# List View Stage Dropdown Fix - 2025-01-17

## Issue Summary
The List view's stage dropdown was not showing the current stage of projects, even though the workflow view was working correctly.

## Root Cause Analysis
The issue was in the data flow between components:

1. **Missing Props**: `ProjectTable` component was not receiving `workflowStages` as a prop
2. **Component Chain**: `Projects.tsx` → `ProjectList` → `ProjectTable` → `AnimatedTableRow`
3. **Data Access**: `AnimatedTableRow` was trying to use `workflowStages` but it wasn't being passed down
4. **Fallback Logic**: The component was using `project.current_stage_legacy` which doesn't exist
5. **State Management**: `AnimatedTableRow` had its own `useState` for workflow stages instead of using props

## Solution Applied
1. **Updated ProjectTable Interface**: Added `workflowStages?: WorkflowStage[]` prop
2. **Updated AnimatedTableRow Interface**: Added `workflowStages?: WorkflowStage[]` prop
3. **Fixed Data Flow**: `ProjectList` now passes `workflowStages` to `ProjectTable`
4. **Removed Redundant State**: Removed `useState` and `useEffect` for workflow stages in `AnimatedTableRow`
5. **Fixed Stage Logic**: Updated Select component to use `project.current_stage_id` instead of non-existent fields
6. **Improved Display Logic**: Added proper stage lookup and fallback handling

## Technical Details

### Code Changes

#### ProjectTable.tsx
```typescript
// Added workflowStages prop
interface ProjectTableProps {
  projects: Project[];
  workflowStages?: WorkflowStage[];
  // ... other props
}

// Pass workflowStages to AnimatedTableRow
<AnimatedTableRow
  workflowStages={workflowStages}
  // ... other props
/>
```

#### AnimatedTableRow.tsx
```typescript
// Added workflowStages prop
interface AnimatedTableRowProps {
    project: Project;
    workflowStages?: WorkflowStage[];
    // ... other props
}

// Fixed Select component logic
<Select
    value={project.current_stage_id || ''}
    onValueChange={(value: string) => onStatusChange(project.id, value as ProjectStatus)}
>
    <SelectValue>
        {(() => {
            const currentStage = workflowStages.find(stage => stage.id === project.current_stage_id);
            return currentStage ? (
                <Badge className={workflowStageService.getStageColor(currentStage)}>
                    {currentStage.name}
                </Badge>
            ) : (
                <Badge variant="outline">Unknown Stage</Badge>
            );
        })()}
    </SelectValue>
</Select>
```

#### ProjectList.tsx
```typescript
// Pass workflowStages to ProjectTable
<ProjectTable
    projects={sortedProjects}
    workflowStages={workflowStages}
    // ... other props
/>
```

## Results
✅ **Stage dropdown now shows current project stages** in List view
✅ **Proper stage selection** with correct workflow stage IDs
✅ **Consistent behavior** between workflow view and list view
✅ **Proper stage colors** using workflowStageService
✅ **Fallback handling** for unknown stages

## Files Modified
- `src/components/project/ProjectTable.tsx` - Added workflowStages prop
- `src/components/project/ui/AnimatedTableRow.tsx` - Fixed stage dropdown logic
- `src/components/project/ProjectList.tsx` - Pass workflowStages to ProjectTable

## Data Flow Confirmed
```
Projects.tsx (workflowStages state)
    ↓
ProjectList (workflowStages prop)
    ↓
ProjectTable (workflowStages prop)
    ↓
AnimatedTableRow (workflowStages prop)
    ↓
Select component (shows current stage)
```

## Final Status
🎯 **COMPLETED**: List view stage dropdown now correctly shows current project stages and allows stage changes!
