import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useApprovals } from '@/hooks/useApprovals';
import { supabase } from '@/integrations/supabase/client';
import {
    CheckCircle,
    XCircle,
    AlertCircle,
    Calendar,
    User,
    FileText,
    Building,
    Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const approvalSchema = z.object({
    decision: z.enum(['approved', 'rejected'], {
        required_error: 'Please select a decision'
    }),
    comments: z.string().min(10, 'Comments must be at least 10 characters'),
    decisionReason: z.string().optional()
});

type ApprovalFormData = z.infer<typeof approvalSchema>;

interface ApprovalModalProps {
    approvalId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function ApprovalModal({ approvalId, isOpen, onClose }: ApprovalModalProps) {
    const [approvalDetails, setApprovalDetails] = useState<any>(null);
    const [projectDetails, setProjectDetails] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const { submitApproval } = useApprovals();

    const form = useForm<ApprovalFormData>({
        resolver: zodResolver(approvalSchema),
        defaultValues: {
            decision: undefined,
            comments: '',
            decisionReason: ''
        }
    });

    // Fetch approval and project details
    useEffect(() => {
        if (isOpen && approvalId) {
            fetchApprovalDetails();
        }
    }, [isOpen, approvalId]);

    const fetchApprovalDetails = async () => {
        try {
            setLoading(true);

            // Fetch approval details
            const { data: approval, error: approvalError } = await supabase
                .from('reviews')
                .select(`
          *,
          reviewer:reviewer_id (
            id,
            display_name,
            role
          )
        `)
                .eq('id', approvalId)
                .single();

            if (approvalError) throw approvalError;

            setApprovalDetails(approval);

            // Fetch project details
            const { data: project, error: projectError } = await supabase
                .from('projects')
                .select(`
          *,
          customer:customer_id (
            id,
            name
          ),
          current_stage:current_stage_id (
            id,
            name,
            description
          )
        `)
                .eq('id', approval.project_id)
                .single();

            if (projectError) throw projectError;

            setProjectDetails(project);
        } catch (error) {
            console.error('Error fetching approval details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (data: ApprovalFormData) => {
        try {
            setSubmitting(true);

            const success = await submitApproval(
                approvalId,
                data.decision,
                data.comments,
                data.decisionReason
            );

            if (success) {
                onClose();
            }
        } catch (error) {
            console.error('Error submitting approval:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const getDecisionIcon = (decision: string) => {
        switch (decision) {
            case 'approved':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'rejected':
                return <XCircle className="w-5 h-5 text-red-600" />;
            default:
                return <AlertCircle className="w-5 h-5 text-orange-600" />;
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-background/95 backdrop-blur-lg flex items-center justify-center p-4 z-50">
                <div className="w-full max-w-4xl">
                    <Card>
                        <CardContent className="flex items-center justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-lg flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <AlertCircle className="w-5 h-5 text-orange-500" />
                            <span>Approval Required</span>
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Project Information */}
                        {projectDetails && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Project Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Project ID</Label>
                                            <p className="font-mono">{projectDetails.project_id}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Title</Label>
                                            <p>{projectDetails.title}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Customer</Label>
                                            <p>{projectDetails.customer?.name || 'Unknown'}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Current Stage</Label>
                                            <p>{projectDetails.current_stage?.name || 'Unknown'}</p>
                                        </div>
                                    </div>

                                    {projectDetails.description && (
                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                                            <p className="text-sm bg-muted p-3 rounded mt-1">
                                                {projectDetails.description}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Approval Details */}
                        {approvalDetails && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Approval Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Approval Type</Label>
                                            <p>{approvalDetails.review_type?.replace('stage_approval_', '').toUpperCase()}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Assigned To</Label>
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4" />
                                                <span>{approvalDetails.reviewer?.display_name || 'You'}</span>
                                                <Badge variant="secondary">{approvalDetails.reviewer?.role}</Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Priority</Label>
                                            <Badge variant={approvalDetails.priority === 'high' ? 'destructive' : 'secondary'}>
                                                {approvalDetails.priority}
                                            </Badge>
                                        </div>
                                        {approvalDetails.due_date && (
                                            <div>
                                                <Label className="text-sm font-medium text-muted-foreground">Due Date</Label>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{formatDistanceToNow(new Date(approvalDetails.due_date), { addSuffix: true })}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Approval Form */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Your Decision</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                                        {/* Decision */}
                                        <FormField
                                            control={form.control}
                                            name="decision"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Approval Decision</FormLabel>
                                                    <FormControl>
                                                        <RadioGroup
                                                            value={field.value}
                                                            onValueChange={field.onChange}
                                                            className="flex gap-6"
                                                        >
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem value="approved" id="approved" />
                                                                <Label htmlFor="approved" className="flex items-center gap-2 cursor-pointer">
                                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                                    Approve
                                                                </Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem value="rejected" id="rejected" />
                                                                <Label htmlFor="rejected" className="flex items-center gap-2 cursor-pointer">
                                                                    <XCircle className="w-4 h-4 text-red-600" />
                                                                    Reject
                                                                </Label>
                                                            </div>
                                                        </RadioGroup>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Comments */}
                                        <FormField
                                            control={form.control}
                                            name="comments"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Comments *</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            {...field}
                                                            placeholder="Provide detailed feedback about your decision..."
                                                            rows={4}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Decision Reason (optional) */}
                                        <FormField
                                            control={form.control}
                                            name="decisionReason"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Decision Rationale (Optional)</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            {...field}
                                                            placeholder="Explain the reasoning behind your decision..."
                                                            rows={3}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>

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
                                className="min-w-[100px]"
                            >
                                {submitting ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Submitting...
                                    </div>
                                ) : (
                                    'Submit Decision'
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}