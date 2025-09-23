# Factory Pulse: End-to-End Data Schema and Workflow Blueprint (Inquiry → Delivery)

## Scope and Objectives

- Build a first-implementation-ready blueprint covering data model, workflow, document taxonomy, approvals, and audit from initial inquiry through delivery.
- Align to current Factory Pulse assets: PostgreSQL/Supabase schema (organizations, users, projects, workflow, approvals, documents, activity log, supplier RFQs/quotes), API patterns, RLS, triggers, and real‑time updates.
- Extend the model for quoting, sales orders, BOM, work orders, inventory, procurement, quality, shipments, and delivery—minimizing refactors via consistent naming, RLS, and trigger patterns.

---

## 1) Required Data Fields by Lifecycle Stage (Mapped to Current and Proposed Tables)

### Simple View

#### Intake/Inquiry (RFQ/PO/Idea)
- **Existing:**  
  - `projects.project_id`, `title`, `description`, `intake_type`, `intake_source`, `customer_organization_id`, `point_of_contacts[]`, `priority_level`, `desired_delivery_date`, `target_price_per_unit`, `volume JSONB`, `project_reference`, `tags[]`, `created_by`, `created_at`, `metadata JSONB`
- **Contacts:**  
  - `contacts.*` (type=customer), `organizations.*` (customer)
- **Documents:**  
  - `documents` (category='rfq','po','spec','drawing','nda')
- **Approvals:**  
  - `approvals` (approval_type='stage_transition','document_approval')

#### Qualification & Internal Review
- **Existing:**  
  - `reviews` (`review_type`='engineering'/'qa'/'production', `status`, `priority`, `due_date`, `decision`, `decision_reason`, `recommendations`, `metadata`)
- **Workflow:**  
  - `workflow_stages`, `workflow_sub_stages` (responsible_roles, requires_approval, exit_criteria)
- **Approvals:**  
  - `approvals` (quality_review, safety_review, stage_transition)
- **Audit:**  
  - `activity_log`

#### Quotation
- **New:**  
  - `quotations`, `quotation_lines` (see DDL below)
- **Links:**  
  - `projects.id`, `supplier_quotes` (optional make-vs-buy), `documents` (category='quote_pdf','cost_model')
- **Fields:**  
  - costing (material/labor/overhead/tooling/margin), terms (payment_terms, incoterm), lead_time_days, validity, quote_status
- **Approvals:**  
  - `approvals` (cost_approval, budget_approval, contract_approval)

#### Sales Order (if quote accepted or direct PO)
- **New:**  
  - `sales_orders`, `sales_order_lines`
- **Links:**  
  - `projects`, `customer_organization_id`, `point_of_contacts[0]` as sold_to; ship_to/bill_to (org/addresses)
- **Fields:**  
  - so_number, so_status, customer_po_number, commitments (delivery_date, ship_terms), currency
- **Approvals:**  
  - `approvals` (contract_approval, stage_transition)

#### Engineering (EBOM/MBOM, DFM/DFA, Change Control)
- **New:**  
  - `items`, `item_revisions`, `boms` (headers), `bom_items` (lines), `routings`, `routing_operations`
- **Documents:**  
  - `documents` (category='drawing','cad','bom','ecn','spec','work_instruction')
- **Change:**  
  - `approvals` (engineering_change), `documents.versioning`, `document_access_log`
- **Fields:**  
  - revision, effectivity dates, alternates, critical characteristics

#### Procurement
- **Existing:**  
  - `supplier_rfqs`, `supplier_quotes`
- **New:**  
  - `purchase_requisitions`, `purchase_orders`, `purchase_order_lines`
- **Inventory master:**  
  - `items` (SKU), `uom`, `suppliers` (contacts type='supplier')
- **Approvals:**  
  - `approvals` (supplier_qualification, purchase_order)

#### Production Planning
- **New:**  
  - `work_orders`, `work_order_materials`, `work_order_operations`; `work_centers`, `machines`; calendars/shifts (optional)
- **Fields:**  
  - planned_start/end, scheduling priority, assigned_to (users/operators), quantities (ordered/started/completed/scrap), lot/serial requirements
- **Approvals:**  
  - `approvals` (production_release, safety_review)

