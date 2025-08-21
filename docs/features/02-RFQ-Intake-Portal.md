
### `requirements-feature2.md`

# Requirements Document: Feature 2 - RFQ Intake Portal

## Introduction
The RFQ Intake Portal is the primary entry point for customers and sales representatives to submit manufacturing requests. It replaces manual processes with a standardized, automated, and validated web form to ensure all necessary information is captured at the outset, reducing delays and errors.

## Stakeholders
- Customer
- Sales Manager
- Procurement Owner
- Engineering Team
- System Administrator

## Requirements

### Requirement 2.1: Public RFQ Submission Form
**User Story:** As a Customer or Sales Manager, I want to submit an RFQ through a web form, so that I can initiate the manufacturing process with all required information.  
**Acceptance Criteria:**
- The system SHALL provide a public-facing web form accessible without login.
- The form SHALL collect customer information (name, email, company), project details (name, description, annual volume, timeline), technical specifications (processes, materials, quality standards), and compliance requirements.
- The form SHALL support multi-file uploads (PDF, STEP, IGES, XLSX, CAD files) with validation on file type and size (max 50MB per file).
- Required fields SHALL be clearly marked, and submission SHALL be blocked if any required data is missing.

### Requirement 2.2: Unique RFQ ID Generation
**User Story:** As a Procurement Owner, I want each RFQ to have a unique identifier, so that I can track it throughout its lifecycle.  
**Acceptance Criteria:**
- The system SHALL Auto-generation of unique RFQ IDs with format RFQ-YYMMDDXX, where YY is the last 2 digits of the year, MM is the month, DD is the day, and XX is a sequential number (e.g., `RFQ-25082001` for the RFQ 01 on August 20, 2025).
- IDs SHALL be sequential within each year and never reused.
- The ID SHALL be displayed to the user upon successful submission and included in all notifications.

### Requirement 2.3: Document Validation
**User Story:** As an Engineering Lead, I want to ensure that critical documents (e.g., BOM, drawings) are attached, so that the review process can begin immediately.  
**Acceptance Criteria:**
- The system SHALL validate that at least one technical drawing (STEP, IGES, PDF) and a BOM (XLSX, CSV) are uploaded before submission.
- If required documents are missing, the system SHALL display a clear error message and prevent submission.

### Requirement 2.4: Automated Confirmation
**User Story:** As a Customer, I want to receive confirmation that my RFQ was submitted successfully.  
**Acceptance Criteria:**
- Upon successful submission, the system SHALL send an automated email to the submitter.
- The email SHALL include the RFQ ID, submission summary, list of attached files, and estimated response timeline.
- The email template SHALL be customizable by administrators.

### Requirement 2.5: Data & File Storage
**User Story:** As a System Administrator, I want all RFQ data and files stored securely and linked correctly.  
**Acceptance Criteria:**
- All submitted form data SHALL be stored in Firestore under a `rfqs` collection.
- Uploaded files SHALL be stored in Firebase Cloud Storage with path structured as `rfqs/{rfqId}/original/`.
- The system SHALL maintain a direct link between the RFQ record and its associated files.

## Non-Functional Requirements
- The form SHALL load within 2 seconds under normal network conditions.
- The system SHALL prevent spam submissions using rate limiting and CAPTCHA (reCAPTCHA v3).
- All submissions SHALL be logged with timestamp, IP address, and user agent for audit purposes.

---

### `design-feature2.md`

# Design Document: Feature 2 - RFQ Intake Portal

## Overview
The RFQ Intake Portal is a public-facing web application that captures all necessary information for a manufacturing request. It is designed to be user-friendly, guide the user through the submission process, and ensure data completeness before creating an RFQ in the system.

## Components and Interfaces

### Frontend Components

#### 1. Public RFQ Form
```typescript
interface RFQFormProps {
  onSubmit: (rfqData: RFQSubmission) => Promise<void>;
}

interface RFQSubmission {
  customerInfo: {
    name: string;
    email: string;
    company: string;
  };
  projectInfo: {
    projectName: string;
    description: string;
    annualVolume: number;
    targetMargin: number;
    timeline: {
      prototype: Date | null;
      production: Date | null;
    };
  };
  technicalSpecs: {
    processes: string[];
    materials: string[];
    qualityStandards: string[];
  };
  documents: File[];
  compliance: string[];
}
```

#### 2. Document Upload Component
```typescript
interface DocumentUploadProps {
  onFilesSelected: (files: File[]) => void;
  acceptedTypes: string[]; // e.g., ['.pdf', '.step', '.xlsx']
  maxFileSize: number; // in MB
}
```

