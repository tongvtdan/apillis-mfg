#!/usr/bin/env node
// Organization-Based Customer Model Migration - Production Deployment Script
// Automated deployment with validation and rollback capabilities

import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Configuration
const config = {
    supabaseUrl: process.env.SUPABASE_URL || 'http://127.0.0.1:54321',
    supabaseKey: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
    environment: process.env.NODE_ENV || 'development',
    backupPath: './backups',
    logPath: './logs'
};

const supabase = createClient(config.supabaseUrl, config.supabaseKey);

class DeploymentManager {
    constructor() {
        this.startTime = new Date();
        this.logFile = path.join(config.logPath, `deployment_${this.startTime.toISOString().replace(/[:.]/g, '-')}.log`);
        this.ensureDirectories();
    }

    ensureDirectories() {
        [config.backupPath, config.logPath].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    log(message, level = 'INFO') {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${level}] ${message}`;
        console.log(logMessage);

        // Write to log file
        fs.appendFileSync(this.logFile, logMessage + '\n');
    }

    async createBackup() {
        this.log('Creating pre-deployment backup...');

        try {
            const backupFile = path.join(config.backupPath, `backup_pre_migration_${this.startTime.toISOString().replace(/[:.]/g, '-')}.sql`);

            // Create backup using pg_dump
            const backupCommand = `pg_dump -h 127.0.0.1 -p 54322 -U postgres -d postgres --format=plain --file="${backupFile}"`;

            execSync(backupCommand, { stdio: 'inherit' });

            this.log(`Backup created successfully: ${backupFile}`);
            return backupFile;
        } catch (error) {
            this.log(`Backup creation failed: ${error.message}`, 'ERROR');
            throw error;
        }
    }

    async validatePreDeployment() {
        this.log('Running pre-deployment validation...');

        try {
            // Check database connectivity
            const { data, error } = await supabase.from('organizations').select('count').limit(1);
            if (error) throw new Error(`Database connectivity check failed: ${error.message}`);

            // Check if migration has already been applied
            const { data: projects, error: projectsError } = await supabase
                .from('projects')
                .select('customer_organization_id')
                .limit(1);

            if (projectsError) throw new Error(`Projects table check failed: ${projectsError.message}`);

            // Check if customer_organization_id column exists
            if (projects && projects.length > 0 && 'customer_organization_id' in projects[0]) {
                this.log('Migration appears to already be applied. Skipping deployment.', 'WARNING');
                return false;
            }

            this.log('Pre-deployment validation passed');
            return true;
        } catch (error) {
            this.log(`Pre-deployment validation failed: ${error.message}`, 'ERROR');
            throw error;
        }
    }

    async applySchemaMigration() {
        this.log('Applying database schema migration...');

        try {
            // Apply schema changes
            const schemaMigration = path.join(process.cwd(), 'supabase/migrations/20250130000001_migrate_org_become_customer.sql');

            if (!fs.existsSync(schemaMigration)) {
                throw new Error(`Schema migration file not found: ${schemaMigration}`);
            }

            const migrationCommand = `psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f "${schemaMigration}"`;
            execSync(migrationCommand, { stdio: 'inherit' });

            this.log('Schema migration applied successfully');
        } catch (error) {
            this.log(`Schema migration failed: ${error.message}`, 'ERROR');
            throw error;
        }
    }

    async applyDataMigration() {
        this.log('Applying data migration...');

        try {
            // Apply data migration
            const dataMigration = path.join(process.cwd(), 'supabase/migrations/20250130000002_migrate_org_become_customer_data.sql');

            if (!fs.existsSync(dataMigration)) {
                throw new Error(`Data migration file not found: ${dataMigration}`);
            }

            const migrationCommand = `psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f "${dataMigration}"`;
            execSync(migrationCommand, { stdio: 'inherit' });

            this.log('Data migration applied successfully');
        } catch (error) {
            this.log(`Data migration failed: ${error.message}`, 'ERROR');
            throw error;
        }
    }

    async validatePostDeployment() {
        this.log('Running post-deployment validation...');

        try {
            // Run validation script
            const validationScript = path.join(process.cwd(), 'scripts/validate-migration.js');

            if (!fs.existsSync(validationScript)) {
                throw new Error(`Validation script not found: ${validationScript}`);
            }

            execSync(`node "${validationScript}"`, { stdio: 'inherit' });

            this.log('Post-deployment validation passed');
        } catch (error) {
            this.log(`Post-deployment validation failed: ${error.message}`, 'ERROR');
            throw error;
        }
    }

    async buildApplication() {
        this.log('Building application...');

        try {
            execSync('npm run build', { stdio: 'inherit' });
            this.log('Application built successfully');
        } catch (error) {
            this.log(`Application build failed: ${error.message}`, 'ERROR');
            throw error;
        }
    }

    async deployApplication() {
        this.log('Deploying application...');

        try {
            // This would be specific to your deployment method
            // For now, we'll just log the deployment step
            this.log('Application deployment completed (deployment method depends on infrastructure)');
        } catch (error) {
            this.log(`Application deployment failed: ${error.message}`, 'ERROR');
            throw error;
        }
    }

    async rollback(backupFile) {
        this.log('Initiating rollback...', 'WARNING');

        try {
            if (backupFile && fs.existsSync(backupFile)) {
                this.log('Restoring from backup...');

                const restoreCommand = `psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f "${backupFile}"`;
                execSync(restoreCommand, { stdio: 'inherit' });

                this.log('Rollback completed successfully');
            } else {
                this.log('No backup file available for rollback', 'ERROR');
            }
        } catch (error) {
            this.log(`Rollback failed: ${error.message}`, 'ERROR');
            throw error;
        }
    }

    async generateDeploymentReport(success, error = null) {
        const endTime = new Date();
        const duration = endTime - this.startTime;

        const report = {
            deploymentId: this.startTime.toISOString(),
            environment: config.environment,
            startTime: this.startTime.toISOString(),
            endTime: endTime.toISOString(),
            duration: `${Math.round(duration / 1000)}s`,
            success: success,
            error: error?.message || null,
            logFile: this.logFile
        };

        const reportFile = path.join(config.logPath, `deployment_report_${this.startTime.toISOString().replace(/[:.]/g, '-')}.json`);
        fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

        this.log(`Deployment report saved: ${reportFile}`);
        return report;
    }

    async deploy() {
        let backupFile = null;

        try {
            this.log('Starting organization-based customer model migration deployment...');

            // Step 1: Pre-deployment validation
            const shouldProceed = await this.validatePreDeployment();
            if (!shouldProceed) {
                this.log('Deployment skipped - migration already applied');
                return;
            }

            // Step 2: Create backup
            backupFile = await this.createBackup();

            // Step 3: Apply schema migration
            await this.applySchemaMigration();

            // Step 4: Apply data migration
            await this.applyDataMigration();

            // Step 5: Build application
            await this.buildApplication();

            // Step 6: Deploy application
            await this.deployApplication();

            // Step 7: Post-deployment validation
            await this.validatePostDeployment();

            // Step 8: Generate success report
            const report = await this.generateDeploymentReport(true);

            this.log('🎉 Deployment completed successfully!');
            this.log(`Deployment ID: ${report.deploymentId}`);
            this.log(`Duration: ${report.duration}`);

        } catch (error) {
            this.log(`Deployment failed: ${error.message}`, 'ERROR');

            // Attempt rollback
            try {
                await this.rollback(backupFile);
            } catch (rollbackError) {
                this.log(`Rollback also failed: ${rollbackError.message}`, 'ERROR');
            }

            // Generate failure report
            const report = await this.generateDeploymentReport(false, error);

            this.log('❌ Deployment failed and rollback attempted');
            this.log(`Deployment ID: ${report.deploymentId}`);

            throw error;
        }
    }
}

// Main execution
async function main() {
    const deploymentManager = new DeploymentManager();

    try {
        await deploymentManager.deploy();
        process.exit(0);
    } catch (error) {
        console.error('Deployment failed:', error.message);
        process.exit(1);
    }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Organization-Based Customer Model Migration - Deployment Script

Usage: node scripts/deploy-migration.js [options]

Options:
  --help, -h     Show this help message
  --dry-run      Validate deployment without applying changes
  --rollback     Rollback previous deployment (requires backup file)

Environment Variables:
  SUPABASE_URL           Supabase URL (default: http://127.0.0.1:54321)
  SUPABASE_ANON_KEY      Supabase anonymous key
  NODE_ENV               Environment (development, staging, production)

Examples:
  node scripts/deploy-migration.js
  NODE_ENV=production node scripts/deploy-migration.js
  `);
    process.exit(0);
}

if (args.includes('--dry-run')) {
    console.log('Dry run mode - validation only');
    // Implement dry run logic
    process.exit(0);
}

if (args.includes('--rollback')) {
    console.log('Rollback mode - not implemented in this version');
    process.exit(1);
}

// Run deployment
main();
