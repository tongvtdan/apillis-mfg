import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { IntakeFormData, AdditionalNotesSectionProps } from '../../types/intake.types';

export function AdditionalNotesSection({
    form,
    collapsed,
    onToggle
}: AdditionalNotesSectionProps) {

    if (collapsed) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <Button
                        variant="ghost"
                        onClick={onToggle}
                        className="w-full justify-between p-0 h-auto"
                    >
                        <CardTitle className="text-lg">Additional Notes</CardTitle>
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
                    <CardTitle className="text-lg">Additional Notes</CardTitle>
                    <ChevronUp className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                    <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                        <Label htmlFor="notes">Additional Information</Label>
                        <Textarea
                            id="notes"
                            placeholder="Any additional information, special requirements, or questions you have about this project..."
                            rows={4}
                            className="mt-2"
                            {...form.register('notes')}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Optional: Include any special instructions, deadlines, or specific requirements
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
