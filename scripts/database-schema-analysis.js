#!/usr/bin/env node

/**
 * Database Schema Analysis Script
 * 
 * This script connects to the local Supabase database and extracts complete
 * schema information for the projects table and related tables.
 * 
 * Requirements addressed:
 * - 1.1: Connect to local Supabase database and extract complete projects table schema
 * - 1.2: Document all column definitions, constraints, and relationships
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Database connection configuration
const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Initialize Supabase client with service role key for admin access
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Read and parse migration files to extract schema information
 */
function readMigrationSchema(tableName) {
    try {
        // Find migration file for this table
        const migrationDir = 'supabase/migrations';
        const files = fs.readdirSync(migrationDir);

        const migrationFile = files.find(file =>
            file.includes(`create_${tableName}`) ||
            (tableName === 'projects' && file.includes('create_projects'))
        );

        if (!migrationFile) {
            console.log(`⚠️  No migration file found for ${tableName}`);
            return null;
        }

        const migrationPath = path.join(migrationDir, migrationFile);
        const migrationContent = fs.readFileSync(migrationPath, 'utf8');

        // Parse the CREATE TABLE statement
        const schema = parseMigrationSQL(migrationContent, tableName);

        return schema;
    } catch (error) {
        console.error(`❌ Error reading migration for ${tableName}:`, error);
        return null;
    }
}

/**
 * Parse SQL migration content to extract schema information
 */
function parseMigrationSQL(sqlContent, tableName) {
    const lines = sqlContent.split('\n');
    const schema = {
        columns: [],
        constraints: [],
        foreignKeys: [],
        indexes: []
    };

    let inTableDefinition = false;
    let currentTable = '';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Detect CREATE TABLE statement
        if (line.includes('CREATE TABLE') && line.includes(tableName)) {
            inTableDefinition = true;
            currentTable = tableName;
            continue;
        }

        // End of table definition
        if (inTableDefinition && line.includes(');')) {
            inTableDefinition = false;
            continue;
        }

        // Parse column definitions
        if (inTableDefinition && line && !line.startsWith('--')) {
            const columnMatch = line.match(/^\s*(\w+)\s+([^,\s]+(?:\s*\([^)]+\))?)/);
            if (columnMatch) {
                const [, columnName, dataType] = columnMatch;

                const column = {
                    column_name: columnName,
                    data_type: dataType,
                    is_nullable: line.includes('NOT NULL') ? 'NO' : 'YES',
                    column_default: extractDefault(line),
                    constraints: extractConstraints(line)
                };

                schema.columns.push(column);

                // Check for foreign key references
                if (line.includes('REFERENCES')) {
                    const fkMatch = line.match(/REFERENCES\s+(\w+)\((\w+)\)/);
                    if (fkMatch) {
                        schema.foreignKeys.push({
                            column_name: columnName,
                            referenced_table_name: fkMatch[1],
                            referenced_column_name: fkMatch[2]
                        });
                    }
                }
            }
        }

        // Parse CHECK constraints
        if (line.includes('CHECK')) {
            const checkMatch = line.match(/CHECK\s*\(([^)]+)\)/);
            if (checkMatch) {
                schema.constraints.push({
                    constraint_type: 'CHECK',
                    constraint_definition: checkMatch[1]
                });
            }
        }

        // Parse CREATE INDEX statements
        if (line.includes('CREATE INDEX')) {
            const indexMatch = line.match(/CREATE INDEX\s+(\w+)\s+ON\s+(\w+)\s*\(([^)]+)\)/);
            if (indexMatch && indexMatch[2] === tableName) {
                schema.indexes.push({
                    index_name: indexMatch[1],
                    table_name: indexMatch[2],
                    columns: indexMatch[3]
                });
            }
        }
    }

    return schema;
}

/**
 * Extract default value from column definition
 */
function extractDefault(line) {
    const defaultMatch = line.match(/DEFAULT\s+([^,\s]+(?:\s*\([^)]*\))?)/);
    return defaultMatch ? defaultMatch[1] : null;
}

/**
 * Extract constraints from column definition
 */
function extractConstraints(line) {
    const constraints = [];

    if (line.includes('PRIMARY KEY')) constraints.push('PRIMARY KEY');
    if (line.includes('UNIQUE')) constraints.push('UNIQUE');
    if (line.includes('NOT NULL')) constraints.push('NOT NULL');

    return constraints;
}

/**
 * Extract table schema information by analyzing actual table data and migration files
 */
