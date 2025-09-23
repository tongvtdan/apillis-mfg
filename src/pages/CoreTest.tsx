import React from 'react';
import { CoreModulesTestWrapper } from '@/core/core-test';

/**
 * Core Modules Test Page
 * This page provides a comprehensive test of all core modules
 */
export default function CoreTest() {
    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Core Modules Testing</h1>
                <p className="text-muted-foreground">
                    This page tests the functionality of all core modules implemented in Phase 1.
                    Each module is tested for proper imports, initialization, and basic functionality.
                </p>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Testing Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div>
                        <h3 className="font-medium">Auth Module</h3>
                        <p className="text-muted-foreground">Authentication, authorization, user management</p>
                    </div>
                    <div>
                        <h3 className="font-medium">Workflow Module</h3>
                        <p className="text-muted-foreground">Project workflow management, stage transitions</p>
                    </div>
                    <div>
                        <h3 className="font-medium">Approvals Module</h3>
                        <p className="text-muted-foreground">Approval workflows, delegation, history</p>
                    </div>
                    <div>
                        <h3 className="font-medium">Documents Module</h3>
                        <p className="text-muted-foreground">Document management, versioning, upload</p>
                    </div>
                    <div>
                        <h3 className="font-medium">Activity Log Module</h3>
                        <p className="text-muted-foreground">Activity tracking, audit trails, analytics</p>
                    </div>
                    <div>
                        <h3 className="font-medium">Integration Test</h3>
                        <p className="text-muted-foreground">Cross-module integration and data flow</p>
                    </div>
                </div>
            </div>

            <CoreModulesTestWrapper />
        </div>
    );
}
