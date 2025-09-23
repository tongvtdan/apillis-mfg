# 🏗️ **Factory Pulse — Feature-Based Architecture Specification**  
*Aligned with PRD v1.2, Tech Stack v1.0.0, and End-to-End Data Schema Blueprint*  
*Designed for Incremental Delivery, Scalability, Maintainability, and Supabase Integration*

---

## 🎯 **Architecture Philosophy**

Factory Pulse is built around **three core pillars**:

1. **Project-Centric Hub** — Every entity (`quotations`, `work_orders`, `shipments`) links back to `projects.id`. The project is the single source of truth.
2. **Phase-Driven Rollout** — Delivery is split into **Waves** (Wave 1: Quoting → Wave 3: Shipping) to manage risk and validate value.
3. **Feature-Modular Design** — Business capabilities (`intake`, `engineering-review`, `costing-engine`) are self-contained, reusable, and independently testable.

> ✅ **No spaghetti code. No god files. No cross-wave dependencies.**

---

## 📁 **Root Folder Structure**

```
src/
├── core/                         → Shared kernel (auth, workflow, approvals, docs, audit)
├── waves/                        → Phased delivery modules (Wave 1 → Wave 3)
├── features/                     → Cross-wave business features (UI + logic)
├── shared/                       → Reusable UI, hooks, utils (non-business)
├── app/                          → App setup (routes, layouts, providers)
├── pages/                        → Thin route wrappers
├── config/                       → Constants, env, seed data
├── test/                         → Feature + wave + core tests
└── scripts/                      → DB seeders, migration helpers
```

---

## 🧱 **1. Core Layer — The Stable Foundation**

These modules are **organization-scoped, RLS-enforced, and used by ALL waves/features**. They rarely change.

```
src/core/
├── auth/
│   ├── AuthProvider.tsx          → Wraps Supabase session + org context
│   ├── useAuth.ts                → Returns { user, org, role, permissions }
│   └── rls-helpers.ts            → get_current_user_org_id(), isRole(), hasPermission()
│
├── workflow/
│   ├── WorkflowProvider.tsx      → Manages current project stage/sub-stage
│   ├── useWorkflow.ts            → useProjectStage(projectId), advanceStage()
│   ├── StageGateBanner.tsx       → UI: “Complete Engineering Review to proceed”
│   └── exit-criteria/            → Logic validators (e.g., “All reviews approved?”)
│
├── approvals/
│   ├── ApprovalProvider.tsx      → Global approval state
│   ├── useApproval.ts            → useApproval(entityType, entityId)
│   ├── ApprovalButton.tsx        → Renders “Approve/Reject” with delegation
│   └── ApprovalHistoryTimeline.tsx → Audit trail UI
│
├── documents/
│   ├── DocumentProvider.tsx      → Central doc context
│   ├── useDocumentUpload.ts      → Handles upload + link + versioning
│   ├── DocumentUploader.tsx      → UI: file or link, with category selector
│   └── DocumentVersionViewer.tsx → Compare versions, view access log
│
└── activity-log/
    ├── ActivityProvider.tsx      → Real-time activity feed
    ├── useActivityLog.ts         → Fetch logs for project/entity
    └── ActivityFeed.tsx          → UI: “James approved quote on Sep 5”
```

> 🔐 **RLS Enforcement**: All core modules use `get_current_user_org_id()` in Supabase queries.

---

## 🌊 **2. Waves Layer — Phased Delivery Modules**

Each wave is a **self-contained delivery unit** with its own data, UI, and services. Waves are **deployed incrementally** and **do not depend on future waves**.

```
src/waves/
├── wave-1/                       → Quoting + Item Master (MVP Extension)
│   ├── quotations/
│   │   ├── components/
│   │   │   ├── QuoteBuilder.tsx
│   │   │   ├── CostBreakdownEditor.tsx
│   │   │   └── QuotePDFPreview.tsx
│   │   ├── hooks/
│   │   │   └── useQuotation.ts
│   │   ├── services/
│   │   │   └── quotationService.ts
│   │   ├── types/
│   │   │   └── quotation.types.ts
│   │   └── validations/
│   │       └── quotationSchema.ts
│   │
│   └── items/
│       ├── components/
│       │   └── ItemSelector.tsx
│       ├── hooks/
│       │   └── useItems.ts
│       └── services/
│           └── itemService.ts
│
├── wave-2/                       → Engineering + Planning
│   ├── engineering/
│   │   ├── components/
│   │   │   ├── BOMEditor.tsx
│   │   │   └── RoutingSheet.tsx
│   │   └── services/
│   │       └── bomService.ts
│   │
│   └── planning/
│       ├── components/
│       │   └── WorkOrderGenerator.tsx
│       └── services/
│           └── workOrderService.ts
│
└── wave-3/                       → Procurement + Quality + Shipping
    ├── procurement/
    │   └── components/PurchaseOrderForm.tsx
    ├── quality/
    │   └── components/InspectionPlanEditor.tsx
    └── shipping/
        └── components/ShipmentTracker.tsx
```

