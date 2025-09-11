import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/core/auth';
import { useToast } from '@/shared/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
    UserCheck,
    Calendar as CalendarIcon,
    User,
    Clock,
    AlertCircle,
    Loader2,
    ArrowRight
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';

const delegationSchema = z.object({
    delegateToId: z.string().min(1, 'Please select a delegate'),
    reason: z.string().min(10, 'Reason must be at least 10 characters'),
    startDate: z.date({
        required_error: 'Please select a start date'
    }),
    endDate: z.date({
        required_error: 'Please select an end date'
    }),
    includeNewApprovals: z.boolean().default(true)
}).refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"]
});

type DelegationFormData = z.infer<typeof delegationSchema>;

interface ApprovalDelegationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
    approvalIds?: string[]; // Optional: specific approvals to delegate
}

interface User {
    id: string;
    name: string;
    role: string;
    email: string;
}

export function ApprovalDelegationModal({
    isOpen,
    onClose,
    onComplete,
    approvalIds
}: ApprovalDelegationModalProps) {
    const [availableUsers, setAvailableUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const { user } = useAuth();
    const { toast } = useToast();

    const form = useForm<DelegationFormData>({
        resolver: zodResolver(delegationSchema),
        defaultValues: {
            delegateToId: '',
            reason: '',
            startDate: new Date(),
            endDate: addDays(new Date(), 7),
            includeNewApprovals: true
        }
    });

    // Fetch available users for delegation
    useEffect(() => {
        if (isOpen && user) {
            fetchAvailableUsers();
        }
    }, [isOpen, user]);

    const fetchAvailableUsers = async () => {
        try {
            setLoading(true);

            // Get users from the same organization with approval roles
            const { data: users, error } = await supabase
                .from('users')
                .select('id, name, role, email')
                .eq('organization_id', user?.user_metadata?.organization_id)
                .neq('id', user?.id) // Exclude current user
                .eq('is_active', true)
                .in('role', ['admin', 'manager', 'team_lead']); // Roles that can handle approvals

            if (error) throw error;

            setAvailableUsers(users || []);
        } catch (error) {
            console.error('Error fetching available users:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to load available users for delegation.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (data: DelegationFormData) => {
        try {
            setSubmitting(true);

            // Create delegation record
            const delegationData = {
                delegator_id: user?.id,
                delegate_id: data.delegateToId,
                start_date: data.startDate.toISOString(),
                end_date: data.endDate.toISOString(),
                reason: data.reason,
                include_new_approvals: data.includeNewApprovals,
                status: 'active',
                organization_id: user?.user_metadata?.organization_id
            };

            const { data: delegation, error: delegationError } = await supabase
                .from('approval_delegations')
                .insert(delegationData)
                .select()
                .single();

            if (delegationError) throw delegationError;

            // If specific approvals are provided, delegate them
            if (approvalIds && approvalIds.length > 0) {
                const delegationMappings = approvalIds.map(approvalId => ({
                    delegation_id: delegation.id,
                    approval_id: approvalId,
                    created_at: new Date().toISOString()
                }));

                const { error: mappingError } = await supabase
                    .from('approval_delegation_mappings')
                    .insert(delegationMappings);

                if (mappingError) throw mappingError;

                // Update the approvals to reflect delegation
                const { error: updateError } = await supabase
                    .from('reviews')
                    .update({
                        reviewer_id: data.delegateToId,
                        metadata: {
                            ...{}, // Preserve existing metadata
                            delegated_from: user?.id,
                            delegation_id: delegation.id
                        }
                    })
                    .in('id', approvalIds);

                if (updateError) throw updateError;
            }

            // Send notification to delegate
            await sendDelegationNotification(data.delegateToId, delegation.id);

            toast({
                title: 'Success',
                description: `Approval delegation created successfully. ${data.delegateToId} has been notified.`
            });

            onComplete();
        } catch (error) {
            console.error('Error creating delegation:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to create approval delegation.'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const sendDelegationNotification = async (delegateId: string, delegationId: string) => {
        try {
            // Create notification for the delegate
            const { error } = await supabase
                .from('notifications')
                .insert({
                    user_id: delegateId,
                    title: 'Approval Delegation Received',
                    message: `${user?.user_metadata?.display_name || 'A colleague'} has delegated approval responsibilities to you.`,
                    type: 'approval_delegation',
                    metadata: {
                        delegation_id: delegationId,
                        delegator_id: user?.id,
                        delegator_name: user?.user_metadata?.display_name
                    },
                    organization_id: user?.user_metadata?.organization_id
                });

            if (error) throw error;
        } catch (error) {
            console.error('Error sending delegation notification:', error);
            // Don't throw to avoid breaking the main flow
        }
    };

    if (loading) {
        return (
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title={
                    <div className="flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-blue-500" />
                        Delegate Approval Responsibilities
                    </div>
                }
                maxWidth="max-w-2xl"
            >
                <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </Modal>
        );
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-blue-500" />
                    <span>Delegate Approval Responsibilities</span>
                </div>
            }
            description="Temporarily assign your approval responsibilities to another team member."
            showDescription={true}
            maxWidth="max-w-2xl"
        >
            {/* Delegation Info */}
            {approvalIds && approvalIds.length > 0 && (
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-sm">
                            <AlertCircle className="w-4 h-4 text-orange-500" />
                            <span>
                                Delegating {approvalIds.length} specific approval{approvalIds.length > 1 ? 's' : ''}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Delegation Form */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    {/* Delegate Selection */}
                    <FormField
                        control={form.control}
                        name="delegateToId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Delegate To</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a team member" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {availableUsers.map((user) => (
                                            <SelectItem key={user.id} value={user.id}>
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4" />
                                                    <div>
                                                        <span className="font-medium">{user.name}</span>
                                                        <Badge variant="outline" className="ml-2 text-xs">
                                                            {user.role}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="startDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Start Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date < new Date() || date < new Date("1900-01-01")
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="endDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>End Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date < form.getValues('startDate') || date < new Date("1900-01-01")
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Reason */}
                    <FormField
                        control={form.control}
                        name="reason"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Reason for Delegation</FormLabel>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        placeholder="Explain why you're delegating these approvals (e.g., vacation, business trip, workload management)..."
                                        rows={3}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Include New Approvals */}
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="includeNew"
                            {...form.register('includeNewApprovals')}
                            className="rounded border-gray-300"
                        />
                        <Label htmlFor="includeNew" className="text-sm">
                            Include new approvals assigned during this period
                        </Label>
                    </div>
                </form>
            </Form>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
                <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={submitting}
                >
                    Cancel
                </Button>
                <Button
                    onClick={form.handleSubmit(handleSubmit)}
                    disabled={submitting}
                    className="min-w-[120px]"
                >
                    {submitting ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Creating...
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <ArrowRight className="w-4 h-4" />
                            Create Delegation
                        </div>
                    )}
                </Button>
            </div>
        </Modal>
    );
}