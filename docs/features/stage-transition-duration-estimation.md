# Stage Transition Duration Estimation Feature

## Overview
Implemented stage transition functionality with duration estimation to allow users to specify estimated duration when transitioning between workflow stages.

## Features Implemented

### 1. StageTransitionDialog Component
- **Location**: `src/components/project/workflow/StageTransitionDialog.tsx`
- **Features**:
  - Duration input field with days/hours selection
  - Shows default duration from stage configuration
  - Allows user to override default duration
  - Comprehensive validation and prerequisite checks
  - Manager bypass functionality for invalid transitions

### 2. Updated Services

#### ProjectWorkflowService
- **Location**: `src/services/projectWorkflowService.ts`
- **Changes**:
  - Added `estimatedDuration` parameter to `advanceProjectStage` method
  - Updated workflow event logging to include duration estimation

#### StageHistoryService
- **Location**: `src/services/stageHistoryService.ts`
- **Changes**:
  - Added `estimatedDuration` parameter to `StageTransitionData` interface
  - Updated `recordStageTransition` method to store duration in metadata
  - Duration stored as `estimated_duration_days` in activity log

#### useStageTransition Hook
- **Location**: `src/features/project-management/hooks/useStageTransition.ts`
- **Changes**:
  - Added `estimatedDuration` to `StageTransitionOptions` interface
  - Updated transition execution to handle duration parameter

### 3. Updated Components

#### ProjectWorkflowOrchestrator
- **Location**: `src/components/project/ProjectWorkflowOrchestrator.tsx`
- **Changes**:
  - Integrated StageTransitionDialog for stage transitions
  - Updated stage transition buttons to open dialog instead of direct transition
  - Added dialog state management and confirmation handling

## Usage

### For Users
1. Navigate to project workflow management
2. Click on a stage transition button
3. The StageTransitionDialog will open showing:
   - Current stage validation status
   - Prerequisite checks
   - Duration estimation section
4. Enter estimated duration (defaults to stage's configured duration)
5. Choose between days or hours
6. Review validation results and proceed with transition

### For Developers
The duration estimation is automatically:
- Stored in activity log metadata
- Passed through the workflow service chain
- Available for timeline tracking and analytics

## Database Schema
The feature uses existing `estimated_duration_days` field in:
- `workflow_stages` table (default duration per stage)
- Activity log metadata (actual duration used in transition)

## Default Durations
Based on the workflow stages documentation:
- Inquiry Received: 1 day
- Technical Review: 2 days  
- Supplier RFQ Sent: 5 days
- Quoted: 2 days
- Order Confirmed: 3 days
- Procurement Planning: 2 days
- Production: 4 days
- Completed: 3 days

## Future Enhancements
- Duration tracking and comparison with actual time spent
- Analytics dashboard for stage duration trends
- Automatic duration suggestions based on historical data
- Integration with project timeline visualization
