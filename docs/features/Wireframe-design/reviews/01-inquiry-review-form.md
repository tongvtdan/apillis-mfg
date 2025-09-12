# 🖼️ **Form Design: “Inquiry Received Review”**  
*Internal Review Form — Stage: Inquiry Received (Post-Intake, Pre-Qualification)*  
*Aligned with PRD v1.2, Factory Pulse Data Schema, and Supabase Workflow Engine*

---

## 🎯 **Purpose**

This form is completed by the **Procurement Owner or Sales Operations Lead** immediately after a project is created via the **Intake Portal**. It ensures the inquiry is **complete, valid, and ready for technical review** — acting as a **quality gate** before routing to Engineering/QA/Production.

> ✅ **Triggers**: `project.status = 'inquiry_received'`  
> ✅ **Blocks progression** to “Qualification” stage until approved  
> ✅ **Logs to `reviews` table** with `review_type = 'inquiry_received'`  
> ✅ **Creates `approvals` record** if clarification or rejection is needed

---

# 🖼️ **Text-Based Figma Design: Inquiry Received Review Form**

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                            PRJ-2025-001 – Inquiry Received Review                                                  │
│                       Internal Assessment – For Procurement / Sales Ops Use Only                                    │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  PROJECT SNAPSHOT (READ-ONLY)
───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
Project Title:       High-Precision Sensor Mount
Intake Type:         RFQ
Submitted By:        Sarah Chen (Customer) / James Wu (Sales Rep)
Submitted On:        Sep 5, 2025
Target Delivery:     Oct 15, 2025
Target Price:        $8.50/unit
Estimated Volume:    5,000 pcs/year

Customer:            TechNova Inc. (United States)
Project Reference:   PO-2025-TECHNOVA-001
```

```
───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  DOCUMENT COMPLETENESS CHECK
───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
Verify all required documents for intake type are present:

[✓] RFQ or PO Document Uploaded
[✓] Engineering Drawings (2D/3D) Attached
[✓] Bill of Materials (BOM) Provided
[ ] Quality / Tolerance Specifications
[ ] Compliance Docs (ISO, RoHS, etc.)
[ ] Other: _________________________

⚠️  Required for RFQ/PO: At least RFQ/PO + Drawings + BOM must be present.
    → If missing, status will be set to “Incomplete — Awaiting Customer”

📎 Attached Files:
→ [ Sensor_Mount_Rfq.pdf ] ✅ (1.2 MB) — Category: rfq
→ [ Sensor_Mount_Drawing.step ] ✅ (3.4 MB) — Category: drawing
→ [ BOM_SensorMount.xlsx ] ✅ (85 KB) — Category: bom
```

```
───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  PROJECT VALIDITY & CLARITY
───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
[ ] Project scope is clear and unambiguous
[ ] Customer contact information is complete and valid
[ ] Target price and volume are realistic for initial assessment
[ ] Delivery date is feasible (min 6 weeks for new product)

Additional Notes:
[ Customer requested expedited timeline — may require premium capacity. 
  Recommend flagging for management review during costing phase. ]
```

```
───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  REVIEW DECISION
───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
Select next action:

🔘 Ready for Technical Review (Engineering/QA/Production)
    → Auto-advances project to “Qualification” stage
    → Notifies assigned reviewers

🔘 Request Clarification from Customer
    → Opens modal to draft message to Sales Rep/Customer
    → Sets project status to “awaiting_customer_clarification”
    → Free-text reason required

🔘 Reject Inquiry (Not Suitable for Our Capabilities)
    → Requires justification
    → Sends rejection email to customer
    → Archives project with status “rejected”

Reason for rejection or clarification:
[ Target delivery date is 4 weeks — standard lead time for new product is 8 weeks. 
  Request customer to confirm if flexible or if expedited fee is acceptable. ]
```

```
───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  REVIEW METADATA
───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
Reviewer: [ Alex Rivera (Procurement Owner) ] → Auto-filled from Supabase auth
Date: [ Sep 5, 2025 ] → Auto-filled (today)
Review Type: [ inquiry_received ] → Hidden field
Status: [ Draft ▼ ] → Options: Draft, Submitted, Rejected, Needs Clarification
```

```
                      [ Save Draft ]                     [ Request Clarification ]                     [ Submit Review ]
                                                                                                     → Final action
