# Manual Testing Guide - Project Creation Workflow

## Overview
This guide provides step-by-step instructions for manually testing the project creation workflow to ensure all data is stored correctly in the database.

## Prerequisites
1. ✅ Supabase local instance running (`supabase status`)
2. ✅ Development server running (`npm run dev` on port 8080)
3. ✅ Database seeded with workflow stages
4. ✅ Browser access to http://localhost:8080

## Test Scenario: Complete Project Creation Flow

### Step 1: Access Application
```
URL: http://localhost:8080
Expected: Application loads successfully
```

### Step 2: Navigate to Projects
```
1. Click on "Projects" in the navigation
2. Verify projects list loads
3. Check existing projects are displayed
Expected: Projects page loads with existing data
```

### Step 3: Start Project Creation
```
1. Click "New Project" button
2. Verify redirect to `/projects/new`
3. Confirm ProjectIntakePortal loads
Expected: Project creation form displays
```

### Step 4: Select Intake Type
```
1. Choose "RFQ" from intake type options
2. Verify form updates for RFQ-specific fields
Expected: Form adapts to selected intake type
```

### Step 5: Enter Project Information
```
Project Title: "Manual Test Project - Manufacturing Components"
Description: "Comprehensive test of the project creation workflow"
Priority: High
Target Price Per Unit: 75.00
Desired Delivery Date: Select date 45 days from today
```

### Step 6: Customer Information
```
Option 1: Create New Customer
- Company Name: "TestCorp Manufacturing Inc"
- Contact Name: "Sarah Johnson"
- Email: "sarah.johnson@testcorp.com"
- Phone: "+1-555-TEST"
- Country: "United States"

Option 2: Use Existing Customer
- Search for existing customer
- Select from dropdown
```

### Step 7: Volume Specifications
```
Quantity: 2500
Unit: pcs
Frequency: per year
```

### Step 8: Document Upload
```
Upload at least 2 files:
1. Drawing file (PDF/DWG)
2. BOM file (Excel/CSV)

Note: Files will be validated for type and size
```

### Step 9: Additional Information
```
Notes: "Manual testing of complete project creation workflow"
Terms Agreement: Check the agreement checkbox
```

### Step 10: Submit Project
```
1. Click "Submit RFQ" button
2. Wait for processing (should show loading state)
3. Verify success message appears
4. Confirm redirect to projects list
5. Check new project appears in the list
```

## Database Verification Queries

### Verify Project Creation
```sql
SELECT
    id,
    project_id,
    title,
    customer_organization_id,
    point_of_contacts,
    current_stage_id,
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
WHERE title LIKE '%Manual Test Project%'
ORDER BY created_at DESC
LIMIT 1;
```

### Verify Customer Creation (if new)
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
WHERE company_name = 'TestCorp Manufacturing Inc'
ORDER BY created_at DESC
LIMIT 1;
```

### Verify Workflow Assignment
```sql
SELECT
    p.id,
    p.project_id,
    p.title,
    ws.name as current_stage,
    ws.stage_order,
    p.stage_entered_at
FROM projects p
LEFT JOIN workflow_stages ws ON p.current_stage_id = ws.id
WHERE p.title LIKE '%Manual Test Project%';
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
WHERE p.title LIKE '%Manual Test Project%';
```

### Verify Documents (if uploaded)
```sql
SELECT
    d.id,
    d.file_name,
    d.title,
    d.file_type,
    d.file_size,
    d.created_at,
    d.uploaded_by
