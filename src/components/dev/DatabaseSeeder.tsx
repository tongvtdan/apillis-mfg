import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Database, Users, FolderOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ProjectPriority } from '@/types/project';

// Sample data - customers and projects
const sampleCustomers = [
    { id: '01234567-1234-1234-1234-123456789001', name: 'Sarah Johnson', company: 'TechCorp Industries', email: 'sarah.johnson@techcorp.com', phone: '+1-555-0101', country: 'USA' },
    { id: '01234567-1234-1234-1234-123456789002', name: 'Michael Chen', company: 'Quantum Systems Ltd', email: 'michael.chen@quantumsys.com', phone: '+1-555-0102', country: 'USA' },
    { id: '01234567-1234-1234-1234-123456789003', name: 'Emma Rodriguez', company: 'BioTech Solutions', email: 'emma.rodriguez@biotechsol.com', phone: '+1-555-0103', country: 'USA' },
    { id: '01234567-1234-1234-1234-123456789004', name: 'James Wilson', company: 'Precision Manufacturing Co', email: 'james.wilson@precisionmfg.com', phone: '+1-555-0104', country: 'USA' },
    { id: '01234567-1234-1234-1234-123456789005', name: 'Lisa Thompson', company: 'Global Assembly Corp', email: 'lisa.thompson@globalassembly.com', phone: '+1-555-0105', country: 'USA' },
    { id: '01234567-1234-1234-1234-123456789006', name: 'David Kim', company: 'Advanced Automation Inc', email: 'david.kim@advancedauto.com', phone: '+1-555-0106', country: 'USA' },
    { id: '01234567-1234-1234-1234-123456789007', name: 'Dr. Maria Garcia', company: 'MedDevice Innovations', email: 'maria.garcia@meddevice.com', phone: '+1-555-0107', country: 'USA' },
    { id: '01234567-1234-1234-1234-123456789008', name: 'Robert Brown', company: 'Healthcare Systems LLC', email: 'robert.brown@healthsys.com', phone: '+1-555-0108', country: 'USA' }
];

const sampleProjects = [
    { id: '11111111-1111-1111-1111-111111111001', project_id: 'P-25082301', title: 'Advanced IoT Sensor System', description: 'Complete IoT sensor system with wireless communication', customer_id: '01234567-1234-1234-1234-123456789001', status: 'inquiry', priority: 'urgent' as ProjectPriority, estimated_value: 750000, days_in_stage: 2, stage_entered_at: '2025-08-21T10:00:00Z', contact_name: 'Sarah Johnson', tags: ['IoT', 'Sensors'] },
    { id: '11111111-1111-1111-1111-111111111002', project_id: 'P-25082302', title: 'Precision CNC Machined Parts', description: 'High-precision CNC machined components for aerospace', customer_id: '01234567-1234-1234-1234-123456789004', status: 'review', priority: 'high' as ProjectPriority, estimated_value: 125000, days_in_stage: 5, stage_entered_at: '2025-08-18T14:30:00Z', contact_name: 'James Wilson', tags: ['CNC', 'Aerospace'] },
    { id: '11111111-1111-1111-1111-111111111003', project_id: 'P-25082303', title: 'Medical Device Assembly Line', description: 'Automated assembly line for medical device manufacturing', customer_id: '01234567-1234-1234-1234-123456789007', status: 'review', priority: 'urgent' as ProjectPriority, estimated_value: 2500000, days_in_stage: 8, stage_entered_at: '2025-08-15T09:15:00Z', contact_name: 'Dr. Maria Garcia', tags: ['Medical', 'Assembly'] },
    { id: '11111111-1111-1111-1111-111111111004', project_id: 'P-25082304', title: 'Quantum Computing Enclosure', description: 'Custom enclosure system for quantum computing hardware', customer_id: '01234567-1234-1234-1234-123456789002', status: 'quoted', priority: 'high' as ProjectPriority, estimated_value: 450000, days_in_stage: 12, stage_entered_at: '2025-08-11T16:45:00Z', contact_name: 'Michael Chen', tags: ['Quantum', 'Enclosure'] },
    { id: '11111111-1111-1111-1111-111111111005', project_id: 'P-25082305', title: 'Laboratory Equipment Fabrication', description: 'Custom laboratory equipment fabrication', customer_id: '01234567-1234-1234-1234-123456789003', status: 'won', priority: 'medium' as ProjectPriority, estimated_value: 185000, days_in_stage: 18, stage_entered_at: '2025-08-05T11:20:00Z', contact_name: 'Emma Rodriguez', tags: ['Laboratory'] },
    { id: '11111111-1111-1111-1111-111111111006', project_id: 'P-25082306', title: 'Automotive Parts Manufacturing', description: 'High-volume manufacturing of automotive components', customer_id: '01234567-1234-1234-1234-123456789005', status: 'won', priority: 'medium' as ProjectPriority, estimated_value: 850000, days_in_stage: 22, stage_entered_at: '2025-08-01T13:10:00Z', contact_name: 'Lisa Thompson', tags: ['Automotive'] },
    { id: '11111111-1111-1111-1111-111111111007', project_id: 'P-25082307', title: 'Robotic Arm Integration System', description: 'Complete robotic arm integration with vision system', customer_id: '01234567-1234-1234-1234-123456789006', status: 'production', priority: 'high' as ProjectPriority, estimated_value: 320000, days_in_stage: 35, stage_entered_at: '2025-07-19T08:30:00Z', contact_name: 'David Kim', tags: ['Robotics'] },
    { id: '11111111-1111-1111-1111-111111111008', project_id: 'P-25082308', title: 'Healthcare Monitoring Device', description: 'Portable healthcare monitoring device', customer_id: '01234567-1234-1234-1234-123456789008', status: 'completed', priority: 'medium' as ProjectPriority, estimated_value: 95000, days_in_stage: 0, stage_entered_at: '2025-07-15T16:30:00Z', contact_name: 'Robert Brown', tags: ['Healthcare'] }
];

