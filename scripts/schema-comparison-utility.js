#!/usr/bin/env node

/**
 * Schema Comparison Utility
 * 
 * This utility provides functions to compare database schema with TypeScript interfaces
 * and detect mismatches for ongoing validation.
 * 
 * Requirements addressed:
 * - 1.2: Create schema comparison utilities for ongoing validation
 */

import fs from 'fs';
import path from 'path';
import { analyzeDatabase } from './database-schema-analysis.js';

/**
 * Load and parse TypeScript interface files
 */
function parseTypeScriptInterface(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const interfaces = [];

        // Simple regex-based parsing for TypeScript interfaces
        const interfaceRegex = /interface\s+(\w+)\s*{([^}]+)}/g;
        let match;

        while ((match = interfaceRegex.exec(content)) !== null) {
            const [, interfaceName, interfaceBody] = match;
            const properties = parseInterfaceProperties(interfaceBody);

            interfaces.push({
                name: interfaceName,
                properties,
                filePath,
                sourceContent: match[0]
            });
        }

        return interfaces;
    } catch (error) {
        console.error(`❌ Error parsing TypeScript file ${filePath}:`, error);
        return [];
    }
}

/**
 * Parse interface properties from interface body
 */
function parseInterfaceProperties(interfaceBody) {
    const properties = [];
    const lines = interfaceBody.split('\n');

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*')) {
            continue;
        }

        // Match property definitions: propertyName?: type;
        const propertyMatch = trimmed.match(/^(\w+)(\?)?:\s*([^;]+);?/);
        if (propertyMatch) {
            const [, propertyName, optional, propertyType] = propertyMatch;

            properties.push({
                name: propertyName,
                type: propertyType.trim(),
                optional: !!optional,
                sourceCode: trimmed
            });
        }
    }

    return properties;
}

/**
 * Compare database schema with TypeScript interface
 */
function compareSchemaWithInterface(databaseTable, tsInterface) {
    const mismatches = [];
    const { tableName, migrationSchema, actualColumns, dataPatterns } = databaseTable;

    if (!migrationSchema || !migrationSchema.columns) {
        mismatches.push({
            type: 'missing_migration',
            severity: 'critical',
            message: `No migration schema found for table ${tableName}`,
            table: tableName,
            interface: tsInterface.name
        });
        return mismatches;
    }

    // Create maps for easier comparison
    const dbColumns = new Map();
    migrationSchema.columns.forEach(col => {
        dbColumns.set(col.column_name, col);
    });

    const tsProperties = new Map();
    tsInterface.properties.forEach(prop => {
        tsProperties.set(prop.name, prop);
    });

    // Check for missing properties in TypeScript interface
    for (const [columnName, column] of dbColumns) {
        if (!tsProperties.has(columnName)) {
            mismatches.push({
                type: 'missing_property',
                severity: 'high',
                message: `Database column '${columnName}' not found in TypeScript interface '${tsInterface.name}'`,
                table: tableName,
                interface: tsInterface.name,
                column: columnName,
                dbType: column.data_type,
                nullable: column.is_nullable
            });
        }
    }

    // Check for extra properties in TypeScript interface
    for (const [propertyName, property] of tsProperties) {
        if (!dbColumns.has(propertyName)) {
            // Check if it might be a computed/joined field
            const isComputedField = ['customer', 'current_stage', 'assignee', 'creator', 'organization'].includes(propertyName);

            mismatches.push({
                type: 'extra_property',
                severity: isComputedField ? 'low' : 'medium',
                message: `TypeScript property '${propertyName}' not found in database table '${tableName}'`,
                table: tableName,
                interface: tsInterface.name,
                property: propertyName,
                tsType: property.type,
                isComputedField
            });
        }
    }

    // Check for type mismatches
    for (const [columnName, column] of dbColumns) {
        const tsProperty = tsProperties.get(columnName);
        if (tsProperty) {
            const mismatch = compareTypes(column, tsProperty, tableName, tsInterface.name);
            if (mismatch) {
                mismatches.push(mismatch);
            }

            // Check nullable/optional mismatch
            const dbNullable = column.is_nullable === 'YES';
            const tsOptional = tsProperty.optional;

            if (dbNullable !== tsOptional) {
                mismatches.push({
                    type: 'nullable_mismatch',
                    severity: 'medium',
                    message: `Nullable mismatch for '${columnName}': DB nullable=${dbNullable}, TS optional=${tsOptional}`,
                    table: tableName,
                    interface: tsInterface.name,
                    column: columnName,
                    dbNullable,
                    tsOptional
                });
            }
        }
    }

    return mismatches;
}

