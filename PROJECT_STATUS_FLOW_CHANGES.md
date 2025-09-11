# Project Status Flow Changes

## Overview
This document summarizes the changes made to update the project status flow to use "draft" and "in progress" statuses, with the requirement that when project_status = "in progress", the current_stage_id should always be "inquiry_received" (id = 880e8400-e29b-41d4-a716-446655440001).

## Changes Made

### 1. Updated ProjectStatus Type
**File:** `src/types/project.ts`
- Changed `ProjectStatus` type from `'active' | 'on_hold' | 'cancelled' | 'completed'` to `'draft' | 'in_progress'`

### 2. Updated Project List Status Filters
**File:** `src/components/project/ProjectList.tsx`
- Updated status filter options to show "Draft" and "In Progress" instead of the previous options

### 3. Updated Project Creation Default Status
**File:** `src/services/projectWorkflowService.ts`
- Changed default status from `'active'` to `'in_progress'` when creating projects

### 4. Updated Project Intake Data Type
**File:** `src/services/projectIntakeService.ts`
- Updated `ProjectIntakeData.status` type to `'draft' | 'in_progress'`

### 5. Updated Inquiry Intake Form
**File:** `src/components/project/intake/InquiryIntakeForm.tsx`
- Updated "Submit" button to set status to `'in_progress'`
- Updated "Save as Draft" button to set status to `'draft'`

### 6. Added Logic to Ensure Correct Stage for In Progress Status
**File:** `src/services/projectService.ts`
- Added logic in `createProject` method to automatically set `current_stage_id` to inquiry_received stage when status is `'in_progress'`
- Added logic in `updateProject` method to automatically set `current_stage_id` to inquiry_received stage when status is `'in_progress'`

## Implementation Details

### Status Mapping
- **Draft**: Projects saved with "Save as Draft" button
- **In Progress**: Projects submitted with "Submit" button

### Stage Enforcement
When a project has status "in progress", the system automatically ensures that:
- `current_stage_id` is set to the inquiry_received stage (id = 880e8400-e29b-41d4-a716-446655440001)
- This applies to both project creation and updates

### Form Behavior
- **Save as Draft**: Creates project with status = 'draft'
- **Submit**: Creates project with status = 'in_progress' and automatically sets current_stage_id to inquiry_received

## Testing
The changes have been implemented to ensure:
1. Type safety with updated TypeScript interfaces
2. Consistent behavior across project creation and update operations
3. Proper UI filtering in project lists
4. Automatic stage assignment when status is "in progress"