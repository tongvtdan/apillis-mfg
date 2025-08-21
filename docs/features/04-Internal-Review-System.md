

### ✅ Feature Progress Tracking

### Core Features (MVP - Phase 1)

1. **User Authentication & Role Management** ✅  
2. **RFQ Intake Portal** ✅  
3. **Dashboard & Workflow Management** ✅  
4. **Internal Review System** ✅   
5. **Document Management**  
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

---


### `requirements-feature4.md`

# Requirements Document: Feature 4 - Internal Review System


## Introduction
The Internal Review System enables structured digital evaluations of RFQs by Engineering, QA, and Production teams. It replaces ad-hoc email or paper-based reviews with a standardized, auditable workflow that ensures all technical, quality, and production aspects are assessed before quoting. This system includes assignment of reviewers, approval workflow, risk logging, customer clarification requests, and a consolidated view for Procurement Owners.

## Stakeholders
- Engineering Team
- QA Team
- Production Team
- Procurement Owner
- Sales/Account Manager
- Management

## Requirements

### Requirement 4.1: Structured Digital Review Forms
**User Story:** As an Engineering Lead, I want to use a standardized form to review RFQs, so I can ensure consistency and completeness.  
**Acceptance Criteria:**
- The system SHALL provide department-specific digital review forms for Engineering, QA, and Production.
- Each form SHALL include fields for: approval status (Approved, Rejected, Revision Requested), feedback/comments, identified risks, and suggestions.
- Forms SHALL be accessible only to users with the corresponding role.

### Requirement 4.2: Review Assignment to Team Members
**User Story:** As a Team Lead, I want to assign a specific team member to perform the review, so accountability is clear and workload is balanced.  
**Acceptance Criteria:**
- WHEN a Procurement Owner or Team Lead views an RFQ, the system SHALL allow assignment of a reviewer from the Engineering, QA, or Production team.
- The system SHALL display only users with the correct role for the selected department.
- Upon assignment, the system SHALL update the RFQ record and notify the assigned reviewer.

### Requirement 4.3: Approval Workflow
**User Story:** As a Team Lead, I want to approve or reject an RFQ review, so I can control the progression of the quote process.  
**Acceptance Criteria:**
- Users SHALL be able to submit a review with one of three outcomes: Approved, Rejected, or Revision Requested.
- IF a review is rejected or requires revision, the system SHALL notify the Procurement Owner.
- The system SHALL prevent the RFQ from advancing until all required departmental reviews are completed.

### Requirement 4.4: Risk and Bottleneck Logging
**User Story:** As a Production Planner, I want to log manufacturing bottlenecks and special tooling needs, so they are formally recorded and addressed.  
**Acceptance Criteria:**
- The system SHALL allow team members to log technical risks, manufacturing bottlenecks, and special tooling requirements directly within the RFQ.
- Each risk SHALL include: description, category (Technical, Timeline, Cost, Quality), severity (Low, Medium, High), and optional mitigation plan.
- Logged risks SHALL be visible to all authorized team members.

### Requirement 4.5: Internal Feedback Loop for Customer Clarifications
**User Story:** As an Engineer, I want to request design clarifications from the customer, so I can resolve ambiguities without delay.  
**Acceptance Criteria:**
- The system SHALL provide a mechanism to flag a request for customer clarification.
- WHEN a clarification is requested, the system SHALL create a task for the Sales/Account Manager to contact the customer.
- The request SHALL be logged with timestamp, description, and resolution status.

### Requirement 4.6: Consolidated Review Status View
**User Story:** As a Procurement Owner, I want to see all departmental review statuses and feedback in one place, so I can manage the overall progress.  
**Acceptance Criteria:**
- The system SHALL display a consolidated view of all review statuses (Pending, Approved, Rejected) for each department.
- The view SHALL include submitted feedback, logged risks, and any open clarification requests.
- The Procurement Owner SHALL be able to see which departments have completed their review and which are pending.

## Non-Functional Requirements
- Review submission SHALL be completed within 2 seconds.
- All review data SHALL be stored securely with audit trails.
- The system SHALL support offline form drafting with auto-sync when reconnected (future enhancement).


---

### `design-feature4.md`
```markdown
# Design Document: Feature 4 - Internal Review System


## Overview
The Internal Review System digitizes the cross-functional assessment process for RFQs. It replaces fragmented review methods with a centralized, role-based workflow that ensures accountability, captures critical technical insights, and streamlines decision-making. Built on Firebase and React, it integrates with the RFQ detail view and notification system.

## Components and Interfaces

### Frontend Components

#### 1. Department-Specific Review Form
```typescript
interface ReviewFormProps {
  rfq: RFQ;
  department: 'Engineering' | 'QA' | 'Production';
  existingReview: Review | null;
  onSubmit: (reviewData: ReviewSubmission) => Promise<void>;
}

