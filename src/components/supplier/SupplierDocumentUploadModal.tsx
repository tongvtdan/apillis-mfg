import React from 'react';
import { Modal } from '@/components/ui/modal';
import { SupplierDocumentUploader } from './SupplierDocumentUploader';
import { useToast } from '@/shared/hooks/use-toast';
import { Upload } from 'lucide-react';

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
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Upload Supplier Documents
                </div>
            }
            maxWidth="max-w-4xl"
        >
            <SupplierDocumentUploader
                supplierId={supplierId}
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
                onClose={onClose}
                maxFileSize={50}
                allowedTypes={['*']}
                showMetadata={true}
            />
        </Modal>
    );
}
