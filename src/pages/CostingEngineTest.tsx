import React from 'react';
import { CostingEngine, COSTING_CONFIG } from '@/features/costing-engine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * Costing Engine Feature Test Page
 * This page demonstrates the new costing engine feature implementation
 */
export default function CostingEngineTest() {
    const handleSave = (result: any) => {
        console.log('Costing scenario saved:', result);
        alert(`Scenario saved successfully! Total cost: $${result.scenario.totalCost.toFixed(2)}`);
    };

    const handleExport = (data: any) => {
        console.log('Exporting costing data:', data);

        // Create and download JSON file
        const jsonBlob = new Blob([data.json], { type: 'application/json' });
        const jsonUrl = URL.createObjectURL(jsonBlob);
        const jsonLink = document.createElement('a');
        jsonLink.href = jsonUrl;
        jsonLink.download = 'costing-scenario.json';
        jsonLink.click();

        // Create and download CSV file
        const csvBlob = new Blob([data.csv], { type: 'text/csv' });
        const csvUrl = URL.createObjectURL(csvBlob);
        const csvLink = document.createElement('a');
        csvLink.href = csvUrl;
        csvLink.download = 'cost-breakdown.csv';
        csvLink.click();

        URL.revokeObjectURL(jsonUrl);
        URL.revokeObjectURL(csvUrl);

        alert('Data exported successfully!');
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Costing Engine Feature Test</h1>
                <p className="text-muted-foreground">
                    This page tests the new feature-based costing engine implementation.
                    The costing engine provides comprehensive cost analysis, margin calculations, and pricing recommendations.
                </p>
            </div>

            {/* Feature Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">💰 Costing Engine Feature</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <h4 className="font-semibold text-blue-700">📊 Cost Analysis</h4>
                            <ul className="text-sm space-y-1">
                                <li>• Multi-category cost breakdown</li>
                                <li>• Variable vs fixed cost analysis</li>
                                <li>• Volume-based calculations</li>
                                <li>• Scenario comparisons</li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold text-green-700">🎯 Pricing Strategy</h4>
                            <ul className="text-sm space-y-1">
                                <li>• Margin-based pricing</li>
                                <li>• Market-driven recommendations</li>
                                <li>• Break-even analysis</li>
                                <li>• ROI calculations</li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold text-purple-700">📈 Business Intelligence</h4>
                            <ul className="text-sm space-y-1">
                                <li>• Risk assessment</li>
                                <li>• Cost trend analysis</li>
                                <li>• Scenario optimization</li>
                                <li>• Export capabilities</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Cost Categories Reference */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">📋 Cost Categories</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(COSTING_CONFIG.categories).map(([key, config]) => (
                            <div key={key} className="flex items-center space-x-2">
                                <Badge className={config.color}>
                                    {config.label}
                                </Badge>
                            </div>
                        ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                        The costing engine supports comprehensive cost categorization to ensure accurate
                        cost analysis and pricing recommendations.
                    </p>
                </CardContent>
            </Card>

            {/* Test Engine */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">🧮 Costing Engine Calculator</CardTitle>
                    <p className="text-muted-foreground">
                        Test the costing engine with sample data. Adjust quantities, costs, and margins
                        to see real-time calculations and recommendations.
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="bg-blue-50 p-4 rounded-lg mb-6">
                        <div className="flex items-start space-x-3">
                            <div className="text-blue-600 mt-0.5">ℹ️</div>
                            <div>
                                <h4 className="font-medium text-blue-900">Test Project</h4>
                                <p className="text-sm text-blue-700 mt-1">
                                    <strong>Project:</strong> Custom Electronics Manufacturing<br />
                                    <strong>ID:</strong> PRJ-COST-TEST-001<br />
                                    <strong>Description:</strong> High-precision electronics assembly with custom components
                                    and quality testing requirements.
                                </p>
                            </div>
                        </div>
                    </div>

                    <CostingEngine
                        projectId="PRJ-COST-TEST-001"
                        projectTitle="Custom Electronics Manufacturing"
                        initialQuantity={100}
                        onSave={handleSave}
                        onExport={handleExport}
                    />
                </CardContent>
            </Card>

            {/* Feature Architecture */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">🏗️ Feature Architecture</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold mb-2">📁 Feature Structure</h4>
                            <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                                {`src/features/costing-engine/
├── components/
│   └── CostingEngine.tsx
├── services/
│   └── costingEngineService.ts
├── types/
│   └── costing-engine.types.ts
└── index.ts`}
                            </pre>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">🔗 Dependencies</h4>
                            <ul className="text-sm space-y-1">
                                <li><strong>Core Auth:</strong> User context and permissions</li>
                                <li><strong>Core Workflow:</strong> Project status integration</li>
                                <li><strong>Database:</strong> Supabase for scenario storage</li>
                                <li><strong>UI Components:</strong> Form and chart components</li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">🎯 Key Capabilities</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <strong>Cost Modeling:</strong>
                                <ul className="mt-1 space-y-1">
                                    <li>• Fixed vs variable costs</li>
                                    <li>• Volume scaling</li>
                                    <li>• Multi-category breakdown</li>
                                </ul>
                            </div>
                            <div>
                                <strong>Pricing Intelligence:</strong>
                                <ul className="mt-1 space-y-1">
                                    <li>• Margin optimization</li>
                                    <li>• Market alignment</li>
                                    <li>• Break-even analysis</li>
                                </ul>
                            </div>
                            <div>
                                <strong>Business Analytics:</strong>
                                <ul className="mt-1 space-y-1">
                                    <li>• Risk assessment</li>
                                    <li>• Scenario comparison</li>
                                    <li>• Trend analysis</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
