# Archive Functionality Implementation

## Overview
Implemented comprehensive archive/unarchive functionality for both customers and suppliers in the Factory Pulse application. This replaces hard delete operations with soft delete functionality to preserve data integrity and allow reactivation.

## Implementation Details

### Core Concept
- **Archive**: Sets `is_active = false` (soft delete)
- **Unarchive/Reactivate**: Sets `is_active = true`
- **Delete**: Still available for permanent removal (hard delete)

### Customer Archive Implementation

#### Modified Files:
- `src/hooks/useCustomers.ts` - Added `archiveCustomer()` and `unarchiveCustomer()` functions
- `src/components/customer/CustomerTable.tsx` - Replaced delete with archive action
- `src/pages/Customers.tsx` - Added "Show Archived" toggle and updated statistics

#### Key Features:
- Archive customers instead of deleting them permanently
- Toggle to view active vs archived customers separately
- Updated statistics cards to reflect current view
- Orange-colored archive action in dropdown menu
- Toast notifications for archive/unarchive actions

### Supplier Archive Implementation

#### Modified Files:
- `src/hooks/useSuppliers.ts` - Added `archiveSupplier()` and `unarchiveSupplier()` functions
- `src/components/supplier/SupplierTable.tsx` - Replaced delete with archive action
- `src/pages/Suppliers.tsx` - Added "Show Archived" toggle and updated statistics

#### Key Features:
- Archive suppliers (both organization and associated contacts)
- Toggle to view active vs archived suppliers separately
- Maintains referential integrity by archiving all related contacts
- Updated statistics cards to reflect current view
- Orange-colored archive action in dropdown menu
- Toast notifications for archive/unarchive actions

## Benefits

### Data Preservation
- Historical data maintained for auditing and reactivation
- No loss of customer/supplier relationships with projects
- Maintains data integrity for reporting and analytics

### User Experience
- One-click reactivation of archived items
- Clean separation between active and archived items
- Intuitive toggle switches for view switching
- Clear visual indicators (orange archive buttons)

### Business Value
- Recover accidentally archived items
- Maintain historical supplier/customer relationships
- Support compliance and audit requirements
- Flexible workflow management

## Usage Instructions

### For Customers:
1. Navigate to `/customers` page
2. Use "Show Archived" toggle to switch between active/archived views
3. Click ⋮ menu on any customer → "Archive" to archive
4. In archived view, reactivate customers as needed

### For Suppliers:
1. Navigate to `/suppliers` page
2. Use "Show Archived" toggle to switch between active/archived views
3. Click ⋮ menu on any supplier → "Archive" to archive
4. In archived view, reactivate suppliers as needed

## Database Impact
- Uses existing `is_active` boolean field in `contacts` and `organizations` tables
- No schema changes required
- Maintains all existing relationships and data integrity
- Supports both active and archived queries efficiently

## Technical Notes
- Archive operations update both organization and contact records for suppliers
- Real-time updates maintained through existing Supabase subscriptions
- Error handling with user-friendly toast notifications
- Form validation preserved for all operations

## Future Enhancements
- Bulk archive/unarchive operations
- Archive reasons/notes tracking
- Automated archive policies (time-based)
- Archive search and filtering improvements

## Implementation Date
December 2024

## Commit Reference
`feat: Implement archive/unarchive functionality for customers and suppliers`
