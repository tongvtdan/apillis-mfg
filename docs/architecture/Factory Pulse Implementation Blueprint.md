# Factory Pulse Implementation Blueprint

## 1. Data Model

Supports end-to-end tracking from inquiry to delivery with multi-tenant isolation, versioned workflow templates, and per-project progress.

### Core Entities

- **organizations**
  - `id (uuid, pk)`, `name`, `slug (unique)`, `organization_type (customer, supplier, internal)`, `is_active (bool)`, `created_at`, `updated_at`
  - **Indexes:** `unique(slug)`, `idx_org_active(is_active)`
- **users**
  - `id (uuid, pk)`, `organization_id (fk)`, `email (unique)`, `name`, `role (enum user_role)`, `status (enum user_status)`, `direct_manager_id (nullable fk users.id)`, `preferences (jsonb)`, `created_at`, `updated_at`
  - **Indexes:** `unique(email)`, `idx_users_org(organization_id)`, `idx_users_role(role)`
- **contacts**
  - `id (uuid, pk)`, `organization_id (fk)`, `type (enum contact_type: customer, supplier, internal)`, `company_name`, `contact_name`, `email`, `phone`, `is_primary_contact`, `created_at`, `updated_at`
  - **Indexes:** `idx_contacts_org_type(organization_id, type)`

### Projects and Workflow (Catalog + Versioned Templates)

- **projects**
  - `id (uuid, pk)`, `organization_id (fk owner)`, `project_id (text unique, human-friendly)`, `title`, `description`, `customer_organization_id (fk organizations)`, `workflow_definition_id (fk)`, `current_stage_id (fk workflow_stages)`, `status (enum project_status)`, `priority (enum priority_level)`, `requested_due_date`, `promised_due_date`, `stage_entered_at`, `created_by (fk users)`, `assigned_to (fk users)`, `point_of_contacts (uuid[] fk contacts)`, `created_at`, `updated_at`
  - **Indexes:** `unique(project_id)`, `idx_projects_org(organization_id)`, `idx_projects_customer(customer_organization_id)`, `idx_projects_status(status)`, `idx_projects_stage(current_stage_id)`, `idx_projects_definition(workflow_definition_id)`
- **workflow_stages** (org-level catalog; reusable templates)
  - `id (uuid, pk)`, `organization_id (fk)`, `name`, `slug`, `stage_order (int)`, `is_active (bool)`, `estimated_duration_days (int, nullable)`, `created_at`, `updated_at`
  - **Indexes:** `unique(organization_id, slug)`, `idx_ws_org_order(organization_id, stage_order)`
- **workflow_sub_stages** (org-level catalog; reusable templates)
  - `id (uuid, pk)`, `organization_id (fk)`, `workflow_stage_id (fk)`, `name`, `slug`, `sub_stage_order (int)`, `is_required (bool)`, `requires_approval (bool)`, `can_skip (bool default false)`, `auto_advance (bool default false)`, `estimated_duration_hours (int, nullable)`, `metadata (jsonb)`, `is_active (bool default true)`, `created_at`, `updated_at`
  - **Indexes:** `unique(organization_id, slug)`, `idx_wss_stage_order(workflow_stage_id, sub_stage_order)`, `idx_wss_active(is_active)`

### Workflow Templates (Option A)

- **workflow_definitions**
  - `id (uuid, pk)`, `organization_id (fk)`, `name`, `version (int)`, `description`, `is_active (bool)`, `created_by (fk users)`, `created_at`, `updated_at`
  - **Constraints:** `unique(organization_id, name, version)`
  - **Indexes:** `idx_wd_org_active(organization_id, is_active)`
