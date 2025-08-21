
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

### Advanced Features (Phase 2)

9. **Quotation & Costing Engine** ✅ 
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


### `requirements-feature9.md`
# Requirements Document: Feature 9 - Quotation & Costing Engine


## Introduction
The Quotation & Costing Engine enables Procurement Owners to generate accurate, professional customer quotes by aggregating internal cost estimates and supplier quotes. It includes a cost roll-up calculator, margin simulator, PDF generation, and approval workflow to ensure profitability and compliance.

## Stakeholders
- Procurement Owner
- Sales Manager
- Management
- Finance Team

## Requirements

### Requirement 9.1: Cost Roll-Up Calculator
**User Story:** As a Procurement Owner, I want to calculate the total cost of a quote, so I can ensure it covers all expenses and desired margin.  
**Acceptance Criteria:**
- The system SHALL provide a cost calculator that sums: Tooling, Material, Labor, Overhead, and Markup.
- Each cost component SHALL be editable with user input or auto-populated from internal reviews and supplier quotes.
- The calculator SHALL display total cost, unit price, and estimated margin in real time.

### Requirement 9.2: Margin Simulator (What-If Analysis)
**User Story:** As a Sales Manager, I want to adjust pricing and see the impact on margin, so I can balance competitiveness and profitability.  
**Acceptance Criteria:**
- The system SHALL allow users to adjust price, volume, or markup and instantly see updated margin.
- The simulator SHALL display visual feedback (e.g., color-coded margin levels).
- Users SHALL be able to save multiple pricing scenarios for comparison.

### Requirement 9.3: Professional PDF Quote Generation
**User Story:** As a Sales Manager, I want to generate a branded, professional PDF quote, so I can present it to the customer.  
**Acceptance Criteria:**
- The system SHALL generate a PDF quote using customizable company templates.
- The PDF SHALL include: customer info, project details, bill of materials, pricing breakdown, delivery terms, validity period, and company branding.
- Templates SHALL be editable by administrators via the admin panel.

### Requirement 9.4: Side-by-Side Supplier Quote Comparison
**User Story:** As a Procurement Owner, I want to compare supplier quotes side-by-side, so I can make an informed sourcing decision.  
**Acceptance Criteria:**
- The system SHALL display all received supplier quotes in a tabular format.
- Comparison SHALL include: unit price, lead time, MOQ, quality certifications, and uploaded documents.
- The view SHALL highlight the lowest cost and shortest lead time.

### Requirement 9.5: Quote Approval Workflow
**User Story:** As a Manager, I want to approve high-value quotes before they are sent, so I can control financial risk.  
**Acceptance Criteria:**
- The system SHALL support an approval workflow for quotes exceeding a configured threshold (e.g., $50,000).
- WHEN a quote is submitted for approval, the system SHALL notify the assigned approver.
- The quote SHALL be locked from editing during approval.
- IF approved, the status SHALL change to "Approved"; IF rejected, it SHALL return to draft with feedback.

## Non-Functional Requirements
- Quote generation SHALL complete within 3 seconds.
- PDFs SHALL be stored in the Document Management system with versioning.
- Access to pricing tools SHALL be restricted to Procurement, Sales, and Management roles.


---

### `design-feature9.md`

# Design Document: Feature 9 - Quotation & Costing Engine


## Overview
The Quotation & Costing Engine automates the final stages of the RFQ process, transforming internal assessments and supplier data into a formal customer quote. It ensures accuracy, profitability, and brand consistency through integrated cost calculation, simulation, and approval.

## Components and Interfaces

### Frontend Components

#### 1. Cost Calculator UI
```typescript
interface CostCalculatorProps {
  rfqId: string;
  onCostUpdate: (total: number, margin: number) => void;
}

interface CostBreakdown {
  tooling: number;
  material: number;
  labor: number;
  overhead: number;
  markup: number;
  total: number;
  marginPercent: number;
}
```

#### 2. Margin Simulator
- Interactive sliders for price, volume, markup.
- Real-time margin preview with visual indicators (red/yellow/green).
- Scenario save/load functionality.