### Backend Services
- **Cloud Function: `createRFQ`**  
  Triggered on form submission. Validates data, generates RFQ ID, stores data in Firestore, uploads files to Cloud Storage, and triggers confirmation email.
- **Email Service:** Uses SendGrid to send automated confirmation emails via a Cloud Function (`sendRFQConfirmation`).

## Data Model
```json
rfqs (collection)
  └── {rfqId} (document)
      ├── rfqId: string (e.g., "RFQ-25082001")
      ├── status: "Submitted"
      ├── createdAt: timestamp
      ├── submittedBy: string (email)
      ├── customerInfo: object
      ├── projectInfo: object
      ├── technicalSpecs: object
      ├── compliance: string[]
      ├── files: array of { name, type, size, storagePath }
      └── metadata: { ip, userAgent, submittedAt }
```

## Workflow
1. User accesses `/rfq-submit` (public route).
2. Fills out form and uploads required documents.
3. On submit, frontend validates inputs and files.
4. Data is sent to `createRFQ` Cloud Function.
5. Function generates ID, saves to Firestore, uploads files, sends email.
6. User is redirected to a success page with RFQ ID and confirmation message.

## Security Considerations
- Public form protected with reCAPTCHA v3 to prevent bots.
- File uploads scanned for malware (via Cloud Function hook).
- All file types and sizes strictly validated.
- Input sanitized to prevent XSS and injection attacks.

## UI/UX Guidelines
- Form divided into logical steps: Customer Info → Project Details → Technical Specs → Uploads.
- Progress indicator shown at top.
- Clear error messages for invalid fields or missing files.
- Success page includes RFQ ID, summary, and option to submit another request.


---
### `tasks-feature2.md`

# Implementation Plan: Feature 2 - RFQ Intake Portal

## Sprint 1 (from PRD)

- [ ] **1. Set up dashboard foundation and state management**
  - [ ] Initialize React project structure with TypeScript and modern tooling
  - [ ] Configure Zustand for global state management and React Query for server state
  - [ ] Set up Firebase integration with Firestore real-time listeners
  - [ ] Create base routing structure and authentication guards
  - **Requirements:** 2.1, 9.1

- [ ] **2. Design and implement public RFQ submission form**
  - [ ] Create multi-step form layout with navigation
  - [ ] Implement form fields for customer, project, and technical data
  - [ ] Add client-side validation for required fields
  - [ ] Integrate date pickers for timeline inputs
  - **Requirements:** 2.1

- [ ] **3. Implement file upload component integrated with Cloud Function**
  - [ ] Build reusable DocumentUpload component with drag-and-drop
  - [ ] Validate file types and sizes (max 50MB)
  - [ ] Connect to Firebase Cloud Storage via signed upload URL
  - [ ] Display upload progress and success/failure status
  - **Requirements:** 2.1, 2.3

- [ ] **4. Implement auto-generation of unique RFQ IDs**
  - [ ] Create Cloud Function `generateRFQId` that checks last ID and increments
  - [ ] Ensure atomic increment using Firestore transactions
  - [ ] Format ID  `RFQ-YYMMDDXX`, where YY is the last 2 digits of the year, MM is the month, DD is the day, and XX is a sequential number (e.g., `RFQ-25082001` for the RFQ 01 on August 20, 2025).
  - **Requirements:** 2.2

- [ ] **5. Build backend logic for RFQ creation**
  - [ ] Create `createRFQ` Cloud Function
  - [ ] Validate all inputs and attached files
  - [ ] Store RFQ data in Firestore under `rfqs/{rfqId}`
  - [ ] Save file metadata and organize storage paths
  - **Requirements:** 2.5

- [ ] **6. Implement automated confirmation email**
  - [ ] Design email template with RFQ summary and ID
  - [ ] Integrate SendGrid for transactional emails
  - [ ] Trigger email via `sendRFQConfirmation` Cloud Function
  - [ ] Allow template customization in admin panel (future)
  - **Requirements:** 2.4

- [ ] **7. Add security and anti-spam measures**
  - [ ] Integrate reCAPTCHA v3 on form submission
  - [ ] Implement rate limiting (max 5 submissions per IP/hour)
  - [ ] Log submission metadata (IP, user agent)
  - **Requirements:** Non-functional

- [ ] **8. Write unit and integration tests**
  - [ ] Test form validation logic
  - [ ] Mock file upload and Cloud Function execution
  - [ ] Verify email is triggered on successful submission
