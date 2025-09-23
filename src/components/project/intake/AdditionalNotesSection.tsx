import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { AdditionalNotesSectionProps } from './types';

export function AdditionalNotesSection({
    form,
    collapsed,
    onToggle
}: AdditionalNotesSectionProps) {
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
                            Additional Notes
                        </CardTitle>
                        <CardDescription>
                            Any additional information or special requirements
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            {!collapsed && (
                <CardContent>
                    <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <div className="relative">
                                        <Textarea
                                            placeholder="Any additional notes, special requirements, or considerations..."
                                            className="min-h-[100px] pr-16"
                                            {...field}
                                            maxLength={1000}
                                        />
                                        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background px-1 rounded">
                                            {field.value?.length || 0}/1000
                                        </div>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            )}
        </Card>
    );
}
