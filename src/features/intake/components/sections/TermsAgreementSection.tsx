import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp, Shield } from 'lucide-react';
import { IntakeFormData, TermsAgreementSectionProps } from '../../types/intake.types';

export function TermsAgreementSection({
    form,
    collapsed,
    onToggle
}: TermsAgreementSectionProps) {

    if (collapsed) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <Button
                        variant="ghost"
                        onClick={onToggle}
                        className="w-full justify-between p-0 h-auto"
                    >
                        <CardTitle className="text-lg">Terms & Agreement</CardTitle>
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <Button
                    variant="ghost"
                    onClick={onToggle}
                    className="w-full justify-between p-0 h-auto"
                >
                    <CardTitle className="text-lg">Terms & Agreement</CardTitle>
                    <ChevronUp className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1 space-y-4">
                        <div className="bg-muted p-4 rounded-lg">
                            <h4 className="font-medium mb-2">Terms of Service</h4>
                            <div className="text-sm text-muted-foreground space-y-2">
                                <p>
                                    By submitting this request, you agree to our terms of service and privacy policy.
                                    We will process your information to provide manufacturing quotes and services.
                                </p>
                                <p>
                                    <strong>Data Privacy:</strong> Your information will be stored securely and used only
                                    for processing your request and improving our services.
                                </p>
                                <p>
                                    <strong>Response Time:</strong> We aim to respond to all inquiries within 2-3 business days.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <Checkbox
                                id="terms-agreement"
                                checked={form.watch('agreedToTerms')}
                                onCheckedChange={(checked) => form.setValue('agreedToTerms', checked as boolean)}
                            />
                            <div className="grid gap-1.5 leading-none">
                                <Label
                                    htmlFor="terms-agreement"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    I agree to the terms of service *
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    You must agree to the terms before submitting your request
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
