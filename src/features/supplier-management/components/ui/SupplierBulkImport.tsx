// Supplier Bulk Import Component
// UI for uploading and importing multiple suppliers from Excel/CSV

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
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
    Eye
} from 'lucide-react';
import { useAuth } from '@/core/auth';
import { useToast } from '@/shared/hooks/use-toast';
import { downloadSupplierTemplate, parseSupplierImportFile } from '@/utils/excelTemplateGenerator';
import { SupplierBulkImportService, type BulkImportResult, type BulkImportProgress } from '@/services/supplierBulkImportService';
import type { SupplierImportRow } from '@/utils/supplierImportTemplate';

interface SupplierBulkImportProps {
    onImportComplete?: (result: BulkImportResult) => void;
    onClose?: () => void;
}

export function SupplierBulkImport({ onImportComplete, onClose }: SupplierBulkImportProps) {
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
            } else if (data.length > 0) {
                toast({
                    title: 'File Parsed Successfully',
                    description: `Found ${data.length} suppliers ready for import.`,
                });
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
    };

    // Start import process
    const handleStartImport = async () => {
        if (!profile?.organization_id || parsedData.length === 0) return;

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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Bulk Import Suppliers</h2>
                <p className="text-muted-foreground">
                    Import multiple suppliers at once using an Excel or CSV file
                </p>
            </div>

            {/* Step 1: Download Template */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5" />
                        Step 1: Download Template
                    </CardTitle>
                    <CardDescription>
                        Download the supplier import template with sample data and instructions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleDownloadTemplate} variant="outline" className="w-full">
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Download Supplier Import Template
                    </Button>
                </CardContent>
            </Card>

            {/* Step 2: Upload File */}
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
                                    <ul className="list-disc list-inside text-sm space-y-1">
                                        {parseErrors.slice(0, 5).map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                        {parseErrors.length > 5 && (
                                            <li>... and {parseErrors.length - 5} more issues</li>
                                        )}
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
                                <Dialog open={showPreview} onOpenChange={setShowPreview}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            <Eye className="h-4 w-4 mr-2" />
                                            View Details
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle>Import Preview Details</DialogTitle>
                                            <DialogDescription>
                                                Review the suppliers that will be imported
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
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

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <h4 className="font-medium mb-2">By Country</h4>
                                                    <div className="space-y-2">
                                                        {Object.entries(previewData.summary.byCountry).map(([country, count]) => (
                                                            <div key={country} className="flex justify-between items-center">
                                                                <span className="text-sm">{country}</span>
                                                                <Badge variant="secondary">{count}</Badge>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="font-medium mb-2">By Specialty</h4>
                                                    <div className="space-y-2">
                                                        {Object.entries(previewData.summary.bySpecialty).slice(0, 10).map(([specialty, count]) => (
                                                            <div key={specialty} className="flex justify-between items-center">
                                                                <span className="text-sm capitalize">{specialty.replace('_', ' ')}</span>
                                                                <Badge variant="secondary">{count}</Badge>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            {/* Step 3: Import */}
            {parsedData.length > 0 && parseErrors.length === 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5" />
                            Step 3: Start Import
                        </CardTitle>
                        <CardDescription>
                            Begin importing the suppliers into your system
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Import Progress */}
                        {isProcessing && importProgress && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Importing suppliers...</span>
                                    <span>{importProgress.current} of {importProgress.total}</span>
                                </div>
                                <Progress value={(importProgress.current / importProgress.total) * 100} />
                                {importProgress.currentSupplier && (
                                    <p className="text-sm text-muted-foreground">
                                        Processing: {importProgress.currentSupplier}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Import Result */}
                        {importResult && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                        <span className="font-medium text-green-700">
                                            {importResult.success} Successful
                                        </span>
                                    </div>
                                    {importResult.failed > 0 && (
                                        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                                            <XCircle className="h-5 w-5 text-red-500" />
                                            <span className="font-medium text-red-700">
                                                {importResult.failed} Failed
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {importResult.errors.length > 0 && (
                                    <Alert variant="destructive">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertDescription>
                                            <div className="space-y-1">
                                                <p className="font-medium">Import Errors:</p>
                                                <ul className="list-disc list-inside text-sm space-y-1">
                                                    {importResult.errors.slice(0, 5).map((error, index) => (
                                                        <li key={index}>{error}</li>
                                                    ))}
                                                    {importResult.errors.length > 5 && (
                                                        <li>... and {importResult.errors.length - 5} more errors</li>
                                                    )}
                                                </ul>
                                            </div>
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {importResult.createdSuppliers.length > 0 && (
                                    <div>
                                        <h4 className="font-medium mb-2">Successfully Created Suppliers:</h4>
                                        <div className="space-y-1 max-h-32 overflow-y-auto">
                                            {importResult.createdSuppliers.map((supplier, index) => (
                                                <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                                                    <span className="font-medium">{supplier.name}</span>
                                                    <span className="text-muted-foreground ml-2">({supplier.email})</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button
                                onClick={handleStartImport}
                                disabled={isProcessing || parsedData.length === 0}
                                className="flex-1"
                            >
                                {isProcessing ? 'Importing...' : `Import ${parsedData.length} Suppliers`}
                            </Button>

                            {onClose && (
                                <Button variant="outline" onClick={onClose}>
                                    Close
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}