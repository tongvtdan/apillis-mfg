// Supplier Bulk Import Service
// Handles bulk creation of suppliers from imported data

import { supabase } from '@/integrations/supabase/client';
import type { SupplierImportRow } from '@/utils/supplierImportTemplate';

export interface BulkImportResult {
    success: number;
    failed: number;
    errors: string[];
    createdSuppliers: Array<{
        name: string;
        id: string;
        email: string;
    }>;
}

export interface BulkImportProgress {
    current: number;
    total: number;
    currentSupplier: string;
    status: 'processing' | 'completed' | 'error';
}

export class SupplierBulkImportService {

    static async importSuppliers(
        suppliers: SupplierImportRow[],
        userId: string,
        organizationId: string,
        onProgress?: (progress: BulkImportProgress) => void
    ): Promise<BulkImportResult> {
        const result: BulkImportResult = {
            success: 0,
            failed: 0,
            errors: [],
            createdSuppliers: []
        };

        const total = suppliers.length;

        for (let i = 0; i < suppliers.length; i++) {
            const supplier = suppliers[i];

            // Update progress
            onProgress?.({
                current: i + 1,
                total,
                currentSupplier: supplier.organizationName,
                status: 'processing'
            });

            try {
                // Check if supplier already exists
                const existingSupplier = await this.checkExistingSupplier(
                    supplier.organizationName,
                    supplier.email,
                    organizationId
                );

                if (existingSupplier) {
                    result.errors.push(
                        `Supplier "${supplier.organizationName}" already exists with email ${supplier.email}`
                    );
                    result.failed++;
                    continue;
                }

                // Create supplier
                const createdSupplier = await this.createSupplierFromImport(
                    supplier,
                    userId,
                    organizationId
                );

                result.createdSuppliers.push({
                    name: createdSupplier.company_name,
                    id: createdSupplier.id,
                    email: createdSupplier.email || supplier.email
                });

                result.success++;

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                result.errors.push(
                    `Failed to create supplier "${supplier.organizationName}": ${errorMessage}`
                );
                result.failed++;
            }
        }

        // Final progress update
        onProgress?.({
            current: total,
            total,
            currentSupplier: '',
            status: result.failed === 0 ? 'completed' : 'error'
        });

        return result;
    }

    private static async checkExistingSupplier(
        name: string,
        email: string,
        organizationId: string
    ): Promise<boolean> {
        const { data, error } = await supabase
            .from('contacts')
            .select('id')
            .eq('organization_id', organizationId)
            .eq('type', 'supplier')
            .or(`company_name.ilike.%${name}%,email.eq.${email}`)
            .limit(1);

        if (error) {
            console.error('Error checking existing supplier:', error);
            return false;
        }

        return data && data.length > 0;
    }

    private static async createSupplierFromImport(
        importData: SupplierImportRow,
        userId: string,
        organizationId: string
    ) {
        // Parse comma-separated values
        const specialties = importData.specialties
            ? importData.specialties.split(',').map(s => s.trim()).filter(Boolean)
            : [];

        const materials = importData.materials
            ? importData.materials.split(',').map(m => m.trim()).filter(Boolean)
            : [];

        const certifications = importData.certifications
            ? importData.certifications.split(',').map(c => c.trim()).filter(Boolean)
            : [];

        const tags = importData.tags
            ? importData.tags.split(',').map(t => t.trim()).filter(Boolean)
            : [];

        // Prepare metadata
        const metadata = {
            specialties,
            materials,
            certifications,
            tags,
            import_source: 'bulk_import',
            imported_at: new Date().toISOString(),
            imported_by: userId
        };

        // Create supplier in contacts table
        const { data: supplier, error } = await supabase
            .from('contacts')
            .insert({
                organization_id: organizationId,
                type: 'supplier',
                company_name: importData.organizationName,
                contact_name: importData.primaryContactName,
                email: importData.email,
                phone: importData.phone,
                website: importData.website,
                address: importData.address,
                city: importData.city,
                state: importData.state,
                country: importData.country,
                postal_code: importData.postalCode,
                tax_id: importData.taxId,
                payment_terms: importData.paymentTerms || 'Net 30',
                notes: importData.notes,
                metadata,
                is_active: true,
                created_by: userId
            })
            .select()
            .single();

        if (error) {
            throw new Error(`Database error: ${error.message}`);
        }

        return supplier;
    }

    // Validate import data before processing
    static validateImportData(suppliers: SupplierImportRow[]): {
        valid: boolean;
        errors: string[];
        duplicates: string[];
    } {
        const errors: string[] = [];
        const duplicates: string[] = [];
        const seen = new Set<string>();

        // Check for duplicates within the import data
        suppliers.forEach((supplier, index) => {
            const key = `${supplier.organizationName.toLowerCase()}-${supplier.email.toLowerCase()}`;

            if (seen.has(key)) {
                duplicates.push(
                    `Row ${index + 2}: Duplicate supplier "${supplier.organizationName}" with email ${supplier.email}`
                );
            } else {
                seen.add(key);
            }
        });

        // Additional validation
        if (suppliers.length === 0) {
            errors.push('No valid supplier data found');
        }

        if (suppliers.length > 100) {
            errors.push('Maximum 100 suppliers can be imported at once');
        }

        return {
            valid: errors.length === 0 && duplicates.length === 0,
            errors,
            duplicates
        };
    }

    // Preview import data
    static previewImport(suppliers: SupplierImportRow[]): {
        totalSuppliers: number;
        countries: string[];
        specialties: string[];
        summary: {
            byCountry: Record<string, number>;
            bySpecialty: Record<string, number>;
        };
    } {
        const countries = [...new Set(suppliers.map(s => s.country).filter(Boolean))];
        const allSpecialties = suppliers
            .flatMap(s => s.specialties ? s.specialties.split(',').map(sp => sp.trim()) : [])
            .filter(Boolean);
        const specialties = [...new Set(allSpecialties)];

        const byCountry: Record<string, number> = {};
        const bySpecialty: Record<string, number> = {};

        suppliers.forEach(supplier => {
            // Count by country
            if (supplier.country) {
                byCountry[supplier.country] = (byCountry[supplier.country] || 0) + 1;
            }

            // Count by specialty
            if (supplier.specialties) {
                supplier.specialties.split(',').forEach(specialty => {
                    const trimmed = specialty.trim();
                    if (trimmed) {
                        bySpecialty[trimmed] = (bySpecialty[trimmed] || 0) + 1;
                    }
                });
            }
        });

        return {
            totalSuppliers: suppliers.length,
            countries,
            specialties,
            summary: {
                byCountry,
                bySpecialty
            }
        };
    }
}