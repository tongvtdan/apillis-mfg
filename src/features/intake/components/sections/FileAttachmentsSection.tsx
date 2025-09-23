import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronUp, Plus, Minus, Upload, Link as LinkIcon, FileText } from 'lucide-react';
import { IntakeFormData, FileAttachmentsSectionProps, DocumentUploadMode } from '../../types/intake.types';

const DOCUMENT_TYPES = [
    'Drawing',
    'Specification',
    'BOM',
    'Requirements',
    'Datasheet',
    'Reference Material',
    'Other'
];

export function FileAttachmentsSection({
    form,
    documentFields,
    appendDocument,
    removeDocument,
    documentModes,
    setDocumentModes,
    collapsed,
    onToggle
}: FileAttachmentsSectionProps) {

    const addDocument = () => {
        appendDocument({
            type: 'Drawing',
            description: ''
        });

        // Set default mode for new document
        const newIndex = documentFields.length;
        setDocumentModes({
            ...documentModes,
            [newIndex]: 'none'
        });
    };

    const updateDocumentMode = (index: number, mode: DocumentUploadMode) => {
        setDocumentModes({
            ...documentModes,
            [index]: mode
        });
    };

    const handleFileChange = (index: number, file: File | null) => {
        if (file) {
            form.setValue(`documents.${index}.file`, file);
            form.setValue(`documents.${index}.uploaded`, false);
        } else {
            form.setValue(`documents.${index}.file`, undefined);
        }
    };

    const handleLinkChange = (index: number, link: string) => {
        form.setValue(`documents.${index}.link`, link);
    };

    if (collapsed) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <Button
                        variant="ghost"
                        onClick={onToggle}
                        className="w-full justify-between p-0 h-auto"
                    >
                        <CardTitle className="text-lg">File Attachments</CardTitle>
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
                    <CardTitle className="text-lg">File Attachments</CardTitle>
                    <ChevronUp className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-start space-x-3">
                        <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                            <h4 className="font-medium text-blue-900">Document Requirements</h4>
                            <p className="text-sm text-blue-700 mt-1">
                                At minimum, please provide a Drawing and Bill of Materials (BOM).
                                Additional documents help us better understand your requirements.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">Documents</Label>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addDocument}
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Document
                        </Button>
                    </div>

                    {documentFields.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No documents added yet</p>
                            <p className="text-sm">Click "Add Document" to get started</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {documentFields.map((field, index) => {
                                const mode = documentModes[index] || 'none';
                                const documentType = form.watch(`documents.${index}.type`);
                                const hasFile = form.watch(`documents.${index}.file`);
                                const hasLink = form.watch(`documents.${index}.link`);

                                return (
                                    <Card key={field.id} className="p-4">
                                        <div className="space-y-4">
                                            {/* Document Header */}
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium">Document {index + 1}</h4>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removeDocument(index)}
                                                    disabled={documentFields.length === 1}
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            {/* Document Type */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Document Type *</Label>
                                                    <Select
                                                        value={documentType}
                                                        onValueChange={(value) => form.setValue(`documents.${index}.type`, value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {DOCUMENT_TYPES.map((type) => (
                                                                <SelectItem key={type} value={type}>
                                                                    {type}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* Upload Mode Selection */}
                                                <div className="space-y-2">
                                                    <Label>Upload Method</Label>
                                                    <div className="flex space-x-2">
                                                        <Button
                                                            type="button"
                                                            variant={mode === 'file' ? 'default' : 'outline'}
                                                            size="sm"
                                                            onClick={() => updateDocumentMode(index, 'file')}
                                                            className="flex-1"
                                                        >
                                                            <Upload className="h-4 w-4 mr-1" />
                                                            File
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant={mode === 'link' ? 'default' : 'outline'}
                                                            size="sm"
                                                            onClick={() => updateDocumentMode(index, 'link')}
                                                            className="flex-1"
                                                        >
                                                            <LinkIcon className="h-4 w-4 mr-1" />
                                                            Link
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* File Upload */}
                                            {mode === 'file' && (
                                                <div className="space-y-2">
                                                    <Label>Upload File *</Label>
                                                    <div className="border-2 border-dashed rounded-lg p-4">
                                                        <Input
                                                            type="file"
                                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.dwg,.step,.stp,.iges,.igs,.png,.jpg,.jpeg"
                                                            onChange={(e) => handleFileChange(index, e.target.files?.[0] || null)}
                                                            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                                                        />
                                                        {hasFile && (
                                                            <p className="text-sm text-green-600 mt-2">
                                                                ✓ {(hasFile as File).name} ({((hasFile as File).size / 1024 / 1024).toFixed(1)} MB)
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            Supported: PDF, DOC, XLS, DWG, STEP, IGES, PNG, JPG (Max 10MB)
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Link Input */}
                                            {mode === 'link' && (
                                                <div className="space-y-2">
                                                    <Label>Document Link *</Label>
                                                    <Input
                                                        type="url"
                                                        placeholder="https://example.com/document.pdf"
                                                        value={hasLink || ''}
                                                        onChange={(e) => handleLinkChange(index, e.target.value)}
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        Provide a direct link to your document
                                                    </p>
                                                </div>
                                            )}

                                            {/* Description */}
                                            <div className="space-y-2">
                                                <Label>Description</Label>
                                                <Textarea
                                                    placeholder="Brief description of this document..."
                                                    rows={2}
                                                    {...form.register(`documents.${index}.description`)}
                                                />
                                            </div>

                                            {/* Validation Status */}
                                            <div className="flex items-center space-x-2 text-sm">
                                                {mode === 'file' && hasFile && (
                                                    <span className="text-green-600">✓ File selected</span>
                                                )}
                                                {mode === 'link' && hasLink && (
                                                    <span className="text-green-600">✓ Link provided</span>
                                                )}
                                                {mode !== 'none' && !hasFile && !hasLink && (
                                                    <span className="text-red-600">⚠ Document required</span>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Requirements Summary */}
                <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Document Status</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="font-medium">Total Documents:</span> {documentFields.length}
                        </div>
                        <div>
                            <span className="font-medium">Required:</span> At least 2 (Drawing + BOM)
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        Make sure to include technical drawings and specifications for accurate quoting.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
