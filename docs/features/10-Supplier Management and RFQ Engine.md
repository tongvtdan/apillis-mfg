## ✅ Feature Progress Tracking

### Core Features (MVP - Phase 1)

1. **User Authentication & Role Management** ✅  
2. **RFQ Intake Portal** ✅  
3. **Dashboard & Workflow Management** ✅  
4. **Internal Review System** ✅  
5. **Document Management** ✅  
6. **Notification and Assignment System** ✅  
7. **Metrics and Analytics Dashboard** ✅  
8. **Workflow Configuration** ✅  
9. **Quotation & Costing Engine** ✅  
10. **Supplier Management & RFQ Engine** ✅    
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


### `requirements-feature10.md`

# Requirements Document: Feature 10 - Supplier Management & RFQ Engine



## Introduction
The Supplier Management & RFQ Engine enables Procurement Owners to manage supplier relationships and distribute RFQs to external vendors. This feature streamlines the sourcing process by allowing secure, trackable, and auditable communication with suppliers, ensuring timely and comparable quotes for components and sub-assemblies.

## Stakeholders
- Procurement Owner
- Supplier
- Engineering Team
- QA Team
- System Administrator

## Requirements

### Requirement 10.1: Supplier Database
**User Story:** As a Procurement Owner, I want to maintain a database of approved suppliers, so I can quickly select qualified partners for RFQ distribution.  
**Acceptance Criteria:**
- The system SHALL provide a CRUD interface to manage supplier records.
- Supplier records SHALL include: company name, contact person, email, phone, specialties (e.g., CNC, Sheet Metal), certifications (ISO, AS9100), performance rating, and status (Active/Inactive).
- The list SHALL be searchable and filterable by specialty, location, or rating.

### Requirement 10.2: Supplier Filtering by Capabilities
**User Story:** As a Procurement Owner, I want to filter suppliers by process and capability requirements, so I can target the most suitable vendors.  
**Acceptance Criteria:**
- The system SHALL allow filtering suppliers based on required manufacturing processes (e.g., milling, turning, welding).
- Filters SHALL support multiple selections and combination logic.
- Results SHALL be displayed in a ranked or scored list based on capability match.

### Requirement 10.3: Automated RFQ Distribution
**User Story:** As a Procurement Owner, I want to send RFQs to selected suppliers with a secure link, so they can respond without needing a full platform login.  
**Acceptance Criteria:**
- The system SHALL allow selection of one or more suppliers to receive an RFQ.
- Each supplier SHALL receive a unique, time-limited, secure link via email.
- The link SHALL grant access only to the specific RFQ and its associated documents (e.g., drawings, BOM).
- Access SHALL expire after 7 days or upon submission.

### Requirement 10.4: Real-Time Supplier Quote Tracking
**User Story:** As a Procurement Owner, I want to track the status of supplier quotes in real time, so I can follow up on delays.  
**Acceptance Criteria:**
- The system SHALL display the status of each distributed quote: Sent, Viewed, Submitted, Expired.
- Status updates SHALL be reflected in real time on the RFQ detail page.
- A timeline view SHALL show key events (e.g., email sent, link opened).

### Requirement 10.5: Supplier Portal
**User Story:** As a Supplier, I want a secure portal to view RFQs and submit quotes, so I can respond professionally and efficiently.  
**Acceptance Criteria:**
- The system SHALL provide a lightweight, secure web portal for suppliers.
- Suppliers SHALL log in via secure token or email-based authentication.
- The portal SHALL allow viewing of RFQ details and submission of quotes (price, lead time, MOQ, notes, files).

### Requirement 10.6: Supplier Communication Logs
**User Story:** As a Procurement Owner, I want to track all interactions with a supplier, so I have a complete audit trail.  
**Acceptance Criteria:**
- The system SHALL maintain a communication log for each supplier and RFQ.
- Logs SHALL include: emails sent, calls made, portal access, quote submissions.
- Entries SHALL be timestamped and attributed to the initiating user.

## Non-Functional Requirements
- Supplier links SHALL be resistant to tampering and brute-force guessing.
- All supplier communications SHALL be logged for audit purposes.
- The supplier portal SHALL be mobile-responsive and accessible without JavaScript for compatibility.


---

### `design-feature10.md`

# Design Document: Feature 10 - Supplier Management & RFQ Engine

## Overview
This feature enables end-to-end management of external suppliers and their involvement in the RFQ process. It includes a secure, lightweight portal for suppliers to respond to quotes and provides internal users with tools to distribute, track, and evaluate responses.

## Components and Interfaces

### Frontend Components

#### 1. Supplier Management Dashboard
```typescript
interface Supplier {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  specialties: string[]; // e.g., "CNC", "Injection Molding"
  certifications: string[];
  performanceRating: number; // 1-5
  status: "Active" | "Inactive";
  lastQuoteDate?: Date;
}
```

#### 2. RFQ Distribution Modal
- Allows Procurement Owner to select suppliers from a searchable, filterable list.
- Sends email via Cloud Function with secure link.
- Tracks delivery and view status.

