import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { AlertTriangle, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface FinalApprovalModalProps {
    isOpen: boolean;
    onClose: () => void;
    supplier: {
        id: string;
        name: string;
    };
    onSubmit: (decision: {
        decisionType: 'approve' | 'partial' | 'exception' | 'reject';
        conditions?: string;
        exceptionJustification?: string;
        escalatedTo?: string;
        reviewDueDate?: string;
        attachedDocumentId?: string;
    }) => void;
}

export function FinalApprovalModal({ isOpen, onClose, supplier, onSubmit }: FinalApprovalModalProps) {
    const [decisionType, setDecisionType] = useState<'approve' | 'partial' | 'exception' | 'reject'>('approve');
    const [conditions, setConditions] = useState('');
    const [exceptionJustification, setExceptionJustification] = useState('');
    const [escalatedTo, setEscalatedTo] = useState('');
    const [reviewDueDate, setReviewDueDate] = useState('');
    const [attachedDocumentId, setAttachedDocumentId] = useState('');

    const handleSubmit = () => {
        onSubmit({
            decisionType,
            conditions: decisionType === 'partial' ? conditions : undefined,
            exceptionJustification: decisionType === 'exception' ? exceptionJustification : undefined,
            escalatedTo: decisionType === 'exception' ? escalatedTo : undefined,
            reviewDueDate: decisionType === 'exception' ? reviewDueDate : undefined,
            attachedDocumentId: decisionType === 'partial' ? attachedDocumentId : undefined,
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Final Approval – ${supplier.name}`}
            maxWidth="max-w-2xl"
        >
            <div className="space-y-6 py-4">
                <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Approval Options</h3>
                    <RadioGroup value={decisionType} onValueChange={(value) => setDecisionType(value as any)}>
                        <div className="flex items-start space-x-3 mb-4">
                            <RadioGroupItem value="approve" id="approve" />
                            <Label htmlFor="approve" className="flex-1">
                                <div className="flex items-center">
                                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                                    <span className="font-medium">Approve</span>
                                </div>
                                <p className="text-sm text-muted-foreground ml-7">Supplier fully qualified for all projects</p>
                            </Label>
                        </div>

                        <div className="flex items-start space-x-3 mb-4">
                            <RadioGroupItem value="partial" id="partial" />
                            <Label htmlFor="partial" className="flex-1">
                                <div className="flex items-center">
                                    <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
                                    <span className="font-medium">Approve with Conditions</span>
                                </div>
                                <p className="text-sm text-muted-foreground ml-7">
                                    Supplier qualified only if conditions are met
                                </p>
                                {decisionType === 'partial' && (
                                    <div className="mt-3 ml-7 space-y-4">
                                        <div>
                                            <Label htmlFor="conditions" className="text-sm font-medium">
                                                Conditions
                                            </Label>
                                            <Textarea
                                                id="conditions"
                                                value={conditions}
                                                onChange={(e) => setConditions(e.target.value)}
                                                placeholder="NDA must be signed within 48 hours of approval. Supplier must provide updated ISO 9001 cert by Oct 30, 2025."
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="attached-document" className="text-sm font-medium">
                                                Attach Document
                                            </Label>
                                            <div className="flex space-x-2 mt-1">
                                                <Input
                                                    id="attached-document"
                                                    value={attachedDocumentId}
                                                    onChange={(e) => setAttachedDocumentId(e.target.value)}
                                                    placeholder="Document ID or URL"
                                                />
                                                <Button variant="outline">Upload</Button>
                                            </div>
                                            {attachedDocumentId && (
                                                <div className="flex items-center mt-2 text-sm">
                                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                                                        NDA_Waiver_Signed.pdf ✅
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </Label>
                        </div>

                        <div className="flex items-start space-x-3 mb-4">
                            <RadioGroupItem value="exception" id="exception" />
                            <Label htmlFor="exception" className="flex-1">
                                <div className="flex items-center">
                                    <AlertCircle className="w-5 h-5 text-orange-500 mr-2" />
                                    <span className="font-medium">Approve as Exception</span>
                                </div>
                                <p className="text-sm text-muted-foreground ml-7">
                                    Supplier does not meet standards but approved for business need
                                </p>
                                {decisionType === 'exception' && (
                                    <div className="mt-3 ml-7 space-y-4">
                                        <div>
                                            <Label htmlFor="justification" className="text-sm font-medium">
                                                Justification
                                            </Label>
                                            <Textarea
                                                id="justification"
                                                value={exceptionJustification}
                                                onChange={(e) => setExceptionJustification(e.target.value)}
                                                placeholder="Supplier is sole source for material X. Risk accepted by Director of Ops."
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="escalate-to" className="text-sm font-medium">
                                                Escalate to
                                            </Label>
                                            <Select value={escalatedTo} onValueChange={setEscalatedTo}>
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Select approver" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="maria_chen">Maria Chen (Director of Operations)</SelectItem>
                                                    <SelectItem value="john_smith">John Smith (Procurement Manager)</SelectItem>
                                                    <SelectItem value="sarah_johnson">Sarah Johnson (Quality Manager)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="review-due" className="text-sm font-medium">
                                                Review Due
                                            </Label>
                                            <Input
                                                id="review-due"
                                                type="date"
                                                value={reviewDueDate}
                                                onChange={(e) => setReviewDueDate(e.target.value)}
                                                className="mt-1"
                                            />
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Max 90 days from today
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </Label>
                        </div>

                        <div className="flex items-start space-x-3">
                            <RadioGroupItem value="reject" id="reject" />
                            <Label htmlFor="reject" className="flex-1">
                                <div className="flex items-center">
                                    <XCircle className="w-5 h-5 text-red-500 mr-2" />
                                    <span className="font-medium">Reject</span>
                                </div>
                                <p className="text-sm text-muted-foreground ml-7">
                                    Supplier not qualified
                                </p>
                                {decisionType === 'reject' && (
                                    <div className="mt-3 ml-7">
                                        <Label htmlFor="rejection-reason" className="text-sm font-medium">
                                            Reason
                                        </Label>
                                        <Textarea
                                            id="rejection-reason"
                                            placeholder="Material certifications expired and not renewable."
                                            className="mt-1"
                                        />
                                    </div>
                                )}
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Preview Supplier Status</h3>
                    <div className="text-sm space-y-2">
                        {decisionType === 'approve' && (
                            <p>If approved: Status will be Qualified ✅</p>
                        )}
                        {decisionType === 'partial' && (
                            <div>
                                <p>If approved with conditions:</p>
                                <ul className="list-disc list-inside ml-4 space-y-1">
                                    <li>Status: Qualified (with conditions) ⚠️</li>
                                    <li>Conditions: {conditions || "N/A"}</li>
                                    <li>RFQs: Allowed only after conditions resolved</li>
                                </ul>
                            </div>
                        )}
                        {decisionType === 'exception' && (
                            <div>
                                <p>If approved as exception:</p>
                                <ul className="list-disc list-inside ml-4 space-y-1">
                                    <li>Status: Qualified (exception) ⚠️</li>
                                    <li>Expires: {reviewDueDate || "N/A"}</li>
                                    <li>RFQs: Allowed with manual override + audit log</li>
                                </ul>
                            </div>
                        )}
                        {decisionType === 'reject' && (
                            <p>If rejected: Status will be Rejected ❌</p>
                        )}
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit}>
                        Submit Approval →
                    </Button>
                </div>
            </div>
        </Modal>
    );
}