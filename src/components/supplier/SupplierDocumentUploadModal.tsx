import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SupplierDocumentUploader } from './SupplierDocumentUploader';
import { useToast } from '@/shared/hooks/use-toast';

interface SupplierDocumentUploadModalProps {
    supplierId: string;
    isOpen: boolean;
    onClose: () => void;
    onUploadSuccess?: () => void;
}

export function SupplierDocumentUploadModal({
    supplierId,
    isOpen,
    onClose,
    onUploadSuccess
}: SupplierDocumentUploadModalProps) {
    const { toast } = useToast();

    const handleUploadSuccess = (document: any) => {
        toast({
            title: "Success",
            description: "Document uploaded successfully"
        });
        onUploadSuccess?.();
    };

    const handleUploadError = (error: string) => {
        toast({
            title: "Error",
            description: `Failed to upload document: ${error}`,
            variant: "destructive"
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Upload Supplier Documents</DialogTitle>
                </DialogHeader>
                
                <SupplierDocumentUploader
                    supplierId={supplierId}
                    onUploadSuccess={handleUploadSuccess}
                    onUploadError={handleUploadError}
                    onClose={onClose}
                    maxFileSize={50}
                    allowedTypes={['*']}
                    showMetadata={true}
                />
            </DialogContent>
        </Dialog>
    );
}
