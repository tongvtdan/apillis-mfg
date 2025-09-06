import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/contexts/AuthContext';
import { ProjectIntakeService, ProjectIntakeData } from '@/services/projectIntakeService';
import { IntakeMappingService } from '@/services/intakeMappingService';

// Simplified validation schema
const intakeFormSchema = z.object({
    companyName: z.string().min(1, 'Company name is required'),
    contactName: z.string().min(1, 'Contact name is required'),
    contactEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
    contactPhone: z.string().optional(),
    projectTitle: z.string().min(3, 'Project title must be at least 3 characters'),
    description: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
    estimatedValue: z.string().optional(),
    dueDate: z.string().optional(),
    notes: z.string().optional(),
});

type IntakeFormData = z.infer<typeof intakeFormSchema>;

interface SimplifiedIntakeFormProps {
    submissionType: 'RFQ' | 'Purchase Order' | 'Project Idea';
    onSuccess?: (projectId: string) => void;
}

export function SimplifiedIntakeForm({ submissionType, onSuccess }: SimplifiedIntakeFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [tempProjectId, setTempProjectId] = useState<string>('');

    const { toast } = useToast();
    const { createProject, createOrGetCustomer } = useProjects();
    const { profile } = useAuth();

    // Get intake mapping for this submission type
    const mapping = IntakeMappingService.getMapping(submissionType);

    // Initialize form
    const form = useForm<IntakeFormData>({
        resolver: zodResolver(intakeFormSchema),
        defaultValues: {
            priority: 'medium',
        }
    });

    // Generate temporary project ID
    React.useEffect(() => {
        const generateTempId = () => {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const sequence = String(Math.floor(Math.random() * 100)).padStart(2, '0');
            return `P-${year}${month}${day}${sequence}`;
        };

        setTempProjectId(generateTempId());
    }, []);

    const handleSubmit = async (data: IntakeFormData) => {
        setIsSubmitting(true);

        try {
            // Create or get customer
            const customer = await createOrGetCustomer({
                name: data.contactName,
                company: data.companyName,
                email: data.contactEmail || undefined,
                phone: data.contactPhone || undefined
            });

            // Prepare intake data
            const intakeData: ProjectIntakeData = {
                title: data.projectTitle,
                description: data.description,
                customer_id: customer.id,
                priority: data.priority,
                estimated_value: data.estimatedValue ? parseFloat(data.estimatedValue) : undefined,
                due_date: data.dueDate,
                contact_name: data.contactName,
                contact_email: data.contactEmail || undefined,
                contact_phone: data.contactPhone || undefined,
                notes: data.notes,
                intake_type: submissionType,
                intake_source: 'portal'
            };

            // Create project using intake service
            const project = await ProjectIntakeService.createProjectFromIntake(
                intakeData,
                profile?.organization_id || '',
                createProject
            );

            setIsSubmitted(true);

            toast({
                title: "Project Submitted Successfully!",
                description: `Your ${submissionType.toLowerCase()} has been submitted with ID: ${project.project_id}`,
            });

            onSuccess?.(project.project_id);

        } catch (error) {
            console.error('Error submitting project:', error);
            toast({
                variant: "destructive",
                title: "Submission Failed",
                description: "Failed to submit project. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <Card className="border-accent/30 bg-accent/5">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/20">
                        <CheckCircle2 className="h-6 w-6 text-accent" />
                    </div>
                    <CardTitle className="text-accent-foreground">Project Submitted Successfully!</CardTitle>
                    <CardDescription className="text-accent-foreground/80">
                        Your {submissionType.toLowerCase()} has been received and assigned ID: <strong>{tempProjectId}</strong>
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-sm text-accent-foreground/70 mb-4">
                        You will receive email updates as your project progresses through our review process.
                    </p>
                    <Button onClick={() => window.location.reload()} variant="outline" className="border-accent/30 text-accent hover:bg-accent/10">
                        Submit Another Project
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* Project ID Display */}
                <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Temporary Project ID</p>
                    <p className="text-lg font-mono font-bold">{tempProjectId}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        A permanent ID will be assigned upon submission
                    </p>
                </div>

                {/* Intake Type Info */}
                {mapping && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Badge variant="outline">{submissionType}</Badge>
                                {mapping.description}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                )}

                {/* Company & Contact Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Company & Contact Information</CardTitle>
                        <CardDescription>
                            Tell us about your company and the primary contact for this project.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="companyName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Company Name *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter company name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="contactName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contact Name *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter contact person name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="contactEmail"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email Address</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="Enter email address" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="contactPhone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number</FormLabel>
                                        <FormControl>
                                            <Input type="tel" placeholder="Enter phone number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Project Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Project Details</CardTitle>
                        <CardDescription>
                            Provide details about your manufacturing project or requirements.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="projectTitle"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Project Title *</FormLabel>
                                    <FormControl>
                                        <Input placeholder={`Enter ${submissionType.toLowerCase()} title`} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe your project requirements, materials, quantities, specifications, etc."
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Priority Level</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select priority" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                                <SelectItem value="critical">Critical</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="estimatedValue"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estimated Value ($)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Target Due Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Additional Notes</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Any additional information, special requirements, or notes..."
                                            className="min-h-[80px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        size="lg"
                        disabled={isSubmitting || !form.formState.isValid}
                        className="min-w-[200px]"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            `Submit ${submissionType}`
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
