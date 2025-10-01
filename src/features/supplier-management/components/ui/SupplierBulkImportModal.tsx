// Supplier Bulk Import Modal Component
// Dedicated modal for bulk importing suppliers with improved visibility

import React, { useState, useRef } from 'react';
import { Modal } from '@/components/ui/modal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import {
    Upload,
    Download,
    FileSpreadsheet,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Users,
    Globe,
    Wrench,
    Eye,
    FileText,
    ArrowRight
} from 'lucide-react';
import { useAuth } from '@/core/auth';
import { useToast } from '@/shared/hooks/use-toast';
import { downloadSupplierTemplate, parseSupplierImportFile } from '@/utils/excelTemplateGenerator';
import { SupplierBulkImportService, type BulkImportResult, type BulkImportProgress } from '@/services/supplierBulkImportService';
import type { SupplierImportRow } from '@/utils/supplierImportTemplate';

interface SupplierBulkImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImportComplete?: (result: BulkImportResult) => void;
}

export function SupplierBulkImportModal({ isOpen, onClose, onImportComplete }: SupplierBulkImportModalProps) {
    const { user, profile } = useAuth();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State management
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<SupplierImportRow[]>([]);
    const [parseErrors, setParseErrors] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [importProgress, setImportProgress] = useState<BulkImportProgress | null>(null);
    const [importResult, setImportResult] = useState<BulkImportResult | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [currentStep, setCurrentStep] = useState<'start' | 'upload' | 'import' | 'complete'>('start');
    const [showPreviewModal, setShowPreviewModal] = useState(false);

    // Reset state when modal opens/closes
    React.useEffect(() => {
        if (isOpen) {
            setUploadedFile(null);
            setParsedData([]);
            setParseErrors([]);
            setIsProcessing(false);
            setImportProgress(null);
            setImportResult(null);
            setShowPreview(false);
            setCurrentStep('start');
            setShowPreviewModal(false);
        }
    }, [isOpen]);

    // Handle file upload
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['.csv', '.xlsx', '.xls'];
        const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

        if (!validTypes.includes(fileExtension)) {
            toast({
                title: 'Invalid File Type',
                description: 'Please upload a CSV or Excel file (.csv, .xlsx, .xls)',
                variant: 'destructive'
            });
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: 'File Too Large',
                description: 'File size must be less than 5MB',
                variant: 'destructive'
            });
            return;
        }

        setUploadedFile(file);
        parseFile(file);
    };

    // Parse uploaded file
    const parseFile = (file: File) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const content = e.target?.result as string;
            const { data, errors } = parseSupplierImportFile(content);

            setParsedData(data);
            setParseErrors(errors);

            if (errors.length > 0) {
                toast({
                    title: 'File Parsing Issues',
                    description: `Found ${errors.length} issues in the uploaded file. Please review and fix them.`,
                    variant: 'destructive'
                });
                setCurrentStep('upload');
            } else if (data.length > 0) {
                toast({
                    title: 'File Parsed Successfully',
                    description: `Found ${data.length} suppliers ready for import.`,
                });
                setCurrentStep('import');
            }
        };

        reader.onerror = () => {
            toast({
                title: 'File Reading Error',
                description: 'Failed to read the uploaded file. Please try again.',
                variant: 'destructive'
            });
        };

        reader.readAsText(file);
    };

    // Download template
    const handleDownloadTemplate = () => {
        downloadSupplierTemplate();
        toast({
            title: 'Template Downloaded',
            description: 'Supplier import template has been downloaded. Fill it out and upload to import suppliers.',
        });
        setCurrentStep('upload');
    };

    // Skip to upload step
    const handleSkipToUpload = () => {
        setCurrentStep('upload');
    };

    // Start import process
    const handleStartImport = async () => {
        if (!user?.id || !profile?.organization_id || parsedData.length === 0) return;

        // Validate data before import
        const validation = SupplierBulkImportService.validateImportData(parsedData);

        if (!validation.valid) {
            toast({
                title: 'Validation Failed',
                description: `Found ${validation.errors.length + validation.duplicates.length} validation issues.`,
                variant: 'destructive'
            });
            setParseErrors([...validation.errors, ...validation.duplicates]);
            return;
        }

        setIsProcessing(true);
        setImportResult(null);

        try {
            const result = await SupplierBulkImportService.importSuppliers(
                parsedData,
                user.id,
                profile.organization_id,
                setImportProgress
            );

            setImportResult(result);
            setCurrentStep('complete');

            if (result.success > 0) {
                toast({
                    title: 'Import Completed',
                    description: `Successfully imported ${result.success} suppliers${result.failed > 0 ? ` (${result.failed} failed)` : ''}.`,
                });

                onImportComplete?.(result);
            } else {
                toast({
                    title: 'Import Failed',
                    description: 'No suppliers were imported. Please check the errors and try again.',
                    variant: 'destructive'
                });
            }
        } catch (error) {
            toast({
                title: 'Import Error',
                description: error instanceof Error ? error.message : 'An unexpected error occurred.',
                variant: 'destructive'
            });
        } finally {
            setIsProcessing(false);
        }
    };

    // Get preview data
    const getPreviewData = () => {
        if (parsedData.length === 0) return null;
        return SupplierBulkImportService.previewImport(parsedData);
    };

    const previewData = getPreviewData();

    // Step indicator component
    const StepIndicator = () => (
        <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-4">
                {[
                    { key: 'start', label: 'Get Started', icon: FileText },
                    { key: 'upload', label: 'Upload File', icon: Upload },
                    { key: 'import', label: 'Import Data', icon: Users },
                    { key: 'complete', label: 'Complete', icon: CheckCircle }
                ].map((step, index) => {
                    const isActive = currentStep === step.key;
                    const isCompleted = ['start', 'upload', 'import', 'complete'].indexOf(currentStep) > index;
                    const Icon = step.icon;

                    return (
                        <React.Fragment key={step.key}>
                            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${isActive ? 'bg-primary text-primary-foreground' :
                                isCompleted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                }`}>
                                <Icon className="h-4 w-4" />
                                <span className="text-sm font-medium">{step.label}</span>
                            </div>
                            {index < 3 && (
                                <ArrowRight className={`h-4 w-4 ${isCompleted ? 'text-green-500' : 'text-gray-300'
                                    }`} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title={
                    <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5" />
                        Bulk Import Suppliers
                    </div>
                }
                description="Import multiple suppliers at once using an Excel or CSV file"
                maxWidth="max-w-5xl"
                showDescription={true}
            >
                <div className="space-y-6">
                    {/* Step Indicator */}
                    <StepIndicator />

                    {/* Step 1: Get Started */}
                    {currentStep === 'start' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Get Started with Bulk Import
                                </CardTitle>
                                <CardDescription>
                                    Choose how you want to proceed with importing suppliers
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Download Template Option */}
                                    <Card className="border-2 border-dashed border-blue-200 hover:border-blue-300 transition-colors">
                                        <CardContent className="pt-6">
                                            <div className="text-center space-y-4">
                                                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <Download className="h-6 w-6 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-gray-900">Download Template</h3>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Get our template with sample data and formatting guidelines
                                                    </p>
                                                </div>
                                                <Button onClick={handleDownloadTemplate} className="w-full">
                                                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                                                    Download Template
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Upload Existing File Option */}
                                    <Card className="border-2 border-dashed border-green-200 hover:border-green-300 transition-colors">
                                        <CardContent className="pt-6">
                                            <div className="text-center space-y-4">
                                                <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                                    <Upload className="h-6 w-6 text-green-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-gray-900">Upload Existing File</h3>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Already have a supplier list? Upload it directly
                                                    </p>
                                                </div>
                                                <Button onClick={handleSkipToUpload} variant="outline" className="w-full">
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    Upload File
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                                        <div>
                                            <h4 className="font-medium text-blue-900">Supported File Formats</h4>
                                            <ul className="text-sm text-blue-700 mt-2 space-y-1">
                                                <li>• CSV files (.csv)</li>
                                                <li>• Excel files (.xlsx, .xls)</li>
                                                <li>• Maximum file size: 5MB</li>
                                                <li>• Up to 100 suppliers per import</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 2: Upload File */}
                    {(currentStep === 'upload' || currentStep === 'import' || currentStep === 'complete') && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Upload className="h-5 w-5" />
                                    Step 2: Upload Completed File
                                </CardTitle>
                                <CardDescription>
                                    Upload your completed CSV or Excel file with supplier data
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".csv,.xlsx,.xls"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />

                                    {uploadedFile ? (
                                        <div className="space-y-2">
                                            <FileSpreadsheet className="h-12 w-12 mx-auto text-green-500" />
                                            <p className="font-medium">{uploadedFile.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {(uploadedFile.size / 1024).toFixed(1)} KB
                                            </p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                Choose Different File
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <Upload className="h-12 w-12 mx-auto text-gray-400" />
                                            <p className="text-lg font-medium">Drop your file here or click to browse</p>
                                            <p className="text-sm text-muted-foreground">
                                                Supports CSV, Excel (.xlsx, .xls) files up to 5MB
                                            </p>
                                            <Button onClick={() => fileInputRef.current?.click()}>
                                                Choose File
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* Parse Errors */}
                                {parseErrors.length > 0 && (
                                    <Alert variant="destructive">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertDescription>
                                            <div className="space-y-1">
                                                <p className="font-medium">Found {parseErrors.length} issues:</p>
                                                <ul className="list-disc list-inside text-sm space-y-1 max-h-32 overflow-y-auto">
                                                    {parseErrors.map((error, index) => (
                                                        <li key={index}>{error}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {/* Preview Data */}
                                {parsedData.length > 0 && parseErrors.length === 0 && previewData && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-medium">Import Preview</h3>
                                            <Button variant="outline" size="sm" onClick={() => setShowPreviewModal(true)}>
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Details
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-5 w-5 text-blue-500" />
                                                <span className="text-sm">
                                                    <strong>{previewData.totalSuppliers}</strong> suppliers ready
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Globe className="h-5 w-5 text-green-500" />
                                                <span className="text-sm">
                                                    <strong>{previewData.countries.length}</strong> countries
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Wrench className="h-5 w-5 text-orange-500" />
                                                <span className="text-sm">
                                                    <strong>{previewData.specialties.length}</strong> specialties
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 3: Import */}
                    {(currentStep === 'import' || currentStep === 'complete') && parsedData.length > 0 && parseErrors.length === 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Step 3: Start Import
                                </CardTitle>
                                <CardDescription>
                                    Begin importing the suppliers into your system
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Import Progress */}
                                {isProcessing && importProgress && (
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span>Importing suppliers...</span>
                                            <span>{importProgress.current} of {importProgress.total}</span>
                                        </div>
                                        <Progress value={(importProgress.current / importProgress.total) * 100} />
                                        {importProgress.currentSupplier && (
                                            <p className="text-sm text-muted-foreground">
                                                Processing: <strong>{importProgress.currentSupplier}</strong>
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Import Result */}
                                {importResult && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                                                <CheckCircle className="h-6 w-6 text-green-500" />
                                                <div>
                                                    <p className="font-medium text-green-700">
                                                        {importResult.success} Successful
                                                    </p>
                                                    <p className="text-sm text-green-600">Suppliers imported successfully</p>
                                                </div>
                                            </div>
                                            {importResult.failed > 0 && (
                                                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                                                    <XCircle className="h-6 w-6 text-red-500" />
                                                    <div>
                                                        <p className="font-medium text-red-700">
                                                            {importResult.failed} Failed
                                                        </p>
                                                        <p className="text-sm text-red-600">Check errors below</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {importResult.errors.length > 0 && (
                                            <Alert variant="destructive">
                                                <AlertTriangle className="h-4 w-4" />
                                                <AlertDescription>
                                                    <div className="space-y-1">
                                                        <p className="font-medium">Import Errors:</p>
                                                        <ul className="list-disc list-inside text-sm space-y-1 max-h-32 overflow-y-auto">
                                                            {importResult.errors.map((error, index) => (
                                                                <li key={index}>{error}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </AlertDescription>
                                            </Alert>
                                        )}

                                        {importResult.createdSuppliers.length > 0 && (
                                            <div>
                                                <h4 className="font-medium mb-2">Successfully Created Suppliers:</h4>
                                                <div className="space-y-1 max-h-32 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                                                    {importResult.createdSuppliers.map((supplier, index) => (
                                                        <div key={index} className="text-sm p-2 bg-white rounded border">
                                                            <span className="font-medium">{supplier.name}</span>
                                                            <span className="text-muted-foreground ml-2">({supplier.email})</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {!isProcessing && !importResult && (
                                    <Button
                                        onClick={handleStartImport}
                                        disabled={parsedData.length === 0}
                                        className="w-full"
                                        size="lg"
                                    >
                                        <Users className="h-4 w-4 mr-2" />
                                        Import {parsedData.length} Suppliers
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-between pt-4 border-t">
                        <Button variant="outline" onClick={onClose}>
                            {currentStep === 'complete' ? 'Close' : 'Cancel'}
                        </Button>

                        {currentStep === 'complete' && importResult && importResult.success > 0 && (
                            <Button onClick={onClose}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Done
                            </Button>
                        )}
                    </div>
                </div>
            </Modal>

            {/* Preview Details Modal */}
            {
                previewData && (
                    <Modal
                        isOpen={showPreviewModal}
                        onClose={() => setShowPreviewModal(false)}
                        title={
                            <div className="flex items-center gap-2">
                                <Eye className="h-5 w-5" />
                                Import Preview Details
                            </div>
                        }
                        description="Review the suppliers that will be imported"
                        maxWidth="max-w-4xl"
                        showDescription={true}
                    >
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-center">
                                            <Users className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                                            <p className="text-2xl font-bold">{previewData.totalSuppliers}</p>
                                            <p className="text-sm text-muted-foreground">Total Suppliers</p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-center">
                                            <Globe className="h-8 w-8 mx-auto text-green-500 mb-2" />
                                            <p className="text-2xl font-bold">{previewData.countries.length}</p>
                                            <p className="text-sm text-muted-foreground">Countries</p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-center">
                                            <Wrench className="h-8 w-8 mx-auto text-orange-500 mb-2" />
                                            <p className="text-2xl font-bold">{previewData.specialties.length}</p>
                                            <p className="text-sm text-muted-foreground">Specialties</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">By Country</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3 max-h-64 overflow-y-auto">
                                            {Object.entries(previewData.summary.byCountry).map(([country, count]) => (
                                                <div key={country} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                                    <span className="font-medium">{country}</span>
                                                    <Badge variant="secondary" className="ml-2">{count} suppliers</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">By Specialty</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3 max-h-64 overflow-y-auto">
                                            {Object.entries(previewData.summary.bySpecialty).map(([specialty, count]) => (
                                                <div key={specialty} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                                    <span className="font-medium capitalize">{specialty.replace('_', ' ')}</span>
                                                    <Badge variant="secondary" className="ml-2">{count} suppliers</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                                    <div>
                                        <h4 className="font-medium text-blue-900">Import Summary</h4>
                                        <p className="text-sm text-blue-700 mt-1">
                                            Ready to import {previewData.totalSuppliers} suppliers from {previewData.countries.length} countries
                                            with {previewData.specialties.length} different specialties.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal>
                )}
        </>
    );
}