#### 3. Quote Comparison Table
- Displays supplier quotes in columns.
- Sortable by price, lead time, etc.
- Supports document preview.

#### 4. PDF Template Editor (Admin)
- Drag-and-drop interface for building quote templates.
- Supports dynamic fields (e.g., `{{customerName}}`, `{{totalPrice}}`).

### Backend Services

#### 1. `generateQuotePDF` Cloud Function
- Renders HTML template to PDF using Puppeteer.
- Applies company branding and formatting.
- Saves PDF to Document Management system.

#### 2. `submitQuoteForApproval` Cloud Function
- Validates quote completeness.
- Updates status to "Pending Approval".
- Sends notification to approver.

## Data Model

### Quote Document (Firestore)
```json
quotes/{quoteId}
  ├── rfqId: string
  ├── version: number
  ├── status: "Draft" | "Pending Approval" | "Approved" | "Rejected" | "Sent"
  ├── costBreakdown: {
    tooling: 5000,
    material: 2000,
    labor: 1500,
    overhead: 1000,
    markup: 2000,
    total: 11500,
    marginPercent: 28.5
  }
  ├── scenarios: [
    {
      name: "Aggressive",
      price: 10000,
      margin: 15
    }
  ]
  ├── approvedBy: string (userId)
  ├── approvedAt: timestamp
  ├── pdfUrl: string
  ├── createdAt: timestamp
  ├── createdBy: string
  └── auditLog: [...]
```

## Workflow
1. User navigates to RFQ and clicks "Create Quote".
2. Fills cost components and adjusts pricing.
3. Uses simulator to explore scenarios.
4. Compares supplier quotes.
5. Submits for approval (if threshold exceeded).
6. On approval, generates PDF and marks as ready to send.

## Security Considerations
- Only Procurement, Sales, and Management can access quoting tools.
- Approval workflow enforces separation of duties.
- All quote changes are logged.

## Testing Strategy
- Validate cost calculation accuracy.
- Test PDF generation with edge cases.
- Mock approval workflow and verify status transitions.

---

### `tasks-feature9.md`
```markdown
# Implementation Plan: Feature 9 - Quotation & Costing Engine



## Sprint 5

- [ ] **1. Implement cost roll-up calculator**
  - [ ] Build CostCalculator UI with editable fields
  - [ ] Implement real-time total and margin calculation
  - [ ] Auto-populate from internal reviews and supplier data
  - **Requirements:** 9.1

- [ ] **2. Develop margin simulator with what-if analysis**
  - [ ] Add interactive sliders for pricing variables
  - [ ] Display visual margin feedback
  - [ ] Implement scenario save/load
  - **Requirements:** 9.2

- [ ] **3. Build side-by-side supplier quote comparison tool**
  - [ ] Create comparison table UI
  - [ ] Integrate with supplier quote data
  - [ ] Add sorting, filtering, and highlighting
  - **Requirements:** 9.4

- [ ] **4. Implement quote approval workflow**
  - [ ] Define approval threshold in admin settings
  - [ ] Create `submitQuoteForApproval` Cloud Function
  - [ ] Add status locking during approval
  - [ ] Notify approver via email and in-app
  - **Requirements:** 9.5

- [ ] **5. Develop PDF quote generation**
  - [ ] Create default quote template (HTML/CSS)
  - [ ] Build `generateQuotePDF` Cloud Function using Puppeteer
  - [ ] Save PDF to Document Management system
  - **Requirements:** 9.3

- [ ] **6. Build admin template editor**
  - [ ] Create drag-and-drop interface for template customization
  - [ ] Support dynamic field insertion
  - [ ] Validate and save templates to Firestore
  - **Requirements:** 9.3

- [ ] **7. Write unit and integration tests**
  - [ ] Test cost calculation accuracy
  - [ ] Verify PDF generation and formatting
  - [ ] Mock approval workflow and audit logging
  - [ ] Test margin simulator scenarios