/**
 * Compare database column type with TypeScript property type
 */
function compareTypes(dbColumn, tsProperty, tableName, interfaceName) {
    const dbType = dbColumn.data_type.toLowerCase();
    const tsType = tsProperty.type.toLowerCase();

    // Type mapping rules
    const typeMapping = {
        'uuid': ['string'],
        'varchar': ['string'],
        'text': ['string'],
        'integer': ['number'],
        'bigint': ['number'],
        'decimal': ['number'],
        'boolean': ['boolean'],
        'timestamptz': ['string', 'date'],
        'jsonb': ['object', 'record<string, any>', 'any'],
        'text[]': ['string[]', 'array<string>'],
        'uuid[]': ['string[]', 'array<string>']
    };

    // Find matching database type pattern
    let expectedTsTypes = [];
    for (const [dbPattern, tsTypes] of Object.entries(typeMapping)) {
        if (dbType.includes(dbPattern)) {
            expectedTsTypes = tsTypes;
            break;
        }
    }

    if (expectedTsTypes.length === 0) {
        return {
            type: 'unknown_type',
            severity: 'medium',
            message: `Unknown database type '${dbColumn.data_type}' for column '${dbColumn.column_name}'`,
            table: tableName,
            interface: interfaceName,
            column: dbColumn.column_name,
            dbType: dbColumn.data_type,
            tsType: tsProperty.type
        };
    }

    // Check if TypeScript type matches any expected type
    const tsTypeClean = tsType.replace(/\s/g, '');
    const isMatch = expectedTsTypes.some(expectedType =>
        tsTypeClean.includes(expectedType.replace(/\s/g, ''))
    );

    if (!isMatch) {
        return {
            type: 'type_mismatch',
            severity: 'high',
            message: `Type mismatch for '${dbColumn.column_name}': DB type '${dbColumn.data_type}' should map to one of [${expectedTsTypes.join(', ')}], but found '${tsProperty.type}'`,
            table: tableName,
            interface: interfaceName,
            column: dbColumn.column_name,
            dbType: dbColumn.data_type,
            tsType: tsProperty.type,
            expectedTsTypes
        };
    }

    return null;
}

/**
 * Generate mismatch report
 */
function generateMismatchReport(mismatches) {
    let report = `# Schema Mismatch Report\n\n`;
    report += `Generated on: ${new Date().toISOString()}\n\n`;

    if (mismatches.length === 0) {
        report += `✅ No mismatches found! Database schema and TypeScript interfaces are aligned.\n\n`;
        return report;
    }

    // Group by severity
    const bySeverity = {
        critical: mismatches.filter(m => m.severity === 'critical'),
        high: mismatches.filter(m => m.severity === 'high'),
        medium: mismatches.filter(m => m.severity === 'medium'),
        low: mismatches.filter(m => m.severity === 'low')
    };

    report += `## Summary\n\n`;
    report += `- 🔴 Critical: ${bySeverity.critical.length}\n`;
    report += `- 🟠 High: ${bySeverity.high.length}\n`;
    report += `- 🟡 Medium: ${bySeverity.medium.length}\n`;
    report += `- 🟢 Low: ${bySeverity.low.length}\n\n`;

    // Report by severity
    for (const [severity, items] of Object.entries(bySeverity)) {
        if (items.length === 0) continue;

        const emoji = {
            critical: '🔴',
            high: '🟠',
            medium: '🟡',
            low: '🟢'
        }[severity];

        report += `## ${emoji} ${severity.toUpperCase()} Issues\n\n`;

        items.forEach((mismatch, index) => {
            report += `### ${index + 1}. ${mismatch.type.replace(/_/g, ' ').toUpperCase()}\n\n`;
            report += `**Message:** ${mismatch.message}\n\n`;
            report += `**Details:**\n`;
            report += `- Table: \`${mismatch.table}\`\n`;
            report += `- Interface: \`${mismatch.interface}\`\n`;

            if (mismatch.column) {
                report += `- Column: \`${mismatch.column}\`\n`;
            }
            if (mismatch.property) {
                report += `- Property: \`${mismatch.property}\`\n`;
            }
            if (mismatch.dbType) {
                report += `- Database Type: \`${mismatch.dbType}\`\n`;
            }
            if (mismatch.tsType) {
                report += `- TypeScript Type: \`${mismatch.tsType}\`\n`;
            }
            if (mismatch.expectedTsTypes) {
                report += `- Expected TS Types: \`${mismatch.expectedTsTypes.join(', ')}\`\n`;
            }

            report += `\n---\n\n`;
        });
    }

    return report;
}