> 🔄 **Wave Independence**:
> - Wave 1 can be deployed without Wave 2 or 3.
> - Wave 2 uses `items` from Wave 1 but does not import Wave 1 UI/components.
> - Wave 3 uses `work_orders` from Wave 2 but does not depend on Wave 2 UI.

---

## 🧩 **3. Features Layer — Cross-Wave Business Capabilities**

These are **user-facing features** that may be used across multiple waves. They are **not tied to a delivery phase**.

```
src/features/
├── intake/                       → Available from Day 1 (pre-Wave 1)
│   ├── components/
│   │   └── IntakeForm.tsx
│   ├── hooks/
│   │   └── useIntakeForm.ts
│   └── services/
│       └── intakeService.ts
│
├── engineering-review/           → Used in Qualification stage (pre-Wave 1)
│   ├── components/
│   │   └── EngineeringReviewForm.tsx
│   └── services/
│       └── reviewService.ts
│
├── costing-engine/               → Used in Wave 1 (Quoting) and Wave 3 (Procurement)
│   ├── hooks/
│   │   └── useCostSimulator.ts
│   └── components/
│       └── MarginSlider.tsx
│
├── supplier-management/          → Used in Wave 1 (RFQ) and Wave 3 (Procurement)
│   └── components/SupplierSelector.tsx
│
├── dashboard/                    → Always available
│   └── components/KanbanBoard.tsx
│
└── reporting/                    → Always available
    └── components/WinLossChart.tsx
```

> 💡 **Key Insight**: `intake` and `engineering-review` are **prerequisites** for Wave 1 — they are not “part of” Wave 1.

---

## 🧵 **4. Shared Layer — Reusable, Non-Business UI & Logic**

These are **truly reusable** components and utilities — no business logic, no wave/feature coupling.

```
src/shared/
├── ui/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   ├── FormInput.tsx
│   └── Table.tsx
│
├── hooks/
│   ├── useSupabase.ts
│   ├── useLocalStorage.ts
│   └── useRealtime.ts
│
├── utils/
│   ├── formatCurrency.ts
│   ├── formatDate.ts
│   └── generateProjectId.ts
│
├── types/
│   ├── global.d.ts               → Project, User, Document, Approval
│   └── enums.ts                  → quote_status, wo_status, qc_result
│
└── lib/
    ├── supabaseClient.ts
    └── queryClient.ts
```

> 🚫 **Rule**: If it’s specific to a feature or wave, it doesn’t belong here.

---

## 🗺️ **5. App Layer — Routing, Layouts, Providers**

```
src/app/
├── App.tsx                       → Main component
├── routes/
│   └── AppRoutes.tsx             → All routes + lazy loading
├── layouts/
│   ├── DashboardLayout.tsx       → Sidebar, topbar, notifications
│   └── ProjectDetailLayout.tsx   → Tabs: Overview, Quote, BOM, WO, Quality, Ship
└── providers/
    ├── AuthProvider.tsx          → Already in core/auth/
    └── QueryClientProvider.tsx   → TanStack Query setup
```

> ✅ **Lazy Loading Example**:
```tsx
const QuoteTab = lazy(() => import('@/waves/wave-1/quotations/QuoteTab'));
const BomTab = lazy(() => import('@/waves/wave-2/engineering/BomTab'));
```

---

## 📄 **6. Pages Layer — Thin Route Wrappers**

Pages are **lightweight** — they compose features/waves and handle routing.

```
src/pages/
├── intake/
│   └── IntakeFormPage.tsx        → <IntakeForm onSuccess={navigate} />
├── dashboard/
│   └── DashboardPage.tsx         → <KanbanBoard />
├── project/
│   └── [id]/
│       └── ProjectDetailPage.tsx → Renders tabs based on wave progress
└── admin/
    └── DocumentCategoriesPage.tsx → Manages `document_categories`
```

> 🔄 **Conditional Rendering in ProjectDetailPage**:
```tsx
{isWave1Enabled && <Tab label="Quote"><QuoteTab projectId={id} /></Tab>}
{isWave2Enabled && <Tab label="BOM"><BomTab projectId={id} /></Tab>}
{isWave3Enabled && <Tab label="Shipping"><ShippingTab projectId={id} /></Tab>}
```

