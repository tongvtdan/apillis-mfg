import { describe, it, expect } from 'vitest';
import {
    ProjectIntakeFormSchema,
    ProjectEditFormSchema,
    ProjectStatusSchema,
    ProjectPrioritySchema,
    validateFileUpload,
    validateFileUploads,
    PROJECT_CONSTRAINTS
} from '../project-schemas';

describe('ProjectIntakeFormSchema', () => {
    it('should validate valid project intake data', () => {
        const validData = {
            companyName: 'Test Company',
            contactName: 'John Doe',
            contactEmail: 'john@test.com',
            contactPhone: '+1234567890',
            projectTitle: 'Test Project',
            description: 'Test description',
            priority: 'medium' as const,
            estimatedValue: '10000.50',
            dueDate: '2025-12-31',
            notes: 'Test notes'
        };

        const result = ProjectIntakeFormSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
        const invalidData = {
            contactEmail: 'john@test.com'
        };

        const result = ProjectIntakeFormSchema.safeParse(invalidData);
        expect(result.success).toBe(false);

        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            expect(errors.companyName).toBeDefined();
            expect(errors.contactName).toBeDefined();
            expect(errors.projectTitle).toBeDefined();
        }
    });

    it('should reject fields exceeding length limits', () => {
        const longString = 'x'.repeat(PROJECT_CONSTRAINTS.TITLE_MAX_LENGTH + 1);

        const invalidData = {
            companyName: 'Test Company',
            contactName: 'John Doe',
            projectTitle: longString
        };

        const result = ProjectIntakeFormSchema.safeParse(invalidData);
        expect(result.success).toBe(false);

        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            expect(errors.projectTitle).toBeDefined();
            expect(errors.projectTitle?.[0]).toContain('cannot exceed 255 characters');
        }
    });

    it('should validate email format', () => {
        const invalidData = {
            companyName: 'Test Company',
            contactName: 'John Doe',
            contactEmail: 'invalid-email',
            projectTitle: 'Test Project'
        };

        const result = ProjectIntakeFormSchema.safeParse(invalidData);
        expect(result.success).toBe(false);

        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            expect(errors.contactEmail).toBeDefined();
            expect(errors.contactEmail?.[0]).toContain('valid email address');
        }
    });

    it('should validate estimated value format', () => {
        const invalidData = {
            companyName: 'Test Company',
            contactName: 'John Doe',
            projectTitle: 'Test Project',
            estimatedValue: 'not-a-number'
        };

        const result = ProjectIntakeFormSchema.safeParse(invalidData);
        expect(result.success).toBe(false);

        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            expect(errors.estimatedValue).toBeDefined();
        }
    });

    it('should validate future dates for due date', () => {
        const pastDate = '2020-01-01';

        const invalidData = {
            companyName: 'Test Company',
            contactName: 'John Doe',
            projectTitle: 'Test Project',
            dueDate: pastDate
        };

        const result = ProjectIntakeFormSchema.safeParse(invalidData);
        expect(result.success).toBe(false);

        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            expect(errors.dueDate).toBeDefined();
            expect(errors.dueDate?.[0]).toContain('must be in the future');
        }
    });
});

describe('ProjectEditFormSchema', () => {
    it('should validate valid project edit data', () => {
        const validData = {
            title: 'Updated Project',
            description: 'Updated description',
            status: 'active' as const,
            priority_level: 'high' as const,
            estimated_value: 15000.75,
            project_type: 'manufacturing',
            notes: 'Updated notes',
            tags: ['urgent', 'customer-priority']
        };

        const result = ProjectEditFormSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it('should reject invalid status values', () => {
        const invalidData = {
            title: 'Test Project',
            status: 'invalid-status',
            priority_level: 'medium'
        };

        const result = ProjectEditFormSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    it('should reject negative estimated values', () => {
        const invalidData = {
            title: 'Test Project',
            status: 'active',
            priority_level: 'medium',
            estimated_value: -1000
        };

        const result = ProjectEditFormSchema.safeParse(invalidData);
        expect(result.success).toBe(false);

        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            expect(errors.estimated_value).toBeDefined();
        }
    });
});

describe('Enum Schemas', () => {
    it('should validate project status enum', () => {
        const validStatuses = ['active', 'on_hold', 'delayed', 'cancelled', 'completed'];

        validStatuses.forEach(status => {
            const result = ProjectStatusSchema.safeParse(status);
            expect(result.success).toBe(true);
        });

        const invalidResult = ProjectStatusSchema.safeParse('invalid-status');
        expect(invalidResult.success).toBe(false);
    });

    it('should validate project priority enum', () => {
        const validPriorities = ['low', 'normal', 'high', 'urgent'];

        validPriorities.forEach(priority => {
            const result = ProjectPrioritySchema.safeParse(priority);
            expect(result.success).toBe(true);
        });

        const invalidResult = ProjectPrioritySchema.safeParse('invalid-priority');
        expect(invalidResult.success).toBe(false);
    });
});

describe('File Upload Validation', () => {
    // Mock File constructor for testing
    const createMockFile = (name: string, size: number, type: string): File => {
        const file = new File([''], name, { type });
        Object.defineProperty(file, 'size', { value: size });
        return file;
    };

    it('should validate valid file uploads', () => {
        const validFile = createMockFile('document.pdf', 1024 * 1024, 'application/pdf'); // 1MB PDF

        const result = validateFileUpload(validFile);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
    });

    it('should reject files exceeding size limit', () => {
        const largeFile = createMockFile('large.pdf', 60 * 1024 * 1024, 'application/pdf'); // 60MB

        const result = validateFileUpload(largeFile);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('cannot exceed 50MB');
    });

    it('should reject empty files', () => {
        const emptyFile = createMockFile('empty.pdf', 0, 'application/pdf');

        const result = validateFileUpload(emptyFile);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('cannot be empty');
    });

    it('should reject unsupported file types', () => {
        const unsupportedFile = createMockFile('virus.exe', 1024, 'application/x-executable');

        const result = validateFileUpload(unsupportedFile);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Unsupported file type');
    });

    it('should validate multiple file uploads', () => {
        const files = [
            createMockFile('doc1.pdf', 1024 * 1024, 'application/pdf'),
            createMockFile('doc2.docx', 2 * 1024 * 1024, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
            createMockFile('image.jpg', 512 * 1024, 'image/jpeg')
        ];

        const result = validateFileUploads(files);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should reject too many files', () => {
        const files = Array.from({ length: 25 }, (_, i) =>
            createMockFile(`doc${i}.pdf`, 1024, 'application/pdf')
        );

        const result = validateFileUploads(files);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(error => error.includes('more than 20 files'))).toBe(true);
    });

    it('should reject when total size exceeds limit', () => {
        const files = Array.from({ length: 5 }, (_, i) =>
            createMockFile(`doc${i}.pdf`, 25 * 1024 * 1024, 'application/pdf') // 25MB each = 125MB total
        );

        const result = validateFileUploads(files);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(error => error.includes('Total file size cannot exceed 100MB'))).toBe(true);
    });

    it('should reject empty file array', () => {
        const result = validateFileUploads([]);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(error => error.includes('At least one file must be uploaded'))).toBe(true);
    });
});