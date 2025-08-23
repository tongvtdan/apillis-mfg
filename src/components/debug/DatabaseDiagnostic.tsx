import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Database,
    CheckCircle,
    XCircle,
    AlertTriangle,
    RefreshCw,
    Users,
    FileText,
    Truck
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { QuickDatabaseSeeder } from './QuickDatabaseSeeder';
import { ProjectLoadTest } from './ProjectLoadTest';

interface DiagnosticResult {
    name: string;
    status: 'success' | 'error' | 'warning';
    message: string;
    count?: number;
    details?: string[];
}

export function DatabaseDiagnostic() {
    const [results, setResults] = useState<DiagnosticResult[]>([]);
    const [loading, setLoading] = useState(false);

    const runDiagnostics = async () => {
        setLoading(true);
        const diagnosticResults: DiagnosticResult[] = [];

        try {
            // Test 1: Database Connection
            try {
                const { data, error } = await supabase.from('profiles').select('count').limit(1);
                if (error) throw error;
                diagnosticResults.push({
                    name: 'Database Connection',
                    status: 'success',
                    message: 'Successfully connected to database'
                });
            } catch (error) {
                diagnosticResults.push({
                    name: 'Database Connection',
                    status: 'error',
                    message: `Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`
                });
            }

            // Test 2: Projects Table
            try {
                const { data: projects, error } = await supabase
                    .from('projects')
                    .select('id, project_id, title, status, customer_id')
                    .limit(10);

                if (error) throw error;

                diagnosticResults.push({
                    name: 'Projects Table',
                    status: projects && projects.length > 0 ? 'success' : 'warning',
                    message: `Found ${projects?.length || 0} projects`,
                    count: projects?.length || 0,
                    details: projects?.map(p => `${p.project_id}: ${p.title} (${p.status})`) || []
                });
            } catch (error) {
                diagnosticResults.push({
                    name: 'Projects Table',
                    status: 'error',
                    message: `Error accessing projects: ${error instanceof Error ? error.message : 'Unknown error'}`
                });
            }

            // Test 3: Customers Table
            try {
                const { data: customers, error } = await supabase
                    .from('customers')
                    .select('id, name, company')
                    .limit(10);

                if (error) throw error;

                diagnosticResults.push({
                    name: 'Customers Table',
                    status: customers && customers.length > 0 ? 'success' : 'warning',
                    message: `Found ${customers?.length || 0} customers`,
                    count: customers?.length || 0,
                    details: customers?.map(c => `${c.name} (${c.company || 'No company'})`) || []
                });
            } catch (error) {
                diagnosticResults.push({
                    name: 'Customers Table',
                    status: 'error',
                    message: `Error accessing customers: ${error instanceof Error ? error.message : 'Unknown error'}`
                });
            }

            // Test 4: Suppliers Table
            try {
                const { data: suppliers, error } = await supabase
                    .from('suppliers')
                    .select('id, name, company, is_active')
                    .limit(10);

                if (error) throw error;

                diagnosticResults.push({
                    name: 'Suppliers Table',
                    status: suppliers && suppliers.length > 0 ? 'success' : 'warning',
                    message: `Found ${suppliers?.length || 0} suppliers`,
                    count: suppliers?.length || 0,
                    details: suppliers?.map(s => `${s.name} (${s.company || 'No company'}) - ${s.is_active ? 'Active' : 'Inactive'}`) || []
                });
            } catch (error) {
                diagnosticResults.push({
                    name: 'Suppliers Table',
                    status: 'error',
                    message: `Error accessing suppliers: ${error instanceof Error ? error.message : 'Unknown error'}`
                });
            }

            // Test 5: Project-Customer Relationships
            try {
                const { data: projectsWithCustomers, error } = await supabase
                    .from('projects')
                    .select(`
            id,
            project_id,
            title,
            customer:customers(name, company)
          `)
                    .limit(5);

                if (error) throw error;

                const withCustomers = projectsWithCustomers?.filter(p => p.customer) || [];
                diagnosticResults.push({
                    name: 'Project-Customer Relations',
                    status: withCustomers.length > 0 ? 'success' : 'warning',
                    message: `${withCustomers.length} projects have customer data`,
                    details: withCustomers.map(p => `${p.project_id}: ${p.title} → ${p.customer?.name || 'Unknown'}`)
                });
            } catch (error) {
                diagnosticResults.push({
                    name: 'Project-Customer Relations',
                    status: 'error',
                    message: `Error checking relationships: ${error instanceof Error ? error.message : 'Unknown error'}`
                });
            }

            // Test 6: Sample Project Check
            try {
                const { data: sampleProject, error } = await supabase
                    .from('projects')
                    .select('*')
                    .eq('id', '11111111-1111-1111-1111-111111111001')
                    .single();

                if (error && error.code !== 'PGRST116') throw error;

                diagnosticResults.push({
                    name: 'Sample Project (11111111-1111-1111-1111-111111111001)',
                    status: sampleProject ? 'success' : 'warning',
                    message: sampleProject ? `Found: ${sampleProject.title}` : 'Sample project not found - migration may not have run',
                    details: sampleProject ? [`Status: ${sampleProject.status}`, `Priority: ${sampleProject.priority}`] : []
                });
            } catch (error) {
                diagnosticResults.push({
                    name: 'Sample Project Check',
                    status: 'error',
                    message: `Error checking sample project: ${error instanceof Error ? error.message : 'Unknown error'}`
                });
            }

        } catch (error) {
            diagnosticResults.push({
                name: 'General Error',
                status: 'error',
                message: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
            });
        }

        setResults(diagnosticResults);
        setLoading(false);
    };

    useEffect(() => {
        runDiagnostics();
    }, []);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
            case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
            default: return <Database className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success': return 'bg-green-100 text-green-800 border-green-200';
            case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'error': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const hasErrors = results.some(r => r.status === 'error');
    const hasWarnings = results.some(r => r.status === 'warning');

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Database className="w-5 h-5 mr-2" />
                        Database Diagnostic
                    </CardTitle>
                    <CardDescription>
                        Checking database connectivity and data availability
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                            {hasErrors && (
                                <Badge className="bg-red-100 text-red-800">
                                    {results.filter(r => r.status === 'error').length} Errors
                                </Badge>
                            )}
                            {hasWarnings && (
                                <Badge className="bg-yellow-100 text-yellow-800">
                                    {results.filter(r => r.status === 'warning').length} Warnings
                                </Badge>
                            )}
                            {!hasErrors && !hasWarnings && (
                                <Badge className="bg-green-100 text-green-800">
                                    All Systems OK
                                </Badge>
                            )}
                        </div>
                        <Button onClick={runDiagnostics} disabled={loading} variant="outline" size="sm">
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {results.map((result, index) => (
                            <div key={index} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                        {getStatusIcon(result.status)}
                                        <h4 className="font-medium">{result.name}</h4>
                                        {result.count !== undefined && (
                                            <Badge variant="secondary" className="text-xs">
                                                {result.count} items
                                            </Badge>
                                        )}
                                    </div>
                                    <Badge className={getStatusColor(result.status)}>
                                        {result.status.toUpperCase()}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{result.message}</p>
                                {result.details && result.details.length > 0 && (
                                    <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                                        <div className="font-medium mb-1">Details:</div>
                                        <ul className="space-y-1">
                                            {result.details.slice(0, 5).map((detail, i) => (
                                                <li key={i} className="text-muted-foreground">• {detail}</li>
                                            ))}
                                            {result.details.length > 5 && (
                                                <li className="text-muted-foreground">... and {result.details.length - 5} more</li>
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {hasErrors && (
                        <Alert className="mt-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                Database errors detected. Please check your database connection and ensure migrations have been run.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {/* Quick Database Seeder */}
            {(hasErrors || hasWarnings) && <QuickDatabaseSeeder />}

            {/* Project Load Test */}
            <ProjectLoadTest />
        </div>
    );
}