# Project Validation System

## Overview

The Factory Pulse project validation system provides comprehensive client-side validation using Zod schemas to ensure data integrity and prevent database constraint violations. The system covers project forms, file uploads, and user input validation with user-friendly error messages.

## Architecture

### Core Components

- **Validation Schemas**: Zod-based schemas matching database constraints
- **Database Constants**: Centralized constraint definitions
- **File Validation**: Comprehensive file upload validation
- **Error Handling**: User-friendly error messages with specific guidance

### File Structure

```
src/lib/validation/
├── project-schemas.ts          # Main validation schemas
├── error-handlers.ts           # Error handling utilities
└── __tests__/
    └── project-schemas.test.ts # Validation tests
```

## Validation Schemas

### ProjectIntakeFormSchema

Validates new project creation forms with the following fields:

**Company & Contact Information:**
- `companyName` - Required, max 255 characters
- `contactName` - Required, max 255 characters  
- `contactEmail` - Optional, valid email format, max 255 characters
- `contactPhone` - Optional, max 50 characters

**Project Details:**
- `projectTitle` - Required, max 255 characters
- `description` - Optional, unlimited text
- `priority` - Enum: 'low', 'medium', 'high', 'urgent' (default: 'medium')
- `estimatedValue` - Optional, positive decimal up to 15 digits with 2 decimal places
- `dueDate` - Optional, must be future date
- `notes` - Optional, unlimited text

### ProjectEditFormSchema

Validates project editing forms with database-aligned fields:

- `title` - Required, max 255 characters
- `description` - Optional text
- `status` - Enum: 'active', 'on_hold', 'delayed', 'cancelled', 'completed'
- `priority_level` - Enum: 'low', 'medium', 'high', 'urgent'
- `estimated_value` - Optional positive number
- `project_type` - Optional, max 100 characters
- `notes` - Optional text
- `tags` - Optional array of strings

## Database Constraint Alignment

### Field Length Constraints

```typescript
export const PROJECT_CONSTRAINTS = {
  TITLE_MAX_LENGTH: 255,
  PROJECT_ID_MAX_LENGTH: 50,
  SOURCE_MAX_LENGTH: 50,
  PROJECT_TYPE_MAX_LENGTH: 100,
  ESTIMATED_VALUE_MAX_DIGITS: 15,
  ESTIMATED_VALUE_DECIMAL_PLACES: 2,
  CONTACT_NAME_MAX_LENGTH: 255,
  CONTACT_EMAIL_MAX_LENGTH: 255,
  CONTACT_PHONE_MAX_LENGTH: 50,
  COMPANY_NAME_MAX_LENGTH: 255,
} as const;
```

### Enum Validation

**Project Status** (matches database CHECK constraint):
- 'active', 'on_hold', 'delayed', 'cancelled', 'completed'

**Priority Level** (matches database CHECK constraint):
- 'low', 'medium', 'high', 'urgent'

## File Upload Validation

### Supported File Types

**Documents:**
- PDF: `application/pdf`
- Word: `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Excel: `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

**CAD Files:**
- DWG: `application/acad`
- DXF: `application/dxf`
- STEP: `application/step`, `application/x-step`, `model/step`
- IGES: `application/iges`, `model/iges`

**Images:**
- JPEG, PNG, GIF, BMP, TIFF

**Text Files:**
- Plain text, CSV

### File Validation Rules

**Single File Limits:**
- Maximum size: 50MB per file
- Minimum size: Must not be empty
- Type validation: MIME type + extension checking

**Multiple File Limits:**
- Maximum files: 20 files per upload
- Total size limit: 100MB for all files combined
- At least one file required for uploads

### Validation Functions

```typescript
// Single file validation
validateFileUpload(file: File): { isValid: boolean; error?: string }

// Multiple file validation  
validateFileUploads(files: File[]): { isValid: boolean; errors: string[] }
```

## Usage Examples

### Form Validation

```typescript
import { ProjectIntakeFormSchema } from '@/lib/validation/project-schemas';

// Validate form data
const result = ProjectIntakeFormSchema.safeParse(formData);

if (!result.success) {
  // Handle validation errors
  const errors = result.error.flatten().fieldErrors;
  console.log('Validation errors:', errors);
} else {
  // Form data is valid
  const validData = result.data;
}
```

### File Upload Validation

```typescript
import { validateFileUploads } from '@/lib/validation/project-schemas';

const validation = validateFileUploads(selectedFiles);

if (!validation.isValid) {
  // Show validation errors
  validation.errors.forEach(error => {
    toast.error(error);
  });
} else {
  // Proceed with upload
  uploadFiles(selectedFiles);
}
```

## Error Messages

The validation system provides user-friendly error messages:

- **Field Length**: "Project title cannot exceed 255 characters"
- **Required Fields**: "Company name is required"
- **Email Format**: "Please enter a valid email address"
- **File Size**: "File size cannot exceed 50MB"
- **File Type**: "Unsupported file type. Please upload PDF, CAD files (DWG, DXF, STEP), images, or office documents."
- **Date Validation**: "Due date must be in the future"
- **Number Validation**: "Please enter a valid positive number"

## TypeScript Integration

The validation system provides full TypeScript integration:

```typescript
// Inferred types from schemas
export type ProjectIntakeFormData = z.infer<typeof ProjectIntakeFormSchema>;
export type ProjectEditFormData = z.infer<typeof ProjectEditFormSchema>;
export type FileUploadData = z.infer<typeof FileUploadSchema>;
```

## Benefits

1. **Data Integrity**: Prevents database constraint violations at the client level
2. **User Experience**: Clear, specific error messages guide users to correct input
3. **Type Safety**: Full TypeScript integration prevents runtime errors
4. **Maintainability**: Centralized validation logic with database constraint constants
5. **Security**: Comprehensive file upload validation prevents malicious uploads
6. **Performance**: Client-side validation reduces server round trips

## Future Enhancements

- Real-time validation feedback during typing
- Async validation for unique constraints
- Cross-field validation rules
- Internationalization support for error messages
- Advanced file type detection and security scanning