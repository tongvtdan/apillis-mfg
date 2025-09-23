import { z } from 'zod';
import { intakeFormSchema, IntakeFormData, DocumentItem } from '../types/intake.types';

// Re-export the main schema
export { intakeFormSchema };

// Additional validation utilities
export class IntakeValidation {

    /**
     * Validate document requirements based on intake type
     */
    static validateDocumentRequirements(documents: DocumentItem[], intakeType: string): {
        isValid: boolean;
        errors: string[];
        warnings: string[];
    } {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Minimum document requirements
        if (documents.length < 2) {
            errors.push('At least two documents are required (Drawing and BOM)');
        }

        // Check for required document types based on intake type
        const documentTypes = documents.map(doc => doc.type.toLowerCase());

        // Always require drawing
        if (!documentTypes.some(type => type.includes('drawing') || type.includes('spec'))) {
            errors.push('A drawing or specification document is required');
        }

        // Require BOM for manufacturing-related intakes
        if (['rfq', 'po'].includes(intakeType) &&
            !documentTypes.some(type => type.includes('bom') || type.includes('bill'))) {
            errors.push('A Bill of Materials (BOM) is required for quotes and purchase orders');
        }

        // Check file sizes (max 10MB per file)
        documents.forEach((doc, index) => {
            if (doc.file && doc.file.size > 10 * 1024 * 1024) {
                errors.push(`Document ${index + 1} exceeds maximum file size (10MB)`);
            }
        });

        // Check for duplicate document types
        const uniqueTypes = new Set(documentTypes);
        if (uniqueTypes.size !== documentTypes.length) {
            warnings.push('Consider using different document types for better organization');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Validate customer information completeness
     */
    static validateCustomerInfo(formData: Partial<IntakeFormData>): {
        isValid: boolean;
        errors: string[];
        warnings: string[];
    } {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Required fields
        if (!formData.customerName?.trim()) {
            errors.push('Customer name is required');
        }

        if (!formData.company?.trim()) {
            errors.push('Company name is required');
        }

        if (!formData.email?.trim()) {
            errors.push('Email address is required');
        }

        // Email format validation (additional to schema)
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.push('Please enter a valid email address');
        }

        // Optional but recommended fields
        if (!formData.phone?.trim()) {
            warnings.push('Phone number is recommended for better communication');
        }

        if (!formData.country?.trim()) {
            warnings.push('Country information helps with logistics planning');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Validate project requirements based on intake type
     */
    static validateProjectRequirements(formData: Partial<IntakeFormData>): {
        isValid: boolean;
        errors: string[];
        warnings: string[];
    } {
        const errors: string[] = [];
        const warnings: string[] = [];

        const intakeType = formData.intakeType;

        // Title validation
        if (!formData.projectTitle?.trim()) {
            errors.push('Project title is required');
        } else if (formData.projectTitle.length < 3) {
            errors.push('Project title must be at least 3 characters');
        }

        // Description validation
        if (!formData.description?.trim()) {
            errors.push('Project description is required');
        } else if (formData.description.length < 50) {
            errors.push('Project description must be at least 50 characters');
        }

        // Type-specific validations
        switch (intakeType) {
            case 'rfq':
                if (!formData.volumes?.length) {
                    errors.push('Volume information is required for quotes');
                }
                if (!formData.targetPricePerUnit) {
                    warnings.push('Target price per unit helps with quote preparation');
                }
                break;

            case 'po':
                if (!formData.projectReference?.trim()) {
                    errors.push('Purchase order reference is required');
                }
                break;

            case 'design_idea':
                if (!formData.desiredDeliveryDate) {
                    warnings.push('Timeline information helps with feasibility assessment');
                }
                break;
        }

        // Delivery date validation
        if (formData.desiredDeliveryDate) {
            const deliveryDate = new Date(formData.desiredDeliveryDate);
            const minDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

            if (deliveryDate < minDate) {
                errors.push('Delivery date must be at least 7 days from now');
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Comprehensive form validation
     */
    static validateCompleteForm(formData: IntakeFormData): {
        isValid: boolean;
        errors: Record<string, string[]>;
        warnings: Record<string, string[]>;
    } {
        const errors: Record<string, string[]> = {};
        const warnings: Record<string, string[]> = {};

        // Validate customer information
        const customerValidation = this.validateCustomerInfo(formData);
        if (!customerValidation.isValid) {
            errors.customer = customerValidation.errors;
        }
        if (customerValidation.warnings.length > 0) {
            warnings.customer = customerValidation.warnings;
        }

        // Validate project requirements
        const projectValidation = this.validateProjectRequirements(formData);
        if (!projectValidation.isValid) {
            errors.project = projectValidation.errors;
        }
        if (projectValidation.warnings.length > 0) {
            warnings.project = projectValidation.warnings;
        }

        // Validate documents
        const documentValidation = this.validateDocumentRequirements(formData.documents, formData.intakeType);
        if (!documentValidation.isValid) {
            errors.documents = documentValidation.errors;
        }
        if (documentValidation.warnings.length > 0) {
            warnings.documents = documentValidation.warnings;
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
            warnings
        };
    }

    /**
     * Check if form can be submitted
     */
    static canSubmitForm(formData: IntakeFormData): boolean {
        try {
            // Parse with schema validation
            intakeFormSchema.parse(formData);

            // Additional business logic validation
            const validation = this.validateCompleteForm(formData);

            return validation.isValid;
        } catch (error) {
            return false;
        }
    }
}
