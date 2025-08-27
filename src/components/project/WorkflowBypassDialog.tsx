import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Info, X } from 'lucide-react';

interface WorkflowBypassDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string, comment: string) => void;
    currentStage: string;
    nextStage: string;
    validationWarnings: string[];
}

export function WorkflowBypassDialog({
    isOpen,
    onClose,
    onConfirm,
    currentStage,
    nextStage,
    validationWarnings
}: WorkflowBypassDialogProps) {
    const [reason, setReason] = useState('');
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirm = async () => {
        if (!reason.trim()) return;

        setIsSubmitting(true);
        try {
            await onConfirm(reason.trim(), comment.trim());
            handleClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setReason('');
        setComment('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-lg flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-[500px] bg-card border rounded-lg shadow-lg">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            <h2 className="text-lg font-semibold">Workflow Bypass Required</h2>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleClose}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-6">
                        You are attempting to move a project from <strong>{currentStage}</strong> to <strong>{nextStage}</strong>,
                        but some exit criteria are not met. As a manager, you can bypass this requirement.
                    </p>

                    <div className="space-y-4">
                        {validationWarnings.length > 0 && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                <div className="flex items-start gap-2">
                                    <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm text-amber-800">
                                        <p className="font-medium mb-1">Validation Warnings:</p>
                                        <ul className="list-disc list-inside space-y-1">
                                            {validationWarnings.map((warning, index) => (
                                                <li key={index}>{warning}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason for Bypass *</Label>
                            <Input
                                id="reason"
                                placeholder="e.g., Urgent customer request, Special circumstances"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="comment">Additional Comments</Label>
                            <Textarea
                                id="comment"
                                placeholder="Provide additional context or justification..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 pt-6">
                        <Button variant="outline" onClick={handleClose} disabled={isSubmitting} className="flex-1">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={!reason.trim() || isSubmitting}
                            className="bg-amber-600 hover:bg-amber-700 flex-1"
                        >
                            {isSubmitting ? 'Processing...' : 'Confirm Bypass'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
