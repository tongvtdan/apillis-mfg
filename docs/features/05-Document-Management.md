

### `requirements-feature5.md`

# Requirements Document: Feature 5 - Document Management

## ✅ Feature Progress Tracking

### Core Features (MVP - Phase 1)

1. **User Authentication & Role Management** ✅  
2. **RFQ Intake Portal** ✅  
3. **Dashboard & Workflow Management** ✅  
4. **Internal Review System** ✅  
5. **Document Management** ✅   
6. **Notification and Assignment System**  
7. **Metrics and Analytics Dashboard**  
8. **Workflow Configuration**

### Advanced Features (Phase 2)

9. **Quotation & Costing Engine**  
10. **Supplier Management & RFQ Engine**  
11. **Communication & Notifications**  
12. **Reporting & Analytics**  
13. **Integration & API**

### Extended Features (Phase 3)

14. **Mobile Application**  
15. **Advanced Workflow Features**

### Compliance & Security Features

16. **Audit & Compliance**  
17. **Security & Performance**

### Future Enhancements

18. **AI & Automation**  
19. **Advanced Analytics**

## Introduction
The Document Management system serves as the centralized, secure repository for all files associated with an RFQ. It ensures that technical drawings, BOMs, specifications, compliance documents, and internal reviews are properly stored, version-controlled, and accessible only to authorized users. This system supports auditability, collaboration, and traceability throughout the RFQ lifecycle.

## Stakeholders
- Procurement Owner
- Engineering Team
- QA Team
- Production Team
- Supplier
- Management
- System Administrator

## Requirements

### Requirement 5.1: Centralized Document Repository
**User Story:** As a Procurement Owner, I want all project files stored in one place, so I can easily access and manage them.  
**Acceptance Criteria:**
- The system SHALL provide a dedicated document section within each RFQ.
- All uploaded files SHALL be linked to the RFQ and visible in a unified list.
- The system SHALL support file types: PDF, STEP, IGES, XLSX, CSV, DWG, and other common CAD formats.

### Requirement 5.2: Version Control and History
**User Story:** As an Engineer, I want to track changes to design files, so I can ensure we're working with the latest version.  
**Acceptance Criteria:**
- The system SHALL maintain a complete version history for every document.
- WHEN a document is updated, the system SHALL create a new version with timestamp, uploader, and optional change notes.
- Users SHALL be able to view, download, and restore previous versions.

### Requirement 5.3: Document Categorization and Tagging
**User Story:** As a QA Specialist, I want to tag documents by type (e.g., Drawing, BOM, Certificate), so I can filter and find them quickly.  
**Acceptance Criteria:**
- Users SHALL be able to assign predefined categories and custom tags to documents.
- Default categories SHALL include: Drawing, BOM, Specification, Compliance, Internal Review, Supplier Quote.
- The system SHALL allow filtering by category and tag.

### Requirement 5.4: Role-Based Access Control (RBAC)
**User Story:** As a System Administrator, I want to restrict access to sensitive documents, so only authorized users can view them.  
**Acceptance Criteria:**
- The system SHALL enforce access control based on user role and department.
- Suppliers SHALL only see documents explicitly marked as "Shared with Supplier".
- Internal teams SHALL only see documents relevant to their phase (e.g., QA sees quality specs).
- Access attempts to unauthorized documents SHALL be logged.

### Requirement 5.5: Global Search and Filtering
**User Story:** As a Team Member, I want to search for a document by name or content, so I don’t waste time browsing manually.  
**Acceptance Criteria:**
- The system SHALL support full-text search across document names and extracted text (PDF, XLSX).
- Search SHALL be possible by: RFQ ID, customer name, document type, file name, or content.
- Results SHALL be sorted by relevance, date, or document type.

### Requirement 5.6: Upload and Notification System
**User Story:** As a Team Member, I want to be notified when a new document is uploaded, so I can review it promptly.  
**Acceptance Criteria:**
- WHEN a document is uploaded or updated, the system SHALL trigger notifications to relevant team members.
- Notifications SHALL be delivered in-app and via email.
- The system SHALL support bulk uploads and validate file types and sizes (max 50MB per file).

## Non-Functional Requirements
- Document upload and retrieval SHALL complete within 2 seconds under normal load.
- All files SHALL be stored encrypted at rest and in transit.
- The system SHALL prevent malicious file uploads through validation and scanning.


---

