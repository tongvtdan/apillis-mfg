import { describe, it, expect } from 'vitest';
import {
    ProjectIntakeFormSchema,
    ProjectEditFormSchema,
    validateFileUpload,
    validateFileUploads,
    PROJECT_CONSTRAINTS
} from '../project-schemas';

describe('ProjectIntakeFormSchema', () => {
    it('should validate a valid form', () => {
        const validData = {
            companyName: 'Test Company',
            contactName: 'John Doe',
            contactEmail: 'john@test.com',
            contactPhone: '123-456-7890',
            projectTitle: 'Test Project',
            description: 'Test description',
            priority: 'medium' as const,
            estimatedValue: '1000.00',
            dueDate: '2025-12-31',
            notes: 'Test notes'
        };

        const result = ProjectIntakeFormSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it('should reject empty required fields', () => {
        const invalidData = {
            companyName: '',
            contactName: '',
            projectTitle: '',
            priority: 'medium' as const
        };

        const result = ProjectIntakeFormSchema.safeParse(invalidData);
        expect(result.success).toBe(false);

        if (!result.success) {
            expect(result.error.issues).toHaveLength(3); // companyName, contactName, projectTitle
        }
    });

    it('should reject fields that exceed maximum length', () => {
        const longString = 'a'.repeat(PROJECT_CONSTRAINTS.TITLE_MAX_LENGTH + 1);

        const invalidData = {
            companyName: 'Test Company',
            contactName: 'John Doe',
            projectTitle: longString,
            priority: 'medium' as const
        };

        const result = ProjectIntakeFormSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    it('should validate email format', () => {
        const invalidData = {
            companyName: 'Test Company',
            contactName: 'John Doe',
            contactEmail: 'invalid-email',
            projectTitle: 'Test Project',
            priority: 'medium' as const
        };

        const result = ProjectIntakeFormSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    it('should validate priority enum values', () => {
        const invalidData = {
            companyName: 'Test Company',
            contactName: 'John Doe',
            projectTitle: 'Test Project',
            priority: 'invalid' as any
        };

        const result = ProjectIntakeFormSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });
});

describe('ProjectEditFormSchema', () => {
    it('should validate a valid edit form', () => {
        const validData = {
            title: 'Updated Project',
            description: 'Updated description',
            status: 'active' as const,
            priority_level: 'high' as const,
            estimated_value: 2000,
            project_type: 'Manufacturing',
            notes: 'Updated notes',
            tags: ['tag1', 'tag2']
        };

        const result = ProjectEditFormSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it('should validate status enum values', () => {
        const invalidData = {
            title: 'Test Project',
            status: 'invalid_status' as any,
            priority_level: 'medium' as const
        };

        const result = ProjectEditFormSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });
});

describe('File Upload Validation', () => {
    it('should validate a valid file', () => {
        const validFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
        const result = validateFileUpload(validFile);

        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
    });

    it('should reject empty files', () => {
        const emptyFile = new File([], 'empty.pdf', { type: 'application/pdf' });
        const result = validateFileUpload(emptyFile);

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('File cannot be empty');
    });

    it('should reject files that are too large', () => {
        const largeContent = new Array(51 * 1024 * 1024).fill('a').join(''); // 51MB
        const largeFile = new File([largeContent], 'large.pdf', { type: 'application/pdf' });
        const result = validateFileUpload(largeFile);

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('File size cannot exceed 50MB');
    });

    it('should reject unsupported file types', () => {
        const unsupportedFile = new File(['test'], 'test.exe', { type: 'application/x-executable' });
        const result = validateFileUpload(unsupportedFile);

        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Unsupported file type');
    });
});

describe('Multiple File Upload Validation', () => {
    it('should validate multiple valid files', () => {
        const files = [
            new File(['content1'], 'file1.pdf', { type: 'application/pdf' }),
            new File(['content2'], 'file2.jpg', { type: 'image/jpeg' })
        ];

        const result = validateFileUploads(files);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should reject when no files are provided', () => {
        const result = validateFileUploads([]);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('At least one file must be uploaded');
    });

    it('should reject too many files', () => {
        const files = Array.from({ length: 21 }, (_, i) =>
            new File(['content'], `file${i}.pdf`, { type: 'application/pdf' })
        );

        const result = validateFileUploads(files);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Cannot upload more than 20 files at once');
    });
});