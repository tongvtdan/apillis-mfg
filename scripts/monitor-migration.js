#!/usr/bin/env node
// Organization-Based Customer Model Migration - Monitoring Dashboard
// Real-time monitoring of migration health and performance

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'http://127.0.0.1:54321',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
);

class MigrationMonitor {
    constructor() {
        this.startTime = new Date();
        this.metrics = {
            organizations: 0,
            contacts: 0,
            projects: 0,
            contactPoints: 0,
            errors: 0,
            lastUpdate: null
        };
    }

    async getDatabaseMetrics() {
        try {
            // Get customer organizations count
            const { count: orgCount, error: orgError } = await supabase
                .from('organizations')
                .select('*', { count: 'exact', head: true })
                .eq('description', 'Customer Organization')
                .eq('is_active', true);

            if (orgError) throw orgError;

            // Get migrated contacts count
            const { count: contactCount, error: contactError } = await supabase
                .from('contacts')
                .select('*', { count: 'exact', head: true })
                .eq('type', 'customer')
                .not('organization_id', 'is', null);

            if (contactError) throw contactError;

            // Get projects with organization references count
            const { count: projectCount, error: projectError } = await supabase
                .from('projects')
                .select('*', { count: 'exact', head: true })
                .not('customer_organization_id', 'is', null);

            if (projectError) throw projectError;

            // Get project contact points count
            const { count: contactPointCount, error: contactPointError } = await supabase
                .from('project_contact_points')
                .select('*', { count: 'exact', head: true });

            if (contactPointError) throw contactPointError;

            return {
                organizations: orgCount || 0,
                contacts: contactCount || 0,
                projects: projectCount || 0,
                contactPoints: contactPointCount || 0,
                lastUpdate: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error fetching database metrics:', error.message);
            return null;
        }
    }

    async getPerformanceMetrics() {
        try {
            // Test query performance
            const startTime = Date.now();

            const { data, error } = await supabase
                .from('projects')
                .select(`
          id,
          project_id,
          title
        `)
                .not('customer_organization_id', 'is', null)
                .limit(10);

            const queryTime = Date.now() - startTime;

            if (error) throw error;

            return {
                queryTime: queryTime,
                resultCount: data?.length || 0,
                hasError: false
            };
        } catch (error) {
            return {
                queryTime: null,
                resultCount: 0,
                hasError: true,
                error: error.message
            };
        }
    }

    async getRecentActivity() {
        try {
            // Get recent customer organizations
            const { data: recentOrgs, error: orgError } = await supabase
                .from('organizations')
                .select('id, name, created_at')
                .eq('description', 'Customer Organization')
                .order('created_at', { ascending: false })
                .limit(5);

            if (orgError) throw orgError;

            // Get recent project contact points
            const { data: recentContactPoints, error: cpError } = await supabase
                .from('project_contact_points')
                .select(`
          id,
          created_at,
          projects:projects!project_id(
            project_id,
            title
          ),
          contacts:contacts!contact_id(
            contact_name
          )
        `)
                .order('created_at', { ascending: false })
                .limit(5);

            if (cpError) throw cpError;

            return {
                recentOrganizations: recentOrgs || [],
                recentContactPoints: recentContactPoints || []
            };
        } catch (error) {
            console.error('Error fetching recent activity:', error.message);
            return {
                recentOrganizations: [],
                recentContactPoints: []
            };
        }
    }

    async getHealthStatus() {
        try {
            // Test basic connectivity
            const { data, error } = await supabase.from('organizations').select('count').limit(1);

            if (error) throw error;

            // Test new schema elements
            const { data: projects, error: projectsError } = await supabase
                .from('projects')
                .select('id, customer_organization_id')
                .limit(1);

            if (projectsError) throw projectsError;

            // Test project contact points table
            const { data: contactPoints, error: cpError } = await supabase
                .from('project_contact_points')
                .select('id')
                .limit(1);

            if (cpError) throw cpError;

            return {
                status: 'healthy',
                connectivity: true,
                schemaValid: true,
                lastCheck: new Date().toISOString()
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                connectivity: false,
                schemaValid: false,
                error: error.message,
                lastCheck: new Date().toISOString()
            };
        }
    }

    formatDuration(ms) {
        if (ms < 1000) return `${ms}ms`;
        if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
        return `${(ms / 60000).toFixed(1)}m`;
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleString();
    }

    async displayDashboard() {
        console.clear();
        console.log('🔍 Organization-Based Customer Model Migration - Monitoring Dashboard');
        console.log('='.repeat(80));
        console.log(`📅 Started: ${this.formatDate(this.startTime.toISOString())}`);
        console.log(`⏱️  Uptime: ${this.formatDuration(Date.now() - this.startTime.getTime())}`);
        console.log('');

        // Health Status
        const health = await this.getHealthStatus();
        console.log('🏥 Health Status:');
        console.log(`   Status: ${health.status === 'healthy' ? '✅ Healthy' : '❌ Unhealthy'}`);
        console.log(`   Connectivity: ${health.connectivity ? '✅ Connected' : '❌ Disconnected'}`);
        console.log(`   Schema: ${health.schemaValid ? '✅ Valid' : '❌ Invalid'}`);
        if (health.error) {
            console.log(`   Error: ${health.error}`);
        }
        console.log('');

        // Database Metrics
        const dbMetrics = await this.getDatabaseMetrics();
        if (dbMetrics) {
            console.log('📊 Database Metrics:');
            console.log(`   Customer Organizations: ${dbMetrics.organizations}`);
            console.log(`   Migrated Contacts: ${dbMetrics.contacts}`);
            console.log(`   Projects with Organizations: ${dbMetrics.projects}`);
            console.log(`   Project Contact Points: ${dbMetrics.contactPoints}`);
            console.log(`   Last Update: ${this.formatDate(dbMetrics.lastUpdate)}`);
            console.log('');
        }

        // Performance Metrics
        const perfMetrics = await this.getPerformanceMetrics();
        console.log('⚡ Performance Metrics:');
        if (perfMetrics.hasError) {
            console.log(`   Query Status: ❌ Error - ${perfMetrics.error}`);
        } else {
            console.log(`   Query Time: ${perfMetrics.queryTime ? this.formatDuration(perfMetrics.queryTime) : 'N/A'}`);
            console.log(`   Result Count: ${perfMetrics.resultCount}`);
            console.log(`   Performance: ${perfMetrics.queryTime < 200 ? '✅ Good' : perfMetrics.queryTime < 500 ? '⚠️  Acceptable' : '❌ Slow'}`);
        }
        console.log('');

        // Recent Activity
        const activity = await this.getRecentActivity();
        console.log('📈 Recent Activity:');

        if (activity.recentOrganizations.length > 0) {
            console.log('   Recent Organizations:');
            activity.recentOrganizations.forEach(org => {
                console.log(`     • ${org.name} (${this.formatDate(org.created_at)})`);
            });
        } else {
            console.log('   Recent Organizations: None');
        }

        if (activity.recentContactPoints.length > 0) {
            console.log('   Recent Contact Points:');
            activity.recentContactPoints.forEach(cp => {
                const projectTitle = cp.projects?.title || 'Unknown Project';
                const contactName = cp.contacts?.contact_name || 'Unknown Contact';
                console.log(`     • ${projectTitle} - ${contactName} (${this.formatDate(cp.created_at)})`);
            });
        } else {
            console.log('   Recent Contact Points: None');
        }
        console.log('');

        // Migration Progress
        const totalProjects = await supabase.from('projects').select('*', { count: 'exact', head: true });
        const migratedProjects = dbMetrics?.projects || 0;
        const migrationPercentage = totalProjects.count > 0 ? (migratedProjects / totalProjects.count * 100).toFixed(1) : 0;

        console.log('📈 Migration Progress:');
        console.log(`   Projects Migrated: ${migratedProjects}/${totalProjects.count || 0} (${migrationPercentage}%)`);
        console.log(`   Migration Status: ${migrationPercentage > 80 ? '✅ Nearly Complete' : migrationPercentage > 50 ? '⚠️  In Progress' : '🔄 Early Stage'}`);
        console.log('');

        console.log('🔄 Refreshing every 30 seconds... (Press Ctrl+C to exit)');
        console.log('='.repeat(80));
    }

    async startMonitoring() {
        console.log('Starting migration monitoring dashboard...');

        // Initial display
        await this.displayDashboard();

        // Refresh every 30 seconds
        setInterval(async () => {
            await this.displayDashboard();
        }, 30000);
    }
}

// Main execution
async function main() {
    const monitor = new MigrationMonitor();

    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n\n👋 Monitoring dashboard stopped.');
        process.exit(0);
    });

    try {
        await monitor.startMonitoring();
    } catch (error) {
        console.error('Monitoring dashboard failed:', error.message);
        process.exit(1);
    }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Organization-Based Customer Model Migration - Monitoring Dashboard

Usage: node scripts/monitor-migration.js [options]

Options:
  --help, -h     Show this help message
  --once         Run once and exit (no continuous monitoring)

Features:
  - Real-time health status monitoring
  - Database metrics tracking
  - Performance metrics
  - Recent activity display
  - Migration progress tracking

Examples:
  node scripts/monitor-migration.js
  node scripts/monitor-migration.js --once
  `);
    process.exit(0);
}

if (args.includes('--once')) {
    console.log('Running monitoring dashboard once...');
    const monitor = new MigrationMonitor();
    monitor.displayDashboard().then(() => {
        console.log('\nMonitoring complete.');
        process.exit(0);
    });
} else {
    main();
}