- **workflow_definition_stages**
  - `id (uuid, pk)`, `workflow_definition_id (fk)`, `workflow_stage_id (fk)`, `is_included (bool default true)`, `stage_order_override (int nullable)`, `responsible_roles_override (user_role[])`, `estimated_duration_days_override (int)`, `requires_approval_override (bool)`, `metadata (jsonb)`, `created_at`, `updated_at`
  - **Constraints:** `unique(workflow_definition_id, workflow_stage_id)`
  - **Indexes:** `idx_wds_wd(workflow_definition_id)`, `idx_wds_stage(workflow_stage_id)`
- **workflow_definition_sub_stages**
  - `id (uuid, pk)`, `workflow_definition_id (fk)`, `workflow_sub_stage_id (fk)`, `is_included (bool default true)`, `sub_stage_order_override (int)`, `responsible_roles_override (user_role[])`, `requires_approval_override (bool)`, `can_skip_override (bool)`, `auto_advance_override (bool)`, `estimated_duration_hours_override (int)`, `metadata (jsonb)`, `created_at`, `updated_at`
  - **Constraints:** `unique(workflow_definition_id, workflow_sub_stage_id)`
  - **Indexes:** `idx_wdss_wd(workflow_definition_id)`, `idx_wdss_sub_stage(workflow_sub_stage_id)`

### Per-Project Tracking

- **project_sub_stage_progress**
  - `id (uuid, pk)`, `organization_id (fk)`, `project_id (fk)`, `workflow_stage_id (fk)`, `sub_stage_id (fk)`, `status (enum sub_stage_status)`, `assigned_to (fk users)`, `started_at`, `due_at`, `completed_at`, `blocked_reason (text)`, `metadata (jsonb)`, `created_at`, `updated_at`
  - **Constraints:** `unique(project_id, sub_stage_id)`
  - **Indexes:** `idx_pssp_project(project_id)`, `idx_pssp_stage(project_id, workflow_stage_id)`, `idx_pssp_status(status)`, `idx_pssp_due(due_at)`

### Approvals

- **approvals**
  - `id (uuid, pk)`, `organization_id (fk)`, `approval_type (enum approval_type)`, `entity_type (text)`, `entity_id (uuid)`, `status (enum approval_status)`, `priority (enum approval_priority)`, `requested_by (fk users)`, `current_approver_id (fk users)`, `sla_due_at`, `created_at`, `updated_at`, `metadata (jsonb)`
  - **Indexes:** `idx_apv_entity(entity_type, entity_id)`, `idx_apv_status(status)`, `idx_apv_due(sla_due_at)`
- **approval_history**
  - `id (uuid, pk)`, `approval_id (fk)`, `organization_id (fk)`, `action_by (fk users)`, `action_type (enum approval_action)`, `old_status (enum approval_status)`, `new_status (enum approval_status)`, `comments`, `action_at`
  - **Indexes:** `idx_aph_approval(approval_id)`
- **approval_attachments**
  - `id (uuid, pk)`, `approval_id (fk)`, `organization_id (fk)`, `uploaded_by (fk users)`, `file_url`, `uploaded_at`
- **approval_chains** (optional for advanced routing)
  - `id (uuid, pk)`, `organization_id (fk)`, `chain_name`, `conditions (jsonb)`, `steps (jsonb)`, `is_active (bool)`
- **approval_notifications**
  - `id (uuid, pk)`, `approval_id (fk)`, `organization_id (fk)`, `recipient_id (fk users)`, `sent_at`, `read_at`

### Documents and Collaboration

- **documents**
  - `id (uuid, pk)`, `organization_id (fk)`, `project_id (fk)`, `title`, `category (enum document_category)`, `file_path`, `version (int)`, `is_current_version (bool)`, `uploaded_by (fk users)`, `approved_by (fk users nullable)`, `checksum (text)`, `size_bytes (bigint)`, `mime_type (text)`, `created_at`, `updated_at`
  - **Indexes:** `idx_docs_project(project_id)`, `idx_docs_category(category)`, `idx_docs_checksum(checksum)`