export function DatabaseSeeder() {
    const [isSeeding, setIsSeeding] = useState(false);
    const [seedingProgress, setSeedingProgress] = useState('');
    const [isSeeded, setIsSeeded] = useState(false);
    const { toast } = useToast();

    const seedDatabase = async () => {
        setIsSeeding(true);
        setSeedingProgress('Starting database seeding...');

        try {
            setSeedingProgress('Clearing existing sample data...');
            await supabase.from('projects').delete().in('id', sampleProjects.map(p => p.id));
            await supabase.from('customers').delete().in('id', sampleCustomers.map(c => c.id));

            setSeedingProgress('Inserting sample customers...');
            const { error: customersError } = await supabase.from('customers').insert(sampleCustomers);
            if (customersError) throw new Error(`Error inserting customers: ${customersError.message}`);

            setSeedingProgress('Inserting sample projects...');
            const { error: projectsError } = await supabase.from('projects').insert(sampleProjects as any);
            if (projectsError) throw new Error(`Error inserting projects: ${projectsError.message}`);

            setSeedingProgress('Database seeding completed successfully!');
            setIsSeeded(true);

            toast({
                title: "Database Seeded Successfully",
                description: `Added ${sampleCustomers.length} customers and ${sampleProjects.length} projects.`,
            });

        } catch (error) {
            console.error('Seeding failed:', error);
            setSeedingProgress(`Error: ${error.message}`);
            toast({ title: "Seeding Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsSeeding(false);
        }
    };

    const clearSampleData = async () => {
        setIsSeeding(true);
        setSeedingProgress('Clearing sample data...');

        try {
            await supabase.from('projects').delete().in('id', sampleProjects.map(p => p.id));
            await supabase.from('customers').delete().in('id', sampleCustomers.map(c => c.id));

            setSeedingProgress('Sample data cleared successfully!');
            setIsSeeded(false);
            toast({ title: "Sample Data Cleared", description: "All sample data has been removed." });

        } catch (error) {
            console.error('Clear failed:', error);
            setSeedingProgress(`Error: ${error.message}`);
            toast({ title: "Clear Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsSeeding(false);
        }
    };

    const statusCounts = sampleProjects.reduce((acc: Record<string, number>, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        Database Seeder
                    </CardTitle>
                    <CardDescription>
                        Populate the database with comprehensive sample data for development and testing
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="flex gap-3">
                        <Button onClick={seedDatabase} disabled={isSeeding} className="flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            {isSeeding ? 'Seeding...' : 'Seed Database'}
                        </Button>

                        <Button onClick={clearSampleData} disabled={isSeeding} variant="outline" className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Clear Sample Data
                        </Button>
                    </div>

                    {seedingProgress && (
                        <div className={`flex items-center gap-2 p-3 rounded-lg ${seedingProgress.includes('Error') ? 'bg-red-50 text-red-700' :
                            isSeeded ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                            }`}>
                            {seedingProgress.includes('Error') ? <AlertCircle className="h-4 w-4" /> :
                                isSeeded ? <CheckCircle2 className="h-4 w-4" /> :
                                    <Database className="h-4 w-4 animate-pulse" />}
                            <span className="text-sm font-medium">{seedingProgress}</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Users className="h-4 w-4" />
                            Sample Data Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span>Customers:</span>
                            <Badge variant="secondary">{sampleCustomers.length}</Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Projects:</span>
                            <Badge variant="secondary">{sampleProjects.length}</Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <FolderOpen className="h-4 w-4" />
                            Project Status Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {Object.entries(statusCounts).map(([status, count]) => (
                            <div key={status} className="flex justify-between text-sm">
                                <span className="capitalize">{status.replace('_', ' ')}</span>
                                <Badge variant="outline">{count as number}</Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}