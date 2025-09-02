import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
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
    Loader2,
    CheckSquare
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const bulkApprovalSchema = z.object({
    decision: z.enum(['approved', 'rejected'], {
        required_error: 'Please select a decision'
    }),
    comments: z.string().min(10, 'Comments must be at least 10 characters'),
    decisionReason: z.string().optional()
});

type BulkApprovalFormData = z.infer<typeof bulkApprovalSchema>;

interface BulkApprovalModalProps {
    approvalIds: string[];
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
}

interface ApprovalSummary {
    id: string;
    project_id: string;
    project_title: string;
    approver_role: string;
    due_date?: string;
    priority: string;
}

export function BulkApprovalModal({ approvalIds, isOpen, onClose, onComplete }: BulkApprovalModalProps) {
    const [approvalSummaries, setApprovalSummaries] = useState<ApprovalSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitProgress, setSubmitProgress] = useState(0);
    const { submitApproval } = useApprovals();

    const form = useForm<BulkApprovalFormData>({
        resolver: zodResolver(bulkApprovalSchema),
        defaultValues: {
            decision: undefined,
            comments: '',
            decisionReason: ''
        }
    });

    // Fetch approval summaries
    useEffect(() => {
        if (isOpen && approvalIds.length > 0) {
            fetchApprovalSummaries();
        }
    }, [isOpen, approvalIds]);

    const fetchApprovalSummaries = async () => {
        try {
            setLoading(true);

            // Fetch approval details with project information
            const { data: approvals, error: approvalsError } = await supabase
                .from('reviews')
                .select(`
                    id,
                    project_id,
                    due_date,
                    priority,
                    metadata,
                    projects:project_id (
                        id,
                        project_id,
                        title
                    )
                `)
                .in('id', approvalIds);

            if (approvalsError) throw approvalsError;

            const summaries: ApprovalSummary[] = (approvals || []).map(approval => ({
                id: approval.id,
                project_id: (approval.projects as any)?.project_id || approval.project_id,
                project_title: (approval.projects as any)?.title || 'Unknown Project',
                approver_role: (approval.metadata as any)?.approval_role || 'Unknown Role',
                due_date: approval.due_date || undefined,
                priority: approval.priority || 'medium'
            }));

            setApprovalSummaries(summaries);
        } catch (error) {
            console.error('Error fetching approval summaries:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (data: BulkApprovalFormData) => {
        try {
            setSubmitting(true);
            setSubmitProgress(0);

            const total = approvalIds.length;
            let completed = 0;

            // Process approvals one by one to show progress
            for (const approvalId of approvalIds) {
                const success = await submitApproval(
                    approvalId,
                    data.decision,
                    data.comments,
                    data.decisionReason
                );

                if (success) {
                    completed++;
                    setSubmitProgress((completed / total) * 100);
                }
            }

            if (completed === total) {
                onComplete();
            } else {
                // Some failed, but don't close modal to show results
                console.warn(`Only ${completed}/${total} approvals were processed successfully`);
            }
        } catch (error) {
            console.error('Error submitting bulk approvals:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'high':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (loading) {
        return (
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title={
                    <div className="flex items-center gap-2">
                        <CheckSquare className="w-5 h-5 text-blue-500" />
                        Bulk Approval Review
                    </div>
                }
                maxWidth="max-w-4xl"
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
                    <CheckSquare className="w-5 h-5 text-blue-500" />
                    <span>Bulk Approval Review</span>
                    <Badge variant="secondary">{approvalIds.length} approvals</Badge>
                </div>
            }
            maxWidth="max-w-4xl"
        >
            {/* Approval Summaries */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Approvals to Process</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {approvalSummaries.map((approval, index) => (
                        <div key={approval.id}>
                            <div className="flex items-center justify-between p-3 border rounded">
                                <div className="flex items-center gap-3">
                                    <Badge variant="outline" className="text-xs">
                                        #{index + 1}
                                    </Badge>
                                    <div>
                                        <p className="font-medium">{approval.project_title}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {approval.project_id} • {approval.approver_role}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge className={getPriorityColor(approval.priority)}>
                                        {approval.priority}
                                    </Badge>
                                    {approval.due_date && new Date(approval.due_date) < new Date() && (
                                        <Badge variant="destructive">Overdue</Badge>
                                    )}
                                </div>
                            </div>
                            {index < approvalSummaries.length - 1 && <Separator className="my-2" />}
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Bulk Decision Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Bulk Decision</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        This decision will be applied to all {approvalIds.length} selected approvals.
                    </p>
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
                                        <FormLabel>Bulk Approval Decision</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                className="flex gap-6"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="approved" id="bulk-approved" />
                                                    <Label htmlFor="bulk-approved" className="flex items-center gap-2 cursor-pointer">
                                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                                        Approve All
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="rejected" id="bulk-rejected" />
                                                    <Label htmlFor="bulk-rejected" className="flex items-center gap-2 cursor-pointer">
                                                        <XCircle className="w-4 h-4 text-red-600" />
                                                        Reject All
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
                                                placeholder="Provide detailed feedback that applies to all selected approvals..."
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
                                                placeholder="Explain the reasoning behind your bulk decision..."
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

            {/* Progress Indicator */}
            {submitting && (
                <Card>
                    <CardContent className="p-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span>Processing approvals...</span>
                                <span>{Math.round(submitProgress)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-primary h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${submitProgress}%` }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

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
                    className="min-w-[150px]"
                >
                    {submitting ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Processing...
                        </div>
                    ) : (
                        `Submit Bulk Decision (${approvalIds.length})`
                    )}
                </Button>
            </div>
        </Modal>
    );
}