#### 3. Supplier Portal (Public-Facing)
- Minimalist form: price, lead time, MOQ, notes, file upload.
- No login required — access via secure token in URL.
- Form disables after submission or link expiration.

### Backend Services

#### 1. `distributeRFQToSuppliers` Cloud Function
- Generates unique token for each supplier.
- Stores token in Firestore with TTL (7 days).
- Sends email with link: `https://supplier.yourplatform.com/rfq/{token}`

#### 2. `submitSupplierQuote` Cloud Function
- Validates token and RFQ eligibility.
- Saves quote data and files to `supplierQuotes` sub-collection.
- Updates RFQ status and notifies Procurement Owner.

## Data Model

### Suppliers Collection
```json
suppliers (collection)
  └── {supplierId}
      ├── companyName: string
      ├── contactName: string
      ├── email: string
      ├── specialties: string[]
      ├── certifications: string[]
      ├── performanceRating: number
      ├── status: "Active" | "Inactive"
      ├── createdAt: timestamp
      └── updatedAt: timestamp
```

### Supplier Quotes Sub-collection
```json
rfqs/{rfqId}/supplierQuotes/{quoteId}
  ├── supplierId: string
  ├── token: string (unique, time-limited)
  ├── submittedAt: timestamp
  ├── price: number
  ├── leadTimeDays: number
  ├── moq: number
  ├── notes: string
  ├── files: array of { name, size, storagePath }
  └── status: "Sent" | "Viewed" | "Submitted" | "Expired"
```

### Communication Log
```json
rfqs/{rfqId}/communicationLog/{logId}
  ├── timestamp: timestamp
  ├── sender: string (userId or "system")
  ├── recipient: string (email)
  ├── method: "email" | "call" | "portal"
  ├── subject: string
  ├── details: string
  └── relatedDocument?: string
```

## Workflow
1. Procurement Owner selects RFQ and clicks "Send to Suppliers".
2. Chooses one or more suppliers from the database.
3. System generates secure links and emails them.
4. Supplier clicks link, views RFQ, and submits quote.
5. System saves response, updates status, and notifies internal team.

## Security Considerations
- Tokens are cryptographically secure and single-use.
- Supplier access is scoped to one RFQ only.
- All file uploads are scanned and validated.
- Firestore Security Rules enforce strict access control.

## UI/UX Guidelines
- Supplier form is simple, clean, and works on mobile.
- Internal comparison table supports sorting and filtering.
- Supplier profiles include performance badges (e.g., "Top Performer").

---

### `tasks-feature10.md`

# Implementation Plan: Feature 10 - Supplier Management & RFQ Engine

## Sprint 5

- [ ] **1. Design and implement the suppliers collection and its security rules**
  - [ ] Create `suppliers` collection in Firestore
  - [ ] Define schema including contact, specialties, certifications, and performance
  - [ ] Implement RBAC: only Procurement and Admin can edit
  - **Requirements:** 10.1

- [ ] **2. Build the Supplier Management CRUD interface**
  - [ ] Create Supplier List page with search and filters
  - [ ] Add Create/Edit Supplier modals
  - [ ] Support deactivation (soft delete)
  - **Requirements:** 10.1

- [ ] **3. Implement supplier filtering by capabilities**
  - [ ] Add filter controls for processes, materials, certifications
  - [ ] Implement multi-select and combination logic
  - [ ] Display results with match score or ranking
  - **Requirements:** 10.2

- [ ] **4. Create secure RFQ distribution system**
  - [ ] Build modal to select suppliers for RFQ
  - [ ] Generate unique, time-limited token per supplier
  - [ ] Store token in `supplierQuotes` with TTL
  - **Requirements:** 10.3

- [ ] **5. Implement supplier notification via email**
  - [ ] Use SendGrid to send distribution email
  - [ ] Include secure link and response deadline
  - [ ] Log email delivery status
  - **Requirements:** 10.3, 10.6

- [ ] **6. Set up Supplier Portal (Firebase Hosting)**
  - [ ] Create separate `supplier-web` app using Firebase Hosting
  - [ ] Deploy lightweight React app for quote submission
  - [ ] Ensure compatibility with older browsers
  - **Requirements:** 10.5

- [ ] **7. Develop supplier response submission form**
  - [ ] Build form with price, lead time, MOQ, notes
  - [ ] Add file upload (max 25MB, validated types)
  - [ ] On submit, save to Firestore and invalidate token
  - **Requirements:** 10.5

- [ ] **8. Build real-time quote tracking dashboard**
  - [ ] Display status (Sent, Viewed, Submitted, Expired) for each supplier
  - [ ] Update in real time via Firestore listeners
  - [ ] Show timeline of interactions
  - **Requirements:** 10.4

- [ ] **9. Implement communication logging**
  - [ ] Create `communicationLog` sub-collection under each RFQ
  - [ ] Log all supplier interactions (email, view, submit)
  - [ ] Make accessible in RFQ detail view
  - **Requirements:** 10.6

- [ ] **10. Write unit and integration tests**
  - [ ] Test token generation and validation
  - [ ] Mock supplier submission and verify data flow
  - [ ] Test filtering logic and performance
