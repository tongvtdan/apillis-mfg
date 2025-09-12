/**
 * Document Debug Panel Component
 * 
 * React component for in-app debugging of document saving issues.
 * Provides a comprehensive interface for testing and debugging document operations.
 */

import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    CheckCircle,
    XCircle,
    AlertTriangle,
    Info,
    Upload,
    Database,
    FileText,
    Trash2,
    Download,
    RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
    DocumentDebugLogger,
    validateDocumentData,
    checkDatabaseConnectivity,
    checkStorageBucket,
    simulateDocumentUpload,
    generateDebugReport,
    cleanupDebugDocuments,
    formatFileSize,
    type DocumentUploadDebugResult,
    type DocumentValidationResult
} from '@/utils/documentDebugUtils';

interface DocumentDebugPanelProps {
    projectId?: string;
    onClose?: () => void;
    className?: string;
}

export function DocumentDebugPanel({
    projectId,
    onClose,
    className
}: DocumentDebugPanelProps) {
    const { toast } = useToast();
    const { user, profile } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State management
    const [isLoading, setIsLoading] = useState(false);
    const [debugLogs, setDebugLogs] = useState<DocumentUploadDebugResult[]>([]);
    const [validationResult, setValidationResult] = useState<DocumentValidationResult | null>(null);
    const [debugReport, setDebugReport] = useState<any>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [testResults, setTestResults] = useState<any[]>([]);

    // Debug logger instance
    const debugLogger = new DocumentDebugLogger(true);

    // Handle file selection
    const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setValidationResult(null);
            setDebugLogs([]);
        }
    }, []);

    // Validate selected file
    const handleValidateFile = useCallback(async () => {
        if (!selectedFile) {
            toast({
                variant: "destructive",
                title: "No file selected",
                description: "Please select a file to validate"
            });
            return;
        }

        setIsLoading(true);
        try {
            const result = await validateDocumentData(
                selectedFile,
                profile?.organization_id,
                projectId,
                user?.id
            );
            setValidationResult(result);

            toast({
                title: result.isValid ? "Validation passed" : "Validation failed",
                description: result.isValid
                    ? "File is ready for upload"
                    : `Issues found: ${result.errors.join(', ')}`,
                variant: result.isValid ? "default" : "destructive"
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Validation error",
                description: error instanceof Error ? error.message : "Unknown error"
            });
        } finally {
            setIsLoading(false);
        }
    }, [selectedFile, profile?.organization_id, projectId, user?.id, toast]);

    // Simulate document upload
    const handleSimulateUpload = useCallback(async () => {
        if (!selectedFile || !profile?.organization_id || !user?.id) {
            toast({
                variant: "destructive",
                title: "Missing required data",
                description: "Please ensure file is selected and user context is available"
            });
            return;
        }

        setIsLoading(true);
        setDebugLogs([]);

        try {
            const result = await simulateDocumentUpload(
                selectedFile,
                profile.organization_id,
                user.id,
                projectId,
                debugLogger
            );

            setDebugLogs(result.logs || []);

            if (result.success) {
                toast({
                    title: "Upload simulation successful",
                    description: `Document created with ID: ${result.documentId}`
                });

                // Add to test results
                setTestResults(prev => [...prev, {
                    id: result.documentId,
                    fileName: selectedFile.name,
                    success: true,
                    timestamp: new Date().toISOString()
                }]);
            } else {
                toast({
                    variant: "destructive",
                    title: "Upload simulation failed",
                    description: result.error
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Simulation error",
                description: error instanceof Error ? error.message : "Unknown error"
            });
        } finally {
            setIsLoading(false);
        }
    }, [selectedFile, profile?.organization_id, user?.id, projectId, toast]);

    // Generate debug report
    const handleGenerateReport = useCallback(async () => {
        setIsLoading(true);
        try {
            const report = await generateDebugReport();
            setDebugReport(report);

            toast({
                title: "Debug report generated",
                description: "System status and recommendations available"
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Report generation failed",
                description: error instanceof Error ? error.message : "Unknown error"
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    // Clean up test documents
    const handleCleanup = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await cleanupDebugDocuments();

            toast({
                title: "Cleanup completed",
                description: `Cleaned ${result.cleaned} documents. ${result.errors.length} errors occurred.`
            });

            if (result.errors.length > 0) {
                console.error('Cleanup errors:', result.errors);
            }

            // Clear test results
            setTestResults([]);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Cleanup failed",
                description: error instanceof Error ? error.message : "Unknown error"
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    // Export logs
    const handleExportLogs = useCallback(() => {
        if (debugLogs.length === 0) {
            toast({
                variant: "destructive",
                title: "No logs to export",
                description: "Run a simulation first to generate logs"
            });
            return;
        }

        const logsJson = JSON.stringify(debugLogs, null, 2);
        const blob = new Blob([logsJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `document-debug-logs-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({
            title: "Logs exported",
            description: "Debug logs have been downloaded"
        });
    }, [debugLogs, toast]);

    // Get status icon
    const getStatusIcon = (success: boolean) => {
        return success ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
            <XCircle className="h-4 w-4 text-red-500" />
        );
    };

    // Get status badge
    const getStatusBadge = (success: boolean) => {
        return success ? (
            <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Success
            </Badge>
        ) : (
            <Badge variant="destructive">
                <XCircle className="h-3 w-3 mr-1" />
                Failed
            </Badge>
        );
    };

    return (
        <div className={`w-full max-w-6xl mx-auto p-6 ${className}`}>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Document Debug Panel
                    </CardTitle>
                    <CardDescription>
                        Debug and test document saving functionality with comprehensive tools and logging
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Tabs defaultValue="upload" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="upload">Upload Test</TabsTrigger>
                            <TabsTrigger value="system">System Check</TabsTrigger>
                            <TabsTrigger value="logs">Debug Logs</TabsTrigger>
                            <TabsTrigger value="results">Test Results</TabsTrigger>
                        </TabsList>

                        {/* Upload Test Tab */}
                        <TabsContent value="upload" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* File Selection */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">File Selection</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label htmlFor="file-input">Select Test File</Label>
                                            <Input
                                                ref={fileInputRef}
                                                id="file-input"
                                                type="file"
                                                onChange={handleFileSelect}
                                                className="mt-2"
                                            />
                                        </div>

                                        {selectedFile && (
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <h4 className="font-medium">Selected File:</h4>
                                                <p className="text-sm text-gray-600">Name: {selectedFile.name}</p>
                                                <p className="text-sm text-gray-600">Size: {formatFileSize(selectedFile.size)}</p>
                                                <p className="text-sm text-gray-600">Type: {selectedFile.type}</p>
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            <Button
                                                onClick={handleValidateFile}
                                                disabled={!selectedFile || isLoading}
                                                variant="outline"
                                                size="sm"
                                            >
                                                <Info className="h-4 w-4 mr-2" />
                                                Validate
                                            </Button>

                                            <Button
                                                onClick={handleSimulateUpload}
                                                disabled={!selectedFile || isLoading}
                                                size="sm"
                                            >
                                                <Upload className="h-4 w-4 mr-2" />
                                                Simulate Upload
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Validation Results */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Validation Results</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {validationResult ? (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(validationResult.isValid)}
                                                    <span className="font-medium">
                                                        {validationResult.isValid ? 'Valid' : 'Invalid'}
                                                    </span>
                                                </div>

                                                {validationResult.errors.length > 0 && (
                                                    <div>
                                                        <h4 className="font-medium text-red-600 mb-2">Errors:</h4>
                                                        <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                                                            {validationResult.errors.map((error, index) => (
                                                                <li key={index}>{error}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {validationResult.warnings.length > 0 && (
                                                    <div>
                                                        <h4 className="font-medium text-yellow-600 mb-2">Warnings:</h4>
                                                        <ul className="list-disc list-inside text-sm text-yellow-600 space-y-1">
                                                            {validationResult.warnings.map((warning, index) => (
                                                                <li key={index}>{warning}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {validationResult.suggestions.length > 0 && (
                                                    <div>
                                                        <h4 className="font-medium text-blue-600 mb-2">Suggestions:</h4>
                                                        <ul className="list-disc list-inside text-sm text-blue-600 space-y-1">
                                                            {validationResult.suggestions.map((suggestion, index) => (
                                                                <li key={index}>{suggestion}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-sm">Select a file and click Validate to see results</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* System Check Tab */}
                        <TabsContent value="system" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">System Status</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <Button
                                            onClick={handleGenerateReport}
                                            disabled={isLoading}
                                            className="w-full"
                                        >
                                            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                            Generate System Report
                                        </Button>

                                        {debugReport && (
                                            <div className="space-y-3">
                                                <Separator />
                                                <div>
                                                    <h4 className="font-medium mb-2">Database Status:</h4>
                                                    <div className="flex items-center gap-2">
                                                        {getStatusIcon(debugReport.databaseStatus.connected)}
                                                        <span className="text-sm">
                                                            {debugReport.databaseStatus.connected ? 'Connected' : 'Disconnected'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="font-medium mb-2">Storage Status:</h4>
                                                    <div className="flex items-center gap-2">
                                                        {getStatusIcon(debugReport.storageStatus.exists)}
                                                        <span className="text-sm">
                                                            {debugReport.storageStatus.exists ? 'Available' : 'Unavailable'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="font-medium mb-2">Document Issues:</h4>
                                                    <div className="text-sm space-y-1">
                                                        <p>Orphaned: {debugReport.documentIssues.orphanedDocuments}</p>
                                                        <p>Invalid sizes: {debugReport.documentIssues.invalidSizes}</p>
                                                        <p>Duplicate paths: {debugReport.documentIssues.duplicatePaths}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Recommendations</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {debugReport?.recommendations && debugReport.recommendations.length > 0 ? (
                                            <div className="space-y-2">
                                                {debugReport.recommendations.map((rec, index) => (
                                                    <Alert key={index}>
                                                        <AlertTriangle className="h-4 w-4" />
                                                        <AlertDescription>{rec}</AlertDescription>
                                                    </Alert>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-sm">Generate a report to see recommendations</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Debug Logs Tab */}
                        <TabsContent value="logs" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Debug Logs</CardTitle>
                                    <CardDescription>
                                        Detailed logs from document upload simulations
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-2 mb-4">
                                        <Button
                                            onClick={handleExportLogs}
                                            disabled={debugLogs.length === 0}
                                            variant="outline"
                                            size="sm"
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Export Logs
                                        </Button>
                                    </div>

                                    <ScrollArea className="h-96 w-full">
                                        {debugLogs.length > 0 ? (
                                            <div className="space-y-3">
                                                {debugLogs.map((log, index) => (
                                                    <div key={index} className="p-3 border rounded-lg">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                {getStatusIcon(log.success)}
                                                                <span className="font-medium">{log.step}</span>
                                                            </div>
                                                            <span className="text-xs text-gray-500">{log.timestamp}</span>
                                                        </div>

                                                        {log.data && (
                                                            <div className="mb-2">
                                                                <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                                                                    {JSON.stringify(log.data, null, 2)}
                                                                </pre>
                                                            </div>
                                                        )}

                                                        {log.error && (
                                                            <div className="text-red-600 text-sm">
                                                                <strong>Error:</strong> {log.error}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-center py-8">
                                                No logs available. Run a simulation to generate logs.
                                            </p>
                                        )}
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Test Results Tab */}
                        <TabsContent value="results" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Test Results</CardTitle>
                                    <CardDescription>
                                        Results from document upload simulations
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-2 mb-4">
                                        <Button
                                            onClick={handleCleanup}
                                            disabled={testResults.length === 0 || isLoading}
                                            variant="outline"
                                            size="sm"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Cleanup Test Documents
                                        </Button>
                                    </div>

                                    <ScrollArea className="h-96 w-full">
                                        {testResults.length > 0 ? (
                                            <div className="space-y-3">
                                                {testResults.map((result, index) => (
                                                    <div key={index} className="p-3 border rounded-lg">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                {getStatusBadge(result.success)}
                                                                <span className="font-medium">{result.fileName}</span>
                                                            </div>
                                                            <span className="text-xs text-gray-500">{result.timestamp}</span>
                                                        </div>

                                                        {result.id && (
                                                            <div className="text-sm text-gray-600">
                                                                Document ID: {result.id}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-center py-8">
                                                No test results available. Run simulations to see results.
                                            </p>
                                        )}
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}