FROM documents d
WHERE d.project_id = (
    SELECT id FROM projects
    WHERE title LIKE '%Manual Test Project%'
    ORDER BY created_at DESC
    LIMIT 1
);
```

## Expected Results Verification

### ✅ Project Record Validation
- [ ] `project_id`: Auto-generated (format: P-YYYYMMDDXXX)
- [ ] `title`: "Manual Test Project - Manufacturing Components"
- [ ] `customer_organization_id`: References created/found customer
- [ ] `point_of_contacts`: Array with customer ID
- [ ] `status`: "active"
- [ ] `priority_level`: "high"
- [ ] `intake_type`: "rfq"
- [ ] `intake_source`: "portal"
- [ ] `estimated_value`: 187500 (2500 * 75)
- [ ] `estimated_delivery_date`: Selected date
- [ ] `volume`: JSON with volume specifications
- [ ] `target_price_per_unit`: 75.00
- [ ] `desired_delivery_date`: Selected date
- [ ] `tags`: ["rfq", "fabrication"]
- [ ] `notes`: Provided test notes
- [ ] `current_stage_id`: References "Inquiry Received" stage

### ✅ Customer Record Validation (if new)
- [ ] `company_name`: "TestCorp Manufacturing Inc"
- [ ] `contact_name`: "Sarah Johnson"
- [ ] `email`: "sarah.johnson@testcorp.com"
- [ ] `phone`: "+1-555-TEST"
- [ ] `country`: "United States"
- [ ] `organization_id`: Current user's organization

### ✅ Workflow Integration Validation
- [ ] Project assigned to correct initial stage
- [ ] Sub-stage progress initialized automatically
- [ ] Stage history logged
- [ ] Activity log entries created

### ✅ Document Management Validation
- [ ] Files uploaded successfully
- [ ] Document records created in database
- [ ] File metadata stored correctly
- [ ] Document relationships established

## Troubleshooting

### Common Issues & Solutions

#### Issue: Form not loading
```
Solution:
1. Check browser console for errors
2. Verify Supabase connection
3. Check user authentication
4. Clear browser cache
```

#### Issue: Project creation fails
```
Solution:
1. Verify all required fields filled
2. Check form validation errors
3. Verify customer creation/selection
4. Check database connection
```

#### Issue: Files not uploading
```
Solution:
1. Check file type restrictions
2. Verify file size limits
3. Check Supabase storage configuration
4. Verify upload permissions
```

#### Issue: Database errors
```
Solution:
1. Check Supabase local status
2. Verify database migrations
3. Check RLS policies
4. Review database logs
```

## Performance Validation

### Response Times
- [ ] Page load: < 3 seconds
- [ ] Form submission: < 5 seconds
- [ ] File upload: < 10 seconds
- [ ] Database queries: < 2 seconds

### Functionality Checks
- [ ] Form validation works correctly
- [ ] Real-time updates functional
- [ ] Error handling graceful
- [ ] Navigation smooth
- [ ] Data persistence accurate

## Success Criteria

### ✅ Functional Completeness
- [ ] All form fields captured and validated
- [ ] Customer creation/selection works
- [ ] Documents uploaded successfully
- [ ] Project created with correct relationships
- [ ] Workflow stage assigned properly
- [ ] Database records complete and accurate

### ✅ Data Integrity
- [ ] All required fields populated
- [ ] Foreign key constraints satisfied
- [ ] Data types correct
- [ ] Relationships established
- [ ] Audit trail complete

### ✅ User Experience
- [ ] Form intuitive and responsive
- [ ] Validation messages clear
- [ ] Loading states appropriate
- [ ] Success feedback informative
- [ ] Error recovery user-friendly

## Test Completion Checklist

### Pre-Test Setup
- [ ] Supabase running
- [ ] Dev server running
- [ ] Browser cache cleared
- [ ] Test data prepared

### Test Execution
- [ ] Navigate through creation flow
- [ ] Fill all form fields
- [ ] Upload test documents
- [ ] Submit project
- [ ] Verify success
- [ ] Check database records
- [ ] Validate relationships

### Post-Test Validation
- [ ] Project appears in list
- [ ] Project detail accessible
- [ ] Workflow functional
- [ ] No console errors
- [ ] Performance acceptable

---

## Summary Report Template

After completing the manual test, create a summary:

### Test Results Summary
```
Date: YYYY-MM-DD
Tester: [Name]
Environment: Local Development
Browser: [Chrome/Firefox/Safari]

✅ PASSED / ❌ FAILED

Issues Found:
1. [Issue description and resolution]

Recommendations:
1. [Any improvements or fixes needed]

Next Steps:
1. [Deployment readiness or additional testing needed]
```

This manual testing guide ensures comprehensive validation of the project creation workflow and data storage integrity.

