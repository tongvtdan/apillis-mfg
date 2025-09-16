# Supplier Management Components

This directory contains React components for managing suppliers, their qualifications, and RFQ distribution in the Factory Pulse application.

## Components

### 1. SupplierTable.tsx

Enhanced supplier table with qualification status display and actions.

**Features:**
- Displays supplier information with contact details and specialties
- Shows performance metrics (rating, response rate, turnaround time)
- Displays qualification status with color-coded badges
- Actions dropdown with options for viewing details, qualification, sending RFQs, editing, archiving, and final approval

### 2. SupplierQualificationProgress.tsx

Component for displaying supplier qualification progress based on Section 7.2 of the Supplier Management & RFQ Engine requirements.

**Features:**
- Shows supplier qualification status with expiration date
- Displays qualification steps with completion status
- Shows documents uploaded by the supplier
- Provides actions for re-qualifying, viewing profile, sending RFQs, blocking supplier, and exporting reports
- Handles special cases for suppliers qualified with conditions or as exceptions

### 3. FinalApprovalModal.tsx

Modal component for final supplier qualification approval based on Section 7.3 of the Supplier Management & RFQ Engine requirements.

**Features:**
- Radio group for selecting approval decision (Approve, Approve with Conditions, Approve as Exception, Reject)
- Conditional fields based on selected decision type
- Preview of supplier status based on selected decision
- Form validation and submission handling

### 4. RFQDistributionModal.tsx

Modal component for distributing RFQs to qualified suppliers.

**Features:**
- Supplier selection with filtering by specialties
- Only shows qualified suppliers (blocks unqualified suppliers)
- RFQ details form (due date, priority, requirements, special instructions)
- Preview of RFQ bundle contents
- Selected suppliers summary with removal option

## Integration

These components are integrated into the main Suppliers page (`src/pages/Suppliers.tsx`) with:

1. Enhanced supplier statistics including qualification metrics
2. New "Qualification" tab for managing supplier qualification processes
3. Updated supplier table with qualification status and actions

## Usage

The components are designed to work with the existing supplier data model and can be easily integrated into other parts of the application.

### Example Usage in Suppliers Page

```tsx
import { SupplierTable } from '@/components/supplier/SupplierTable';
import { SupplierQualificationProgress } from '@/components/supplier/SupplierQualificationProgress';
import { FinalApprovalModal } from '@/components/supplier/FinalApprovalModal';
import { RFQDistributionModal } from '@/components/supplier/RFQDistributionModal';

// In your component:
<SupplierTable
  suppliers={suppliers}
  onSupplierSelect={handleSupplierSelect}
  onSupplierEdit={handleEdit}
  canArchive={canManageSuppliers}
/>
```

## Data Model

The components expect supplier data with the following qualification-related properties:

- `qualificationStatus`: 'not_started' | 'in_progress' | 'pending_approval' | 'qualified' | 'qualified_with_conditions' | 'qualified_as_exception' | 'rejected' | 'expired'
- `qualificationExpiry`: string (expiration date)
- `qualificationConditions`: string (conditions for partial approval)
- `qualificationExceptionJustification`: string (justification for exception approval)
- `qualificationExceptionExpiresAt`: string (exception expiration date)

## Styling

All components use the existing UI component library (shadcn/ui) and follow the application's design system.