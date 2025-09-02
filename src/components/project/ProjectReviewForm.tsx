import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Modal } from '@/components/ui/modal';
import {
    Department,
    ReviewSubmission,
    DEPARTMENT_LABELS,
    RiskCategory,
    RiskSeverity,
    InternalReview
} from '@/types/review';
import {
    Plus,
    Trash2,
    CheckCircle,
    XCircle,
    AlertCircle,
    FileText,
    X
} from 'lucide-react';

const reviewSchema = z.object({
    status: z.enum(['approved', 'rejected', 'revision_requested']),
    feedback: z.string().min(10, 'Feedback must be at least 10 characters'),
    suggestions: z.array(z.string().min(1)),
    risks: z.array(z.object({
        description: z.string().min(10, 'Risk description must be at least 10 characters'),
        category: z.enum(['technical', 'timeline', 'cost', 'quality']),
        severity: z.enum(['low', 'medium', 'high']),
        mitigation_plan: z.string().optional()
    }))
});

interface ProjectReviewFormProps {
    projectId: string;
    department: Department;
    existingReview?: InternalReview;
    onSubmit: (submission: ReviewSubmission) => Promise<boolean>;
    onCancel: () => void;
    // Modal mode props
    isOpen?: boolean;
    onClose?: () => void;
}

export function ProjectReviewForm({
    projectId,
    department,
    existingReview,
    onSubmit,
    onCancel,
    isOpen,
    onClose
}: ProjectReviewFormProps) {
    const [submitting, setSubmitting] = useState(false);

    const form = useForm<ReviewSubmission>({
        resolver: zodResolver(reviewSchema),
        defaultValues: {
            status: existingReview?.status as any || 'approved',
            feedback: existingReview?.feedback || '',
            suggestions: existingReview?.suggestions || [],
            risks: []
        }
    });

    const { fields: riskFields, append: appendRisk, remove: removeRisk } = useFieldArray({
        control: form.control,
        name: 'risks'
    });

    const [suggestions, setSuggestions] = useState<string[]>(existingReview?.suggestions || []);

    const handleSubmit = async (data: any) => {
        setSubmitting(true);
        const submission: ReviewSubmission = {
            ...data,
            suggestions
        };
        const success = await onSubmit(submission);
        setSubmitting(false);

        if (success) {
            // Use modal close handler if in modal mode, otherwise use onCancel
            if (isOpen && onClose) {
                onClose();
            } else {
                onCancel();
            }
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'rejected':
                return <XCircle className="w-4 h-4 text-red-600" />;
            case 'revision_requested':
                return <AlertCircle className="w-4 h-4 text-orange-600" />;
            default:
                return <FileText className="w-4 h-4 text-gray-600" />;
        }
    };

    const addSuggestion = () => {
        setSuggestions([...suggestions, '']);
    };

    const updateSuggestion = (index: number, value: string) => {
        const newSuggestions = [...suggestions];
        newSuggestions[index] = value;
        setSuggestions(newSuggestions);
    };

    const removeSuggestion = (index: number) => {
        setSuggestions(suggestions.filter((_, i) => i !== index));
    };

    const handleClose = () => {
        if (!submitting) {
            form.reset();
            setSuggestions([]);
            if (isOpen && onClose) {
                onClose();
            } else {
                onCancel();
            }
        }
    };

    // If in modal mode and not open, don't render
    if (isOpen !== undefined && !isOpen) return null;

    const formContent = (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* Review Status */}
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Review Status</FormLabel>
                            <FormControl>
                                <RadioGroup
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    className="flex gap-6"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="approved" id="approved" />
                                        <Label htmlFor="approved" className="flex items-center gap-1 cursor-pointer">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                            Approved
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="revision_requested" id="revision" />
                                        <Label htmlFor="revision" className="flex items-center gap-1 cursor-pointer">
                                            <AlertCircle className="w-4 h-4 text-orange-600" />
                                            Revision Requested
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="rejected" id="rejected" />
                                        <Label htmlFor="rejected" className="flex items-center gap-1 cursor-pointer">
                                            <XCircle className="w-4 h-4 text-red-600" />
                                            Rejected
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Feedback */}
                <FormField
                    control={form.control}
                    name="feedback"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Feedback</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Provide detailed feedback about the project..."
                                    className="min-h-[100px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Suggestions */}
                <div className="space-y-3">
                    <Label>Suggestions for Improvement</Label>
                    {suggestions.map((suggestion, index) => (
                        <div key={index} className="flex gap-2">
                            <Input
                                value={suggestion}
                                onChange={(e) => updateSuggestion(index, e.target.value)}
                                placeholder="Enter suggestion..."
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeSuggestion(index)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addSuggestion}
                        className="w-full"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Suggestion
                    </Button>
                </div>

                {/* Risks */}
                <div className="space-y-3">
                    <Label>Risk Assessment</Label>
                    {riskFields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-lg space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Risk #{index + 1}</span>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeRisk(index)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>

                            <FormField
                                control={form.control}
                                name={`risks.${index}.description`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Risk Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describe the risk..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name={`risks.${index}.category`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="technical">Technical</SelectItem>
                                                    <SelectItem value="timeline">Timeline</SelectItem>
                                                    <SelectItem value="cost">Cost</SelectItem>
                                                    <SelectItem value="quality">Quality</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name={`risks.${index}.severity`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Severity</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select severity" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="low">Low</SelectItem>
                                                    <SelectItem value="medium">Medium</SelectItem>
                                                    <SelectItem value="high">High</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name={`risks.${index}.mitigation_plan`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mitigation Plan (Optional)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describe how to mitigate this risk..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    ))}

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendRisk({
                            description: '',
                            category: 'technical',
                            severity: 'medium',
                            mitigation_plan: ''
                        })}
                        className="w-full"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Risk
                    </Button>
                </div>

                {/* Submit Button */}
                <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={submitting} className="flex-1">
                        {submitting ? 'Submitting...' : 'Submit Review'}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );

    // If in modal mode, wrap with modal container
    if (isOpen) {
        return (
            <Modal
                isOpen={isOpen}
                onClose={handleClose}
                title={
                    <div className="flex items-center gap-2">
                        {getStatusIcon(form.watch('status'))}
                        {existingReview ? `Update ${DEPARTMENT_LABELS[department]} Review` : `Submit ${DEPARTMENT_LABELS[department]} Review`}
                    </div>
                }
            >
                {formContent}
            </Modal>
        );
    }

    // Return inline form (existing behavior)
    return formContent;
}
