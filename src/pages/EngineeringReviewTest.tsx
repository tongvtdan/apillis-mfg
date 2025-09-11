import React from 'react';
import { EngineeringReviewForm, DEPARTMENT_CONFIG, TECHNICAL_FEASIBILITY_RATINGS } from '@/features/engineering-review';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * Engineering Review Feature Test Page
 * This page demonstrates the new engineering review feature implementation
 */
export default function EngineeringReviewTest() {
    const handleSubmit = (result: any) => {
        console.log('Engineering review submitted:', result);
        if (result.success) {
            alert(`Review submitted successfully! Review ID: ${result.reviewId}`);
        } else {
            alert(`Review submission failed: ${result.error}`);
        }
    };

    const handleCancel = () => {
        console.log('Review cancelled');
        alert('Review cancelled');
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Engineering Review Feature Test</h1>
                <p className="text-muted-foreground">
                    This page tests the new feature-based engineering review implementation.
                    The engineering review feature provides comprehensive technical assessment capabilities.
                </p>
            </div>

            {/* Feature Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">🔧 Engineering Review Feature</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <h4 className="font-semibold text-blue-700">📋 Assessment</h4>
                            <ul className="text-sm space-y-1">
                                <li>• Technical feasibility</li>
                                <li>• Complexity analysis</li>
                                <li>• Effort estimation</li>
                                <li>• Risk assessment</li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold text-green-700">✅ Review Types</h4>
                            <ul className="text-sm space-y-1">
                                <li>• Design Engineering</li>
                                <li>• Manufacturing Engineering</li>
                                <li>• Quality Engineering</li>
                                <li>• Materials Engineering</li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold text-purple-700">🎯 Decisions</h4>
                            <ul className="text-sm space-y-1">
                                <li>• Approve project</li>
                                <li>• Request revisions</li>
                                <li>• Reject project</li>
                                <li>• Risk mitigation</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Test Configuration */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">⚙️ Test Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold mb-3">Available Departments</h4>
                            <div className="space-y-2">
                                {Object.entries(DEPARTMENT_CONFIG).map(([key, config]) => (
                                    <div key={key} className="flex items-center space-x-2">
                                        <span className="text-lg">{config.icon}</span>
                                        <div>
                                            <div className="font-medium">{config.label}</div>
                                            <div className="text-sm text-muted-foreground">{config.focus}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-3">Feasibility Ratings</h4>
                            <div className="space-y-2">
                                {Object.entries(TECHNICAL_FEASIBILITY_RATINGS).map(([key, config]) => (
                                    <div key={key} className="flex items-center space-x-2">
                                        <Badge variant="outline" className={config.color}>
                                            {config.label}
                                        </Badge>
                                        <span className="text-sm">({config.score}/5)</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Test Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">📝 Engineering Review Form</CardTitle>
                    <p className="text-muted-foreground">
                        Test the engineering review form below. This demonstrates the comprehensive
                        technical assessment capabilities of the new feature.
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="bg-blue-50 p-4 rounded-lg mb-6">
                        <div className="flex items-start space-x-3">
                            <div className="text-blue-600 mt-0.5">ℹ️</div>
                            <div>
                                <h4 className="font-medium text-blue-900">Test Project</h4>
                                <p className="text-sm text-blue-700 mt-1">
                                    <strong>Project:</strong> Custom Manufacturing Widget Assembly<br />
                                    <strong>ID:</strong> PRJ-TEST-001<br />
                                    <strong>Description:</strong> High-volume production of precision mechanical widgets
                                    with tight tolerances and complex assembly requirements.
                                </p>
                            </div>
                        </div>
                    </div>

                    <EngineeringReviewForm
                        projectId="PRJ-TEST-001"
                        projectTitle="Custom Manufacturing Widget Assembly"
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                    />
                </CardContent>
            </Card>

            {/* Architecture Notes */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">🏗️ Feature Architecture</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold mb-2">📁 Feature Structure</h4>
                            <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                                {`src/features/engineering-review/
├── components/
│   └── EngineeringReviewForm.tsx
├── services/
│   └── engineeringReviewService.ts
├── types/
│   └── engineering-review.types.ts
└── index.ts`}
                            </pre>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">🔗 Dependencies</h4>
                            <ul className="text-sm space-y-1">
                                <li><strong>Core Auth:</strong> User context, permissions</li>
                                <li><strong>Core Approvals:</strong> Revision requests</li>
                                <li><strong>Core Workflow:</strong> Stage transitions</li>
                                <li><strong>UI Components:</strong> Form components</li>
                                <li><strong>Database:</strong> Supabase integration</li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">🎯 Key Features</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <strong>Technical Assessment:</strong>
                                <ul className="mt-1 space-y-1">
                                    <li>• Feasibility analysis</li>
                                    <li>• Complexity evaluation</li>
                                    <li>• Effort estimation</li>
                                </ul>
                            </div>
                            <div>
                                <strong>Risk Management:</strong>
                                <ul className="mt-1 space-y-1">
                                    <li>• Risk identification</li>
                                    <li>• Impact assessment</li>
                                    <li>• Mitigation planning</li>
                                </ul>
                            </div>
                            <div>
                                <strong>Decision Support:</strong>
                                <ul className="mt-1 space-y-1">
                                    <li>• Approval workflows</li>
                                    <li>• Revision requests</li>
                                    <li>• Status tracking</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