### `design-feature5.md`
```markdown
# Design Document: Feature 5 - Document Management

## ✅ Feature Progress Tracking

### Core Features (MVP - Phase 1)

1. **User Authentication & Role Management** ✅  
2. **RFQ Intake Portal** ✅  
3. **Dashboard & Workflow Management** ✅  
4. **Internal Review System** ✅  
5. **Document Management** ✅  
6. **Notification and Assignment System**  
7. **Metrics and Analytics Dashboard**  
8. **Workflow Configuration**

### Advanced Features (Phase 2)

9. **Quotation & Costing Engine**  
10. **Supplier Management & RFQ Engine**  
11. **Communication & Notifications**  
12. **Reporting & Analytics**  
13. **Integration & API**

### Extended Features (Phase 3)

14. **Mobile Application**  
15. **Advanced Workflow Features**

### Compliance & Security Features

16. **Audit & Compliance**  
17. **Security & Performance**

### Future Enhancements

18. **AI & Automation**  
19. **Advanced Analytics**

## Overview
The Document Management system is a secure, versioned, and searchable repository for all RFQ-related files. It integrates with the RFQ detail view and supports role-based access, tagging, and real-time notifications. Built on Firebase Cloud Storage and Firestore, it ensures traceability and compliance.

## Components and Interfaces

### Frontend Components

#### 1. Document Upload Component
```typescript
interface DocumentUploadProps {
  rfqId: string;
  onUploadSuccess: (docId: string) => void;
  acceptedTypes: string[];
  maxFileSize: number;
  allowMultiple: boolean;
}
```

#### 2. Document List Panel
- Displays documents in a table or grid.
- Columns: Name, Type, Version, Uploader, Date, Tags, Actions.
- Supports sorting, filtering by category/tag, and search.

#### 3. Version History Modal
- Shows all versions of a document.
- Allows download and restoration of previous versions.
- Displays change notes and upload metadata.

### Backend Services

#### 1. `uploadDocument` Cloud Function
- Validates file type, size, and user permissions.
- Uploads file to Cloud Storage at path: `rfqs/{rfqId}/documents/{docId}/v{version}/file.ext`.
- Creates metadata in Firestore with version, uploader, tags.

#### 2. `indexDocumentForSearch` Cloud Function
- Triggers on upload.
- Extracts text from PDF/XLSX using a server-side library.
- Stores searchable content in Firestore.

## Data Model

### Document Metadata (Firestore)
```json
rfqs/{rfqId}/documents/{docId}
  ├── fileName: string
  ├── fileType: "drawing" | "bom" | "specification" | "compliance" | "review" | "quote" | "other"
  ├── tags: string[]
  ├── version: number
  ├── uploadedAt: timestamp
  ├── uploadedBy: string (userId)
  ├── storagePath: string
  ├── downloadUrl: string (signed)
  ├── previousVersions: [
    {
      version: number,
      uploadedAt: timestamp,
      uploadedBy: string,
      storagePath: string,
      changeNotes?: string
    }
  ]
  └── accessControl: {
    allowedRoles: string[],
    visibleToSupplier: boolean
  }
```

## Workflow
1. User uploads file via Document Upload component.
2. Frontend calls `uploadDocument` Cloud Function.
3. Function validates, stores in Cloud Storage, creates metadata.
4. `indexDocumentForSearch` extracts text and updates search index.
5. System triggers notifications to assigned team members.

## Security Considerations
- Firestore Security Rules enforce role-based access.
- Signed URLs are used for secure file access.
- Files are not publicly accessible.
- Input sanitization prevents malicious file names.

## Data Protection
- All files encrypted at rest in Cloud Storage.
- Version history is immutable.
- Access attempts logged for audit purposes.


---

### `tasks-feature5.md`

# Implementation Plan: Feature 5 - Document Management

## ✅ Feature Progress Tracking

### Core Features (MVP - Phase 1)

1. **User Authentication & Role Management** ✅  
2. **RFQ Intake Portal** ✅  
3. **Dashboard & Workflow Management** ✅  
4. **Internal Review System** ✅  
5. **Document Management** ✅ 
6. **Notification and Assignment System**  
7. **Metrics and Analytics Dashboard**  
8. **Workflow Configuration**

### Advanced Features (Phase 2)

9. **Quotation & Costing Engine**  
10. **Supplier Management & RFQ Engine**  
11. **Communication & Notifications**  
12. **Reporting & Analytics**  
13. **Integration & API**

### Extended Features (Phase 3)

14. **Mobile Application**  
15. **Advanced Workflow Features**

### Compliance & Security Features

16. **Audit & Compliance**  
17. **Security & Performance**

### Future Enhancements

18. **AI & Automation**  
19. **Advanced Analytics**

## Sprint 2

- [ ] **1. Build Cloud Function to handle document uploads**
  - [ ] Create `uploadDocument` Cloud Function
  - [ ] Validate file type, size (max 50MB), and user permissions
  - [ ] Upload file to Firebase Cloud Storage with versioned path
  - [ ] Create document metadata in Firestore with version, uploader, timestamp
  - **Requirements:** 5.1, 5.6

- [ ] **2. Implement file upload component integrated with Cloud Function**
  - [ ] Build reusable DocumentUpload component with drag-and-drop
  - [ ] Support single and bulk uploads
  - [ ] Show upload progress and success/failure status
  - [ ] Validate file types (PDF, STEP, IGES, XLSX, CAD)
  - **Requirements:** 5.1, 5.6

- [ ] **3. Implement version control and history tracking**
  - [ ] On document update, increment version number
  - [ ] Move previous version to `previousVersions` array
  - [ ] Build Version History modal to view and restore versions
  - [ ] Display version timeline in document panel
  - **Requirements:** 5.2

- [ ] **4. Develop document categorization and tagging system**
  - [ ] Add category selection (Drawing, BOM, etc.) on upload
  - [ ] Allow custom tags input
  - [ ] Implement filtering by category and tag in UI
  - [ ] Make categories configurable in admin panel (future)
  - **Requirements:** 5.3

- [ ] **5. Implement role-based access control for documents**
  - [ ] Extend document metadata with `accessControl` field
  - [ ] Set `visibleToSupplier` flag for external sharing
  - [ ] Enforce access via Firestore Security Rules
  - [ ] Use signed URLs for secure file retrieval
  - **Requirements:** 5.4

- [ ] **6. Build global search functionality**
  - [ ] Create Cloud Function `indexDocumentForSearch` to extract text from PDF/XLSX
  - [ ] Store searchable text in Firestore
  - [ ] Implement search bar with filters (RFQ ID, customer, type, tag)
  - [ ] Highlight matching terms in results
  - **Requirements:** 5.5

- [ ] **7. Implement document upload notifications**
  - [ ] Trigger in-app and email notifications on new upload
  - [ ] Notify assigned team members and Procurement Owner
  - [ ] Include document name, RFQ ID, and link in message
  - **Requirements:** 5.6

- [ ] **8. Write unit and integration tests**
  - [ ] Test file upload and versioning logic
  - [ ] Mock access control and verify secure file access
  - [ ] Test search indexing and result accuracy


---
