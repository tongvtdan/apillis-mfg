# Schema Mismatch Report

Generated on: 2025-08-30T00:48:06.485Z

## Summary

- 🔴 Critical: 0
- 🟠 High: 5
- 🟡 Medium: 25
- 🟢 Low: 2

## 🟠 HIGH Issues

### 1. MISSING PROPERTY

**Message:** Database column 'CHECK' not found in TypeScript interface 'Project'

**Details:**
- Table: `projects`
- Interface: `Project`
- Column: `CHECK`
- Database Type: `(priority_level`

---

### 2. TYPE MISMATCH ✅ RESOLVED

**Message:** Type mismatch for 'status': DB type 'VARCHAR(20)' should map to one of [string], but found 'ProjectStatus'

**Details:**
- Table: `projects`
- Interface: `Project`
- Column: `status`
- Database Type: `VARCHAR(20)`
- TypeScript Type: `ProjectStatus`
- Expected TS Types: `string`

**Resolution (2025-01-30):**
- ✅ Fixed Projects page type system alignment
- ✅ Clarified `ProjectStatus` vs `ProjectStage` usage
- ✅ Updated function signatures to match component expectations
- ✅ All TypeScript errors resolved, build passes successfully

---

### 3. TYPE MISMATCH

**Message:** Type mismatch for 'priority_level': DB type 'VARCHAR(20)' should map to one of [string], but found 'ProjectPriority'

**Details:**
- Table: `projects`
- Interface: `Project`
- Column: `priority_level`
- Database Type: `VARCHAR(20)`
- TypeScript Type: `ProjectPriority`
- Expected TS Types: `string`

---

### 4. TYPE MISMATCH

**Message:** Type mismatch for 'source': DB type 'VARCHAR(50)' should map to one of [string], but found 'ProjectSource'

**Details:**
- Table: `projects`
- Interface: `Project`
- Column: `source`
- Database Type: `VARCHAR(50)`
- TypeScript Type: `ProjectSource`
- Expected TS Types: `string`

---

### 5. TYPE MISMATCH

**Message:** Type mismatch for 'project_type': DB type 'VARCHAR(100)' should map to one of [string], but found 'ProjectType'

**Details:**
- Table: `projects`
- Interface: `Project`
- Column: `project_type`
- Database Type: `VARCHAR(100)`
- TypeScript Type: `ProjectType`
- Expected TS Types: `string`

---

## 🟡 MEDIUM Issues

### 1. EXTRA PROPERTY

**Message:** TypeScript property 'priority_score' not found in database table 'projects'

**Details:**
- Table: `projects`
- Interface: `Project`
- Property: `priority_score`
- TypeScript Type: `number`

---

### 2. EXTRA PROPERTY

**Message:** TypeScript property 'priority' not found in database table 'projects'

**Details:**
- Table: `projects`
- Interface: `Project`
- Property: `priority`
- TypeScript Type: `ProjectPriority`

---

### 3. EXTRA PROPERTY

**Message:** TypeScript property 'estimated_delivery_date' not found in database table 'projects'

**Details:**
- Table: `projects`
- Interface: `Project`
- Property: `estimated_delivery_date`
- TypeScript Type: `string`

---

### 4. EXTRA PROPERTY

**Message:** TypeScript property 'actual_delivery_date' not found in database table 'projects'

**Details:**
- Table: `projects`
- Interface: `Project`
- Property: `actual_delivery_date`
- TypeScript Type: `string`

---

### 5. EXTRA PROPERTY

**Message:** TypeScript property 'due_date' not found in database table 'projects'

**Details:**
- Table: `projects`
- Interface: `Project`
- Property: `due_date`
- TypeScript Type: `string`

---

### 6. EXTRA PROPERTY

**Message:** TypeScript property 'assignee_id' not found in database table 'projects'

**Details:**
- Table: `projects`
- Interface: `Project`
- Property: `assignee_id`
- TypeScript Type: `string`

---

### 7. EXTRA PROPERTY

**Message:** TypeScript property 'days_in_stage' not found in database table 'projects'

**Details:**
- Table: `projects`
- Interface: `Project`
- Property: `days_in_stage`
- TypeScript Type: `number`

---

### 8. EXTRA PROPERTY

**Message:** TypeScript property 'estimated_completion' not found in database table 'projects'

**Details:**
- Table: `projects`
- Interface: `Project`
- Property: `estimated_completion`
- TypeScript Type: `string`

---

### 9. EXTRA PROPERTY

