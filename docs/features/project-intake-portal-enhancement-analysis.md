# Project Intake Portal Enhancement Analysis

## Overview

Based on the wireframe requirements in `docs/features/Wireframe-design/01. Inquiry-Intake-form.md` and analysis of the current codebase, this document outlines the necessary improvements to align the project intake portal with the comprehensive wireframe specifications.

## Current State Analysis

### ✅ **Already Implemented**

1. **Database Schema**:
   - `intake_type` enum with values: `'rfq'`, `'purchase_order'`, `'project_idea'`, `'direct_request'`
   - `intake_source` field in projects table
   - Documents table supports external links and file uploads
   - Contacts table has all required fields (name, email, phone, country, etc.)

2. **Current Components**:
   - `ProjectIntakePortal.tsx` - Main portal with tabs for RFQ, PO, Project Idea
   - `InquiryIntakeForm.tsx` - Basic form without file uploads
   - Intake mapping service for routing different types to workflows
   - Project creation service with intake type handling

### ❌ **Missing from Wireframe Requirements**

## Database Schema Gaps

### 1. Intake Type Enum Mismatch
**Current**: `'rfq'`, `'purchase_order'`, `'project_idea'`, `'direct_request'`
**Wireframe**: `'inquiry'`, `'rfq'`, `'po'`, `'design_idea'`

**Action Required**: Update enum to match wireframe values

### 2. Missing Project Fields
**Wireframe requires**:
- `volume` (JSONB) - Multi-tier volumes with quantity, unit, frequency
- `target_price_per_unit` (NUMERIC) - Target price per unit
- `project_reference` (TEXT) - For PO types only
- `desired_delivery_date` (DATE) - Target delivery date

**Current projects table has**:
- `estimated_value` (total project value)
- `estimated_delivery_date` (project delivery date)

**Action Required**: Add missing fields to projects table

## Form Implementation Gaps

### 1. Volume/Quantity Fields
**Wireframe shows**:
```
Estimated Volume*        
  ┌─────────────┬─────────────────┬──────────────────┐
  │ Quantity    │ Unit            │ Frequency        │
  ├─────────────┼─────────────────┼──────────────────┤
  │ [ 5,000 ]   │ [ pcs ]         │ [ per year ▼ ]   │
  └─────────────┴─────────────────┴──────────────────┘
```

**Current**: Not implemented
**Action Required**: Add volume fields with units and frequency selection

### 2. File Upload & External Links
**Wireframe shows**:
- File upload with drag & drop
- External link input for cloud storage (Google Drive, Dropbox, etc.)
- File type validation
- Link validation

**Current**: Basic form without file handling
**Action Required**: Implement comprehensive file/link upload system

### 3. Role-Based Behavior
**Wireframe shows**:
- Customer vs Sales Rep submission options
- Different form behavior based on role
- Customer selector for Sales Rep submissions

**Current**: Single form for all users
**Action Required**: Add role-based form behavior

### 4. Project Reference Field
**Wireframe shows**:
- Project Reference field (only shown for PO type)
- Format: `PO-2025-TECHNOVA-001`

**Current**: Not implemented
**Action Required**: Add conditional project reference field

### 5. Terms & Conditions
**Wireframe shows**:
- Terms acceptance checkbox
- Privacy policy link

**Current**: Not implemented
**Action Required**: Add terms acceptance

## UI/UX Improvements Needed

### 1. Form Layout
**Current**: Basic card layout
**Wireframe**: Comprehensive sections with proper visual hierarchy

### 2. Validation & Feedback
**Current**: Basic Zod validation
**Wireframe**: Comprehensive validation with real-time feedback

### 3. Save as Draft
**Current**: Not implemented
**Wireframe**: Save as draft functionality with 30-day TTL

### 4. Mobile Responsiveness
**Current**: Basic responsive design
**Wireframe**: Mobile-optimized layout

## Implementation Plan

### Phase 1: Database Schema Updates
1. **Update intake_type enum**:
   ```sql
   ALTER TYPE intake_type ADD VALUE 'inquiry';
   ALTER TYPE intake_type RENAME VALUE 'purchase_order' TO 'po';
   ALTER TYPE intake_type RENAME VALUE 'project_idea' TO 'design_idea';
   ```

2. **Add missing fields to projects table**:
   ```sql
   ALTER TABLE projects ADD COLUMN volume JSONB;
   ALTER TABLE projects ADD COLUMN target_price_per_unit NUMERIC(15,2);
   ALTER TABLE projects ADD COLUMN project_reference TEXT;
   ALTER TABLE projects ADD COLUMN desired_delivery_date DATE;
   ```

### Phase 2: Enhanced Form Component
1. **Replace InquiryIntakeForm** with comprehensive form
2. **Add volume fields** with units and frequency
3. **Add file upload zone** with drag & drop
4. **Add external link input** with validation
5. **Add role-based behavior** (Customer vs Sales Rep)
6. **Add terms acceptance**

### Phase 3: Integration Updates
1. **Update ProjectIntakeService** to handle new fields
2. **Update intake mapping** for new intake types
3. **Add document upload/link handling**
4. **Add email confirmation system**

### Phase 4: UI/UX Polish
1. **Add form progress indicators**
2. **Add save as draft functionality**
3. **Improve mobile responsiveness**
4. **Add comprehensive error handling**

## Questions for Approval

1. **Database Changes**: Should I proceed with the database schema updates?
2. **Intake Type Values**: Should I update the enum to match wireframe exactly?
3. **Form Replacement**: Should I replace InquiryIntakeForm or enhance it?
4. **File Upload**: Should I implement the full file upload system or start with link-only?
5. **Priority**: Which phase should I start with?

## Estimated Effort

- **Database Schema**: 2-3 hours
- **Enhanced Form**: 8-10 hours
- **Integration Updates**: 4-6 hours
- **UI/UX Polish**: 4-6 hours
- **Testing & Validation**: 4-6 hours

**Total Estimated Effort**: 22-31 hours

## Next Steps

1. **Get approval** for database schema changes
2. **Start with Phase 1** (Database Schema Updates)
3. **Create enhanced form component** based on wireframe
4. **Update integration services**
5. **Add UI/UX improvements**
6. **Test and validate** complete implementation
