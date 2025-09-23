import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Plus, Trash2, Upload, FileText, Link, X, ChevronDown, ChevronRight } from 'lucide-react';
import { FileAttachmentsSectionProps } from './types';

export function FileAttachmentsSection({
    form,
    collapsed,
    onToggle,
    documentFields,
    appendDocument,
    removeDocument,
    documentModes,
    setDocumentModes
}: FileAttachmentsSectionProps) {
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
                            File Attachments
                        </CardTitle>
                        <CardDescription>
                            Upload drawings, BOMs, and other supporting documents
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            {!collapsed && (
                <CardContent className="space-y-4">
                    {documentFields.map((field, index) => (
                        <div key={field.id} className="space-y-2">
                            <div className="flex items-center gap-2">
                                <FormLabel className="text-sm font-medium">Document {index + 1}:</FormLabel>
                                <FormField
                                    control={form.control}
                                    name={`documents.${index}.type`}
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="w-[180px]">
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Drawing">Drawing</SelectItem>
                                                    <SelectItem value="BOM">BOM</SelectItem>
                                                    <SelectItem value="Specification">Specification</SelectItem>
                                                    <SelectItem value="Other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {documentFields.length > 2 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeDocument(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {form.watch(`documents.${index}.type`) === 'BOM'
                                    ? 'Upload any file format (Excel, PDF, image, etc.) or provide a link'
                                    : 'Upload a file or provide a link (either one is required)'
                                }
                            </p>

                            <div className="space-y-3">
                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const input = document.createElement('input');
                                            input.type = 'file';
                                            input.accept = form.watch(`documents.${index}.type`) === 'BOM' ? "*" : ".pdf,.dwg,.step,.stp,.zip,.rar";
                                            input.onchange = (e) => {
                                                const file = (e.target as HTMLInputElement).files?.[0];
                                                if (file) {
                                                    form.setValue(`documents.${index}.file`, file);
                                                    form.setValue(`documents.${index}.uploaded`, true);
                                                    form.setValue(`documents.${index}.link`, '');
                                                    setDocumentModes(prev => ({ ...prev, [index]: 'file' }));
                                                }
                                            };
                                            input.click();
                                        }}
                                        className="flex items-center gap-2"
                                    >
                                        <Upload className="h-4 w-4" />
                                        Upload File
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            form.setValue(`documents.${index}.file`, undefined);
                                            form.setValue(`documents.${index}.link`, '');
                                            form.setValue(`documents.${index}.uploaded`, true);
                                            setDocumentModes(prev => ({ ...prev, [index]: 'link' }));
                                        }}
                                        className="flex items-center gap-2"
                                    >
                                        <Link className="h-4 w-4" />
                                        Add Link
                                    </Button>
                                </div>

                                {/* File Display */}
                                {documentModes[index] === 'file' && form.watch(`documents.${index}.file`) && (
                                    <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">
                                            {form.watch(`documents.${index}.file`)?.name}
                                        </span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                form.setValue(`documents.${index}.file`, undefined);
                                                form.setValue(`documents.${index}.uploaded`, false);
                                                setDocumentModes(prev => ({ ...prev, [index]: 'none' }));
                                            }}
                                            className="ml-auto h-6 w-6 p-0"
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                )}

                                {/* Link Input */}
                                {documentModes[index] === 'link' && (
                                    <FormField
                                        control={form.control}
                                        name={`documents.${index}.link`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>External Link</FormLabel>
                                                <FormControl>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            placeholder="https://drive.google.com/..."
                                                            {...field}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                form.setValue(`documents.${index}.link`, '');
                                                                form.setValue(`documents.${index}.uploaded`, false);
                                                                setDocumentModes(prev => ({ ...prev, [index]: 'none' }));
                                                            }}
                                                            className="h-10 w-10 p-0"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>
                        </div>
                    ))}

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendDocument({ type: 'Other', file: undefined, link: '', uploaded: false })}
                        className="w-full"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Another File or Link
                    </Button>
                </CardContent>
            )}
        </Card>
    );
}
