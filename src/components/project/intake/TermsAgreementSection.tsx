import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { TermsAgreementSectionProps } from './types';

export function TermsAgreementSection({
    form,
    collapsed,
    onToggle
}: TermsAgreementSectionProps) {
    return (
        <Card>
            <CardHeader
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={onToggle}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            {collapsed ? (
                                <ChevronRight className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                            Terms Agreement
                        </CardTitle>
                        <CardDescription>
                            Please review and agree to our terms of service
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            {!collapsed && (
                <CardContent className="pt-6">
                    <FormField
                        control={form.control}
                        name="agreedToTerms"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>
                                        I agree to the Terms of Service and Privacy Policy
                                    </FormLabel>
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />
                </CardContent>
            )}
        </Card>
    );
}
