import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Database,
    CheckCircle,
    AlertTriangle,
    Loader2,
    Users,
    FileText,
    Truck
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function QuickDatabaseSeeder() {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<string[]>([]);
    const { toast } = useToast();

    const seedDatabase = async () => {
        setLoading(true);
        setResults([]);
        const logs: string[] = [];

        try {
            // 1. Seed Customers
            logs.push('🏢 Seeding customers...');
            setResults([...logs]);

            const customers = [
                {
                    id: '01234567-1234-1234-1234-123456789001',
                    name: 'Sarah Johnson',
                    company: 'TechCorp Industries',
                    email: 'sarah.johnson@techcorp.com',
                    phone: '+1-555-0101',
                    country: 'USA'
                },
                {
                    id: '01234567-1234-1234-1234-123456789002',
                    name: 'Michael Chen',
                    company: 'Quantum Systems Ltd',
                    email: 'michael.chen@quantumsys.com',
                    phone: '+1-555-0102',
                    country: 'USA'
                },
                {
                    id: '01234567-1234-1234-1234-123456789003',
                    name: 'Emma Rodriguez',
                    company: 'BioTech Solutions',
                    email: 'emma.rodriguez@biotechsol.com',
                    phone: '+1-555-0103',
                    country: 'USA'
                }
            ];

            const { error: customersError } = await supabase
                .from('customers')
                .upsert(customers, { onConflict: 'id' });

            if (customersError) throw customersError;
            logs.push('✅ Customers seeded successfully');
            setResults([...logs]);

            // 2. Seed Suppliers
            logs.push('🚛 Seeding suppliers...');
            setResults([...logs]);

            const suppliers = [
                {
                    id: '02345678-2345-2345-2345-234567890001',
                    name: 'John Smith',
                    company: 'Precision Metals Co.',
                    email: 'john@precisionmetals.com',
                    phone: '+1-555-0201',
                    country: 'USA',
                    specialties: ['machining', 'fabrication'],
                    rating: 4.2,
                    response_rate: 85.5,
                    is_active: true,
                    average_turnaround_days: 3.5
                },
                {
                    id: '02345678-2345-2345-2345-234567890002',
                    name: 'Maria Garcia',
                    company: 'Advanced Manufacturing Ltd.',
                    email: 'maria@advmfg.com',
                    phone: '+1-555-0202',
                    country: 'USA',
                    specialties: ['casting', 'finishing'],
                    rating: 3.8,
                    response_rate: 78.2,
                    is_active: true,
                    average_turnaround_days: 4.2
                }
            ];

            const { error: suppliersError } = await supabase
                .from('suppliers')
                .upsert(suppliers, { onConflict: 'id' });

            if (suppliersError) throw suppliersError;
            logs.push('✅ Suppliers seeded successfully');
            setResults([...logs]);

            // 3. Seed Projects
            logs.push('📋 Seeding projects...');
            setResults([...logs]);

            const projects = [
                {
                    id: '11111111-1111-1111-1111-111111111001',
                    project_id: 'P-25082301',
                    title: 'Advanced IoT Sensor System',
                    description: 'Complete IoT sensor system with wireless communication, data logging, and cloud integration for smart factory monitoring.',
                    customer_id: '01234567-1234-1234-1234-123456789001',
                    status: 'inquiry_received',
                    priority: 'urgent',
                    priority_score: 95,
                    estimated_value: 750000,
                    due_date: '2025-12-15',
                    days_in_stage: 2,
                    stage_entered_at: '2025-08-21T10:00:00+00:00',
                    contact_name: 'Sarah Johnson',
                    contact_email: 'sarah.johnson@techcorp.com',
                    contact_phone: '+1-555-0101',
                    tags: ['IoT', 'Sensors', 'Wireless', 'Cloud'],
                    notes: 'Rush order for Q4 deployment',
                    project_type: 'system_build'
                },
                {
                    id: '11111111-1111-1111-1111-111111111002',
                    project_id: 'P-25082302',
                    title: 'Precision CNC Machined Parts',
                    description: 'High-precision CNC machined components for aerospace application with tight tolerances ±0.001".',
                    customer_id: '01234567-1234-1234-1234-123456789002',
                    status: 'technical_review',
                    priority: 'high',
                    priority_score: 85,
                    estimated_value: 125000,
                    due_date: '2025-10-30',
                    days_in_stage: 5,
                    stage_entered_at: '2025-08-18T14:30:00+00:00',
                    contact_name: 'Michael Chen',
                    contact_email: 'michael.chen@quantumsys.com',
                    contact_phone: '+1-555-0102',
                    tags: ['CNC', 'Aerospace', 'Precision'],
                    notes: 'Critical components for aircraft assembly',
                    project_type: 'fabrication'
                },
                {
                    id: '11111111-1111-1111-1111-111111111003',
                    project_id: 'P-25082303',
                    title: 'Medical Device Assembly Line',
                    description: 'Automated assembly line for medical device manufacturing with FDA compliance requirements.',
                    customer_id: '01234567-1234-1234-1234-123456789003',
                    status: 'supplier_rfq_sent',
                    priority: 'urgent',
                    priority_score: 90,
                    estimated_value: 2500000,
                    due_date: '2025-11-20',
                    days_in_stage: 8,
                    stage_entered_at: '2025-08-15T09:15:00+00:00',
                    contact_name: 'Emma Rodriguez',
                    contact_email: 'emma.rodriguez@biotechsol.com',
                    contact_phone: '+1-555-0103',
                    tags: ['Medical', 'Assembly', 'FDA', 'Automation'],
                    notes: 'FDA validation required',
                    project_type: 'manufacturing'
                }
            ];

            const { error: projectsError } = await supabase
                .from('projects')
                .upsert(projects, { onConflict: 'id' });

            if (projectsError) throw projectsError;
            logs.push('✅ Projects seeded successfully');
            setResults([...logs]);

            logs.push('🎉 Database seeding completed successfully!');
            setResults([...logs]);

            toast({
                title: "Database Seeded",
                description: "Sample data has been successfully added to the database.",
            });

        } catch (error) {
            console.error('Error seeding database:', error);
            logs.push(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setResults([...logs]);

            toast({
                variant: "destructive",
                title: "Seeding Failed",
                description: `Failed to seed database: ${error instanceof Error ? error.message : 'Unknown error'}`,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Database className="w-5 h-5 mr-2" />
                    Quick Database Seeder
                </CardTitle>
                <CardDescription>
                    Populate the database with sample customers, suppliers, and projects
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            This will add sample data to your database. Existing records with the same IDs will be updated.
                        </AlertDescription>
                    </Alert>

                    <div className="flex items-center space-x-4">
                        <Button
                            onClick={seedDatabase}
                            disabled={loading}
                            className="flex items-center"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Database className="w-4 h-4 mr-2" />
                            )}
                            {loading ? 'Seeding Database...' : 'Seed Sample Data'}
                        </Button>

                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span>3 Customers</span>
                            <Truck className="w-4 h-4" />
                            <span>2 Suppliers</span>
                            <FileText className="w-4 h-4" />
                            <span>3 Projects</span>
                        </div>
                    </div>

                    {results.length > 0 && (
                        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                            <div className="text-sm font-medium mb-2">Seeding Progress:</div>
                            <div className="space-y-1 text-sm font-mono">
                                {results.map((result, index) => (
                                    <div key={index} className="text-muted-foreground">
                                        {result}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}