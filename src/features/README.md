# 🎯 Features Layer

This directory contains **user-facing business capabilities** that are used across multiple waves. These features are **not tied to delivery phases** and represent core business functionality.

## 📁 Structure

```
src/features/
├── intake/                       → Available from Day 1 (pre-Wave 1)
│   ├── components/
│   │   ├── IntakeForm.tsx
│   │   ├── sections/            → Form sections
│   │   └── IntakeWizard.tsx     → Multi-step wizard
│   ├── hooks/
│   │   ├── useIntakeForm.ts     → Form state management
│   │   └── useIntakeValidation.ts → Validation logic
│   ├── services/
│   │   └── intakeService.ts     → Business logic
│   ├── types/
│   │   └── intake.types.ts      → Feature-specific types
│   ├── validations/
│   │   └── intakeSchema.ts      → Zod validation schemas
│   └── index.ts                 → Public API exports

├── engineering-review/           → Used in Qualification stage
│   ├── components/
│   │   └── EngineeringReviewForm.tsx
│   └── services/
│       └── reviewService.ts

├── costing-engine/               → Used in Wave 1 & 3
│   ├── hooks/
│   │   └── useCostSimulator.ts
│   └── components/
│       └── MarginSlider.tsx

├── supplier-management/          → Used in Wave 1 & 3
│   └── components/
│       └── SupplierSelector.tsx

├── dashboard/                    → Always available
│   └── components/
│       └── KanbanBoard.tsx

└── reporting/                    → Always available
    └── components/
        └── WinLossChart.tsx
```

## 🔧 Architecture Principles

### **Feature Independence**
- Features can be developed, tested, and deployed independently
- No cross-feature imports (use core modules instead)
- Features consume core services, don't duplicate them

### **Core Dependencies**
Features depend on core modules for:
- **Auth**: User context, permissions
- **Workflow**: Stage management, transitions
- **Approvals**: Approval workflows
- **Documents**: File management, versions
- **Activity Log**: Audit trails

### **Data Flow**
```
Feature Components → Feature Hooks → Feature Services → Core Modules → Database
```

### **Testing Strategy**
- **Unit Tests**: Individual components and hooks
- **Integration Tests**: Feature-to-core communication
- **E2E Tests**: Complete user workflows

## 🚀 Development Guidelines

### **Adding a New Feature**
1. Create feature directory structure
2. Define types and validation schemas
3. Implement services using core modules
4. Create hooks for state management
5. Build components using core UI modules
6. Export public API in index.ts
7. Add feature to app routing

### **Feature Boundaries**
- Keep features focused on specific business capabilities
- Use composition over inheritance
- Prefer hooks over complex state management
- Document feature APIs clearly

## 📊 Current Features Status

| Feature             | Status      | Priority | Dependencies              |
| ------------------- | ----------- | -------- | ------------------------- |
| Intake              | ✅ Completed | Critical | Auth, Workflow, Documents |
| Engineering Review  | ✅ Completed | High     | Approvals, Documents      |
| Costing Engine      | ✅ Completed | High     | Auth, Workflow            |
| Supplier Management | ✅ Completed | Medium   | Auth, Workflow            |
| Customer Management | ✅ Completed | High     | Auth, Workflow            |
| Dashboard           | ✅ Completed | Medium   | All Core Modules          |
| Reporting           | 🔄 Planned   | Low      | Auth, Activity Log        |