**Message:** TypeScript property 'actual_completion' not found in database table 'projects'

**Details:**
- Table: `projects`
- Interface: `Project`
- Property: `actual_completion`
- TypeScript Type: `string`

---

### 10. EXTRA PROPERTY

**Message:** TypeScript property 'updated_by' not found in database table 'projects'

**Details:**
- Table: `projects`
- Interface: `Project`
- Property: `updated_by`
- TypeScript Type: `string`

---

### 11. EXTRA PROPERTY

**Message:** TypeScript property 'engineering_reviewer_id' not found in database table 'projects'

**Details:**
- Table: `projects`
- Interface: `Project`
- Property: `engineering_reviewer_id`
- TypeScript Type: `string`

---

### 12. EXTRA PROPERTY

**Message:** TypeScript property 'qa_reviewer_id' not found in database table 'projects'

**Details:**
- Table: `projects`
- Interface: `Project`
- Property: `qa_reviewer_id`
- TypeScript Type: `string`

---

### 13. EXTRA PROPERTY

**Message:** TypeScript property 'production_reviewer_id' not found in database table 'projects'

**Details:**
- Table: `projects`
- Interface: `Project`
- Property: `production_reviewer_id`
- TypeScript Type: `string`

---

### 14. EXTRA PROPERTY

**Message:** TypeScript property 'review_summary' not found in database table 'projects'

**Details:**
- Table: `projects`
- Interface: `Project`
- Property: `review_summary`
- TypeScript Type: `any`

---

### 15. EXTRA PROPERTY

**Message:** TypeScript property 'contact_name' not found in database table 'projects'

**Details:**
- Table: `projects`
- Interface: `Project`
- Property: `contact_name`
- TypeScript Type: `string`

---

### 16. EXTRA PROPERTY

**Message:** TypeScript property 'contact_email' not found in database table 'projects'

**Details:**
- Table: `projects`
- Interface: `Project`
- Property: `contact_email`
- TypeScript Type: `string`

---

### 17. EXTRA PROPERTY

**Message:** TypeScript property 'contact_phone' not found in database table 'projects'

**Details:**
- Table: `projects`
- Interface: `Project`
- Property: `contact_phone`
- TypeScript Type: `string`

---

### 18. NULLABLE MISMATCH

**Message:** Nullable mismatch for 'id': DB nullable=true, TS optional=false

**Details:**
- Table: `projects`
- Interface: `Project`
- Column: `id`

---

### 19. NULLABLE MISMATCH

**Message:** Nullable mismatch for 'organization_id': DB nullable=true, TS optional=false

**Details:**
- Table: `projects`
- Interface: `Project`
- Column: `organization_id`

---

### 20. NULLABLE MISMATCH

**Message:** Nullable mismatch for 'status': DB nullable=true, TS optional=false

**Details:**
- Table: `projects`
- Interface: `Project`
- Column: `status`

---

### 21. NULLABLE MISMATCH

**Message:** Nullable mismatch for 'priority_level': DB nullable=true, TS optional=false

**Details:**
- Table: `projects`
- Interface: `Project`
- Column: `priority_level`

---

### 22. NULLABLE MISMATCH

**Message:** Nullable mismatch for 'source': DB nullable=true, TS optional=false

**Details:**
- Table: `projects`
- Interface: `Project`
- Column: `source`

---

### 23. NULLABLE MISMATCH

**Message:** Nullable mismatch for 'stage_entered_at': DB nullable=true, TS optional=false

**Details:**
- Table: `projects`
- Interface: `Project`
- Column: `stage_entered_at`

---

### 24. NULLABLE MISMATCH

**Message:** Nullable mismatch for 'created_at': DB nullable=true, TS optional=false

**Details:**
- Table: `projects`
- Interface: `Project`
- Column: `created_at`

---

### 25. NULLABLE MISMATCH

**Message:** Nullable mismatch for 'updated_at': DB nullable=true, TS optional=false

**Details:**
- Table: `projects`
- Interface: `Project`
- Column: `updated_at`

---

## 🟢 LOW Issues

### 1. EXTRA PROPERTY

**Message:** TypeScript property 'customer' not found in database table 'projects'

**Details:**
- Table: `projects`
- Interface: `Project`
- Property: `customer`
- TypeScript Type: `Customer`

---

### 2. EXTRA PROPERTY

**Message:** TypeScript property 'current_stage' not found in database table 'projects'

**Details:**
- Table: `projects`
- Interface: `Project`
- Property: `current_stage`
- TypeScript Type: `ProjectStage`

---