#### Shop-Floor Execution
- **New:**  
  - `operation_executions`, `time_logs`, `material_issues` (inventory transactions), `scrap_records`
- **Real-time:**  
  - Supabase Realtime subscriptions on `work_orders`, `project_sub_stage_progress`
- **Audit:**  
  - `activity_log`

#### Quality (Incoming, In-process, Final, NCR/CAPA)
- **New:**  
  - `inspection_plans`, `inspections`, `inspection_results`, `defect_codes`, `nonconformances`, `capa`
- **Approvals:**  
  - `approvals` (quality_review)
- **Documents:**  
  - test reports, CoC, FAIR (AS9102), calibration certs

#### Shipping & Logistics
- **New:**  
  - `shipments`, `shipment_items`, `packing_units` (cartons/pallets), `carriers`, `tracking`, `incoterms`
- **Documents:**  
  - packing_list, commercial_invoice, bill_of_lading/waybill, export docs
- **Approvals:**  
  - `approvals` (shipping_approval)

#### Delivery & Closeout
- **New:**  
  - `delivery_confirmations`, `customer_feedback`, `warranty/exceptions`
- **Existing:**  
  - `project status` → completed; `documents` (delivery note, POD, acceptance)
- **Analytics:**  
  - lead times, OTD, quality PPM

---

## 2) Workflow and Sequential Steps (Default Configuration)

### Stage List (`workflow_stages`; configure per organization via `responsible_roles` and `exit_criteria`)

1. **Intake** (`slug:intake`)  
   _Gate:_ required documents present (RFQ/PO, drawing/spec), primary contact set
2. **Qualification** (`slug:qualification`)  
   _Internal reviews (engineering, QA, production) completed; approvals: quality_review if needed_
3. **Quotation** (`slug:quotation`)  
   _Quotation approved (cost_approval/budget_approval) → sent to customer_
4. **Sales Order** (`slug:sales_order`)  
   _Customer acceptance or PO; approvals: contract_approval_
5. **Engineering** (`slug:engineering`)  
   _EBOM/MBOM baselined; ECNs approved (engineering_change)_
6. **Procurement** (`slug:procurement`)  
   _POs released; critical suppliers qualified_
7. **Production Planning** (`slug:planning`)  
   _WO(s) released; approvals: production_release_
8. **Production** (`slug:production`)  
   _Operations executed; in-process inspections pass; NCRs resolved_
9. **Quality Final** (`slug:final_qc`)  
   _Final inspection pass; QA documents ready_
10. **Shipping** (`slug:shipping`)  
    _Packed; shipping_approval; tracking posted_
11. **Delivered/Closed** (`slug:delivered`)  
    _Delivery confirmed; customer acceptance; project status completed_

### Sub-stages (`workflow_sub_stages`; is_required, requires_approval)

- **Example:**  
  - Engineering includes `ebom_ready`, `dfm_done`, `mbom_released` (requires_approval=[engineering,management])
  - Planning includes `capacity_check`, `route_assign`, `wo_release` (auto_advance where rules satisfied)
  - Quality includes `inspection_plan_approved`, `in_process_check`, `final_inspection_pass`

### Progress Tracking

- Use `project_sub_stage_progress` for each sub-stage (status: pending/in_progress/completed/blocked/skipped)
- **Triggers:**  
  - `create_project_sub_stage_progress` on `current_stage_id` change; `handle_project_stage_change` sets `stage_entered_at` and notifications

---

## 3) Documents by Step (Categories and Templates)

_Recommendation: keep using documents table with standardized categories; add a controlled vocabulary table `document_categories` to avoid drift._

- **Intake:**  
  - RFQ, NDA, Customer Spec, Drawing/CAD, Compliance Requirements
- **Qualification/Review:**  
  - Review Forms (Eng/QA/Prod), Risk Register, Feasibility Report
- **Quotation:**  
  - Cost Model (xlsx/csv), Quote PDF, Terms & Conditions
- **Sales Order:**  
  - PO, Sales Order Acknowledgment, Contract/Addendum
- **Engineering:**  
  - EBOM, MBOM, Drawings, Work Instructions, ECN/Deviation, PPAP/FAI plan (industry-specific)
- **Procurement:**  
  - Supplier RFQ (existing), Supplier Quote (existing), Purchase Order, GRN