---

## ⚙️ **7. Config Layer — Constants, Env, Seed Data**

```
src/config/
├── env.ts                        → VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
├── constants.ts                  → APP_NAME, DEFAULT_CURRENCY, ROLES
├── document-categories.ts        → Seed from Appendix A (rfq, nda, drawing, ...)
└── workflow-stages.ts            → Default stages (intake, qualification, ...)
```

> 🌱 **Seed Script Example**:
```ts
// scripts/seed-document-categories.ts
await supabase.from('document_categories').insert([
  { code: 'rfq', name: 'Request for Quotation', is_portal_visible: true },
  { code: 'quote_pdf', name: 'Customer Quote PDF', is_portal_visible: true },
  // ... all from Appendix A
]);
```

---

## 🧪 **8. Test Layer — Isolated, Feature-Focused**

```
src/test/
├── core/
│   └── workflow/
│       └── Workflow.test.ts      → Test stage transitions, exit criteria
├── waves/
│   └── wave-1/
│       └── quotations/
│           └── QuotationService.test.ts
├── features/
│   └── intake/
│       └── IntakeForm.test.tsx
└── shared/
    └── ui/
        └── Button.test.tsx
```

> ✅ Use `vitest`, `@testing-library/react`, and `msw` to mock Supabase.

---

## 🔄 **9. Scripts Layer — DB Management**

```
src/scripts/
├── seed-document-categories.ts
├── seed-workflow-stages.ts
├── migrate-historical-quotes.ts
└── generate-initial-approvals.ts
```

> 🚀 Run via `npm run seed:document-categories` or during CI/CD.

---

## 🧭 **Routing & Navigation Structure**

```tsx
// src/app/routes/AppRoutes.tsx
const routes = [
  { path: '/', element: <DashboardPage /> },
  { path: '/intake', element: <IntakeFormPage /> },
  {
    path: '/project/:projectId',
    element: <ProjectDetailLayout />,
    children: [
      { index: true, element: <OverviewTab /> },
      { path: 'quote', element: <QuoteTab /> },          // ← Wave 1
      { path: 'bom', element: <BomTab /> },              // ← Wave 2
      { path: 'work-orders', element: <WorkOrdersTab /> }, // ← Wave 2
      { path: 'quality', element: <QualityTab /> },      // ← Wave 3
      { path: 'shipments', element: <ShippingTab /> },   // ← Wave 3
    ]
  },
  { path: '/admin/document-categories', element: <DocumentCategoriesAdminPage /> },
];
```

---

## 🎯 **Implementation Roadmap (Wave 1 Start)**

### Phase 1: Core + Features (Pre-Wave 1)
- ✅ Build `core/` modules (auth, workflow, approvals, documents, activity-log)
- ✅ Build `features/intake/` and `features/engineering-review/`
- ✅ Build `pages/intake/` and `pages/dashboard/`
- ✅ Seed `document_categories` and `workflow_stages`

### Phase 2: Wave 1 (Quoting + Item Master)
- ✅ Build `waves/wave-1/quotations/`
- ✅ Build `waves/wave-1/items/`
- ✅ Add “Quote” tab to `ProjectDetailPage`
- ✅ Integrate with `approvals` and `documents`

### Phase 3: Wave 2 (Engineering + Planning)
- ✅ Build `waves/wave-2/engineering/`
- ✅ Build `waves/wave-2/planning/`
- ✅ Add “BOM” and “Work Orders” tabs

### Phase 4: Wave 3 (Procurement + Quality + Shipping)
- ✅ Build `waves/wave-3/procurement/`
- ✅ Build `waves/wave-3/quality/`
- ✅ Build `waves/wave-3/shipping/`
- ✅ Add “Quality” and “Shipping” tabs

---

## ✅ **Benefits of This Architecture**

| Benefit                  | How It’s Achieved                                                       |
| ------------------------ | ----------------------------------------------------------------------- |
| **Scalability**          | Waves are independent — add new waves without touching old ones         |
| **Maintainability**      | Each module is self-contained — easy to debug, test, refactor           |
| **Team Ownership**       | Assign teams to waves or features — clear boundaries                    |
| **Incremental Delivery** | Deploy Wave 1 without Wave 2 or 3 — low risk, fast feedback             |
| **Audit & Compliance**   | Centralized `core/activity-log/` and `core/approvals/` — ISO 9001 ready |
| **Reusability**          | `features/costing-engine/` used in Wave 1 and Wave 3 — no duplication   |

---
