
---

### ✅ Feature Progress Tracking

### Core Features (MVP - Phase 1)

1. **User Authentication & Role Management** ✅  
2. **RFQ Intake Portal** ✅  
3. **Dashboard & Workflow Management** ✅  
4. **Internal Review System** ✅  
5. **Document Management** ✅  
6. **Notification and Assignment System** ✅  
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




### `requirements-feature6.md`

# Requirements Document: Feature 6 - Notification and Assignment System



## Introduction
The Notification and Assignment System ensures that the right team members are assigned to RFQs and are proactively informed of critical events throughout the RFQ lifecycle. This system enables efficient workload distribution, reduces delays, and improves accountability through automated, reliable notifications.

## Stakeholders
- Procurement Owner
- Engineering Team Lead
- QA Team Lead
- Production Team Lead
- Team Members
- Management

## Requirements

### Requirement 6.1: RFQ Assignment to Team Members
**User Story:** As a Team Lead, I want to assign an RFQ to a specific team member, so that I can ensure the right expertise is applied and workload is balanced.  
**Acceptance Criteria:**
- The system SHALL allow Procurement Owners and Team Leads to assign RFQs to specific team members.
- The assignment interface SHALL display only users with valid roles (Engineering, QA, Production).
- Upon assignment, the system SHALL update the `assignedTo` field in the RFQ record.

### Requirement 6.2: Workload Distribution View
**User Story:** As a Team Lead, I want to see how many RFQs each team member is handling, so I can make informed assignment decisions.  
**Acceptance Criteria:**
- The system SHALL provide a workload view showing the number of currently assigned RFQs per team member.
- The view SHALL display pending tasks and indicate nearing deadlines.
- The data SHALL be filterable by department and time range.

### Requirement 6.3: Assignment Notifications
**User Story:** As a Team Member, I want to be notified when I’m assigned to an RFQ, so I can begin work promptly.  
**Acceptance Criteria:**
- WHEN an RFQ is assigned to a user, the system SHALL send an in-app notification and email within 5 minutes.
- The notification SHALL include the RFQ ID, project name, and link to the RFQ.
- WHEN an RFQ is reassigned, the system SHALL notify both the previous and new assignees.

### Requirement 6.4: General Event Notifications
**User Story:** As a User, I want to receive timely alerts about key events, so I can stay on top of my responsibilities.  
**Acceptance Criteria:**
- The system SHALL send notifications for:
  - RFQ status changes
  - Review requests
  - Approaching deadlines (24h and 2h before)
  - Overdue tasks
- Notifications SHALL be delivered via in-app alerts and email.
- Users SHALL be able to view and mark notifications as read.

### Requirement 6.5: Reassignment and Unassignment
**User Story:** As a Team Lead, I want to reassign or unassign an RFQ, so I can adjust for changing priorities or capacity.  
**Acceptance Criteria:**
- Users with proper permissions SHALL be able to reassign or clear assignments.
- Reassignment SHALL trigger notifications to both outgoing and incoming assignees.
- The system SHALL log all assignment changes with timestamp and modifier.

## Non-Functional Requirements
- Assignment updates SHALL be reflected in real time across all clients.
- The workload view SHALL load within 2 seconds, even with 100+ active RFQs.
- The notification system SHALL have retry logic for failed deliveries and track delivery status.


---

### `design-feature6.md`

# Design Document: Feature 6 - Notification and Assignment System



## Overview
This feature provides the core assignment and notification infrastructure for the RFQ platform. It enables task delegation with workload visibility and ensures users are informed of critical events through reliable, multi-channel alerts.

## Components and Interfaces

### Frontend Components

#### 1. Assignment Modal
```typescript
interface AssignmentModalProps {
  rfq: RFQDocument;
  availableUsers: User[]; // Filtered by role
  currentAssignments: Record<string, string>;
  onClose: () => void;
  onAssign: (updates: AssignmentUpdate) => Promise<void>;
}
```

#### 2. Workload Distribution View
```typescript
interface WorkloadViewProps {
  teamMembers: User[];
  workloadData: WorkloadData[];
  filter: WorkloadFilter;
}

interface WorkloadData {
  userId: string;
  assignedRFQs: number;
  pendingTasks: number;
  overdueTasks: number;
}
```

