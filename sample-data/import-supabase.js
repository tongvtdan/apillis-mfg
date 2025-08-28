#!/usr/bin/env node

/**
 * Factory Pulse Sample Data Import Script for Supabase
 * This script imports sample data directly to your Supabase database
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SAMPLE_DATA_DIR = __dirname;
const CONFIG_FILE = path.join(__dirname, '..', 'supabase', 'config.toml');

console.log('🚀 Factory Pulse Sample Data Import Script');
console.log('==========================================');

// Check if we're in the right directory
if (!fs.existsSync(CONFIG_FILE)) {
    console.error('❌ Please run this script from the project root directory');
    process.exit(1);
}

// Function to read JSON files
function readJsonFile(filename) {
    try {
        const filePath = path.join(SAMPLE_DATA_DIR, filename);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(content);
        }
        return null;
    } catch (error) {
        console.error(`❌ Error reading ${filename}:`, error.message);
        return null;
    }
}

// Function to generate SQL for a table
function generateTableSQL(tableName, data, tableConfig) {
    if (!data || !Array.isArray(data) || data.length === 0) {
        return null;
    }

    const columns = tableConfig.columns || Object.keys(data[0]);
    const sql = [];

    sql.push(`-- Import data for ${tableName} table`);
    sql.push(`INSERT INTO ${tableName} (${columns.join(', ')}) VALUES`);

    const values = data.map(record => {
        const row = columns.map(col => {
            const value = record[col];
            if (value === null || value === undefined) {
                return 'NULL';
            } else if (typeof value === 'string') {
                return `'${value.replace(/'/g, "''")}'`;
            } else if (typeof value === 'object') {
                return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
            } else {
                return `'${value}'`;
            }
        });
        return `  (${row.join(', ')})`;
    });

    sql.push(values.join(',\n') + ';');
    sql.push('');

    return sql.join('\n');
}

// Table configurations
const TABLE_CONFIGS = {
    'organizations': {
        columns: ['id', 'name', 'description', 'industry', 'size', 'status', 'created_at', 'updated_at']
    },
    'workflow_stages': {
        columns: ['id', 'organization_id', 'name', 'description', 'order_index', 'status', 'created_at', 'updated_at']
    },
    'users': {
        columns: ['id', 'organization_id', 'email', 'first_name', 'last_name', 'role', 'status', 'created_at', 'updated_at']
    },
    'contacts': {
        columns: ['id', 'organization_id', 'contact_type', 'name', 'email', 'phone', 'address', 'city', 'country', 'status', 'created_at', 'updated_at']
    },
    'projects': {
        columns: ['id', 'organization_id', 'customer_id', 'title', 'description', 'project_type', 'status', 'current_stage_id', 'priority', 'start_date', 'due_date', 'budget', 'created_at', 'updated_at']
    },
    'documents': {
        columns: ['id', 'organization_id', 'project_id', 'title', 'description', 'file_type', 'file_size', 'file_path', 'category', 'status', 'version', 'uploaded_by', 'uploaded_at', 'metadata', 'tags']
    },
    'reviews': {
        columns: ['id', 'organization_id', 'project_id', 'reviewer_id', 'review_type', 'status', 'priority', 'review_date', 'due_date', 'title', 'description', 'comments', 'rating', 'metadata', 'tags', 'created_at', 'updated_at']
    },
    'messages': {
        columns: ['id', 'organization_id', 'project_id', 'sender_id', 'recipient_id', 'thread_id', 'subject', 'content', 'message_type', 'priority', 'status', 'sent_at', 'read_at', 'metadata', 'tags']
    },
    'notifications': {
        columns: ['id', 'organization_id', 'user_id', 'project_id', 'type', 'title', 'message', 'priority', 'status', 'delivery_method', 'sent_at', 'read_at', 'metadata', 'tags']
    },
    'activity_log': {
        columns: ['id', 'organization_id', 'user_id', 'project_id', 'action', 'description', 'entity_type', 'entity_id', 'changes', 'ip_address', 'user_agent', 'timestamp', 'metadata']
    }
};

// Main import function
async function importSampleData() {
    console.log('📊 Starting sample data import...\n');

    const allSQL = [];
    const processedTables = [];

    // Process each table
    for (const [tableName, config] of Object.entries(TABLE_CONFIGS)) {
        // Map table names to file names (handle hyphens in filenames)
        const fileMap = {
            'workflow_stages': 'workflow-stages.json',
            'activity_log': 'activity-log.json'
        };
        const filename = fileMap[tableName] || `${tableName}.json`;
        console.log(`📥 Processing ${filename}...`);

        const data = readJsonFile(filename);
        if (data) {
            const sql = generateTableSQL(tableName, data, config);
            if (sql) {
                allSQL.push(sql);
                processedTables.push(tableName);
                console.log(`✅ Generated SQL for ${tableName} (${data.length} records)`);
            }
        } else {
            console.log(`⚠️  Skipping ${tableName} (file not found or empty)`);
        }
    }

    // Write combined SQL file
    const outputFile = path.join(SAMPLE_DATA_DIR, 'supabase-import.sql');
    const header = `-- Factory Pulse Sample Data Import Script
-- Generated on: ${new Date().toISOString()}
-- Total tables: ${processedTables.length}
-- Total records: ${processedTables.reduce((total, table) => {
        const data = readJsonFile(`${table}.json`);
        return total + (data ? data.length : 0);
    }, 0)}

-- Tables to be imported: ${processedTables.join(', ')}

-- IMPORTANT: Run this script in your Supabase database
-- You can use the Supabase Dashboard SQL Editor or any PostgreSQL client

`;

    fs.writeFileSync(outputFile, header + allSQL.join('\n'));

    console.log('\n🎉 Import preparation completed!');
    console.log(`📁 SQL file created: ${outputFile}`);
    console.log(`📊 Tables processed: ${processedTables.length}`);
    console.log(`📝 Total records: ${processedTables.reduce((total, table) => {
        const data = readJsonFile(`${table}.json`);
        return total + (data ? data.length : 0);
    }, 0)}`);

    console.log('\n📚 Next steps:');
    console.log('1. Open your Supabase Dashboard');
    console.log('2. Go to SQL Editor');
    console.log('3. Copy and paste the content of supabase-import.sql');
    console.log('4. Execute the script');
    console.log('5. Verify data in your tables');

    console.log('\n🔗 Alternative methods:');
    console.log('- Use psql command line: psql "your-connection-string" -f supabase-import.sql');
    console.log('- Use pgAdmin or DBeaver database clients');
    console.log('- Use the Supabase CLI: supabase db push (if you have local migrations)');
}

// Run the import
importSampleData().catch(console.error);