- **document_versions**
  - `id (uuid, pk)`, `organization_id (fk)`, `document_id (fk)`, `version_number (int)`, `file_path`, `uploaded_by (fk users)`, `is_current (bool)`, `uploaded_at`, `change_summary (text)`
  - **Constraints:** `unique(document_id, version_number)`
- **document_access_log**
  - `id (uuid, pk)`, `document_id (fk)`, `user_id (fk)`, `action (view, download)`, `accessed_at`
- **messages**
  - `id (uuid, pk)`, `organization_id (fk)`, `project_id (fk)`, `sender_id (fk users)`, `recipient_id (fk users nullable)`, `subject`, `content`, `created_at`
- **notifications**
  - `id (uuid, pk)`, `organization_id (fk)`, `user_id (fk)`, `type (enum notification_type)`, `title`, `message`, `priority (enum priority_level)`, `action_url`, `created_at`, `read_at`

### Audit

- **activity_log**
  - `id (uuid, pk)`, `organization_id (fk)`, `user_id (fk)`, `project_id (fk nullable)`, `entity_type`, `entity_id`, `action`, `old_values (jsonb)`, `new_values (jsonb)`, `created_at`
  - **Indexes:** `idx_log_entity(entity_type, entity_id)`, `idx_log_project(project_id)`, `idx_log_user(user_id)`

### Enums (Safe Creation)

- `user_role`: admin, management, engineering, qa, procurement, production, sales, finance, logistics, auditor
- `user_status`: active, invited, suspended, disabled
- `project_status`: draft, inquiry, reviewing, quoted, confirmed, procurement, production, completed, cancelled
- `sub_stage_status`: pending, in_progress, in_review, blocked, skipped, completed
- `approval_type`: technical_review, quote_approval, po_approval, supplier_selection, quality_review, shipment_release, final_signoff
- `approval_status`: pending, in_review, approved, rejected, cancelled, expired
- `approval_action`: request, assign, reassign, approve, reject, comment, escalate, cancel
- `approval_priority`: low, normal, high, urgent
- `contact_type`: customer, supplier, internal
- `priority_level`: low, normal, high, urgent
- `document_category`: inquiry, rfq, design_spec, drawing, bom, supplier_rfq, supplier_quote, costing, customer_quote, po, contract, work_order, work_instruction, qa_report, test_result, packing_list, shipping_doc, delivery_confirmation, invoice, other
- `notification_type`: workflow, approval, document, message, system

### Key Relationships

- organizations 1—* users, projects, workflow_stages, workflow_definitions, documents, messages, notifications, activity_log, approvals
- workflow_stages 1—* workflow_sub_stages
- workflow_definitions 1—* workflow_definition_stages, workflow_definition_sub_stages
- projects —> workflow_definitions (fk), —> workflow_stages (current_stage_id)
- project_sub_stage_progress joins projects, workflow_stages, workflow_sub_stages (per-project status)
- approvals attach to any entity via (entity_type, entity_id); commonly project_sub_stage_progress
- documents versioned via document_versions

### Critical Constraints and Indexes

- `unique(projects.project_id)`
- `unique(workflow_definition_stages.workflow_definition_id, workflow_stage_id)`
- `unique(workflow_definition_sub_stages.workflow_definition_id, workflow_sub_stage_id)`
- `unique(project_sub_stage_progress.project_id, sub_stage_id)`
- Common selective indexes listed above enable fast reporting by org, project, stage, status, due dates.

---

## 2. Workflow (Stages, Tasks, Decisions, Roles, Exit Criteria)

Implements 8 main stages with ~30 sub-stages. Templates define inclusion and overrides per organization/version. Exit criteria drive transitions.

### Stages

1. **Inquiry Received**
   - **Sub-stages:** RFQ Review (sales), Feasibility Check (engineering), Customer Clarification (sales)
   - **Tasks:** capture inquiry, attach RFQ, preliminary cost/lead evaluation
   - **Decisions:** feasibility viable? scope clarified?
   - **Exit Criteria:** RFQ completeness, feasibility documented, open questions closed

