# Project Creation Test Script

## Test Overview
This script tests the complete project creation workflow to ensure all data is stored correctly in the database.

## Prerequisites
1. Supabase local instance running
2. Database seeded with workflow stages
3. User authenticated with organization context

## Test Steps

### Step 1: Access Project Creation Page
```bash
# Navigate to http://localhost:8080/projects/new
# Verify page loads with ProjectIntakePortal component
```

### Step 2: Fill Basic Project Information
**Form Fields to Test:**
- [ ] Project Title: "Test Manufacturing Project"
- [ ] Description: "A comprehensive test project for manufacturing workflow"
- [ ] Intake Type: RFQ (Request for Quotation)
- [ ] Priority: High
- [ ] Target Price Per Unit: 150.00
- [ ] Desired Delivery Date: 2025-02-15 (30 days from now)

### Step 3: Customer Information
**Test Case 3.1: New Customer Creation**
- [ ] Company Name: "Test Manufacturing Corp"
- [ ] Contact Name: "John Smith"
- [ ] Email: "john.smith@testcorp.com"
- [ ] Phone: "+1-555-0123"
- [ ] Country: "United States"

**Test Case 3.2: Existing Customer Selection**
- [ ] Search for existing customers
- [ ] Select customer from dropdown
- [ ] Verify auto-population of fields

### Step 4: Volume Specifications
**Volume Entry:**
- [ ] Quantity: 1000
- [ ] Unit: pcs
- [ ] Frequency: per year

### Step 5: Document Upload
**Document Requirements:**
- [ ] Drawing: Upload test_drawing.pdf
- [ ] BOM: Upload test_bom.xlsx
- [ ] Additional documents: Upload test_specs.pdf

### Step 6: Additional Information
**Fields:**
- [ ] Notes: "This is a test project for workflow validation"
- [ ] Terms Agreement: Checked

### Step 7: Form Submission
**Submission Process:**
- [ ] Click "Submit RFQ" button
- [ ] Verify loading state
- [ ] Check success message
- [ ] Confirm redirect to projects list

## Database Verification Queries

### Verify Project Creation
```sql
SELECT
    id,
    project_id,
    title,
    description,
    customer_organization_id,
    point_of_contacts,
    status,
    priority_level,
    intake_type,
    intake_source,
    estimated_value,
    estimated_delivery_date,
    volume,
    target_price_per_unit,
    desired_delivery_date,
    tags,
    notes,
    created_at
FROM projects
WHERE title = 'Test Manufacturing Project'
ORDER BY created_at DESC
LIMIT 1;
```

### Verify Customer Creation
```sql
SELECT
    id,
    company_name,
    contact_name,
    email,
    phone,
    country,
    created_at
FROM contacts
WHERE company_name = 'Test Manufacturing Corp'
ORDER BY created_at DESC
LIMIT 1;
```

### Verify Workflow Stage Assignment
```sql
SELECT
    p.id,
    p.project_id,
    p.title,
    p.current_stage_id,
    ws.name as stage_name,
    ws.stage_order,
    p.stage_entered_at
FROM projects p
LEFT JOIN workflow_stages ws ON p.current_stage_id = ws.id
WHERE p.title = 'Test Manufacturing Project';
```

### Verify Point of Contacts
```sql
SELECT
    p.id,
    p.project_id,
    p.title,
    p.point_of_contacts,
    c.company_name,
    c.contact_name,
    c.email
FROM projects p
LEFT JOIN contacts c ON c.id = ANY(p.point_of_contacts)
WHERE p.title = 'Test Manufacturing Project';
```

### Verify Volume Data
```sql
SELECT
    id,
    project_id,
    title,
    volume,
    target_price_per_unit,
    desired_delivery_date
FROM projects
WHERE title = 'Test Manufacturing Project';
```

## Expected Results

