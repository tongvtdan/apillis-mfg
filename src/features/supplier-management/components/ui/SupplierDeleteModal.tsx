import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface Supplier {
    id: string;
    name: string;
    company?: string;
    // Add other supplier properties as needed
}

interface SupplierDeleteModalProps {
    supplier: Supplier;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function SupplierDeleteModal({
    supplier,
    isOpen,
    onClose,
    onConfirm
}: SupplierDeleteModalProps) {
    const [confirmationText, setConfirmationText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const expectedText = supplier.name;
    const isConfirmationValid = confirmationText === expectedText;

    const handleConfirm = async () => {
        if (!isConfirmationValid) return;

        setIsDeleting(true);
        try {
            await onConfirm();
        } finally {
            setIsDeleting(false);
        }
    };

    const handleClose = () => {
        setConfirmationText('');
        setIsDeleting(false);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={
                <div className="flex items-center text-red-600">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Delete Supplier
                </div>
            }
            description="This action cannot be undone. This will permanently delete the supplier and remove all associated data."
            showDescription={true}
            maxWidth="max-w-md"
        >

            <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start">
                        <Trash2 className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                            <h4 className="font-medium text-red-800">Warning</h4>
                            <p className="text-sm text-red-700 mt-1">
                                Deleting this supplier will permanently remove:
                            </p>
                            <ul className="text-sm text-red-700 mt-2 list-disc list-inside space-y-1">
                                <li>Supplier profile and contact information</li>
                                <li>Qualification records and certificates</li>
                                <li>Performance history and metrics</li>
                                <li>RFQ responses and quotes</li>
                                <li>All associated documents</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div>
                    <Label htmlFor="confirmation">
                        To confirm deletion, type <strong>{expectedText}</strong> below:
                    </Label>
                    <Input
                        id="confirmation"
                        value={confirmationText}
                        onChange={(e) => setConfirmationText(e.target.value)}
                        placeholder={expectedText}
                        className="mt-2"
                    />
                </div>

                <div className="p-3 bg-gray-50 border rounded-lg">
                    <p className="text-sm text-gray-600">
                        <strong>Supplier:</strong> {supplier.name}
                        {supplier.company && (
                            <span> ({supplier.company})</span>
                        )}
                    </p>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={handleClose}>
                    Cancel
                </Button>
                <Button
                    type="button"
                    variant="destructive"
                    onClick={handleConfirm}
                    disabled={!isConfirmationValid || isDeleting}
                >
                    {isDeleting ? 'Deleting...' : 'Delete Supplier'}
                </Button>
            </div>
        </Modal>
    );
}