#### 3. Notification Center
- Displays list of notifications (in-app)
- Supports mark as read, bulk actions
- Shows counts of unread alerts

### Backend Services

#### 1. Assignment Management Service (`updateRFQAssignments`)
- Validates user permissions
- Updates `assignedTo` field in Firestore
- Triggers assignment notifications

#### 2. Notification Service (`sendNotification`)
- Handles in-app and email delivery
- Integrates with SendGrid
- Supports retry logic for failed emails
- Tracks delivery status

## Data Model

### Enhanced RFQ Document
```json
rfqs/{rfqId}
  ├── assignedTo: {
  │   engineering?: string,
  │   qa?: string,
  │   production?: string,
  │   procurement: string
  │ }
  ├── assignmentHistory: [
  │   {
  │     userId: string,
  │     department: string,
  │     action: "assigned" | "reassigned" | "unassigned",
  │     timestamp: timestamp,
  │     modifiedBy: string
  │   }
  │ ]
  └── ...
```

### Notifications Collection
```json
notifications (collection)
  └── {notificationId}
      ├── recipientId: string
      ├── type: "assignment" | "status_change" | "deadline_reminder" | "overdue"
      ├── rfqId: string
      ├── title: string
      ├── message: string
      ├── sentAt: timestamp
      ├── deliveredAt: timestamp
      ├── readAt: timestamp
      ├── deliveryStatus: "pending" | "delivered" | "failed"
      └── retryCount: number
```

## Workflow
1. User opens RFQ and clicks "Assign".
2. Modal shows available team members and their workload.
3. Lead assigns user and submits.
4. Backend updates RFQ and triggers notification.
5. Assigned user receives in-app and email alert.

## Security Considerations
- Only users with `Procurement Owner`, `Team Lead`, or `Admin` roles can assign.
- Notifications are scoped to authorized users only.
- All changes are logged for audit.

## Performance Targets
- Assignment update time: < 500ms
- Workload view load time: < 1 second
- Notification delivery: within 5 minutes


---

### `tasks-feature6.md`
```markdown
# Implementation Plan: Feature 6 - Notification and Assignment System



## Sprint 3

- [ ] **1. Build team member assignment interface**
  - [ ] Add "Assign" button to RFQ card and detail view
  - [ ] Create AssignmentModal with role-filtered user dropdown
  - [ ] Display current workload (assigned count) next to each user
  - [ ] Implement form submission and validation
  - **Requirements:** 6.1, 6.2

- [ ] **2. Implement workload distribution visualization**
  - [ ] Create WorkloadView component (list or chart)
  - [ ] Query Firestore for active assignments per user
  - [ ] Show pending and overdue tasks
  - [ ] Add filters by department and time range
  - **Requirements:** 6.2

- [ ] **3. Develop assignment notification system**
  - [ ] Create `sendAssignmentNotification` Cloud Function
  - [ ] Send in-app notification (Firestore `notifications` collection)
  - [ ] Send email via SendGrid
  - [ ] Include RFQ ID, name, and link
  - **Requirements:** 6.3

- [ ] **4. Implement reassignment and unassignment**
  - [ ] Allow clearing of assignments in modal
  - [ ] Handle `userId: null` in backend
  - [ ] Log changes in `assignmentHistory`
  - [ ] Notify both previous and new assignees
  - **Requirements:** 6.5

- [ ] **5. Build general event notification system**
  - [ ] Extend notification service to handle status changes and deadlines
  - [ ] Schedule reminder notifications (24h and 2h before deadline)
  - [ ] Send escalation on overdue tasks
  - **Requirements:** 6.4

- [ ] **6. Create Notification Center UI**
  - [ ] Build dropdown or sidebar for unread alerts
  - [ ] Allow marking as read and bulk actions
  - [ ] Show notification history
  - **Requirements:** 6.4

- [ ] **7. Write unit and integration tests**
  - [ ] Test assignment validation and update
  - [ ] Mock notification delivery and retry logic
  - [ ] Verify workload data accuracy
  - [ ] Test reassignment notifications