### Project Record
- ✅ `project_id`: Auto-generated (format: P-YYYYMMDDXXX)
- ✅ `title`: "Test Manufacturing Project"
- ✅ `description`: Test description provided
- ✅ `customer_organization_id`: References created/found customer
- ✅ `point_of_contacts`: Array with customer ID
- ✅ `status`: "active"
- ✅ `priority_level`: "high"
- ✅ `intake_type`: "rfq"
- ✅ `intake_source`: "portal"
- ✅ `estimated_value`: 150000 (1000 * 150)
- ✅ `estimated_delivery_date`: "2025-02-15"
- ✅ `volume`: JSON string with volume specifications
- ✅ `target_price_per_unit`: 150.00
- ✅ `desired_delivery_date`: "2025-02-15"
- ✅ `tags`: ["rfq", "fabrication"]
- ✅ `notes`: Test notes provided
- ✅ `current_stage_id`: References "Inquiry Received" stage
- ✅ `stage_entered_at`: Current timestamp

### Customer Record (if new)
- ✅ `company_name`: "Test Manufacturing Corp"
- ✅ `contact_name`: "John Smith"
- ✅ `email`: "john.smith@testcorp.com"
- ✅ `phone`: "+1-555-0123"
- ✅ `country`: "United States"
- ✅ `organization_id`: Current user's organization

### Workflow Integration
- ✅ Project assigned to correct initial stage
- ✅ Sub-stage progress initialized
- ✅ Stage history logged
- ✅ Activity log entries created

## Error Scenarios to Test

### 1. Missing Required Fields
- [ ] Empty project title
- [ ] Missing customer information
- [ ] No documents uploaded
- [ ] Terms not agreed

### 2. Invalid Data
- [ ] Invalid email format
- [ ] Past delivery date
- [ ] Negative quantities
- [ ] Invalid file types

### 3. Database Constraints
- [ ] Duplicate project ID (should be auto-generated)
- [ ] Invalid foreign key references
- [ ] Data type violations

## Performance Validation

### Response Times
- [ ] Page load: < 3 seconds
- [ ] Form submission: < 5 seconds
- [ ] Database queries: < 2 seconds
- [ ] File uploads: < 10 seconds

### Memory Usage
- [ ] Form state: < 50MB
- [ ] File handling: < 100MB
- [ ] Component rendering: < 25MB

## Success Criteria

### ✅ Functional Requirements
- [ ] All form fields captured and stored
- [ ] Customer creation/selection works
- [ ] Workflow stage assignment correct
- [ ] Document uploads processed
- [ ] Volume calculations accurate
- [ ] Database relationships maintained

### ✅ Data Integrity
- [ ] All required fields populated
- [ ] Foreign key constraints satisfied
- [ ] Data types correct
- [ ] JSON fields properly formatted
- [ ] Timestamps accurate

### ✅ User Experience
- [ ] Form validation clear and helpful
- [ ] Loading states appropriate
- [ ] Success/error messages informative
- [ ] Navigation smooth and intuitive

## Test Execution Checklist

### Pre-Test Setup
- [ ] Supabase local running
- [ ] Database seeded
- [ ] User authenticated
- [ ] Browser cache cleared

### Test Execution
- [ ] Navigate to creation page
- [ ] Fill all form fields
- [ ] Upload test documents
- [ ] Submit form
- [ ] Verify success message
- [ ] Check database records
- [ ] Validate relationships

### Post-Test Validation
- [ ] Project appears in list
- [ ] Project detail accessible
- [ ] Workflow functional
- [ ] No console errors
- [ ] Performance acceptable

## Troubleshooting

### Common Issues
1. **Organization ID missing**: Ensure user has organization context
2. **Customer creation fails**: Check database permissions
3. **Stage assignment fails**: Verify workflow stages exist
4. **File upload fails**: Check Supabase storage configuration
5. **Form validation errors**: Verify Zod schema matches form fields

### Debug Queries
```sql
-- Check recent projects
SELECT project_id, title, created_at FROM projects ORDER BY created_at DESC LIMIT 5;

-- Check customer creation
SELECT company_name, contact_name, created_at FROM contacts ORDER BY created_at DESC LIMIT 5;

-- Check workflow stages
SELECT name, slug, stage_order FROM workflow_stages ORDER BY stage_order;

-- Check user organization
SELECT u.email, o.name as organization_name FROM users u JOIN organizations o ON u.organization_id = o.id;
```

---

**This test script ensures comprehensive validation of the project creation workflow and data storage integrity.**
