# stage-review-debugging-202501151400 - Stage Review Component Debugging

## Date & Time
**Created**: January 15, 2025 at 1:40 PM

## Feature/Context
Added debugging capabilities to the StageReview component to identify why the updated InquiryReceivedView component is not displaying in the Reviews page as expected.

## Problem/Situation
The screenshot shows that the Reviews page is displaying a basic interface instead of our enhanced InquiryReceivedView component that includes:
- Stage 1 Exit Criteria prominently displayed
- Sub-Stages Progress with detailed tracking
- Visual progress indicators for each sub-stage
- Detailed sub-stage information cards

The issue suggests that either:
1. The InquiryReceivedView component is not being rendered
2. The component is falling back to BaseStageView
3. There's a data loading issue (missing validation, currentStage, etc.)

## Solution/Changes
Added comprehensive debugging to both StageReview and InquiryReceivedView components to identify the root cause:

### StageReview Component Debugging:
```typescript
const renderStageView = () => {
    if (!project || !currentStage) {
        console.log('StageReview: Missing project or currentStage', { project: !!project, currentStage: !!currentStage });
        return <div>Loading stage information...</div>;
    }

    if (!validation) {
        console.log('StageReview: Missing validation data', { currentStage: currentStage.name });
        return <div>Loading prerequisite validation...</div>;
    }

    console.log('StageReview: Rendering stage view', { 
        stageName: currentStage.name, 
        hasComponent: !!StageViewComponents[currentStage.name],
        availableComponents: Object.keys(StageViewComponents)
    });

    const StageViewComponent = StageViewComponents[currentStage.name];
    if (!StageViewComponent) {
        console.log('StageReview: No specific component found, using BaseStageView', { stageName: currentStage.name });
        return <BaseStageView ... />;
    }

    console.log('StageReview: Rendering specific stage component', { stageName: currentStage.name });
    return <StageViewComponent ... />;
};
```

### InquiryReceivedView Component Debugging:
```typescript
export const InquiryReceivedView: React.FC<InquiryReceivedViewProps> = ({
    project, currentStage, nextStage, validation
}) => {
    console.log('InquiryReceivedView: Component rendered', {
        projectId: project?.id,
        currentStage: currentStage?.name,
        nextStage: nextStage?.name,
        hasValidation: !!validation,
        validationChecks: validation?.checks?.length || 0
    });
    // ... rest of component
};
```

## Technical Details

### Debugging Strategy:
1. **Stage Data Loading**: Check if project and currentStage are properly loaded
2. **Validation Data**: Verify that validation data is available
3. **Component Mapping**: Ensure the stage name matches the component mapping
4. **Component Rendering**: Confirm that InquiryReceivedView is being called
5. **Fallback Behavior**: Identify if BaseStageView is being used instead

### Expected Console Output:
When working correctly, the console should show:
```
StageReview: Rendering stage view { stageName: "Inquiry Received", hasComponent: true, availableComponents: [...] }
StageReview: Rendering specific stage component { stageName: "Inquiry Received" }
InquiryReceivedView: Component rendered { projectId: "...", currentStage: "Inquiry Received", ... }
```

### Potential Issues to Check:
1. **Stage Name Mismatch**: Database stage name might not exactly match "Inquiry Received"
2. **Missing Validation**: Prerequisite validation might not be loading
3. **Missing Current Stage**: Project might not have current_stage_id set
4. **Component Import**: InquiryReceivedView might not be properly imported

## Files Modified

### Modified Files:
- `src/components/project/workflow/StageReview.tsx` - Added debugging to renderStageView function
- `src/components/project/workflow/stage-views/InquiryReceivedView.tsx` - Added debugging to component render

## Testing Instructions

### Step 1: Check Browser Console
1. Open the Reviews page for a project in Stage 1
2. Open browser developer tools (F12)
3. Check the Console tab for debug messages
4. Look for the specific debug messages listed above

### Step 2: Identify the Issue
Based on console output, identify which condition is failing:

**If you see "Missing project or currentStage":**
- The project data is not loading properly
- Check if the project has a current_stage_id set

**If you see "Missing validation data":**
- The prerequisite validation is not loading
- Check if the validation service is working

**If you see "No specific component found, using BaseStageView":**
- The stage name doesn't match the component mapping
- Check the actual stage name in the database

**If you don't see "InquiryReceivedView: Component rendered":**
- The component is not being called
- There's an issue with the component mapping or import

### Step 3: Verify Expected Behavior
When working correctly, you should see:
- Stage 1 Exit Criteria prominently displayed
- Sub-Stages Progress section with 3 sub-stages
- Visual progress indicators and status badges
- Detailed sub-stage information cards

## Next Steps

Once the debugging identifies the issue:

1. **If stage name mismatch**: Update the StageViewComponents mapping
2. **If missing validation**: Fix the validation data loading
3. **If missing current stage**: Ensure project has proper stage assignment
4. **If component not rendering**: Check imports and component structure

## Expected Resolution

After identifying and fixing the root cause, the Reviews page should display:
- Enhanced Stage 1 interface with exit criteria
- Sub-stage progress tracking
- Visual status indicators
- Detailed sub-stage information

This will provide a much better user experience aligned with the documented workflow requirements.

## Debugging Cleanup

Once the issue is resolved, remove the console.log statements to clean up the code:
- Remove debugging from StageReview.tsx renderStageView function
- Remove debugging from InquiryReceivedView.tsx component