2. **Technical Review**
   - **Sub-stages:** Engineering Review (engineering), QA Review (qa), Production Review (production)
   - **Tasks:** review drawings/specs, assess tolerances, plan capability, identify risks
   - **Decisions:** manufacturable as specified? special processes required?
   - **Exit Criteria:** signed technical review note, risks mitigated or accepted

3. **Supplier RFQ Sent**
   - **Sub-stages:** Supplier Identification (procurement), RFQ Preparation (procurement), Response Collection (procurement)
   - **Tasks:** shortlist suppliers, prepare and issue RFQs, track responses
   - **Decisions:** sufficient qualified quotes received?
   - **Exit Criteria:** min N qualified quotes or waiver; responses loaded

4. **Quoted**
   - **Sub-stages:** Cost Analysis (finance/engineering), Quote Preparation (sales), Internal Approval (management/finance), Quote Sent (sales)
   - **Tasks:** roll-up cost (materials, labor, overhead), draft quote, route for approval
   - **Decisions:** margin threshold met? pricing approved?
   - **Exit Criteria:** approved quote issued to customer

5. **Order Confirmed**
   - **Sub-stages:** PO Review (sales/finance), Contract Finalization (management), Order Acknowledgement (sales)
   - **Tasks:** validate PO vs quote, terms (Incoterms, payment), confirm dates
   - **Decisions:** PO accepted? exceptions resolved?
   - **Exit Criteria:** acknowledged order, baselined dates and budget

6. **Procurement Planning**
   - **Sub-stages:** BOM Finalization (engineering), Purchase Order Creation (procurement), Supplier Confirmation (procurement)
   - **Tasks:** freeze BOM, issue POs, obtain supplier confirms/lead times
   - **Decisions:** materials availability and dates aligned to plan?
   - **Exit Criteria:** all critical POs placed and confirmed

7. **Production**
   - **Sub-stages:** Production Setup (production), Assembly (production), Quality Testing (qa), Packaging (logistics)
   - **Tasks:** prepare work center and WIs, build, test/inspect, pack
   - **Decisions:** NCRs resolved? pass criteria met?
   - **Exit Criteria:** all WOs complete, QA report pass, pack complete

8. **Completed**
   - **Sub-stages:** Final Inspection (qa), Shipping (logistics), Delivery Confirmation (sales/logistics), Project Closure (management)
   - **Tasks:** closeout inspection, ship per terms, confirm delivery, archive docs
   - **Decisions:** all deliverables accepted by customer?
   - **Exit Criteria:** delivery confirmed, invoices issued, project closed

### Responsibility Matrix

- **Sales:** inquiry intake, quote prep, order ack, delivery confirmation
- **Engineering:** feasibility, technical review, BOM
- **QA:** QA review, quality testing, final inspection
- **Production:** production review, setup, assembly, packaging
- **Procurement:** supplier identification, RFQ, POs, supplier confirmations
- **Finance/Management:** cost review, internal approvals, contracts, final close
- **Logistics:** shipping documents, delivery

### Transition Rules

- **Sub-stage transitions:** pending → in_progress → in_review (if approval) → completed; can be blocked/skipped per template overrides and permissions.
- **Stage transitions:** automatic when all required sub-stages completed; optional manual override by management with reason.

---

## 3. Document Taxonomy

### Categories (`document_category` enum)

- inquiry, rfq, design_spec, drawing, bom, supplier_rfq, supplier_quote, costing, customer_quote, po, contract, work_order, work_instruction, qa_report, test_result, packing_list, shipping_doc, delivery_confirmation, invoice, other

### Naming Convention

```
<ORG>-<PROJECTID>-<CATEGORY>-<YYYYMMDD>-v<NN>.<ext>
```
**Example:** `FP-PRJ-000123-qa_report-20250907-v03.pdf`