- **Planning/Production:**  
  - Work Order Packet, Routing Sheet, Setup Sheets, Safety/Control Plans
- **Quality:**  
  - Inspection Plan, Incoming/Final Inspection Report, NCR, CAPA, CoC/CoA, Calibration Certificates
- **Shipping:**  
  - Packing List, Labels, Commercial Invoice, Bill of Lading/AWB, Export Docs, CMR, HS Codes
- **Delivery:**  
  - Delivery Note, Proof of Delivery, Customer Acceptance, Warranty/Service Docs

**Proposed: `document_categories`**
- `id UUID PK`, `code TEXT UNIQUE` (rfq, nda, drawing, cad, quote_pdf, cost_model, po, so, bom, ecn, work_instruction, inspection_plan, inspection_report, ncr, capa, coc, cofa, grn, packing_list, invoice, bol, awb, export_doc, delivery_note, pod, acceptance)
- `is_portal_visible BOOLEAN`, `retention_policy JSONB`

---

## 4) Approval Workflows and Hierarchies

Use existing `approvals`, `approval_chains`, `approval_history`, `approval_notifications` plus `workflow_stages.responsible_roles` and `workflow_sub_stages.requires_approval`.

### Default Approval Chain Seeds (`approval_chains.steps` JSON—example)

- **Cost/Quote Approval** (`entity_type='quotation'`, conditions: total_amount > thresholds)
    - Steps:
        - sales lead (`role='sales'`); SLA 1d
        - engineering lead (`role='engineering'`) for technical feasibility; SLA 1d
        - management (`role='management'`) if margin < X% or total > Y; SLA 1d
- **Contract Approval** (`entity_type='sales_order'`)
    - legal/commercial (management), finance (budget_approval) if payment terms deviate
- **Engineering Change** (`entity_type='bom'/'document'`)
    - engineering → qa → production (safety_review if needed)
- **Purchase Order** (`entity_type='purchase_order'`)
    - procurement → management if supplier unqualified or total > threshold
- **Production Release** (`entity_type='work_order'`)
    - production supervisor → qa (quality_review) if special controls
- **Shipping Approval** (`entity_type='shipment'`)
    - logistics → qa (docs reviewed: CoC/labels/packaging) → sales if early/late ship

### Approval Criteria and Record-Keeping

- Required fields: due_date, priority, current_approver_id/role, decision_reason/comments
- Auto-expire: `auto_expire_overdue_approvals()` (existing)
- Delegation: `approval_delegations` and mappings (existing)
- Audit: `approval_history` (action_type: created/approved/rejected/escalated/delegated/expired), `approval_attachments` for evidence, notifications for SLA breaches
- RLS: mirror existing approvals policies; entity scoping via organization_id; link to project_id when applicable in `approval_history.metadata`

---

## 5) Architecture Alignment With Source Assets (What Exists vs. What to Add)

### Existing (Keep As-Is, Leverage)
- Multi-tenant isolation: `organization_id` across tables; RLS policies; auth RPC helpers (`get_current_user_org_id`, `get_current_user_role`)
- Core entities: `projects`, `workflow_stages/sub_stages`, `reviews`, `approvals` (+ chains, history, notifications, delegations), `documents` (+ versions, access_log), `contacts`, `messages`, `notifications`, `supplier_rfqs`, `supplier_quotes`
- Triggers and functions: `generate_project_id`, `create_project_sub_stage_progress`, `handle_project_stage_change`, `create_initial_document_version`, `update_document_on_version_change`, `cleanup_old_document_versions`, activity logging
- Real-time publications: `projects`, `reviews`, `notifications`, `supplier_quotes`

