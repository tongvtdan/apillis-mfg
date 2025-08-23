import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, CheckCircleIcon, DatabaseIcon, LoaderIcon } from 'lucide-react';

// Sample data
const SAMPLE_PROJECTS = [
    {
        id: '11111111-1111-1111-1111-111111111001',
        project_id: 'P-25082301',
        title: 'Advanced IoT Sensor System',
        description: 'Complete IoT sensor system with wireless communication, data logging, and cloud integration for smart factory monitoring.',
        status: 'inquiry', // Note: Using database enum value, not frontend status
        priority: 'urgent',
        priority_score: 95,
        estimated_value: 750000,
        due_date: '2025-12-15',
        days_in_stage: 2,
        stage_entered_at: '2025-08-21 10:00:00+00',
        contact_name: 'Sarah Johnson',
        contact_email: 'sarah.johnson@techcorp.com',
        contact_phone: '+1-555-0101',
        tags: ['IoT', 'Sensors', 'Wireless', 'Cloud'],
        notes: 'Rush order for Q4 deployment',
        project_type: 'system_build',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '11111111-1111-1111-1111-111111111002',
        project_id: 'P-25082302',
        title: 'Precision CNC Machined Parts',
        description: 'High-precision CNC machined components for aerospace application with tight tolerances ±0.001".',
        status: 'review', // Database enum value
        priority: 'high',
        priority_score: 85,
        estimated_value: 125000,
        due_date: '2025-10-30',
        days_in_stage: 5,
        stage_entered_at: '2025-08-18 14:30:00+00',
        contact_name: 'James Wilson',
        contact_email: 'james.wilson@precisionmfg.com',
        contact_phone: '+1-555-0104',
        tags: ['CNC', 'Aerospace', 'Precision'],
        notes: 'Critical components for aircraft assembly',
        project_type: 'fabrication',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];

const SAMPLE_CUSTOMERS = [
    {
        id: '01234567-1234-1234-1234-123456789001',
        name: 'Sarah Johnson',
        company: 'TechCorp Industries',
        email: 'sarah.johnson@techcorp.com',
        phone: '+1-555-0101',
        address: '123 Innovation Drive, Austin, TX 78701',
        country: 'USA',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '01234567-1234-1234-1234-123456789004',
        name: 'James Wilson',
        company: 'Precision Manufacturing Co',
        email: 'james.wilson@precisionmfg.com',
        phone: '+1-555-0104',
        address: '321 Industrial Way, Detroit, MI 48201',
        country: 'USA',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];

export default function EmergencyDatabaseSeeder() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [projectCount, setProjectCount] = useState(0);

    // Check current data in database
    const checkDatabase = async () => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(null);

            // Check projects table
            const { data: projects, error: projectsError } = await supabase
                .from('projects')
                .select('*');

            if (projectsError) {
                throw new Error(`Error checking projects: ${projectsError.message}`);
            }

            setProjectCount(projects?.length || 0);

            if (projects && projects.length > 0) {
                setSuccess(`Database has ${projects.length} projects. Sample ID: ${projects[0].id}`);
            } else {
                setSuccess('Database connected but no projects found. You can seed sample data.');
            }
        } catch (err) {
            console.error('Error checking database:', err);
            setError(err instanceof Error ? err.message : 'Unknown error checking database');
        } finally {
            setLoading(false);
        }
    };

    // Seed sample data
    const seedSampleData = async () => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(null);

            // Insert customers first (foreign keys)
            const { error: customersError } = await supabase
                .from('customers')
                .upsert(SAMPLE_CUSTOMERS, { onConflict: 'id' });

            if (customersError) {
                throw new Error(`Error inserting customers: ${customersError.message}`);
            }

            // Insert projects
            const projectsWithCustomers = SAMPLE_PROJECTS.map(project => ({
                ...project,
                customer_id: project.contact_email === 'sarah.johnson@techcorp.com'
                    ? '01234567-1234-1234-1234-123456789001'
                    : '01234567-1234-1234-1234-123456789004'
            }));

            const { error: projectsError } = await supabase
                .from('projects')
                .upsert(projectsWithCustomers, { onConflict: 'id' });

            if (projectsError) {
                throw new Error(`Error inserting projects: ${projectsError.message}`);
            }

            setSuccess('Sample data successfully added to database!');
            // Refresh project count
            await checkDatabase();
        } catch (err) {
            console.error('Error seeding database:', err);
            setError(err instanceof Error ? err.message : 'Unknown error seeding database');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <DatabaseIcon className="h-5 w-5" />
                    Emergency Database Seeder
                </CardTitle>
                <CardDescription>
                    Use this tool to seed sample data for testing when database is empty
                </CardDescription>
            </CardHeader>
            <CardContent>
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {success && (
                    <Alert variant="default" className="mb-4 bg-green-50 text-green-800 border-green-200">
                        <CheckCircleIcon className="h-4 w-4 text-green-600" />
                        <AlertTitle>Success</AlertTitle>
                        <AlertDescription>{success}</AlertDescription>
                    </Alert>
                )}

                <div className="text-sm">
                    <p className="mb-2">This tool will seed the database with:</p>
                    <ul className="list-disc list-inside mb-4 space-y-1">
                        <li>2 Sample customers</li>
                        <li>2 Sample projects with fixed IDs for testing</li>
                    </ul>
                    <p className="font-medium">
                        Current database: {projectCount === 0 ? 'No projects found' : `${projectCount} projects`}
                    </p>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button
                    variant="outline"
                    onClick={checkDatabase}
                    disabled={loading}
                >
                    {loading ? <LoaderIcon className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Check Database
                </Button>
                <Button
                    onClick={seedSampleData}
                    disabled={loading}
                >
                    {loading ? <LoaderIcon className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Seed Sample Data
                </Button>
            </CardFooter>
        </Card>
    );
}