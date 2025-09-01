import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';

interface DocumentUploadZoneProps {
    projectId: string;
    onClose: () => void;
}

/**
 * Document upload zone component with drag-and-drop support
 * TODO: Implement full upload functionality with progress tracking
 */
export const DocumentUploadZone: React.FC<DocumentUploadZoneProps> = ({
    projectId,
    onClose
}) => {
    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        Upload Documents
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="w-4 h-4" />
                        </Button>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Drag and drop zone */}
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center">
                        <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Drop files here or click to browse</h3>
                        <p className="text-muted-foreground mb-4">
                            Support for PDF, DOC, DOCX, XLS, XLSX, DWG, and image files
                        </p>
                        <Button>
                            <Upload className="w-4 h-4 mr-2" />
                            Select Files
                        </Button>
                    </div>

                    {/* Upload progress area */}
                    <div className="space-y-2">
                        <h4 className="font-medium">Upload Progress</h4>
                        <p className="text-sm text-muted-foreground">
                            No files selected for upload
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button disabled>
                            Upload Files
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};