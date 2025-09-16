import React from 'react';
import { SupplierManagement, SUPPLIER_TYPE_CONFIG, SUPPLIER_STATUS_CONFIG, QUALIFICATION_CRITERIA } from '@/features/supplier-management';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * Supplier Management Feature Test Page
 * This page demonstrates the new supplier management feature implementation
 */
export function SupplierManagementTestPage() {
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
                                <li>• Create RFQs</li>
                                <li>• Send to suppliers</li>
                                <li>• Track responses</li>
                                <li>• Compare quotes</li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold text-purple-700">📊 Performance Analytics</h4>
                            <ul className="text-sm space-y-1">
                                <li>• Quality metrics</li>
                                <li>• Delivery tracking</li>
                                <li>• Response rates</li>
                                <li>• Cost analysis</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Configuration Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Supplier Types</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {Object.entries(SUPPLIER_TYPE_CONFIG).map(([key, config]) => (
                                <div key={key} className="flex items-center justify-between p-2 border rounded">
                                    <div className="flex items-center space-x-2">
                                        <span>{config.icon}</span>
                                        <span className="font-medium">{config.label}</span>
                                    </div>
                                    <Badge className={config.color}>{key}</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Supplier Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {Object.entries(SUPPLIER_STATUS_CONFIG).map(([key, config]) => (
                                <div key={key} className="flex items-center justify-between p-2 border rounded">
                                    <span className="font-medium">{config.label}</span>
                                    <Badge className={config.color}>{key}</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Qualification Criteria */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Qualification Criteria</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(QUALIFICATION_CRITERIA).map(([category, criteria]) => (
                            <div key={category} className="space-y-2">
                                <h4 className="font-semibold capitalize">{category.replace('_', ' ')}</h4>
                                <ul className="text-sm space-y-1">
                                    {criteria.map((criterion, index) => (
                                        <li key={index} className="flex items-center space-x-2">
                                            <span className="text-green-500">✓</span>
                                            <span>{criterion}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Main Feature Component */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Interactive Supplier Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <SupplierManagement
                        onSupplierSelect={handleSupplierSelect}
                        onRFQCreate={handleRFQCreate}
                    />
                </CardContent>
            </Card>

            {/* Usage Instructions */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Usage Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold">1. Supplier Management</h4>
                            <p className="text-sm text-muted-foreground">
                                Use the Suppliers tab to view, create, and manage suppliers. 
                                You can search, filter, and perform bulk operations.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold">2. RFQ Creation</h4>
                            <p className="text-sm text-muted-foreground">
                                Create RFQs with multiple items, select suppliers, 
                                and send them for quotes. Track responses and compare offers.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold">3. Performance Tracking</h4>
                            <p className="text-sm text-muted-foreground">
                                Monitor supplier performance metrics including quality, 
                                delivery times, and response rates.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