async function extractTableSchema(tableName) {
    console.log(`\n📊 Analyzing table: ${tableName}`);

    try {
        // First, try to get sample data to see if table exists and what columns it has
        const { data: sampleData, error: dataError } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);

        if (dataError) {
            console.error(`❌ Error accessing table ${tableName}:`, dataError);
            return null;
        }

        // Read migration file for this table to get accurate schema
        const migrationSchema = readMigrationSchema(tableName);

        // If we have data, analyze the actual data types
        let actualColumns = [];
        if (sampleData && sampleData.length > 0) {
            const firstRow = sampleData[0];
            actualColumns = Object.keys(firstRow).map(columnName => ({
                column_name: columnName,
                actual_data_type: typeof firstRow[columnName],
                sample_value: firstRow[columnName],
                is_null: firstRow[columnName] === null
            }));
        }

        return {
            tableName,
            migrationSchema,
            actualColumns,
            sampleData: sampleData || [],
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error(`❌ Unexpected error analyzing ${tableName}:`, error);
        return null;
    }
}

/**
 * Get sample data from the table to understand data patterns
 */
async function getSampleData(tableName, limit = 5) {
    console.log(`📋 Getting sample data from ${tableName}`);

    try {
        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(limit);

        if (error) {
            console.error(`❌ Error fetching sample data from ${tableName}:`, error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error(`❌ Unexpected error getting sample data from ${tableName}:`, error);
        return [];
    }
}

/**
 * Analyze data types and patterns in the sample data
 */
function analyzeDataPatterns(sampleData, migrationColumns) {
    if (!sampleData || sampleData.length === 0) {
        return {};
    }

    const patterns = {};

    // Get all column names from sample data
    const actualColumns = Object.keys(sampleData[0]);

    actualColumns.forEach(columnName => {
        const values = sampleData.map(row => row[columnName]).filter(val => val !== null && val !== undefined);
        const migrationColumn = migrationColumns?.find(col => col.column_name === columnName);

        patterns[columnName] = {
            sampleValues: values.slice(0, 3), // First 3 non-null values
            nullCount: sampleData.length - values.length,
            actualDataType: values.length > 0 ? typeof values[0] : 'unknown',
            migrationDataType: migrationColumn?.data_type || 'not_found',
            isNullable: migrationColumn?.is_nullable || 'UNKNOWN',
            hasData: values.length > 0,
            constraints: migrationColumn?.constraints || []
        };
    });

    return patterns;
}

/**
 * Generate comprehensive schema documentation
 */
function generateSchemaDocumentation(schemaData) {
    let documentation = `# Database Schema Analysis Report\n\n`;
    documentation += `Generated on: ${new Date().toISOString()}\n\n`;
    documentation += `## Overview\n\n`;
    documentation += `This report contains a comprehensive analysis of the Factory Pulse database schema,\n`;
    documentation += `focusing on the projects table and its relationships.\n\n`;

    schemaData.forEach(tableData => {
        if (!tableData) return;

        const { tableName, migrationSchema, actualColumns, sampleData, dataPatterns } = tableData;

        documentation += `## Table: ${tableName}\n\n`;

        // Migration Schema section
        if (migrationSchema && migrationSchema.columns) {
            documentation += `### Schema Definition (from migrations)\n\n`;
            documentation += `| Column Name | Data Type | Nullable | Default | Constraints |\n`;
            documentation += `|-------------|-----------|----------|---------|-------------|\n`;

            migrationSchema.columns.forEach(column => {
                const nullable = column.is_nullable === 'YES' ? '✅' : '❌';
                const defaultValue = column.column_default || 'None';
                const constraints = column.constraints.join(', ') || 'None';

                documentation += `| ${column.column_name} | ${column.data_type} | ${nullable} | ${defaultValue} | ${constraints} |\n`;
            });
        }

        // Actual Data Analysis section
        if (actualColumns && actualColumns.length > 0) {
            documentation += `\n### Actual Data Analysis\n\n`;
            documentation += `| Column Name | Actual Type | Sample Value | In Migration |\n`;
            documentation += `|-------------|-------------|--------------|-------------|\n`;

            actualColumns.forEach(column => {
                const inMigration = migrationSchema?.columns?.find(col => col.column_name === column.column_name) ? '✅' : '❌';
                const sampleValue = JSON.stringify(column.sample_value);

                documentation += `| ${column.column_name} | ${column.actual_data_type} | ${sampleValue} | ${inMigration} |\n`;
            });
        }

        // Foreign Keys section
        if (migrationSchema?.foreignKeys && migrationSchema.foreignKeys.length > 0) {
            documentation += `\n### Foreign Key Relationships\n\n`;
            migrationSchema.foreignKeys.forEach(fk => {
                documentation += `- \`${fk.column_name}\` → \`${fk.referenced_table_name}.${fk.referenced_column_name}\`\n`;
            });
        }

        // Constraints section
        if (migrationSchema?.constraints && migrationSchema.constraints.length > 0) {
            documentation += `\n### Check Constraints\n\n`;
            migrationSchema.constraints.forEach(constraint => {
                documentation += `- **${constraint.constraint_type}**: ${constraint.constraint_definition}\n`;
            });
        }

        // Indexes section
        if (migrationSchema?.indexes && migrationSchema.indexes.length > 0) {
            documentation += `\n### Indexes\n\n`;
            migrationSchema.indexes.forEach(index => {
                documentation += `- **${index.index_name}**: ${index.columns}\n`;
            });
        }

        // Data Patterns section
        if (dataPatterns && Object.keys(dataPatterns).length > 0) {
            documentation += `\n### Data Patterns Analysis\n\n`;
            Object.entries(dataPatterns).forEach(([columnName, pattern]) => {
                documentation += `**${columnName}:**\n`;
                documentation += `- Migration Type: ${pattern.migrationDataType}\n`;
                documentation += `- Actual Type: ${pattern.actualDataType}\n`;
                documentation += `- Nullable: ${pattern.isNullable}\n`;
                documentation += `- Has Data: ${pattern.hasData ? 'Yes' : 'No'}\n`;
                documentation += `- Sample Values: ${JSON.stringify(pattern.sampleValues)}\n`;
                if (pattern.nullCount > 0) {
                    documentation += `- Null Count: ${pattern.nullCount}\n`;
                }
                if (pattern.constraints.length > 0) {
                    documentation += `- Constraints: ${pattern.constraints.join(', ')}\n`;
                }
                documentation += `\n`;
            });
        }

        documentation += `\n---\n\n`;
    });

    return documentation;
}

/**
 * Main analysis function
 */
async function analyzeDatabase() {
    console.log('🚀 Starting Database Schema Analysis...');
    console.log(`📡 Connecting to: ${SUPABASE_URL}`);

    // Tables to analyze (projects and related tables)
    const tablesToAnalyze = [
        'projects',
        'organizations',
        'users',
        'contacts',
        'workflow_stages',
        'project_assignments',
        'documents',
        'reviews',
        'messages',
        'notifications',
        'activity_log'
    ];

    const schemaData = [];

    for (const tableName of tablesToAnalyze) {
        try {
            // Extract schema information
            const tableSchema = await extractTableSchema(tableName);

            if (tableSchema) {
                // Get additional sample data for pattern analysis
                const sampleData = await getSampleData(tableName, 5);

                // Analyze data patterns
                const dataPatterns = analyzeDataPatterns(sampleData, tableSchema.migrationSchema?.columns);

                schemaData.push({
                    ...tableSchema,
                    sampleData,
                    dataPatterns
                });

                console.log(`✅ Successfully analyzed ${tableName}`);
            } else {
                console.log(`⚠️  Skipped ${tableName} (no data or error)`);
            }

            // Small delay to avoid overwhelming the database
            await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
            console.error(`❌ Failed to analyze ${tableName}:`, error);
        }
    }

    // Generate documentation
    console.log('\n📝 Generating documentation...');
    const documentation = generateSchemaDocumentation(schemaData);

    // Save results
    const outputDir = 'docs/database-analysis';
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save detailed JSON report
    const jsonReport = {
        generatedAt: new Date().toISOString(),
        databaseUrl: SUPABASE_URL,
        tablesAnalyzed: tablesToAnalyze,
        schemaData
    };

    fs.writeFileSync(
        path.join(outputDir, 'schema-analysis.json'),
        JSON.stringify(jsonReport, null, 2)
    );

    // Save markdown documentation
    fs.writeFileSync(
        path.join(outputDir, 'schema-documentation.md'),
        documentation
    );

    console.log(`\n✅ Analysis complete!`);
    console.log(`📄 Documentation saved to: ${outputDir}/schema-documentation.md`);
    console.log(`📊 JSON report saved to: ${outputDir}/schema-analysis.json`);

    // Summary
    console.log(`\n📈 Summary:`);
    console.log(`- Tables analyzed: ${schemaData.length}`);
    console.log(`- Total columns found: ${schemaData.reduce((sum, table) => sum + (table.actualColumns?.length || 0), 0)}`);
    console.log(`- Total foreign keys: ${schemaData.reduce((sum, table) => sum + (table.migrationSchema?.foreignKeys?.length || 0), 0)}`);

    return schemaData;
}

// Run the analysis
if (import.meta.url === `file://${process.argv[1]}`) {
    analyzeDatabase()
        .then(() => {
            console.log('\n🎉 Database schema analysis completed successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Analysis failed:', error);
            process.exit(1);
        });
}

export { analyzeDatabase, extractTableSchema, getSampleData };