### Add (Compatible Modules)
- **Quotation domain:** `quotations`, `quotation_lines` (link projects; optionally versioned documents store PDFs)
- **Order domain:** `sales_orders`, `sales_order_lines`
- **Item/BOM/Routing:** `items`, `item_revisions`, `boms`, `bom_items`, `routings`, `routing_operations`
- **Production:** `work_orders`, `work_order_operations`, `work_order_materials`, `work_centers`, `machines`, `time_logs`, `operation_executions`, `scrap_records`
- **Inventory:** `uom`, `uom_conversions`, `stock_locations`, `stock_lots`, `inventory_items` (or reuse items), `stock_movements` (issues/receipts/transfers/adjustments)
- **Procurement:** `purchase_requisitions`, `purchase_orders`, `purchase_order_lines`, `goods_receipts`
- **Quality:** `inspection_plans`, `inspections`, `inspection_results`, `defect_codes`, `nonconformances`, `capa`
- **Shipping/Delivery:** `shipments`, `shipment_items`, `packing_units`, `carriers`, `delivery_confirmations`
- **Taxonomy:** `document_categories`, `defect_codes`, `incoterms` (optional reference), `cost_centers` (optional)

---

## 6) Proposed SQL (DDL Snippets) for New Domains

_Note: Follows existing conventions: snake_case, UUID PKs via `uuid_generate_v4()`, `organization_id` for multi-tenancy, `created_at/updated_at` with triggers, RLS patterned after existing tables._

### Quotations

```sql
create table public.quotations (
  id uuid primary key default extensions.uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  quote_number varchar(50) not null,
  status varchar(20) not null default 'draft', -- 'draft','in_review','sent','accepted','revised','expired','lost'
  currency varchar(3) not null default 'USD',
  lead_time_days int,
  valid_from timestamptz,
  valid_until timestamptz,
  totals jsonb default '{}'::jsonb, -- {material,labor,overhead,tooling,margin,discount,tax,grand_total}
  terms jsonb default '{}'::jsonb,  -- {payment_terms, incoterm, notes}
  submitted_at timestamptz,
  accepted_at timestamptz,
  created_by uuid references public.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (organization_id, quote_number)
);

create table public.quotation_lines (
  id uuid primary key default extensions.uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  quotation_id uuid not null references public.quotations(id) on delete cascade,
  line_no int not null,
  item_sku text,
  description text,
  qty numeric(18,4) not null,
  uom text not null default 'EA',
  unit_price numeric(18,4),
  cost_breakdown jsonb default '{}'::jsonb, -- {material,labor,overhead,tooling}
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (quotation_id, line_no)
);
```

### Sales Orders

```sql
create table public.sales_orders (
  id uuid primary key default extensions.uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  so_number varchar(50) not null,
  status varchar(20) not null default 'draft', -- 'draft','confirmed','released','fulfilled','cancelled','partial'
  customer_organization_id uuid not null references public.organizations(id),
  customer_po_number text,
  bill_to_org_id uuid references public.organizations(id),
  ship_to_org_id uuid references public.organizations(id),
  currency varchar(3) not null default 'USD',
  payment_terms text,
  incoterm text,
  requested_ship_date date,
  committed_ship_date date,
  created_by uuid references public.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (organization_id, so_number)
);

create table public.sales_order_lines (
  id uuid primary key default extensions.uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  sales_order_id uuid not null references public.sales_orders(id) on delete cascade,
  line_no int not null,
  item_sku text not null,
  description text,
  qty numeric(18,4) not null,
  uom text not null default 'EA',
  unit_price numeric(18,4),
  due_date date,
  metadata jsonb default '{}'::jsonb,
  unique (sales_order_id, line_no)
);
```

### Items, BOM, Routing

```sql
create table public.items (
  id uuid primary key default extensions.uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  sku text not null,
  description text,
  uom text not null default 'EA',
  item_type text not null default 'manufactured', -- 'manufactured','purchased','service'
  is_active boolean default true,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (organization_id, sku)
);

create table public.item_revisions (
  id uuid primary key default extensions.uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete cascade,
  revision text not null,
  effectivity_start date,
  effectivity_end date,
  is_current boolean default false,
  documents jsonb default '[]'::jsonb, -- link to documents ids
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (item_id, revision)
);

create table public.boms (
  id uuid primary key default extensions.uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  item_revision_id uuid not null references public.item_revisions(id) on delete cascade,
  bom_type text not null default 'MBOM', -- 'EBOM','MBOM'
  status text not null default 'draft', -- 'draft','released','obsoleted'
  revision text,
  effectivity_start date,
  effectivity_end date,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.bom_items (
  id uuid primary key default extensions.uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  bom_id uuid not null references public.boms(id) on delete cascade,
  line_no int not null,
  child_item_id uuid not null references public.items(id),
  quantity_per numeric(18,6) not null,
  uom text not null default 'EA',
  scrap_factor numeric(9,6) default 0,
  reference_designators text[],
  make_buy text default 'buy', -- or derive from child item
  metadata jsonb default '{}'::jsonb,
  unique (bom_id, line_no)
);

create table public.routings (
  id uuid primary key default extensions.uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  item_revision_id uuid not null references public.item_revisions(id) on delete cascade,
  status text not null default 'draft', -- 'draft','released'
  revision text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.routing_operations (
  id uuid primary key default extensions.uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  routing_id uuid not null references public.routings(id) on delete cascade,
  op_no int not null,
  work_center_id uuid,
  description text,
  std_setup_time_min numeric(10,2),
  std_run_time_min numeric(10,4), -- per piece
  qa_required boolean default false,
  safety_required boolean default false,
  documents jsonb default '[]'::jsonb,
  metadata jsonb default '{}'::jsonb,
  unique (routing_id, op_no)
);
```

