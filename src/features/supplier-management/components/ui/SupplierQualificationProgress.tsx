import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    CheckCircle,
    Clock,
    XCircle,
    AlertTriangle,
    FileText,
    Download,
    RefreshCw,
    Ban,
    FileArchive
} from 'lucide-react';

interface QualificationStep {
    id: string;
    title: string;
    status: 'completed' | 'in_progress' | 'pending' | 'blocked';
    completedAt?: string;
    description?: string;
}

interface SupplierQualificationProgressProps {
    supplier: {
        id: string;
        name: string;
        qualificationStatus: 'not_started' | 'in_progress' | 'pending_approval' | 'qualified' | 'qualified_with_conditions' | 'qualified_as_exception' | 'rejected' | 'expired';
        qualificationExpiry?: string;
        qualificationConditions?: string;
        qualificationExceptionJustification?: string;
        qualificationExceptionExpiresAt?: string;
    };
    onRequalify?: () => void;
    onViewProfile?: () => void;
    onSendRFQ?: () => void;
    onBlockSupplier?: () => void;
    onExportReport?: () => void;
}

const QUALIFICATION_STATUS_CONFIG = {
    not_started: { label: 'Not Started', color: 'bg-gray-100 text-gray-800' },
    in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
    pending_approval: { label: 'Pending Approval', color: 'bg-yellow-100 text-yellow-800' },
    qualified: { label: 'Qualified ✅', color: 'bg-green-100 text-green-800' },
    'qualified_with_conditions': { label: 'Qualified with Conditions ⚠️', color: 'bg-yellow-100 text-yellow-800' },
    'qualified_as_exception': { label: 'Qualified as Exception ⚠️', color: 'bg-orange-100 text-orange-800' },
    rejected: { label: 'Rejected ❌', color: 'bg-red-100 text-red-800' },
    expired: { label: 'Expired ⚠️', color: 'bg-red-100 text-red-800' }
};

const QUALIFICATION_STEPS: QualificationStep[] = [
    { id: 'profile_complete', title: 'Profile Completed', status: 'completed', completedAt: 'Sep 1, 2025' },
    { id: 'nda_signed', title: 'NDA Signed', status: 'completed', completedAt: 'Sep 2, 2025' },
    { id: 'docs_uploaded', title: 'Documents Uploaded', status: 'completed', completedAt: 'Sep 2, 2025' },
    { id: 'internal_review', title: 'Internal Review', status: 'completed', completedAt: 'Sep 3, 2025' },
    { id: 'final_approval', title: 'Final Approval', status: 'completed', completedAt: 'Sep 5, 2025' }
];

export function SupplierQualificationProgress({
    supplier,
    onRequalify,
    onViewProfile,
    onSendRFQ,
    onBlockSupplier,
    onExportReport
}: SupplierQualificationProgressProps) {
    const renderStatusIcon = (status: QualificationStep['status']) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'in_progress':
                return <Clock className="w-5 h-5 text-blue-500" />;
            case 'pending':
                return <Clock className="w-5 h-5 text-gray-400" />;
            case 'blocked':
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return <Clock className="w-5 h-5 text-gray-400" />;
        }
    };

    const renderStatusBadge = (status: QualificationStep['status']) => {
        switch (status) {
            case 'completed':
                return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
            case 'in_progress':
                return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
            case 'pending':
                return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>;
            case 'blocked':
                return <Badge className="bg-red-100 text-red-800">Blocked</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">
                            {supplier.name} – Qualification Progress
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                            <Badge className={QUALIFICATION_STATUS_CONFIG[supplier.qualificationStatus].color}>
                                {QUALIFICATION_STATUS_CONFIG[supplier.qualificationStatus].label}
                            </Badge>
                            {supplier.qualificationExpiry && (
                                <Badge variant="outline">
                                    Exp: {supplier.qualificationExpiry}
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2 mb-6">
                        <Button onClick={onViewProfile} variant="outline">
                            <FileText className="w-4 h-4 mr-2" />
                            View Profile
                        </Button>
                        <Button onClick={onSendRFQ} variant="default">
                            <FileText className="w-4 h-4 mr-2" />
                            Send RFQ
                        </Button>
                        <Button onClick={onRequalify} variant="outline">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Re-Qualify Now
                        </Button>
                        <Button onClick={onExportReport} variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Export Report
                        </Button>
                        <Button onClick={onBlockSupplier} variant="outline" className="text-destructive hover:text-destructive">
                            <Ban className="w-4 h-4 mr-2" />
                            Block Supplier
                        </Button>
                    </div>

                    {supplier.qualificationStatus === 'qualified_with_conditions' && supplier.qualificationConditions && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <div className="flex items-start">
                                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
                                <div>
                                    <h4 className="font-medium text-yellow-800">Conditions Applied</h4>
                                    <p className="text-yellow-700 text-sm mt-1">{supplier.qualificationConditions}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {supplier.qualificationStatus === 'qualified_as_exception' && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                            <div className="flex items-start">
                                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 mr-2" />
                                <div>
                                    <h4 className="font-medium text-orange-800">Exception Approval</h4>
                                    <p className="text-orange-700 text-sm mt-1">{supplier.qualificationExceptionJustification}</p>
                                    {supplier.qualificationExceptionExpiresAt && (
                                        <p className="text-orange-700 text-sm mt-1">
                                            Expires: {supplier.qualificationExceptionExpiresAt}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Qualification Steps</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {QUALIFICATION_STEPS.map((step) => (
                            <div key={step.id} className="flex items-center p-4 border rounded-lg hover:bg-muted/50">
                                <div className="mr-4">
                                    {renderStatusIcon(step.status)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-medium">{step.title}</h3>
                                        {renderStatusBadge(step.status)}
                                    </div>
                                    {step.completedAt && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Completed on {step.completedAt}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Documents</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center">
                                <FileText className="w-5 h-5 text-muted-foreground mr-3" />
                                <div>
                                    <p className="font-medium">NDA – Signed.pdf</p>
                                    <p className="text-sm text-muted-foreground">Uploaded Sep 2, 2025</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm">
                                <Download className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center">
                                <FileText className="w-5 h-5 text-muted-foreground mr-3" />
                                <div>
                                    <p className="font-medium">ISO 9001 Certificate.pdf</p>
                                    <p className="text-sm text-muted-foreground">Expires Dec 2026</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm">
                                <Download className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center">
                                <FileText className="w-5 h-5 text-muted-foreground mr-3" />
                                <div>
                                    <p className="font-medium">Insurance Certificate.pdf</p>
                                    <p className="text-sm text-muted-foreground">Expires Jun 2026</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm">
                                <Download className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center">
                                <FileText className="w-5 h-5 text-muted-foreground mr-3" />
                                <div>
                                    <p className="font-medium">Financial Statement.xlsx</p>
                                    <p className="text-sm text-muted-foreground">FY 2024</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm">
                                <Download className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}