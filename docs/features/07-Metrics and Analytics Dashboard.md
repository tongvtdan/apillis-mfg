
## ✅ Feature Progress Tracking

### Core Features (MVP - Phase 1)

1. **User Authentication & Role Management** ✅  
2. **RFQ Intake Portal** ✅  
3. **Dashboard & Workflow Management** ✅  
4. **Internal Review System** ✅  
5. **Document Management** ✅  
6. **Notification and Assignment System** ✅  
7. **Metrics and Analytics Dashboard** 🟡  
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

### `requirements-feature7.md`
```markdown
# Requirements Document: Feature 7 - Metrics and Analytics Dashboard


## Introduction
The Metrics and Analytics Dashboard provides real-time insights into the performance of the RFQ workflow. It enables management and team leads to monitor progress, identify bottlenecks, and improve operational efficiency by visualizing key performance indicators such as phase completion rates, average processing times, and SLA adherence.

## Stakeholders
- Management
- Procurement Owner
- Team Leads (Engineering, QA, Production)
- System Administrator

## Requirements

### Requirement 7.1: View Progress Metrics and Completion Percentages
**User Story:** As a Manager, I want to view progress metrics and completion percentages for each workflow phase, so I can identify bottlenecks and optimize our processes.  
**Acceptance Criteria:**
- The system SHALL display the percentage of RFQs completed in each phase (e.g., 70% of RFQs completed in Technical Review).
- The view SHALL be updated in real time as RFQs progress.
- The data SHALL be filterable by time range (e.g., last 7, 30, 90 days).

### Requirement 7.2: Display Average Time Spent in Each Phase
**User Story:** As a Team Lead, I want to see the average time RFQs spend in each phase, so I can assess team performance.  
**Acceptance Criteria:**
- The system SHALL calculate and display the average time (in hours/days) spent in each workflow phase.
- The metric SHALL be computed over a configurable time range (default: last 30 days).
- The system SHALL allow comparison against historical data.

### Requirement 7.3: Highlight Process Bottlenecks
**User Story:** As a Manager, I want to be alerted when a phase exceeds its target processing time, so I can take corrective action.  
**Acceptance Criteria:**
- The system SHALL compare actual average phase time against configured SLA targets.
- IF a phase exceeds its target time, it SHALL be visually highlighted (e.g., red/yellow indicators).
- The dashboard SHALL list identified bottlenecks in a dedicated section.

### Requirement 7.4: Individual RFQ Time Tracking
**User Story:** As a User, I want to see how long an RFQ has been in its current phase and total processing time, so I can prioritize my work.  
**Acceptance Criteria:**
- The system SHALL display time spent in the current phase and total processing time for each RFQ.
- The display SHALL be visible on the RFQ card and in the detail view.
- Time SHALL be shown in days and hours.

### Requirement 7.5: Exportable Performance Reports
**User Story:** As a Manager, I want to export workflow performance data, so I can share it in meetings and presentations.  
**Acceptance Criteria:**
- The system SHALL provide an option to export metrics as Excel (.xlsx) and PDF reports.
- Exports SHALL include charts, tables, and summary statistics.
- Users SHALL be able to customize the report date range and content.

## Non-Functional Requirements
- The metrics dashboard SHALL load within 2 seconds under normal load.
- Calculations SHALL be updated in near real time (within 1 second of data change).
- Access to detailed metrics SHALL be restricted to Management and Admin roles.


---

### `design-feature7.md`

# Design Document: Feature 7 - Metrics and Analytics Dashboard



## Overview
The Metrics and Analytics Dashboard provides real-time, role-based insights into RFQ workflow performance. It visualizes completion rates, phase durations, and bottlenecks to support data-driven decision-making. Built on React and Firebase, it uses Cloud Functions for aggregation and Chart.js for visualization.

## Components and Interfaces

### Frontend Components

#### 1. Metrics Dashboard Component
```typescript
interface MetricsDashboardProps {
  timeRange: '7d' | '30d' | '90d';
  userRole: UserRole;
  onExport: () => void;
}

interface WorkflowMetrics {
  totalRFQs: number;
  completionRate: number;
  averageProcessingTime: number;
  bottlenecks: BottleneckInfo[];
  phaseMetrics: PhaseMetric[];
}

interface PhaseMetric {
  phase: string;
  completionPercentage: number;
  averageTimeInPhase: number; // hours
  targetTime: number; // SLA in hours
  rfqCount: number;
  isBottleneck: boolean;
}