### Production and Inventory

```sql
create table public.work_centers (
  id uuid primary key default extensions.uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  code text not null,
  name text not null,
  capacity_per_day numeric(18,2),
  metadata jsonb default '{}'::jsonb,
  unique (organization_id, code)
);

create table public.work_orders (
  id uuid primary key default extensions.uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  wo_number varchar(50) not null,
  item_id uuid not null references public.items(id),
  item_revision_id uuid references public.item_revisions(id),
  qty_ordered numeric(18,4) not null,
  qty_completed numeric(18,4) default 0,
  qty_scrap numeric(18,4) default 0,
  status text not null default 'draft', -- 'draft','released','in_progress','paused','completed','closed','cancelled'
  routing_id uuid references public.routings(id),
  planned_start timestamptz,
  planned_end timestamptz,
  actual_start timestamptz,
  actual_end timestamptz,
  priority priority_level default 'medium',
  created_by uuid references public.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (organization_id, wo_number)
);

create table public.work_order_operations (
  id uuid primary key default extensions.uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  work_order_id uuid not null references public.work_orders(id) on delete cascade,
  routing_operation_id uuid not null references public.routing_operations(id),
  status text not null default 'pending', -- 'pending','in_progress','completed','skipped','blocked'
  assigned_to uuid references public.users(id),
  started_at timestamptz,
  completed_at timestamptz,
  qty_completed numeric(18,4) default 0,
  qty_scrap numeric(18,4) default 0,
  notes text,
  metadata jsonb default '{}'::jsonb
);

create table public.work_order_materials (
  id uuid primary key default extensions.uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  work_order_id uuid not null references public.work_orders(id) on delete cascade,
  bom_item_id uuid not null references public.bom_items(id),
  qty_required numeric(18,6) not null,
  qty_issued numeric(18,6) default 0,
  uom text default 'EA',
  metadata jsonb default '{}'::jsonb
);

create table public.stock_locations (
  id uuid primary key default extensions.uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  code text not null,
  name text,
  location_type text default 'warehouse', -- 'warehouse','line','qc','shipping','receiving','scrap'
  metadata jsonb default '{}'::jsonb,
  unique (organization_id, code)
);

create table public.stock_lots (
  id uuid primary key default extensions.uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  item_id uuid not null references public.items(id),
  lot_no text,
  serial_no text,
  expiry_date date,
  metadata jsonb default '{}'::jsonb,
  unique (organization_id, item_id, coalesce(lot_no,''), coalesce(serial_no,''))
);

create table public.stock_movements (
  id uuid primary key default extensions.uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  item_id uuid not null references public.items(id),
  lot_id uuid references public.stock_lots(id),
  from_location_id uuid references public.stock_locations(id),
  to_location_id uuid references public.stock_locations(id),
  movement_type text not null, -- 'receipt','issue','transfer','adjust_pos','adjust_neg','return_customer','return_supplier','scrap'
  quantity numeric(18,6) not null,
  uom text not null default 'EA',
  unit_cost numeric(18,6),
  reference_type text, -- 'work_order','purchase_order','shipment','inspection','project'
  reference_id uuid,
  moved_at timestamptz default now(),
  metadata jsonb default '{}'::jsonb
);
```

### Procurement and Receiving

