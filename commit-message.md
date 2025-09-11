feat: Update project status flow to use draft and in_progress statuses

This commit updates the project status flow to use "draft" and "in progress" statuses instead of the previous status values. When a project has status "in progress", the system automatically ensures that the current_stage_id is set to the inquiry_received stage.

Changes made:
- Updated ProjectStatus type from 'active' | 'on_hold' | 'cancelled' | 'completed' to 'draft' | 'in_progress'
- Updated ProjectList status filters to show "Draft" and "In Progress" options
- Updated project creation to default to 'in_progress' status
- Updated InquiryIntakeForm to set status to 'draft' for "Save as Draft" and 'in_progress' for "Submit"
- Added logic to automatically set current_stage_id to inquiry_received stage when status is 'in_progress'
- Created documentation file PROJECT_STATUS_FLOW_CHANGES.md to summarize changes

The implementation ensures that:
1. Projects saved with "Save as Draft" have status = 'draft'
2. Projects submitted with "Submit" have status = 'in_progress'
3. When status is 'in_progress', current_stage_id is automatically set to inquiry_received stage (880e8400-e29b-41d4-a716-446655440001)
4. UI components are updated to reflect the new status options