```

---

## 🔹 **Form Behavior & Logic**

### **Document Completeness**
- Auto-checks presence of documents by `document_category`:
  - `rfq` or `po`
  - `drawing`
  - `bom`
- If any required doc missing → reviewer **cannot** select “Ready for Technical Review”
- “Other” field appears if checkbox is checked

### **Project Validity**
- All checkboxes recommended but not enforced (except for rejection path)
- Notes field recommended for context

### **Review Decision**
- **Only one option** can be selected
- **“Ready for Technical Review”**:
  - Validates all required docs are present
  - Updates `project.status = 'qualification'`
  - Creates `project_sub_stage_progress` records for Engineering, QA, Production reviews
  - Sends notifications via `notifications` table
- **“Request Clarification”**:
  - Opens modal (see below)
  - Sets `project.status = 'awaiting_customer_clarification'`
  - Creates `messages` thread linked to project
- **“Reject Inquiry”**:
  - Requires non-empty reason
  - Sets `project.status = 'rejected'`
  - Triggers `send-inquiry-rejection` Edge Function
  - Logs to `activity_log`

---

## 💬 **Clarification Request Modal**

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                    Request Customer Clarification (Internal)                                                        │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

This will notify the Sales/Account Manager to contact the customer.

Subject: [ Timeline Clarification Required – PRJ-2025-001 ]
Message:
[ Hi Sarah, thank you for your inquiry. Our standard lead time for new products is 8 weeks. 
  Your requested delivery is in 4 weeks. Can you confirm if this is flexible, or if you’d like to discuss expedited options? ]

Attach: [ Sensor_Mount_Rfq.pdf ] ✅

[ Cancel ]                                                      [ Send Request → ]
```

> ✉️ **On Send**:  
> - Creates record in `messages` table  
> - Triggers email to assigned `sales_rep` or `customer`  
> - Updates `projects.status = 'awaiting_customer_clarification'`

---

## 📦 **Supabase Data Mapping**

### `reviews` Table
```sql
id UUID PRIMARY KEY
project_id UUID → references projects.id
review_type TEXT → 'inquiry_received'
reviewer_id UUID → references auth.users
decision TEXT → 'approved', 'needs_clarification', 'rejected'
decision_reason TEXT
metadata JSONB → { document_check: [...], validity_notes: "..." }
status TEXT → 'draft', 'submitted'
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### `approvals` Table (if clarification or rejection)
```sql
entity_type: 'project'
entity_id: projects.id
approval_type: 'inquiry_clarification' or 'inquiry_rejection'
status: 'pending', 'approved', 'rejected'
current_approver_id: NULL (customer-driven)
due_date: NULL
metadata: { reason: "...", requested_by: user_id }
```

### `activity_log` Table
```sql
action: 'inquiry_review_submitted'
user_id: UUID
project_id: UUID
details: JSONB → { decision: 'needs_clarification', missing_docs: [] }
timestamp: TIMESTAMPTZ
```

---

## 🎨 **UI/UX & Styling (Tailwind + DaisyUI)**

| Element            | Class                                                    |
| ------------------ | -------------------------------------------------------- |
| Card               | `card bg-base-100 shadow-md border border-gray-200 p-6`  |
| Section Title      | `font-semibold text-lg text-gray-800 border-b pb-3 mb-4` |
| Checkbox           | `checkbox checkbox-sm checked:bg-blue-600`               |
| Textarea           | `textarea textarea-bordered w-full min-h-20`             |
| Input              | `input input-bordered w-full`                            |
| Select             | `select select-bordered select-sm`                       |
| Button (Primary)   | `btn btn-primary`                                        |
| Button (Secondary) | `btn btn-secondary`                                      |
| Button (Ghost)     | `btn btn-ghost`                                          |
| Alert (Info)       | `alert alert-info shadow-sm text-sm`                     |
| Modal              | `modal`, `modal-box`, `modal-action`                     |

---

## ✅ **PRD & Blueprint Alignment**

| Requirement                        | Implemented? | Notes                                          |
| ---------------------------------- | ------------ | ---------------------------------------------- |
| **FR-103** (Validate Docs)         | ✅            | Enforced in this form                          |
| **FR-301** (Structured Review)     | ✅            | Digital checklist + decision logic             |
| **FR-304** (Request Clarification) | ✅            | Modal + messaging system                       |
| **FR-803** (Audit Trail)           | ✅            | Logged in `reviews` + `activity_log`           |
| **Workflow Stage Gate**            | ✅            | Blocks progression to “Qualification”          |
| **Document Taxonomy**              | ✅            | Uses `document_categories` (rfq, drawing, bom) |
| **Multi-Tenancy**                  | ✅            | All queries scoped by `organization_id`        |

---

## 🔄 **Workflow Integration**

| Action                                         | System Response                                                                                                                 |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `[Save Draft]`                                 | Saves to `reviews` with `status = 'draft'`                                                                                      |
| `[Request Clarification]`                      | Opens modal → sends message → sets `project.status = 'awaiting_customer_clarification'`                                         |
| `[Submit Review → Ready for Technical Review]` | Validates → saves → sets `project.status = 'qualification'` → creates `project_sub_stage_progress` records → notifies reviewers |
| `[Submit Review → Reject]`                     | Validates reason → saves → sets `project.status = 'rejected'` → triggers rejection email                                        |
