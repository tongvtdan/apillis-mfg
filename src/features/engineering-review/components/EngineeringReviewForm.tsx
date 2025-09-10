import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/core/auth';
import {
    Plus,
    Trash2,
    CheckCircle,
    XCircle,
    AlertCircle,
    FileText,
    Wrench,
    Clock,
    DollarSign,
    Shield,
    TrendingUp,
    AlertTriangle
} from 'lucide-react';
import {
    EngineeringReviewData,
    EngineeringDepartment,
    DEPARTMENT_CONFIG,
    TECHNICAL_FEASIBILITY_RATINGS,
    COMPLEXITY_LEVELS,
    RISK_SEVERITY_CONFIG,
    RISK_CATEGORY_CONFIG
} from '../types/engineering-review.types';
import { engineeringReviewSchema } from '../types/engineering-review.types';
import { EngineeringReviewService } from '../services/engineeringReviewService';

interface EngineeringReviewFormProps {
    projectId: string;
    projectTitle: string;
    onSubmit: (result: any) => void;
    onCancel: () => void;
    existingReview?: any;
}

export function EngineeringReviewForm({
    projectId,
    projectTitle,
    onSubmit,
    onCancel,
    existingReview
}: EngineeringReviewFormProps) {
    const { user, profile } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<EngineeringReviewData>({
        resolver: zodResolver(engineeringReviewSchema),
        defaultValues: {
            status: 'approved',
            department: 'Design',
            technical_feasibility: 'good',
            complexity_level: 'medium',
            feedback: '',
            recommendations: [''],
            risks: [],
            design_changes_required: false,
            confidence_level: 'medium',
            requires_follow_up: false
        }
    });

    const recommendationsField = useFieldArray({
        control: form.control,
        name: 'recommendations'
    });

    const risksField = useFieldArray({
        control: form.control,
        name: 'risks'
    });

    const handleSubmit = async (data: EngineeringReviewData) => {
        if (!user?.id || !profile?.id) return;

        setIsSubmitting(true);
        try {
            const result = await EngineeringReviewService.submitEngineeringReview(
                projectId,
                data,
                user.id,
                profile.email || 'Unknown Reviewer'
            );

            onSubmit(result);
        } catch (error) {
            console.error('Review submission failed:', error);
            onSubmit({
                success: false,
                error: 'Failed to submit engineering review'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const addRecommendation = () => {
        recommendationsField.append('');
    };

    const removeRecommendation = (index: number) => {
        if (recommendationsField.fields.length > 1) {
            recommendationsField.remove(index);
        }
    };

    const addRisk = () => {
        risksField.append({
            description: '',
            category: 'technical',
            severity: 'medium',
            mitigation_plan: ''
        });
    };

    const removeRisk = (index: number) => {
        risksField.remove(index);
    };

    const selectedDepartment = form.watch('department');
    const selectedFeasibility = form.watch('technical_feasibility');
    const designChangesRequired = form.watch('design_changes_required');

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Engineering Review</CardTitle>
                            <p className="text-muted-foreground mt-1">
                                Project: {projectTitle}
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Badge variant="outline">
                                ID: {projectId}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    {/* Department Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Wrench className="h-5 w-5" />
                                <span>Review Department</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FormField
                                control={form.control}
                                name="department"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Engineering Department</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select department" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.entries(DEPARTMENT_CONFIG).map(([key, config]) => (
                                                    <SelectItem key={key} value={key}>
                                                        <div className="flex items-center space-x-2">
                                                            <span>{config.icon}</span>
                                                            <span>{config.label}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-sm text-muted-foreground">
                                            {DEPARTMENT_CONFIG[selectedDepartment as keyof typeof DEPARTMENT_CONFIG]?.focus}
                                        </p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Technical Assessment */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Shield className="h-5 w-5" />
                                <span>Technical Assessment</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Technical Feasibility */}
                            <FormField
                                control={form.control}
                                name="technical_feasibility"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Technical Feasibility</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="flex flex-wrap gap-4"
                                            >
                                                {Object.entries(TECHNICAL_FEASIBILITY_RATINGS).map(([key, config]) => (
                                                    <div key={key} className="flex items-center space-x-2">
                                                        <RadioGroupItem value={key} id={key} />
                                                        <Label htmlFor={key} className={`cursor-pointer ${config.color}`}>
                                                            {config.label}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Complexity Level */}
                            <FormField
                                control={form.control}
                                name="complexity_level"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Project Complexity</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select complexity level" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.entries(COMPLEXITY_LEVELS).map(([key, config]) => (
                                                    <SelectItem key={key} value={key}>
                                                        <div>
                                                            <div className="font-medium">{config.label}</div>
                                                            <div className="text-sm text-muted-foreground">{config.description}</div>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Estimated Effort */}
                            <FormField
                                control={form.control}
                                name="estimated_effort_hours"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estimated Engineering Hours</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="e.g., 40"
                                                {...field}
                                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                            />
                                        </FormControl>
                                        <p className="text-sm text-muted-foreground">
                                            Optional: Total engineering hours required
                                        </p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Feedback and Recommendations */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <FileText className="h-5 w-5" />
                                <span>Feedback & Recommendations</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Feedback */}
                            <FormField
                                control={form.control}
                                name="feedback"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Technical Feedback *</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Provide detailed technical feedback on the project design, specifications, and requirements..."
                                                rows={6}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Technical Notes */}
                            <FormField
                                control={form.control}
                                name="technical_notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Technical Notes</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Additional technical observations, calculations, or considerations..."
                                                rows={4}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Recommendations */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label>Recommendations</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addRecommendation}
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add Recommendation
                                    </Button>
                                </div>

                                {recommendationsField.fields.map((field, index) => (
                                    <div key={field.id} className="flex space-x-2">
                                        <FormField
                                            control={form.control}
                                            name={`recommendations.${index}`}
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormControl>
                                                        <Input
                                                            placeholder={`Recommendation ${index + 1}`}
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeRecommendation(index)}
                                            disabled={recommendationsField.fields.length === 1}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Risk Assessment */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <AlertTriangle className="h-5 w-5" />
                                <span>Risk Assessment</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <Label>Risks Identified</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addRisk}
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Risk
                                </Button>
                            </div>

                            {risksField.fields.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No risks identified</p>
                                    <p className="text-sm">Click "Add Risk" if any risks were identified during review</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {risksField.fields.map((field, index) => (
                                        <Card key={field.id} className="p-4 border-l-4 border-l-orange-500">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-medium">Risk {index + 1}</h4>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => removeRisk(index)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name={`risks.${index}.description`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Risk Description *</FormLabel>
                                                                <FormControl>
                                                                    <Textarea
                                                                        placeholder="Describe the risk..."
                                                                        rows={3}
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <div className="space-y-4">
                                                        <FormField
                                                            control={form.control}
                                                            name={`risks.${index}.category`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Category</FormLabel>
                                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                        <FormControl>
                                                                            <SelectTrigger>
                                                                                <SelectValue />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent>
                                                                            {Object.entries(RISK_CATEGORY_CONFIG).map(([key, config]) => (
                                                                                <SelectItem key={key} value={key}>
                                                                                    <Badge className={config.color}>
                                                                                        {config.label}
                                                                                    </Badge>
                                                                                </SelectItem>
                                                                            ))}
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
                                                                                <SelectValue />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent>
                                                                            {Object.entries(RISK_SEVERITY_CONFIG).map(([key, config]) => (
                                                                                <SelectItem key={key} value={key}>
                                                                                    <Badge className={config.color}>
                                                                                        {config.label}
                                                                                    </Badge>
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                </div>

                                                <FormField
                                                    control={form.control}
                                                    name={`risks.${index}.mitigation_plan`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Mitigation Plan *</FormLabel>
                                                            <FormControl>
                                                                <Textarea
                                                                    placeholder="Describe how this risk will be mitigated..."
                                                                    rows={3}
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Review Decision */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <CheckCircle className="h-5 w-5" />
                                <span>Review Decision</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Review Status *</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="flex flex-wrap gap-4"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="approved" id="approved" />
                                                    <Label htmlFor="approved" className="cursor-pointer text-green-600">
                                                        ✅ Approve
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="revision_requested" id="revision_requested" />
                                                    <Label htmlFor="revision_requested" className="cursor-pointer text-orange-600">
                                                        📝 Request Revision
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="rejected" id="rejected" />
                                                    <Label htmlFor="rejected" className="cursor-pointer text-red-600">
                                                        ❌ Reject
                                                    </Label>
                                                </div>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="confidence_level"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confidence Level</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="high">High Confidence</SelectItem>
                                                    <SelectItem value="medium">Medium Confidence</SelectItem>
                                                    <SelectItem value="low">Low Confidence</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="estimated_completion_weeks"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Estimated Completion (Weeks)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 4"
                                                    {...field}
                                                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Actions */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Please review all information before submitting your engineering assessment
                                </div>
                                <div className="flex space-x-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={onCancel}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="min-w-[150px]"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Submitting...
                                            </>
                                        ) : (
                                            'Submit Review'
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </Form>
        </div>
    );
}