### Storage Layout (Object Storage)

```
/org/<org_slug>/projects/<project_id>/<category>/v<version>/<filename>
```

- **Required metadata:** checksum (sha256), size_bytes, mime_type, uploader, approval_state (if applicable), retention_tag
- **Access:** signed URLs scoped by RLS; document_versions maintains history with is_current flag

### Mandatory Attachments by Stage

- **Inquiry:** rfq, inquiry form, SOW/requirements
- **Technical Review:** design_spec, drawings, risk register (other)
- **Supplier RFQ:** supplier_rfq (outbound), supplier_quote (inbound)
- **Quoted:** costing, customer_quote (issued)
- **Order Confirmed:** po (customer), contract
- **Procurement Planning:** bom (final), po (outbound to suppliers)
- **Production:** work_order, work_instruction, qa_report, test_result
- **Completed:** packing_list, shipping_doc, delivery_confirmation, invoice

### Versioning and Immutability

- New upload creates/links document_versions with incremented version_number
- Only document_versions.is_current toggled via atomic update; prior versions immutable
- Optionally require approval on regulated docs (e.g., drawings, work_instruction)

---

## 4. Approvals

### When Approvals Are Required

- Determined by `workflow_sub_stages.requires_approval` OR template override in `workflow_definition_sub_stages.requires_approval_override`

### Approval Hierarchy and Typical Routing

- Technical Review sub-stages → engineering lead → qa lead (if critical-to-quality)
- Quote Preparation/Internal Approval → sales lead → finance → management (if margin below threshold or total > limit)
- PO Creation (large spend) → procurement lead → finance → management
- Quality Testing/Final Inspection → qa lead; NCR requires qa manager approval
- Shipment Release → logistics lead → management if expedited shipment or export-controlled
- Final Sign-off → project manager → management for closure

### Criteria and Thresholds (Configure per Org via `approval_chains.conditions`)

- Monetary thresholds (e.g., quote_value, po_value)
- Risk flags (regulated product, export control, special processes)
- Quality gates (CTQ failures, rework percentage)
- Date risk (promise slippage > X days)

### SLAs and Escalation

- Default SLA by approval_type (e.g., normal=48h, urgent=8h)
- `approvals.sla_due_at` set on creation; notifications scheduled
- Auto-escalation: when now > sla_due_at and status in (pending, in_review) → notify manager chain; optional reassignment to delegate/backup approver

### Mechanism

- Attempt to complete a gated sub-stage calls `finalize_sub_stage_with_approval(project_id, sub_stage_id,...)`
- Creates approvals row with `entity_type='project_sub_stage'` and enforced gate; progress status set to in_review/blocked until decision
- On approve → `project_sub_stage_progress.status=completed`, `completed_at=now()`
- On reject → status=blocked, blocked_reason recorded

### Record-Keeping

- `approval_history` logs every transition; `approval_attachments` hold supporting docs
- Immutable trail retained per retention policy (see Audit)

---

## 5. Audit

### Activity Capture

- All create/update/delete on core entities (projects, workflow_*, project_sub_stage_progress, approvals, documents) write an activity_log row with old/new values (jsonb)
- Document access (view/download) logged via `document_access_log`

### Review Procedures

- Per-project activity feed; org-wide audit views filtered by time range, user, entity
- Monthly compliance exports (CSV/Parquet) for approvals and quality records

### Data Retention

- Approvals, QA records, shipping docs: retain min 7 years (ISO 9001/industry practice)
- General activity logs: retain 2 years; archive older to cold storage
- Documents: retain per document_category; regulated drawings/work_instructions immutable with version history

### Compliance Considerations

- Immutable history for approvals and document versions
- Time-stamped, user-attributed actions
- Optional e-sign style signature for approvals (user id + time + reason + hash of payload)
- PII minimization; encrypt sensitive metadata in transit and at rest

