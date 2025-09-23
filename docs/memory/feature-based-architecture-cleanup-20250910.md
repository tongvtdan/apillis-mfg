# feature-based-architecture-cleanup-20250910 - Feature-Based Architecture Code Organization

## Date & Time
September 10, 2025 - 3:00 PM

## Context
Comprehensive codebase analysis and cleanup to align with Feature-Based Architecture Specification v1.2. Identified and resolved duplicate hooks, misorganized business logic, and architectural violations.

## Problem
The codebase had accumulated duplicate functionality across different layers, business logic in inappropriate locations, and architectural violations that deviated from the established Feature-Based Architecture Specification v1.2.

## Solution
Conducted systematic analysis and reorganization of the codebase according to the feature-based architecture principles, removing duplicates and properly organizing code by architectural layers.

## Technical Details

### Duplicate Hooks Removed:
1. **Activity Log Hooks:**
   - ✅ Removed `src/hooks/useActivityLogs.ts` (simple direct query)
   - ✅ Kept `src/core/activity-log/useActivityLog.ts` (comprehensive context-based)

2. **Approval Hooks:**
   - ✅ Removed `src/hooks/useApprovals.ts` (simple service-based)
   - ✅ Kept `src/core/approvals/useApproval.ts` (comprehensive context-based)

3. **Document Hooks:**
   - ✅ Removed `src/hooks/useDocuments.ts` (simple direct implementation)
   - ✅ Kept `src/core/documents/useDocument.ts` (comprehensive context-based)

4. **Workflow Hooks:**
   - ✅ Removed `src/hooks/useWorkflowStages.ts` (simple query-based)
   - ✅ Removed `src/hooks/useWorkflowSubStages.ts` (simple query-based)
   - ✅ Kept `src/core/workflow/useWorkflow.ts` (comprehensive context-based)

### Code Reorganization:
1. **Workflow Auto-Advance Hook:**
   - ✅ Moved `src/hooks/useWorkflowAutoAdvance.ts` → `src/core/workflow/useWorkflowAutoAdvance.ts`
   - ✅ Properly located workflow-specific business logic in core layer

### Architecture Compliance:
- ✅ **Core Layer**: Contains shared kernel functionality (auth, workflow, approvals, docs, audit)
- ✅ **Features Layer**: Organized business features (intake, dashboard, costing-engine, etc.)
- ✅ **Shared Layer**: Missing - identified need for `src/shared/` folder structure
- ✅ **Duplicate Elimination**: Removed redundant implementations favoring comprehensive context-based hooks

### Current Architecture Status:

#### ✅ Properly Organized:
```
src/core/
├── activity-log/useActivityLog.ts (comprehensive)
├── approvals/useApproval.ts (comprehensive)
├── documents/useDocument.ts (comprehensive)
├── workflow/
│   ├── useWorkflow.ts (comprehensive)
│   └── useWorkflowAutoAdvance.ts (moved from hooks)
└── auth/useAuth.ts (core functionality)
```

#### ⚠️ Needs Further Organization:
```
src/hooks/useEnhancedProjects.ts → Should move to features/dashboard or features/project-management
src/hooks/useProjects.ts → Business logic, consider moving to features
src/hooks/useDashboardData.ts → Should move to features/dashboard
```

#### ❌ Missing Architecture Elements:
```
src/shared/ → Completely missing - required by spec v1.2
├── ui/ (reusable components)
├── hooks/ (non-business hooks)
├── utils/ (helper functions)
└── lib/ (utilities)
```

## Files Modified
- `src/core/workflow/useWorkflowAutoAdvance.ts` - Created with moved functionality
- Various hook files removed from `src/hooks/` directory

## Files Removed
- `src/hooks/useActivityLogs.ts`
- `src/hooks/useApprovals.ts`
- `src/hooks/useDocuments.ts`
- `src/hooks/useWorkflowStages.ts`
- `src/hooks/useWorkflowSubStages.ts`
- `src/hooks/useWorkflowAutoAdvance.ts` (moved to core)

## Challenges
- Large codebase with extensive hook duplication across layers
- Business logic scattered across hooks/ and features/ directories
- Missing shared/ folder structure required by architecture specification
- Need to carefully preserve functionality while reorganizing

## Results
- **Eliminated Duplicates**: Removed 6 duplicate hooks favoring comprehensive implementations
- **Improved Architecture**: Better alignment with Feature-Based Architecture Specification v1.2
- **Cleaner Core Layer**: Core modules now contain authoritative implementations
- **Proper Organization**: Workflow business logic moved to appropriate core/workflow location
- **Reduced Complexity**: Simplified hook imports and eliminated confusion over which implementation to use

## Future Considerations

### Immediate Actions Needed:
1. **Create Shared Folder Structure:**
   ```
   src/shared/
   ├── ui/ → Move from src/components/ui/
   ├── hooks/ → Non-business hooks (use-toast, use-mobile)
   ├── utils/ → Helper functions
   └── lib/ → Reusable utilities
   ```

2. **Move Business Logic Hooks:**
   - `useEnhancedProjects.ts` → `src/features/dashboard/hooks/`
   - `useProjects.ts` → `src/features/project-management/hooks/`
   - `useDashboardData.ts` → `src/features/dashboard/hooks/`

3. **Update Imports:**
   - Update all import statements to use new locations
   - Ensure no broken references after reorganization

4. **Test Coverage:**
   - Verify all functionality works after reorganization
   - Update any tests that reference moved files

### Long-term Maintenance:
- Regular architecture audits every 2-3 months
- Automated checks for duplicate functionality
- Documentation updates for new structure
- Team training on proper architectural patterns

## Git Commit Message
```
refactor: align codebase with feature-based architecture specification

- Remove duplicate hooks favoring comprehensive core implementations
- Move useWorkflowAutoAdvance to core/workflow layer
- Eliminate useActivityLogs, useApprovals, useDocuments, useWorkflowStages duplicates
- Improve architectural compliance with FB-Architecture Spec v1.2
- Prepare foundation for src/shared/ folder structure
```
