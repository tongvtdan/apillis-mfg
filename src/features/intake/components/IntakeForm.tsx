import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Form } from '@/components/ui/form';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useIntakeForm } from '../hooks/useIntakeForm';
import { IntakeSubmissionType } from '../types/intake.types';

// Import section components
import { ContactInfoSection } from './sections/ContactInfoSection';
import { ProjectDetailsSection } from './sections/ProjectDetailsSection';
import { FileAttachmentsSection } from './sections/FileAttachmentsSection';
import { AdditionalNotesSection } from './sections/AdditionalNotesSection';
import { TermsAgreementSection } from './sections/TermsAgreementSection';

interface IntakeFormProps {
    submissionType: IntakeSubmissionType;
    onSuccess?: (projectId: string) => void;
    onError?: (error: string) => void;
}

export function IntakeForm({ submissionType, onSuccess, onError }: IntakeFormProps) {
    const {
        form,
        volumeFields,
        documentFields,
        isSubmitting,
        isSubmitted,
        submitResult,
        tempProjectId,
        isGeneratingId,
        documentModes,
        updateDocumentMode,
        submitForm,
        addVolume,
        removeVolume,
        addDocument,
        removeDocument,
        canSubmit,
        config
    } = useIntakeForm({ submissionType, onSuccess, onError });

    // Success state
    if (isSubmitted && submitResult?.success) {
        return (
            <Card className="w-full max-w-4xl mx-auto">
                <CardContent className="p-8 text-center">
                    <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-green-700 mb-2">
                        Submission Successful!
                    </h2>
                    <p className="text-muted-foreground mb-4">
                        Your {config.label} has been submitted successfully.
                    </p>
                    <div className="bg-muted p-4 rounded-lg mb-4">
                        <p className="text-sm">
                            <strong>Project ID:</strong> {submitResult.projectId}
                        </p>
                        {submitResult.warnings && submitResult.warnings.length > 0 && (
                            <div className="mt-4">
                                <p className="text-sm font-medium text-yellow-700">Warnings:</p>
                                <ul className="text-sm text-yellow-600 mt-1">
                                    {submitResult.warnings.map((warning, index) => (
                                        <li key={index}>• {warning}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        You will receive a confirmation email shortly with next steps.
                    </p>
                </CardContent>
            </Card>
        );
    }

    // Error state
    if (isSubmitted && !submitResult?.success) {
        return (
            <Card className="w-full max-w-4xl mx-auto">
                <CardContent className="p-8 text-center">
                    <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-red-700 mb-2">
                        Submission Failed
                    </h2>
                    <p className="text-muted-foreground mb-4">
                        There was an error submitting your {config.label}.
                    </p>
                    <div className="bg-red-50 p-4 rounded-lg mb-4">
                        <p className="text-sm text-red-700">
                            {submitResult?.error || 'Unknown error occurred'}
                        </p>
                    </div>
                    <Button onClick={() => window.location.reload()}>
                        Try Again
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">
                                {config.label}
                            </CardTitle>
                            <p className="text-muted-foreground mt-1">
                                {config.description}
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Badge variant="secondary">
                                {submissionType.toUpperCase()}
                            </Badge>
                            {tempProjectId && (
                                <Badge variant="outline">
                                    ID: {tempProjectId}
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Form */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(submitForm)} className="space-y-6">
                    {/* Contact Information Section */}
                    <ContactInfoSection
                        form={form}
                        collapsed={false}
                        onToggle={() => { }} // Always expanded for now
                    />

                    {/* Project Details Section */}
                    <ProjectDetailsSection
                        form={form}
                        submissionType={submissionType}
                        tempProjectId={tempProjectId}
                        isGeneratingId={isGeneratingId}
                        volumeFields={volumeFields.fields}
                        appendVolume={addVolume}
                        removeVolume={removeVolume}
                        collapsed={false}
                        onToggle={() => { }}
                    />

                    {/* File Attachments Section */}
                    <FileAttachmentsSection
                        form={form}
                        documentFields={documentFields.fields}
                        appendDocument={addDocument}
                        removeDocument={removeDocument}
                        documentModes={documentModes}
                        setDocumentModes={(modes) => {
                            Object.entries(modes).forEach(([index, mode]) => {
                                updateDocumentMode(parseInt(index), mode);
                            });
                        }}
                        collapsed={false}
                        onToggle={() => { }}
                    />

                    {/* Additional Notes Section */}
                    <AdditionalNotesSection
                        form={form}
                        collapsed={false}
                        onToggle={() => { }}
                    />

                    {/* Terms Agreement Section */}
                    <TermsAgreementSection
                        form={form}
                        collapsed={false}
                        onToggle={() => { }}
                    />

                    {/* Submit Button */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Please review all information before submitting
                                </div>
                                <Button
                                    type="submit"
                                    size="lg"
                                    disabled={!canSubmit() || isSubmitting}
                                    className="min-w-[150px]"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        `Submit ${config.label}`
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </Form>
        </div>
    );
}