```sql
create table public.purchase_orders (
  id uuid primary key default extensions.uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  po_number varchar(50) not null,
  status varchar(20) not null default 'draft', -- 'draft','released','partially_received','received','cancelled'
  supplier_id uuid not null references public.contacts(id),
  currency varchar(3) not null default 'USD',
  expected_date date,
  created_by uuid references public.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (organization_id, po_number)
);

create table public.purchase_order_lines (
  id uuid primary key default extensions.uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  purchase_order_id uuid not null references public.purchase_orders(id) on delete cascade,
  line_no int not null,
  item_id uuid not null references public.items(id),
  description text,
  qty_ordered numeric(18,6) not null,
  qty_received numeric(18,6) default 0,
  uom text not null default 'EA',
  unit_price numeric(18,6),
  metadata jsonb default '{}'::jsonb,
  unique (purchase_order_id, line_no)
);

create table public.goods_receipts (
  id uuid primary key default extensions.uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  purchase_order_id uuid references public.purchase_orders(id),
  received_at timestamptz default now(),
  received_by uuid references public.users(id),
  document_id uuid references public.documents(id),
  metadata jsonb default '{}'::jsonb
);
```

### Quality and Shipping

```sql
create table public.inspection_plans (
  id uuid primary key default extensions.uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  item_id uuid references public.items(id),
  plan_type text not null default 'final', -- 'incoming','in_process','final'
  sampling_plan jsonb default '{}'::jsonb,
  characteristics jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.inspections (
  id uuid primary key default extensions.uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  inspection_plan_id uuid references public.inspection_plans(id),
  project_id uuid references public.projects(id),
  work_order_id uuid references public.work_orders(id),
  inspection_type text not null, -- 'incoming','in_process','final'
  result text, -- 'pass','fail','conditional'
  inspected_at timestamptz default now(),
  inspected_by uuid references public.users(id),
  documents jsonb default '[]'::jsonb,
  metadata jsonb default '{}'::jsonb
);

create table public.defect_codes (
  id uuid primary key default extensions.uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  code text not null,
  description text,
  category text,
  unique (organization_id, code)
);

create table public.nonconformances (
  id uuid primary key default extensions.uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id),
  work_order_id uuid references public.work_orders(id),
  defect_code_id uuid references public.defect_codes(id),
  quantity numeric(18,4),
  disposition text, -- 'use-as-is','rework','scrap','return_to_supplier'
  status text default 'open', -- 'open','closed'
  created_by uuid references public.users(id),
  created_at timestamptz default now(),
  closed_at timestamptz,
  metadata jsonb default '{}'::jsonb
);

create table public.shipments (
  id uuid primary key default extensions.uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id),
  sales_order_id uuid references public.sales_orders(id),
  ship_number varchar(50) not null,
  status text not null default 'draft', -- 'draft','packed','shipped','delivered','returned'
  carrier text,
  tracking_number text,
  incoterm text,
  ship_date date,
  documents jsonb default '[]'::jsonb,
  created_by uuid references public.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (organization_id, ship_number)
);

create table public.shipment_items (
  id uuid primary key default extensions.uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  sales_order_line_id uuid references public.sales_order_lines(id),
  item_id uuid not null references public.items(id),
  qty_shipped numeric(18,4) not null,
  uom text default 'EA',
  metadata jsonb default '{}'::jsonb
);

create table public.delivery_confirmations (
  id uuid primary key default extensions.uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  delivered_at timestamptz,
  received_by text,
  proof_document_id uuid references public.documents(id),
  notes text,
  created_at timestamptz default now()
);
```

---

## RLS, Triggers, and Indexes

- Apply “org-scoped + role-aware” RLS patterns used by projects/documents/reviews/approvals to all new tables:
  - `FOR SELECT/INSERT/UPDATE/DELETE USING (organization_id = get_current_user_org_id())`
  - Role/ownership exceptions as needed (e.g., sender_id = auth.uid() for messages-like patterns)
- Add `updated_at` trigger with `update_updated_at_column()`
- Add activity_log trigger (`log_activity`) to core transactional tables (`work_orders`, `purchase_orders`, `shipments`, `inspections`)
- **Indexes:** organization_id, foreign keys, unique business keys (`so_number`, `po_number`, `ship_number`), and JSONB GIN where used