---

## 6. Integration with Existing Schema, Triggers, RLS

### Option A Alignment

- Keep workflow_stages and workflow_sub_stages as org-level catalogs (no project_id on these)
- Projects reference workflow_definitions (templates). Per-project status lives in project_sub_stage_progress

### Seeding Trigger on Stage Change

- `create_project_sub_stage_progress_v2()`
  - When `projects.current_stage_id` changes: resolve `projects.workflow_definition_id`
  - Seed included sub-stages (template-aware) into `project_sub_stage_progress`
  - First included sub-stage set in_progress; others pending; respect order overrides
  - On conflict (project_id, sub_stage_id) do nothing

### Due Dates/SLA Helper

- Optional trigger: upon seeding, set `project_sub_stage_progress.due_at` from template or catalog estimated_duration

### Notifications

- `handle_project_stage_change()`: emit notifications to assigned team, next responsible roles
- Approval events create notifications to current_approver; escalation jobs monitor `approvals.sla_due_at`

### Row-Level Security (RLS)

- All new tables ENABLE RLS
- Select/Insert/Update/Delete scoped to the user’s organization_id (via session context/auth)
- Administrative updates allowed for roles in (admin, management) with WITH CHECK org guard

### Performance

- Indexes listed above; ensure clustered access paths for high-frequency queries (project dashboards by stage/status, approvals due, late sub-stages)

---

## 7. API Outlines (REST/GraphQL-Ready)

### Projects

- `POST /projects`: create with workflow_definition_id, customer_organization_id, requested_due_date
- `PATCH /projects/:id`: change current_stage_id (triggers seeding), update assigned_to
- `GET /projects/:id/workflow`: stages, sub-stages and progress with statuses, due_at

### Workflow Templates

- `GET /workflow/definitions`: list active versions for org
- `POST /workflow/definitions`: create vN+1 from vN (clone), then modify inclusion/overrides
- `GET /workflow/definitions/:id/stages`, `/:id/sub-stages`

### Progress

- `PATCH /projects/:id/progress/:sub_stage_id`
  - body: `{ action: "start|complete|skip|block", comment?, attachments? }`
  - server enforces approval if required; returns updated progress row

### Approvals

- `POST /approvals/:id/decision`
  - body: `{ decision: "approve|reject", comment }`
  - on approve: if entity is project_sub_stage → complete it; on reject → keep blocked with reason
- `GET /approvals?status=pending&mine=true`

### Documents

- `POST /documents`: metadata create; get signed URL; upload; confirm to create document_versions
- `GET /projects/:id/documents?category=qa_report`

### Notifications

- `GET /notifications?unread=true`
- `PATCH /notifications/:id { read_at: now }`

### Activity Logs (Admin)

- `GET /audit/logs?entity=project_sub_stage_progress&entityId=:id`

#### Example Payloads

**Create Project**
```json
{
  "project_id": "PRJ-000123",
  "title": "Widget A Rev2",
  "customer_organization_id": "9a6f...uuid",
  "workflow_definition_id": "8b2e...uuid",
  "requested_due_date": "2025-10-30"
}
```

**Complete a Sub-Stage (Approval-Gated)**
```json
{
  "action": "complete",
  "comment": "All tests passed; attaching report",
  "attachments": [
    {"document_id": "doc-uuid", "version_number": 2}
  ]
}
```

---

## 8. Migration Plan (Safe Rollout)

- **DDL**
  - Create workflow_definitions, workflow_definition_stages, workflow_definition_sub_stages
  - Add projects.workflow_definition_id (fk)
  - Ensure project_sub_stage_progress has due_at, blocked_reason, status enum aligns
- **Seed Defaults**
  - For each org, create “Default Workflow” v1
  - Insert all active workflow_stages and required workflow_sub_stages into definition tables (is_included=true)
  - Backfill projects.workflow_definition_id with org’s default where null
