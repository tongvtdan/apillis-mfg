// Excel Template Generator for Supplier Import
// Generates downloadable Excel template with sample data and validation

import {
    SUPPLIER_IMPORT_TEMPLATE_HEADERS,
    SUPPLIER_IMPORT_SAMPLE_DATA,
    SUPPLIER_IMPORT_OPTIONS,
    type SupplierImportRow
} from './supplierImportTemplate';

// Simple CSV generation (can be enhanced with xlsx library later)
export function generateSupplierImportTemplate(): string {
    const headers = SUPPLIER_IMPORT_TEMPLATE_HEADERS;
    const sampleData = SUPPLIER_IMPORT_SAMPLE_DATA;

    // Convert sample data to CSV format
    const csvRows: string[] = [];

    // Add headers
    csvRows.push(headers.join(','));

    // Add sample data rows
    sampleData.forEach(row => {
        const csvRow = [
            escapeCSV(row.organizationName),
            escapeCSV(row.primaryContactName),
            escapeCSV(row.email),
            escapeCSV(row.address),
            escapeCSV(row.city),
            escapeCSV(row.country),
            escapeCSV(row.phone || ''),
            escapeCSV(row.website || ''),
            escapeCSV(row.state || ''),
            escapeCSV(row.postalCode || ''),
            escapeCSV(row.taxId || ''),
            escapeCSV(row.paymentTerms || ''),
            escapeCSV(row.currency || ''),
            escapeCSV(row.specialties || ''),
            escapeCSV(row.materials || ''),
            escapeCSV(row.certifications || ''),
            escapeCSV(row.notes || ''),
            escapeCSV(row.tags || '')
        ];
        csvRows.push(csvRow.join(','));
    });

    return csvRows.join('\n');
}

// Helper function to escape CSV values
function escapeCSV(value: string): string {
    if (!value) return '';

    // If value contains comma, quote, or newline, wrap in quotes and escape quotes
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
    }

    return value;
}

// Generate template download
export function downloadSupplierTemplate(): void {
    const csvContent = generateSupplierImportTemplate();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'supplier-import-template.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Parse uploaded CSV/Excel file
export function parseSupplierImportFile(fileContent: string): {
    data: SupplierImportRow[];
    errors: string[];
} {
    const lines = fileContent.split('\n').filter(line => line.trim());
    const errors: string[] = [];
    const data: SupplierImportRow[] = [];

    if (lines.length < 2) {
        errors.push('File must contain at least a header row and one data row');
        return { data, errors };
    }

    // Parse header row
    const headers = parseCSVRow(lines[0]);
    const expectedHeaders = SUPPLIER_IMPORT_TEMPLATE_HEADERS;

    // Validate headers (flexible matching)
    const headerMap = createHeaderMap(headers, expectedHeaders);

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
        const rowData = parseCSVRow(lines[i]);

        if (rowData.length === 0 || rowData.every(cell => !cell.trim())) {
            continue; // Skip empty rows
        }

        try {
            const supplierRow = mapRowToSupplier(rowData, headerMap);
            const validationErrors = validateSupplierRow(supplierRow, i + 1);

            if (validationErrors.length > 0) {
                errors.push(...validationErrors);
            } else {
                data.push(supplierRow);
            }
        } catch (error) {
            errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    return { data, errors };
}

// Parse CSV row handling quoted values
function parseCSVRow(row: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < row.length; i++) {
        const char = row[i];

        if (char === '"') {
            if (inQuotes && row[i + 1] === '"') {
                current += '"';
                i++; // Skip next quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current.trim());
    return result;
}

// Create flexible header mapping
function createHeaderMap(actualHeaders: string[], expectedHeaders: string[]): Record<string, number> {
    const map: Record<string, number> = {};

    expectedHeaders.forEach(expected => {
        const normalized = expected.toLowerCase().replace(/[^a-z0-9]/g, '');

        const matchIndex = actualHeaders.findIndex(actual => {
            const actualNormalized = actual.toLowerCase().replace(/[^a-z0-9]/g, '');
            return actualNormalized === normalized || actualNormalized.includes(normalized);
        });

        if (matchIndex >= 0) {
            map[expected] = matchIndex;
        }
    });

    return map;
}

// Map row data to supplier object
function mapRowToSupplier(rowData: string[], headerMap: Record<string, number>): SupplierImportRow {
    const getValue = (header: string): string => {
        const index = headerMap[header];
        return index !== undefined ? (rowData[index] || '').trim() : '';
    };

    return {
        organizationName: getValue('Organization Name*'),
        primaryContactName: getValue('Primary Contact Name*'),
        email: getValue('Email*'),
        phone: getValue('Phone') || undefined,
        website: getValue('Website') || undefined,
        address: getValue('Address*'),
        city: getValue('City*'),
        state: getValue('State') || undefined,
        country: getValue('Country*'),
        postalCode: getValue('Postal Code') || undefined,
        taxId: getValue('Tax ID') || undefined,
        paymentTerms: getValue('Payment Terms') || undefined,
        currency: getValue('Currency') || undefined,
        specialties: getValue('Specialties') || undefined,
        materials: getValue('Materials') || undefined,
        certifications: getValue('Certifications') || undefined,
        notes: getValue('Notes') || undefined,
        tags: getValue('Tags') || undefined
    };
}

// Validate supplier row data
function validateSupplierRow(row: SupplierImportRow, rowNumber: number): string[] {
    const errors: string[] = [];

    // Required field validation
    if (!row.organizationName) {
        errors.push(`Row ${rowNumber}: Organization Name is required`);
    }

    if (!row.primaryContactName) {
        errors.push(`Row ${rowNumber}: Primary Contact Name is required`);
    }

    if (!row.email) {
        errors.push(`Row ${rowNumber}: Email is required`);
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
        errors.push(`Row ${rowNumber}: Invalid email format`);
    }

    if (!row.address) {
        errors.push(`Row ${rowNumber}: Address is required`);
    }

    if (!row.city) {
        errors.push(`Row ${rowNumber}: City is required`);
    }

    if (!row.country) {
        errors.push(`Row ${rowNumber}: Country is required`);
    }

    // Optional field validation
    if (row.website && !/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(row.website)) {
        errors.push(`Row ${rowNumber}: Invalid website format`);
    }

    // Validate specialties
    if (row.specialties) {
        const specialties = row.specialties.split(',').map(s => s.trim());
        const validSpecialties = SUPPLIER_IMPORT_OPTIONS.specialties;
        const invalidSpecialties = specialties.filter(s => !validSpecialties.includes(s));

        if (invalidSpecialties.length > 0) {
            errors.push(`Row ${rowNumber}: Invalid specialties: ${invalidSpecialties.join(', ')}`);
        }
    }

    // Validate country
    if (row.country && !SUPPLIER_IMPORT_OPTIONS.countries.includes(row.country)) {
        errors.push(`Row ${rowNumber}: Invalid country: ${row.country}`);
    }

    // Validate payment terms
    if (row.paymentTerms && !SUPPLIER_IMPORT_OPTIONS.paymentTerms.includes(row.paymentTerms)) {
        errors.push(`Row ${rowNumber}: Invalid payment terms: ${row.paymentTerms}`);
    }

    // Validate currency
    if (row.currency && !SUPPLIER_IMPORT_OPTIONS.currencies.includes(row.currency)) {
        errors.push(`Row ${rowNumber}: Invalid currency: ${row.currency}`);
    }

    return errors;
}