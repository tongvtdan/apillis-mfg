import React from 'react';
import { CustomerManagement, CUSTOMER_TYPE_CONFIG, CUSTOMER_STATUS_CONFIG, CONTACT_RELATIONSHIP_CONFIG } from '@/features/customer-management';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * Customer Management Feature Test Page
 * This page demonstrates the new customer management feature implementation
 */
export default function CustomerManagementTest() {
    const handleCustomerSelect = (customer: any) => {
        console.log('Customer selected:', customer);
        alert(`Selected customer: ${customer.name}`);
    };

    const handleContactCreate = (contact: any) => {
        console.log('Contact created:', contact);
        alert(`Contact created: ${contact.firstName} ${contact.lastName}`);
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Customer Management Feature Test</h1>
                <p className="text-muted-foreground">
                    This page tests the new feature-based customer management implementation.
                    The customer management feature provides comprehensive customer lifecycle management,
                    contact management, and customer analytics.
                </p>
            </div>

            {/* Feature Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">🏢 Customer Management Feature</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <h4 className="font-semibold text-blue-700">📋 Customer Lifecycle</h4>
                            <ul className="text-sm space-y-1">
                                <li>• Customer onboarding</li>
                                <li>• Contact management</li>
                                <li>• Status tracking</li>
                                <li>• Tier classification</li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold text-green-700">📞 Interaction Management</h4>
                            <ul className="text-sm space-y-1">
                                <li>• Activity logging</li>
                                <li>• Communication tracking</li>
                                <li>• Follow-up management</li>
                                <li>• History analysis</li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold text-purple-700">📊 Analytics & Insights</h4>
                            <ul className="text-sm space-y-1">
                                <li>• Health scoring</li>
                                <li>• Performance metrics</li>
                                <li>• Revenue analysis</li>
                                <li>• Risk assessment</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Customer Types and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">🏭 Customer Types</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            {Object.entries(CUSTOMER_TYPE_CONFIG).map(([key, config]) => (
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
                            Support for various customer types with specialized management approaches
                            for each category.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">📊 Customer Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {Object.entries(CUSTOMER_STATUS_CONFIG).map(([key, config]) => (
                                <div key={key} className="flex items-center space-x-2">
                                    <Badge className={config.color}>
                                        {config.label}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">{key}</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-sm text-muted-foreground mt-4">
                            Comprehensive status tracking for customer lifecycle management
                            and relationship monitoring.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Contact Relationships */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">👥 Contact Relationships</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {Object.entries(CONTACT_RELATIONSHIP_CONFIG).map(([key, config]) => (
                            <div key={key} className="text-center">
                                <div className="text-xl mb-2">{config.icon}</div>
                                <div className="font-medium text-sm">{config.label}</div>
                                <Badge variant="outline" className="mt-1 text-xs">
                                    Priority {config.priority}
                                </Badge>
                            </div>
                        ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                        Hierarchical contact management with relationship prioritization
                        for effective communication and decision-making.
                    </p>
                </CardContent>
            </Card>

            {/* Test Customer Management */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">🎮 Customer Management Interface</CardTitle>
                    <p className="text-muted-foreground">
                        Test the complete customer management system below. Create customers,
                        manage contacts, log interactions, and analyze customer data.
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="bg-blue-50 p-4 rounded-lg mb-6">
                        <div className="flex items-start space-x-3">
                            <div className="text-blue-600 mt-0.5">🚀</div>
                            <div>
                                <h4 className="font-medium text-blue-900">Comprehensive CRM</h4>
                                <p className="text-sm text-blue-700 mt-1">
                                    <strong>Features:</strong> Customer lifecycle, Contact management, Activity tracking<br />
                                    <strong>Analytics:</strong> Health scoring, Revenue analysis, Performance metrics<br />
                                    <strong>Integration:</strong> Seamless workflow integration
                                </p>
                            </div>
                        </div>
                    </div>

                    <CustomerManagement
                        onCustomerSelect={handleCustomerSelect}
                        onContactCreate={handleContactCreate}
                        defaultTab="customers"
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
                                {`src/features/customer-management/
├── components/
│   └── CustomerManagement.tsx
├── services/
│   └── customerManagementService.ts
├── types/
│   └── customer-management.types.ts
└── index.ts`}
                            </pre>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">🔗 Dependencies</h4>
                            <ul className="text-sm space-y-1">
                                <li><strong>Core Auth:</strong> User permissions and organization context</li>
                                <li><strong>Core Workflow:</strong> Customer lifecycle integration</li>
                                <li><strong>Core Activity Log:</strong> Interaction and change tracking</li>
                                <li><strong>Database:</strong> Supabase with comprehensive customer schema</li>
                                <li><strong>UI Components:</strong> Form controls and data visualization</li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">🎯 Key Capabilities</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <strong>Customer Management:</strong>
                                <ul className="mt-1 space-y-1">
                                    <li>• Customer lifecycle tracking</li>
                                    <li>• Multi-tier classification</li>
                                    <li>• Advanced search & filtering</li>
                                    <li>• Export capabilities</li>
                                </ul>
                            </div>
                            <div>
                                <strong>Contact Management:</strong>
                                <ul className="mt-1 space-y-1">
                                    <li>• Hierarchical relationships</li>
                                    <li>• Communication preferences</li>
                                    <li>• Primary contact designation</li>
                                    <li>• Activity association</li>
                                </ul>
                            </div>
                            <div>
                                <strong>Analytics & Insights:</strong>
                                <ul className="mt-1 space-y-1">
                                    <li>• Customer health scoring</li>
                                    <li>• Revenue and performance metrics</li>
                                    <li>• Interaction analysis</li>
                                    <li>• Risk assessment</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