- **Trigger Updates**
  - Replace existing seeding trigger with create_project_sub_stage_progress_v2() (template-aware)
  - Add optional SLA/due date calculation
- **RLS Policies**
  - Mirror org-scoped policies on new tables; allow manage rights for admin/management
- **Verification**
  - Create test project; step through stages; ensure seeding respects template
  - Flip requires_approval_override on a sub-stage; verify gate/approval flow

---

## 9. Operational Dashboards and KPIs

- **Project portfolio:** by stage, status, promised_due_date risk, priority
- **Workflow health:** sub-stages overdue (now > due_at), blocked reasons
- **Approvals:** pending by approver, SLA breaches, cycle time per approval_type
- **Quality:** pass rate from qa_report/test_result docs (metadata-driven)
- **On-time delivery:** promised vs delivered

---

## 10. Acceptance Criteria

- **Data Model**
  - Tables, enums, FKs, indexes created; RLS enabled and validated per role
  - Unique constraints enforce integrity (no duplicate sub-stage per project)
- **Workflow**
  - Changing current_stage_id seeds only included sub-stages from the selected workflow_definition; first included sub-stage auto-starts (in_progress)
  - Stage auto-advance when all required sub-stages complete; manual override restricted to management
- **Approvals**
  - Sub-stages flagged for approval cannot complete without an approved decision
  - SLA timestamps populated; escalation notifications fired on breach
  - approval_history shows full decision trail; attachments can be added
- **Documents**
  - Upload creates document_versions; is_current toggles; checksum recorded
  - Mandatory documents per stage enforced by server validation (configurable)
- **Audit**
  - All key state transitions write to activity_log with old/new values
  - Readable audit timeline at project and entity level
- **APIs**
  - Endpoints enforce RLS; response times p50 < 250 ms on indexed reads
  - Real-time subscriptions notify clients of progress and approval changes

---

## 11. Implementation Snippets (DDL Extracts)

### Workflow Templates

```sql
CREATE TABLE IF NOT EXISTS workflow_definitions (...);
CREATE TABLE IF NOT EXISTS workflow_definition_stages (...);
CREATE TABLE IF NOT EXISTS workflow_definition_sub_stages (...);

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS workflow_definition_id uuid
    REFERENCES workflow_definitions(id) ON DELETE SET NULL;
```

### Progress Seeding Trigger (Concept)

```sql
CREATE OR REPLACE FUNCTION create_project_sub_stage_progress_v2() RETURNS trigger AS $$
-- Resolve project's workflow_definition_id and seed included sub-stages with order overrides
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_project_sub_stage_progress ON projects;
CREATE TRIGGER trigger_create_project_sub_stage_progress
AFTER UPDATE OF current_stage_id ON projects
FOR EACH ROW EXECUTE FUNCTION create_project_sub_stage_progress_v2();
```

### Approval Gate (Concept)

```sql
-- finalize_sub_stage_with_approval(project_id, sub_stage_id, requested_by, due_date)
-- If approval required -> create approvals row and set status='in_review'/'blocked'
-- Else -> mark project_sub_stage_progress.status='completed'
```

---

## 12. Security and Privacy

- Principle of least privilege, RLS enforced on all reads/writes by org
- Sensitive document metadata minimized; object storage access via signed URLs
- Approval decisions and audit entries immutable (append-only)

---

## Summary

This blueprint operationalizes Option A with versioned workflow templates bound to projects, per-project progress tracking, robust approvals, and a complete document taxonomy. It is implementation-ready: it specifies the data model with constraints and indexes, the end-to-end workflow with roles and exit criteria, approval SLAs and escalation, audit and retention practices, triggers for seeding progress, RLS policies, and API outlines. Following this plan will enable a first-cycle correct build, maintain backward compatibility, and minimize future refactoring while supporting scalable, compliant manufacturing operations.