---

## 7) Per-Stage Gate Conditions (exit_criteria) and KPI Capture

- Define `exit_criteria` textual rules in workflow tables for UI display, and enforce via:
  - Required approvals completed for the stage
  - Required documents present (documents with categories)
  - Required reviews completed with decision='approved'
  - Sample rule (Planning → Production): “All required WOs status=released AND material availability>=100%”
- **KPI capture:**
  - Use `project_sub_stage_progress` timestamps for time-in-stage
  - Derive lead-time metrics in `get_dashboard_summary` or materialized views (e.g., `mv_project_lead_times`)
  - Extend `get_dashboard_summary` to include “average days per stage”, “WIP by stage”

---

## 8) Approval Hierarchies and Responsibility Owners (Default)

- **Roles per stage** (`workflow_stages.responsible_roles`)
  - Intake: sales, management
  - Qualification: engineering, qa, production
  - Quotation: sales, engineering, management
  - Sales Order: sales, management
  - Engineering: engineering, qa
  - Procurement: procurement, management
  - Planning: production
  - Production: production, qa
  - Final QC: qa
  - Shipping: logistics (treated as production or management), qa
- **Approval steps** use `approvals` + `approval_chains`
  - Assign `current_approver_role` aligned to step owner
  - Optional `auto_approval_rules` JSON by thresholds (e.g., totals < 1,000 auto-approve)
  - Delegation windows via `approval_delegations` for OOO scenarios

---

## 9) Document and Data Retention, Audit, and Compliance

- Retain `document_versions` for traceability; apply `cleanup_old_document_versions` with per-category retention policy
- All approval actions captured in `approval_history`; all entity changes in `activity_log` with `project_id`
- `document_access_log` on views/downloads
- Quality/traceability: tie inspection reports and CoC to shipments and work_orders
- Privacy: use existing RLS; confine portal roles (customer/supplier) to project-specific docs with appropriate `access_level`
- Compliance mapping (ISO 9001/IATF/AS9100) via:
  - Immutable approval history
  - Controlled documents (`documents.is_current_version` and versioning)
  - NCR/CAPA lifecycle
  - Training/audit extension (future)

---

## 10) Integration Plan With Existing Code and APIs

- **API Surface** (extends current patterns)
  - New REST via Supabase tables; reuse RPC for dashboards and permissions
  - Real-time subscriptions: `work_orders`, `shipments`, `approvals` (optional)
  - Service layer: ProjectService already present; add OrderService, BOMService, WOService, InventoryService, QualityService, ShippingService
- **UI Modules (Incremental)**
  - **Phase 1 (MVP alignment):** Intake/Kanban, Reviews, Documents, Approvals (existing)
  - **Phase 2:** Quotations, Sales Orders, BOM/Routing, Work Orders, Procurement (PO), Inventory, Quality, Shipping
  - Use existing Kanban/workflow viewer to include new gates; add tabs to Project Detail for Quote/SO/WO/Quality/Shipments
- **Backward Compatibility**
  - Project-driven: all downstream entities link to `project_id`; project remains the hub
  - Views for summaries: `project_details_view` already exists; add views for `project_order_summary`, `project_bom_summary`, `project_wo_status`, `project_quality_summary`
- **AI Fields** (`documents.ai_extracted_data`)
  - Use to pre-fill BOM drafts or quote line items; add ingestion service to transform AI JSON into `bom_items`/`quotation_lines` with user confirmation

---

## 11) Migration Plan (Safe, Incremental)

- **Wave 1 (foundation)**
  - Deploy `items`, `item_revisions`, `document_categories`
  - Deploy `quotations`, `quotation_lines`
  - RLS, triggers (`updated_at`, `log_activity`), indexes
  - Minimal UI: Quote creation from Project; PDF Quote in documents
- **Wave 2 (execution core)**
  - Deploy `sales_orders` + lines, `boms` + `bom_items`, `routings` + operations
  - Deploy `work_centers`, `work_orders` (+ operations/materials)
  - Extend workflow stages and sub-stages for Planning/Production
  - UI: SO creation from Quote/Project; WO generation from SO/BOM/Route
