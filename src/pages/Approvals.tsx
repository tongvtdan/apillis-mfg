import React from 'react';
import { ApprovalDashboard } from '@/components/approval/ApprovalDashboard';

export default function Approvals() {
    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Approvals</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your pending approvals and view approval history.
                </p>
            </div>

            <ApprovalDashboard />
        </div>
    );
}