interface BottleneckInfo {
  phase: string;
  averageTime: number;
  targetTime: number;
  severity: 'Low' | 'Medium' | 'High';
}
```

#### 2. RFQ Detail Time Tracker
- Displays: "In current phase: 3 days, 4 hours" and "Total processing time: 6 days"
- Updates in real time

### Backend Services

#### 1. Metrics Aggregation Service (Cloud Function)
- `calculateWorkflowMetrics`
- Aggregates data from `rfqs` collection
- Computes completion rates, average times, and bottleneck detection
- Caches results for performance

#### 2. Report Export Service
- `generateMetricsReport`
- Renders data into PDF (using Puppeteer) or Excel (SheetJS)
- Returns downloadable file

## Data Model

### Phase History Tracking (in RFQ Document)
```json
rfqs/{rfqId}
  ├── status: "Technical Review"
  ├── createdAt: timestamp
  ├── updatedAt: timestamp
  ├── phaseHistory: [
    {
      phase: "Inquiry",
      enteredAt: timestamp,
      exitedAt: timestamp
    },
    {
      phase: "Technical Review",
      enteredAt: timestamp
    }
  ]
  └── ...
```

## Workflow
1. User navigates to `/metrics`.
2. Frontend calls `calculateWorkflowMetrics` Cloud Function.
3. Function queries Firestore, computes metrics, returns data.
4. Dashboard renders charts and bottleneck alerts.
5. On export, `generateMetricsReport` creates and downloads file.

## Security Considerations
- Only users with `Management` or `Admin` roles can access the full dashboard.
- Team Leads can view metrics for their department only.
- All data access is enforced via Firestore Security Rules.

## Performance Optimization
- Metrics are cached (1-minute TTL) to reduce computation.
- Aggregation uses Firestore composite indexes.
- Charts use lazy loading for large datasets.

## Monitoring Metrics
```typescript
interface PerformanceMetrics {
  metricsDashboardLoadTime: number; // ms
  metricsCalculationLatency: number; // ms
  reportGenerationTime: number; // ms
  errorRate: number; // %
}
```


---

### `tasks-feature7.md`
```markdown
# Implementation Plan: Feature 7 - Metrics and Analytics Dashboard



## Sprint 3

- [ ] **1. Implement phase history tracking in RFQ documents**
  - [ ] Add `phaseHistory` array to RFQ schema
  - [ ] Update on every status change via Cloud Function
  - [ ] Ensure `enteredAt` and `exitedAt` timestamps are recorded
  - **Requirements:** 7.2, 7.4

- [ ] **2. Build Cloud Function for metrics aggregation**
  - [ ] Create `calculateWorkflowMetrics` function
  - [ ] Compute completion percentages per phase
  - [ ] Calculate average time in each phase
  - [ ] Implement bottleneck detection (vs. SLA targets)
  - [ ] Cache results for 1 minute
  - **Requirements:** 7.1, 7.2, 7.3

- [ ] **3. Develop the Metrics Dashboard UI**
  - [ ] Create dashboard page with time range selector
  - [ ] Display completion rates in bar/pie charts
  - [ ] Show average phase times in a table
  - [ ] Highlight bottlenecks with color-coded alerts
  - **Requirements:** 7.1, 7.2, 7.3

- [ ] **4. Implement individual RFQ time tracking**
  - [ ] Add time display to RFQ card and detail view
  - [ ] Calculate time in current phase and total processing time
  - [ ] Update in real time using Firestore listeners
  - **Requirements:** 7.4

- [ ] **5. Build exportable report functionality**
  - [ ] Create `generateMetricsReport` Cloud Function
  - [ ] Support PDF (Puppeteer) and Excel (SheetJS) formats
  - [ ] Include charts, tables, and metadata
  - [ ] Add export button to dashboard
  - **Requirements:** 7.5

- [ ] **6. Implement role-based access control for metrics**
  - [ ] Restrict full dashboard to Management and Admin roles
  - [ ] Allow Team Leads to view department-specific metrics
  - [ ] Enforce via Firestore Security Rules and route guards
  - **Requirements:** Non-functional

- [ ] **7. Write unit and integration tests**
  - [ ] Test metrics calculation accuracy
  - [ ] Validate bottleneck detection logic
  - [ ] Test report generation and download
  - [ ] Mock role-based access and verify visibility
