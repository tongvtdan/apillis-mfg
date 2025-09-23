import React from 'react';
import { IntakeForm, IntakeSubmissionType } from '@/features/intake';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * Intake Feature Test Page
 * This page demonstrates the new intake feature implementation
 */
export default function IntakeTest() {
    const handleSuccess = (projectId: string) => {
        console.log('Intake submitted successfully:', projectId);
        // You could add navigation logic here
        // navigate(`/projects/${projectId}`);
    };

    const handleError = (error: string) => {
        console.error('Intake submission failed:', error);
        // You could add error handling logic here
    };

    const submissionTypes: IntakeSubmissionType[] = ['inquiry', 'rfq', 'po', 'design_idea'];

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Intake Feature Test</h1>
                <p className="text-muted-foreground">
                    This page tests the new feature-based intake form implementation.
                    The intake feature has been extracted from the monolithic component into a clean, modular structure.
                </p>
            </div>

            {/* Feature Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">🎯 Feature Extraction Complete</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <h4 className="font-semibold text-green-700">✅ Architecture</h4>
                            <ul className="text-sm space-y-1">
                                <li>• Feature-based structure</li>
                                <li>• Clean separation of concerns</li>
                                <li>• Type-safe implementation</li>
                                <li>• Core module integration</li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold text-blue-700">🔧 Components</h4>
                            <ul className="text-sm space-y-1">
                                <li>• Modular form sections</li>
                                <li>• Reusable hooks</li>
                                <li>• Service layer abstraction</li>
                                <li>• Validation system</li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold text-purple-700">🚀 Benefits</h4>
                            <ul className="text-sm space-y-1">
                                <li>• Better maintainability</li>
                                <li>• Improved testability</li>
                                <li>• Enhanced reusability</li>
                                <li>• Easier debugging</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Test Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">📝 Test the Intake Form</CardTitle>
                    <p className="text-muted-foreground">
                        Try submitting an intake request below. The form supports different submission types:
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {submissionTypes.map((type) => (
                            <Badge key={type} variant="outline">
                                {type.toUpperCase()}
                            </Badge>
                        ))}
                    </div>
                </CardHeader>
                <CardContent>
                    <IntakeForm
                        submissionType="rfq"
                        onSuccess={handleSuccess}
                        onError={handleError}
                    />
                </CardContent>
            </Card>

            {/* Architecture Notes */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">🏗️ Architecture Highlights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold mb-2">📁 Feature Structure</h4>
                            <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                                {`src/features/intake/
├── components/
│   ├── IntakeForm.tsx
│   └── sections/
├── hooks/
│   ├── useIntakeForm.ts
│   └── useIntakeCustomers.ts
├── services/
│   └── intakeService.ts
├── types/
│   └── intake.types.ts
└── validations/
    └── intakeValidation.ts`}
                            </pre>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">🔗 Dependencies</h4>
                            <ul className="text-sm space-y-1">
                                <li><strong>Core Modules:</strong> Auth, Workflow, Documents</li>
                                <li><strong>UI Components:</strong> Shadcn/ui components</li>
                                <li><strong>Forms:</strong> React Hook Form + Zod</li>
                                <li><strong>Database:</strong> Supabase integration</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
