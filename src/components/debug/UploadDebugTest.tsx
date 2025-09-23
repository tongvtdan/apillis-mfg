/**
 * Upload Debug Test Component
 * A simple component to test upload functionality directly
 */

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDocumentManagement } from '@/core/documents/useDocument';
import { useAuth } from '@/contexts/AuthContext';

export function UploadDebugTest() {
    const { createDocument } = useDocumentManagement();
    const { user, profile } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [testResult, setTestResult] = useState<string>('');

    const handleTestUpload = async () => {
        console.log('🧪 [UploadDebugTest] Starting direct upload test');

        // Create a simple test file
        const testContent = `Test file created at ${new Date().toISOString()}\nThis is a test upload from the debug component.`;
        const blob = new Blob([testContent], { type: 'text/plain' });
        const testFile = new File([blob], 'debug_test_upload.txt', { type: 'text/plain' });

        console.log('📄 [UploadDebugTest] Created test file:', {
            name: testFile.name,
            size: testFile.size,
            type: testFile.type
        });

        console.log('👤 [UploadDebugTest] User context:', {
            userId: user?.id,
            organizationId: profile?.organization_id,
            email: user?.email
        });

        console.log('⚙️ [UploadDebugTest] createDocument function:', typeof createDocument);

        try {
            const result = await createDocument(testFile, {
                category: 'other',
                accessLevel: 'internal'
            }, '220e8400-e29b-41d4-a716-446655440001'); // Use the project ID from your logs

            console.log('✅ [UploadDebugTest] Upload result:', result);

            if (result) {
                setTestResult(`✅ SUCCESS: Document uploaded with ID: ${result.id}`);
            } else {
                setTestResult('❌ FAILED: createDocument returned null');
            }
        } catch (error) {
            console.error('❌ [UploadDebugTest] Upload error:', error);
            setTestResult(`❌ ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        console.log('📁 [UploadDebugTest] File selected:', {
            name: file.name,
            size: file.size,
            type: file.type
        });

        try {
            const result = await createDocument(file, {
                category: 'other',
                accessLevel: 'internal'
            }, '220e8400-e29b-41d4-a716-446655440001'); // Use the project ID from your logs

            console.log('✅ [UploadDebugTest] File upload result:', result);

            if (result) {
                setTestResult(`✅ SUCCESS: ${file.name} uploaded with ID: ${result.id}`);
            } else {
                setTestResult('❌ FAILED: createDocument returned null');
            }
        } catch (error) {
            console.error('❌ [UploadDebugTest] File upload error:', error);
            setTestResult(`❌ ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="text-lg">Upload Debug Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <Button onClick={handleTestUpload} variant="outline">
                        Test with Auto-Generated File
                    </Button>

                    <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                        Test with Selected File
                    </Button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleFileSelect}
                        accept="*/*"
                    />
                </div>

                {testResult && (
                    <div className="p-4 bg-muted rounded-lg">
                        <h4 className="font-medium mb-2">Test Result:</h4>
                        <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
                    </div>
                )}

                <div className="text-sm text-muted">
                    <p><strong>Debug Info:</strong></p>
                    <p>• Check browser console for detailed logs</p>
                    <p>• Look for [UploadDebugTest] and [DocumentProvider] logs</p>
                    <p>• Verify Supabase connection and storage bucket</p>
                </div>
            </CardContent>
        </Card>
    );
}