interface ReviewSubmission {
  status: 'Approved' | 'Rejected' | 'Revision Requested';
  feedback: string;
  risksIdentified: Risk[];
  suggestions: string[];
}
```

#### 2. Review Assignment Modal
```typescript
interface AssignmentModalProps {
  rfq: RFQDocument;
  availableUsers: User[]; // Filtered by role/department
  currentAssignments: Record<string, string>; // e.g., { engineering: 'user123' }
  onClose: () => void;
  onAssign: (updates: AssignmentUpdate) => Promise<void>;
}

interface AssignmentUpdate {
  rfqId: string;
  assignments: {
    department: 'engineering' | 'qa' | 'production';
    userId: string | null; // null to unassign
  }[];
}
```

#### 3. Consolidated Review Status Panel
- Displays review status for each department with color-coded indicators.
- Shows summary of feedback, risks, and open items.
- Accessible to Procurement Owner and Management.

### Backend Services

#### 1. Review Submission Service (Cloud Function)
- Validates submission and user permissions.
- Saves review to `internalReviews` sub-collection.
- Triggers notifications based on outcome.

#### 2. Feedback Request Service
- Creates a task in `tasks` collection assigned to Sales/Account Manager.
- Logs interaction in `communicationLog`.

## Database Schema

### Internal Reviews Sub-collection
```json
// Path: rfqs/{rfqId}/internalReviews/{reviewId}
{
  "reviewId": "string",
  "department": "Engineering" | "QA" | "Production",
  "status": "Pending" | "Approved" | "Rejected" | "Revision Requested",
  "feedback": "string",
  "risks": [
    {
      "id": "string",
      "description": "string",
      "category": "Technical" | "Timeline" | "Cost" | "Quality",
      "severity": "Low" | "Medium" | "High"
    }
  ],
  "suggestions": ["string"],
  "submittedAt": "timestamp",
  "submittedBy": "string (userId)"
}
```

### RFQ Document Extension
```json
{
  "assignedTo": {
    "engineering": "userId",
    "qa": "userId",
    "production": "userId"
  },
  "reviewStatus": {
    "engineering": "Pending",
    "qa": "Approved",
    "production": "Rejected"
  },
  "hasOpenClarifications": true,
  "totalRisksLogged": 3
}
```

## Workflow
1. Procurement Owner assigns reviewers via Assignment Modal.
2. Assigned team member receives notification.
3. User navigates to RFQ detail page and submits review.
4. System saves review, updates RFQ status, and notifies stakeholders.
5. Procurement Owner views consolidated status and takes next steps.

## Security Considerations
- Only users with correct role can submit a review for their department.
- Reviews can only be edited by the original submitter before approval.
- Firestore security rules enforce role-based access.

## Testing Strategy
- Validate form validation and submission.
- Test assignment → notification → review flow.
- Verify consolidated view accuracy.


---

### `tasks-feature4.md`

# Implementation Plan: Feature 4 - Internal Review System



## Sprint 2

- [ ] **1. Implement backend logic for the Internal Review module**
  - [ ] Define Firestore sub-collection `internalReviews` under each RFQ
  - [ ] Create Cloud Function `submitReview` to handle form submission
  - [ ] Implement validation for user role and department alignment
  - [ ] Update parent RFQ document with review status summary
  - **Requirements:** 4.1, 4.3, 4.4

- [ ] **2. Build the RFQ Detail View page**
  - [ ] Design and implement detailed RFQ view with tabs or sections
  - [ ] Add "Assign Reviewer" button for each department (role-gated)
  - [ ] Display current review status for all departments
  - [ ] Show list of logged risks and feedback
  - **Requirements:** 4.2, 4.6

- [ ] **3. Implement the Internal Review submission UI**
  - [ ] Create reusable ReviewForm component with dynamic department support
  - [ ] Add fields for status, feedback, risks, and suggestions
  - [ ] Implement risk logging with category and severity selection
  - [ ] Add "Request Clarification" option that opens modal
  - **Requirements:** 4.1, 4.4, 4.5

- [ ] **4. Implement approval workflow and notifications**
  - [ ] On review submission, update status and notify Procurement Owner if rejected or revision requested
  - [ ] Use Firestore triggers to send in-app and email notifications
  - [ ] Prevent RFQ advancement in workflow if any review is pending or rejected
  - **Requirements:** 4.3, 4.5

- [ ] **5. Build feedback request mechanism**
  - [ ] Create modal for entering clarification requests
  - [ ] On submit, create task assigned to Sales/Account Manager
  - [ ] Log request in `communicationLog` and link to RFQ
  - [ ] Update RFQ status to indicate open clarification
  - **Requirements:** 4.5

- [ ] **6. Develop consolidated review status view**
  - [ ] Create summary panel showing all department statuses
  - [ ] Use color coding (green/yellow/red) for quick assessment
  - [ ] Include expandable sections for feedback and risks
  - [ ] Make accessible to Procurement Owner and Management
  - **Requirements:** 4.6

- [ ] **7. Write unit and integration tests**
  - [ ] Test review submission and status update
  - [ ] Mock role-based access and verify form visibility
  - [ ] Validate risk logging and task creation
  - [ ] Test notification delivery on rejection


---
