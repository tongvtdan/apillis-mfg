import React from 'react';
import { SupplierManagement, SUPPLIER_TYPE_CONFIG, SUPPLIER_STATUS_CONFIG, QUALIFICATION_CRITERIA } from '@/features/supplier-management';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * Supplier Management Feature Test Page
 * This page demonstrates the new supplier management feature implementation
 */
export default function SupplierManagementTest() {
    const handleSupplierSelect = (supplier: any) => {
        console.log('Supplier selected:', supplier);
        alert(`Selected supplier: ${supplier.name}`);
    };

    const handleRFQCreate = (rfq: any) => {
        console.log('RFQ created:', rfq);
        alert(`RFQ created: ${rfq.title}`);
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Supplier Management Feature Test</h1>
                <p className="text-muted-foreground">
                    This page tests the new feature-based supplier management implementation.
                    The supplier management feature provides comprehensive supplier lifecycle management,
                    RFQ creation, and supplier performance tracking.
                </p>
            </div>

            {/* Feature Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">🏢 Supplier Management Feature</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <h4 className="font-semibold text-blue-700">📋 Supplier Lifecycle</h4>
                            <ul className="text-sm space-y-1">
                                <li>• Supplier onboarding</li>
                                <li>• Qualification process</li>
                                <li>• Status management</li>
                                <li>• Performance tracking</li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold text-green-700">📄 RFQ Management</h4>
                            <ul className="text-sm space-y-1">
                                <li>• RFQ creation</li>
                                <li>• Supplier selection</li>
                                <li>• Quote collection</li>
                                <li>• Response evaluation</li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold text-purple-700">📊 Performance Analytics</h4>
                            <ul className="text-sm space-y-1">
                                <li>• Quality metrics</li>
                                <li>• Delivery performance</li>
                                <li>• Cost variance analysis</li>
                                <li>• Supplier scoring</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Supplier Types Reference */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">🏭 Supplier Categories</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {Object.entries(SUPPLIER_TYPE_CONFIG).map(([key, config]) => (
                            <div key={key} className="text-center">
                                <div className="text-2xl mb-2">{config.icon}</div>
                                <div className="font-medium">{config.label}</div>
                                <Badge className={`${config.color} mt-1`}>
                                    {key}
                                </Badge>
                            </div>
                        ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                        The supplier management system supports various supplier types with
                        specialized qualification and performance tracking for each category.
                    </p>
                </CardContent>
            </Card>

            {/* Qualification Criteria */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">✅ Supplier Qualification Framework</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {Object.entries(QUALIFICATION_CRITERIA).map(([key, criteria]) => (
                            <div key={key} className="space-y-2">
                                <h4 className="font-semibold capitalize">{criteria.name}</h4>
                                <div className="text-sm text-muted-foreground">
                                    Weight: {criteria.weight}%
                                </div>
                                <ul className="text-xs space-y-1">
                                    {criteria.criteria.map((item, index) => (
                                        <li key={index}>• {item}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg mt-6">
                        <div className="flex items-start space-x-3">
                            <div className="text-blue-600 mt-0.5">ℹ️</div>
                            <div>
                                <h4 className="font-medium text-blue-900">Qualification Process</h4>
                                <p className="text-sm text-blue-700 mt-1">
                                    Suppliers undergo a comprehensive qualification process evaluating their
                                    financial stability, technical capabilities, operational excellence,
                                    and compliance with regulatory standards.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Test Supplier Management */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">🎮 Supplier Management Interface</CardTitle>
                    <p className="text-muted-foreground">
                        Test the complete supplier management system below. Create suppliers,
                        manage RFQs, and track supplier performance.
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="bg-green-50 p-4 rounded-lg mb-6">
                        <div className="flex items-start space-x-3">
                            <div className="text-green-600 mt-0.5">🚀</div>
                            <div>
                                <h4 className="font-medium text-green-900">Test Environment</h4>
                                <p className="text-sm text-green-700 mt-1">
                                    <strong>Mode:</strong> Standalone Testing<br />
                                    <strong>Data:</strong> Mock suppliers and sample RFQs<br />
                                    <strong>Features:</strong> Full supplier lifecycle management
                                </p>
                            </div>
                        </div>
                    </div>

                    <SupplierManagement
                        onSupplierSelect={handleSupplierSelect}
                        onRFQCreate={handleRFQCreate}
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
                                {`src/features/supplier-management/
├── components/
│   └── SupplierManagement.tsx
├── services/
│   └── supplierManagementService.ts
├── types/
│   └── supplier-management.types.ts
└── index.ts`}
                            </pre>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">🔗 Dependencies</h4>
                            <ul className="text-sm space-y-1">
                                <li><strong>Core Auth:</strong> User permissions</li>
                                <li><strong>Core Workflow:</strong> Project integration</li>
                                <li><strong>Core Approvals:</strong> Qualification process</li>
                                <li><strong>Database:</strong> Supabase integration</li>
                                <li><strong>UI Components:</strong> Form and table components</li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">🎯 Key Capabilities</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <strong>Supplier Management:</strong>
                                <ul className="mt-1 space-y-1">
                                    <li>• Onboarding workflow</li>
                                    <li>• Qualification process</li>
                                    <li>• Status tracking</li>
                                    <li>• Performance monitoring</li>
                                </ul>
                            </div>
                            <div>
                                <strong>RFQ Process:</strong>
                                <ul className="mt-1 space-y-1">
                                    <li>• Multi-supplier RFQs</li>
                                    <li>• Quote collection</li>
                                    <li>• Response evaluation</li>
                                    <li>• Award management</li>
                                </ul>
                            </div>
                            <div>
                                <strong>Analytics & Reporting:</strong>
                                <ul className="mt-1 space-y-1">
                                    <li>• Performance metrics</li>
                                    <li>• Cost analysis</li>
                                    <li>• Quality tracking</li>
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
