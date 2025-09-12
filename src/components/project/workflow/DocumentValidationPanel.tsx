import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    FileText,
    CheckCircle,
    AlertTriangle,
    Upload,
    Eye,
    Download,
    Clock,
    AlertCircle
} from "lucide-react";

import { Project, WorkflowStage } from '@/types/project';
import { useToast } from '@/shared/hooks/use-toast';

interface DocumentRequirement {
    id: string;
    name: string;
    description: string;
    document_type: string;
    is_required: boolean;
    stage_id: string;
    created_at: string;
}

interface Document {
    id: string;
    name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    category: string;
    uploaded_by: string;
    uploaded_at: string;
    project_id: string;
}

interface DocumentValidationPanelProps {
    project: Project;
    currentStage: WorkflowStage | null;
    requiredDocuments: DocumentRequirement[];
}

export function DocumentValidationPanel({
    project,
    currentStage,
    requiredDocuments
}: DocumentValidationPanelProps) {
    const { toast } = useToast();
    const [projectDocuments, setProjectDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    // Load project documents
    useEffect(() => {
        loadProjectDocuments();
    }, [project.id]);

    const loadProjectDocuments = async () => {
        try {
            setIsLoading(true);

            // This would typically fetch documents from a document service
            // For now, we'll use mock data
            const mockDocuments: Document[] = [
                {
                    id: '1',
                    name: 'Customer RFQ Document.pdf',
                    file_path: '/documents/rfq.pdf',
                    file_size: 1024000,
                    mime_type: 'application/pdf',
                    category: 'rfq_document',
                    uploaded_by: 'user1',
                    uploaded_at: '2024-01-15T10:30:00Z',
                    project_id: project.id
                },
                {
                    id: '2',
                    name: 'Technical Specifications.docx',
                    file_path: '/documents/specs.docx',
                    file_size: 512000,
                    mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    category: 'technical_specs',
                    uploaded_by: 'user2',
                    uploaded_at: '2024-01-15T11:15:00Z',
                    project_id: project.id
                }
            ];

            setProjectDocuments(mockDocuments);
        } catch (error) {
            console.error('Error loading documents:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load project documents.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate document validation status
    const getDocumentValidationStatus = () => {
        if (!requiredDocuments.length) {
            return {
                total: 0,
                uploaded: 0,
                missing: 0,
                percentage: 100,
                isValid: true
            };
        }

        const uploadedCategories = projectDocuments.map(doc => doc.category);
        const uploadedRequired = requiredDocuments.filter(req =>
            uploadedCategories.includes(req.document_type)
        );

        const total = requiredDocuments.length;
        const uploaded = uploadedRequired.length;
        const missing = total - uploaded;
        const percentage = total > 0 ? Math.round((uploaded / total) * 100) : 100;
        const isValid = missing === 0;

        return { total, uploaded, missing, percentage, isValid };
    };

    // Get missing documents
    const getMissingDocuments = () => {
        const uploadedCategories = projectDocuments.map(doc => doc.category);
        return requiredDocuments.filter(req =>
            !uploadedCategories.includes(req.document_type)
        );
    };

    // Format file size
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Handle document upload
    const handleDocumentUpload = async (files: FileList) => {
        try {
            setIsUploading(true);

            // This would typically upload files to a document service
            // For now, we'll simulate the upload
            await new Promise(resolve => setTimeout(resolve, 2000));

            toast({
                title: "Documents Uploaded",
                description: `${files.length} document(s) uploaded successfully.`,
            });

            // Reload documents
            await loadProjectDocuments();
        } catch (error) {
            console.error('Error uploading documents:', error);
            toast({
                variant: "destructive",
                title: "Upload Failed",
                description: "Failed to upload documents. Please try again.",
            });
        } finally {
            setIsUploading(false);
        }
    };

    const { total, uploaded, missing, percentage, isValid } = getDocumentValidationStatus();
    const missingDocuments = getMissingDocuments();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Document Validation
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Validation Status */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Required Documents</span>
                        <Badge variant={isValid ? "default" : "destructive"}>
                            {uploaded}/{total} uploaded
                        </Badge>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                        {percentage}% complete - {missing} document(s) missing
                    </p>
                </div>

                {/* Validation Alert */}
                {!isValid && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            {missing} required document(s) are missing. Please upload them to complete this stage.
                        </AlertDescription>
                    </Alert>
                )}

                {isValid && total > 0 && (
                    <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                            All required documents have been uploaded successfully.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Missing Documents */}
                {missingDocuments.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-red-600">Missing Documents</h4>
                        <div className="space-y-2">
                            {missingDocuments.map((doc) => (
                                <div key={doc.id} className="flex items-center gap-2 p-2 bg-red-50 rounded border border-red-200">
                                    <AlertCircle className="w-4 h-4 text-red-600" />
                                    <div className="flex-1">
                                        <span className="text-sm font-medium text-red-900">{doc.name}</span>
                                        <p className="text-xs text-red-700">{doc.description}</p>
                                    </div>
                                    <Badge variant="destructive" className="text-xs">
                                        Required
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <Separator />

                {/* Upload Section */}
                <div className="space-y-3">
                    <h4 className="text-sm font-medium">Upload Documents</h4>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">
                            Drag and drop files here, or click to select
                        </p>
                        <input
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
                            onChange={(e) => e.target.files && handleDocumentUpload(e.target.files)}
                            className="hidden"
                            id="document-upload"
                            disabled={isUploading}
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('document-upload')?.click()}
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <>
                                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Select Files
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Uploaded Documents */}
                {projectDocuments.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium">Uploaded Documents</h4>
                        <div className="space-y-2">
                            {projectDocuments.map((doc) => (
                                <div key={doc.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded border">
                                    <FileText className="w-5 h-5 text-gray-500" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{doc.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatFileSize(doc.file_size)} • {doc.mime_type}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="sm">
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm">
                                            <Download className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Stage-Specific Requirements */}
                {currentStage && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">
                            Stage Requirements
                        </h4>
                        <p className="text-xs text-blue-800">
                            For {currentStage.name}, ensure all customer RFQ documents,
                            technical specifications, and initial feasibility assessments are uploaded.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