/**
 * Main comparison function
 */
async function compareSchemaWithInterfaces() {
    console.log('🔍 Starting Schema Comparison...');

    // Get current database schema
    console.log('📊 Analyzing database schema...');
    const schemaData = await analyzeDatabase();

    // Find projects table data
    const projectsTable = schemaData.find(table => table.tableName === 'projects');
    if (!projectsTable) {
        console.error('❌ Projects table not found in schema data');
        return;
    }

    // Parse TypeScript interfaces
    console.log('📝 Parsing TypeScript interfaces...');
    const projectTypesPath = 'src/types/project.ts';

    if (!fs.existsSync(projectTypesPath)) {
        console.error(`❌ TypeScript file not found: ${projectTypesPath}`);
        return;
    }

    const interfaces = parseTypeScriptInterface(projectTypesPath);
    const projectInterface = interfaces.find(iface => iface.name === 'Project');

    if (!projectInterface) {
        console.error('❌ Project interface not found in TypeScript file');
        return;
    }

    console.log(`✅ Found Project interface with ${projectInterface.properties.length} properties`);

    // Compare schema with interface
    console.log('🔍 Comparing schema with interface...');
    const mismatches = compareSchemaWithInterface(projectsTable, projectInterface);

    // Generate report
    const report = generateMismatchReport(mismatches);

    // Save report
    const outputDir = 'docs/database-analysis';
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(
        path.join(outputDir, 'schema-mismatch-report.md'),
        report
    );

    console.log(`\n📄 Mismatch report saved to: ${outputDir}/schema-mismatch-report.md`);
    console.log(`\n📈 Summary: ${mismatches.length} mismatches found`);

    if (mismatches.length > 0) {
        const bySeverity = {
            critical: mismatches.filter(m => m.severity === 'critical').length,
            high: mismatches.filter(m => m.severity === 'high').length,
            medium: mismatches.filter(m => m.severity === 'medium').length,
            low: mismatches.filter(m => m.severity === 'low').length
        };

        console.log(`- 🔴 Critical: ${bySeverity.critical}`);
        console.log(`- 🟠 High: ${bySeverity.high}`);
        console.log(`- 🟡 Medium: ${bySeverity.medium}`);
        console.log(`- 🟢 Low: ${bySeverity.low}`);
    }

    return mismatches;
}

// Export functions for use in other scripts
export {
    parseTypeScriptInterface,
    compareSchemaWithInterface,
    compareTypes,
    generateMismatchReport,
    compareSchemaWithInterfaces
};

// Run comparison if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    compareSchemaWithInterfaces()
        .then((mismatches) => {
            if (mismatches && mismatches.length > 0) {
                console.log('\n⚠️  Schema mismatches detected. Please review the report.');
                process.exit(1);
            } else {
                console.log('\n✅ Schema comparison completed successfully!');
                process.exit(0);
            }
        })
        .catch(error => {
            console.error('\n💥 Schema comparison failed:', error);
            process.exit(1);
        });
}