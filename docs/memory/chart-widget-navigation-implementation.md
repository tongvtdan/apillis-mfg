# Chart Widget Navigation Implementation

## Overview
Added click actions to project chart widgets in the dashboard that navigate to the projects page with appropriate filters applied.

## Changes Made

### 1. Projects Page (`src/pages/Projects.tsx`)
- Added support for `stage` URL parameter
- Updated `getInitialStage()` function to read stage from URL params
- Added effect to update URL when selected stage changes
- Maintains backward compatibility with localStorage

### 2. ProjectOverviewWidget (`src/features/dashboard/components/widgets/ProjectOverviewWidget.tsx`)
- Added `useNavigate` hook import
- Added click handlers for both type and stage charts:
  - `handleTypeChartClick`: Navigates to `/projects?type={type}`
  - `handleStageChartClick`: Navigates to `/projects?stage={stageId}`
- Updated chart data to include necessary IDs for navigation
- Added click handlers to Bar chart and Pie chart components
- Added cursor pointer styling for interactive elements

### 3. Existing Chart Components
The following components already had click handlers implemented:
- `ProjectTypeChart.tsx`: Already navigates to `/projects?type={type}`
- `ProjectStageChart.tsx`: Already navigates to `/projects?stage={stageId}`

## Navigation Behavior

### Type-based Navigation
- Clicking on any project type in charts navigates to: `/projects?type={type}`
- Supported types: `system_build`, `fabrication`, `manufacturing`
- Projects page filters to show only projects of the selected type

### Stage-based Navigation  
- Clicking on any project stage in charts navigates to: `/projects?stage={stageId}`
- Projects page filters to show only projects in the selected stage
- Stage selection is maintained in URL parameters

## Testing
- All chart elements now have click handlers
- Navigation preserves URL state
- Filters are applied correctly on the projects page
- Backward compatibility maintained with existing localStorage functionality

## Files Modified
1. `src/pages/Projects.tsx` - Added stage URL parameter support
2. `src/features/dashboard/components/widgets/ProjectOverviewWidget.tsx` - Added click handlers
3. Existing chart components already had navigation implemented

## Bug Fix - Stage Filtering Issue

### Problem
When clicking on stage charts, the navigation was passing stage names (like "Technical Review") but the filtering logic expected stage IDs (UUIDs). This caused "No projects found" because the stage name couldn't match the UUID stage IDs.

### Solution
1. **Projects Page**: Added logic to convert stage names to stage IDs when filtering
2. **ProjectOverviewWidget**: Updated to use actual workflow stages from database instead of static PROJECT_STAGES
3. **Stage ID Detection**: Added UUID pattern matching to determine if the selected stage is a name or ID

### Technical Details
- Added stage name to stage ID conversion in `selectedStageProjects` filtering logic
- Updated ProjectOverviewWidget to fetch and use actual workflow stages
- Maintained backward compatibility with both stage names and stage IDs

## Implementation Date
January 16, 2025