- **Wave 3 (inventory/procurement/quality/shipping)**
  - Deploy `stock_locations`/lots/movements, `purchase_orders` + lines, `goods_receipts`
  - Deploy `inspection_*` tables, `defect_codes`, `nonconformances`
  - Deploy `shipments`, `shipment_items`, `delivery_confirmations`
  - UI: Receiving, Issue to WO, QC reports, Packing/Shipping
- **Data backfills and reference data**
  - Seed `defect_codes`, `document_categories`, `incoterms`
  - Migrate any historical quotes/orders into new tables (if applicable)
- **Developer checklist per wave**
  - DDL + RLS + triggers
  - TypeScript types and Zod schemas
  - Service classes and React Query hooks
  - Pages/components + role-guarding
  - Tests + docs updates

---

## 12) Security Model for New Tables (Patterns)

**Example RLS for org-scoped read/write:**

```sql
alter table public.work_orders enable row level security;

create policy "wo_select_org"
on public.work_orders
for select using (organization_id = public.get_current_user_org_id());

create policy "wo_insert_org"
on public.work_orders
for insert with check (organization_id = public.get_current_user_org_id());

create policy "wo_update_role_based"
on public.work_orders
for update using (
  organization_id = public.get_current_user_org_id()
  and (public.get_current_user_role() = any(array['admin','management','production']))
);
```

- Apply similar policies to quotations, orders, BOM, procurement, inventory, quality, shipping
- Portal access (customer/supplier) limited to project-bound views and documents with `access_level` customer/supplier
- Activity logging trigger on INSERT/UPDATE/DELETE for audit coverage

---

## 13) Operational Analytics and Dashboards

- Extend `get_dashboard_summary()` to include:
  - quotes: by status, velocity, win rate (`quotations.status`, `accepted_at`)
  - orders: open/fulfilled; revenue forecast (`so_lines`)
  - production: WIP by stage (`work_orders.status`), OEE (future)
  - quality: NCRs open/closed, PPM (`nonconformances`)
  - shipping: OTD, lead time (`shipments.ship_date` vs committed)
- Materialized views for performance where needed; refresh via jobs

---

## 14) Implementation Checklist (First Development Cycle)

- **Data**
  - Deploy Wave 1 DDL (`items`, `item_revisions`, `quotations`, `quotation_lines`, `document_categories`)
  - Add RLS + triggers + indexes
  - Seed `document_categories`; add UI mappings to categories
- **API/Services**
  - QuotationService with create/update/send; PDF generator writes to documents
  - ItemService minimal (SKU selection)
- **UI**
  - Project Detail: new “Quote” tab; create quote from project volume and target price
  - Quote Builder: lines, cost breakdown, totals, validity, approvals
  - Approvals: use existing approvals flows with new `entity_type='quotation'`
- **QA**
  - Unit tests for services, RLS access, approvals RPCs
  - E2E: Create Project → Upload Drawing → Complete Reviews → Create Quote → Approve → Send PDF
- **Observability**
  - Ensure `activity_log` covers new tables; add error boundaries on new pages

---

## Appendix A — Document Categories (Starter Set)

- rfq, nda, drawing, cad, spec, cost_model, quote_pdf, po, so, bom, ecn, work_instruction, inspection_plan, inspection_report, ncr, capa, coc, coa, grn, packing_list, invoice, bol, awb, export_doc, delivery_note, pod, acceptance

---

## Appendix B — Suggested Enums (Optional)

- **quote_status:** draft, in_review, sent, accepted, revised, expired, lost
- **so_status:** draft, confirmed, released, fulfilled, cancelled, partial
- **wo_status:** draft, released, in_progress, paused, completed, closed, cancelled
- **qc_result:** pass, fail, conditional
- **movement_type:** receipt, issue, transfer, adjust_pos, adjust_neg, return_customer, return_supplier, scrap

---

## Summary

This blueprint extends Factory Pulse’s robust core (projects, workflow, approvals, docs, audit) with production-grade domains for quoting, orders, BOM/routing, work orders, inventory, procurement, quality, shipping, and delivery.  
It adheres to existing conventions (organization_id multi-tenancy, RLS, triggers, Supabase Realtime) to minimize refactors and enable staged rollout.  
Start with quotations and item master (Wave 1), then add execution modules (Waves 2–3). The design is scalable, compliant, and ready for the first development cycle.