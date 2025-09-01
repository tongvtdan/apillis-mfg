# Workflow Stage System Documentation

## Overview

The Factory Pulse workflow stage system provides comprehensive stage management capabilities for manufacturing projects, enabling automated requirement tracking, stage advancement validation, intelligent workflow progression, and complete stage transition history tracking.

## Core Components

### StageConfigurationPanel Component

**Location**: `src/components/project/StageConfigurationPanel.tsx`

The `StageConfigurationPanel` is the primary component for managing workflow stages within project detail pages. It provides intelligent requirement generation, stage advancement controls, and progress tracking.

#### Key Features

1. **Dynamic Requirements Generation**
   - Automatically generates stage-specific requirements based on workflow stage configuration
   - Parses JSON exit criteria from workflow stages
   - Handles plain text requirements as fallback
   - Provides contextual requirements based on stage name

2. **Requirement Status Tracking**
   - Tracks completion status: `completed`, `in_progress`, `pending`
   - Visual status indicators with color coding
   - Progress bars showing stage completion percentage
   - Requirement type categorization: `document`, `approval`, `data`, `review`

3. **Stage Advancement Controls**
   - Validates all required requirements before allowing advancement
   - Shows next 2 available stages with advancement buttons
   - Tooltip guidance explaining advancement status
   - Disabled state for stages with pending requirements

4. **Visual Progress Indicators**
   - Real-time progress bar showing completion percentage
   - Color-coded requirement status badges
   - Stage-specific icons for different requirement types
   - Visual stage progression indicators

#### Component Interface

```typescript
interface StageConfigurationPanelProps {
  project: Project;
  onStageUpdate?: (stageId: string) => void;
}

interface StageRequirement {
  id: string;
  name: string;
  description: string;
  type: 'document' | 'approval' | 'data' | 'review';
  status: 'completed' | 'pending' | 'in_progress';
  required: boolean;
}
```

## Integration Points

### useWorkflowStages Hook

The component integrates with the `useWorkflowStages` hook to fetch workflow stage data:

```typescript
const { data: workflowStages = [], isLoading } = useWorkflowStages();
```

### workflowStageService

Service integration for stage management operations:

```typescript
import { workflowStageService } from "@/services/workflowStageService";
```

### Project Detail Integration

The component is designed to integrate with the project detail page tabbed interface:

```typescript
// Example integration in ProjectDetailLayout
<TabsContent value="workflow">
  <StageConfigurationPanel
    project={project}
    onStageUpdate={handleStageUpdate}
  />
</TabsContent>
```

## Dependencies

### Required Packages

- `@/components/ui/*` - shadcn/ui components (Card, Badge, Button, Tooltip)
- `lucide-react` - Icon components
- `@/hooks/useWorkflowStages` - Workflow stage data hook
- `@/services/workflowStageService` - Stage management service
- `@/types/project` - TypeScript type definitions

### Peer Dependencies

- React 18+
- TypeScript 4.9+
- Tailwind CSS 3.0+

## Stage History Service

**Location**: `src/services/stageHistoryService.ts`

The `StageHistoryService` provides comprehensive stage transition tracking and analytics capabilities for the workflow system.

### Key Features

1. **Stage Transition Recording**
   - Records all stage transitions in the activity log
   - Captures user attribution and transition metadata
   - Handles workflow bypass scenarios with special logging
   - Automatic stage name resolution for better audit trails

2. **Stage History Retrieval**
   - Fetches complete stage history for projects
   - Calculates duration spent in each stage
   - Provides user information for each transition
   - Enriches history with stage names and context

3. **Transition Analytics**
   - Organization-wide transition statistics
   - Bypass usage analysis and reporting
   - Stage performance metrics and bottleneck detection
   - Recent transition monitoring across projects

4. **Audit Trail Management**
   - Complete audit trail for all stage changes
   - User accountability and attribution tracking
   - Timestamp precision for compliance requirements
   - Bypass reason tracking for workflow exceptions

### Service Interface

```typescript
interface StageTransitionData {
  projectId: string;
  fromStageId?: string;
  toStageId: string;
  userId: string;
  reason?: string;
  bypassRequired?: boolean;
  bypassReason?: string;
}

class StageHistoryService {
  async recordStageTransition(data: StageTransitionData): Promise<void>
  async getProjectStageHistory(projectId: string): Promise<ProjectStageHistory[]>
  async getStageTransitionStats(organizationId: string, dateRange?: { from: string; to: string })
  async getRecentStageTransitions(organizationId: string, limit?: number)
}
```

### Integration with Activity Log

The service integrates directly with the `activity_log` table to provide:
- Persistent storage of all stage transitions
- Integration with existing audit logging system
- Consistent data structure across all activity types
- Support for real-time activity monitoring

### Usage Example

```typescript
import { stageHistoryService } from '@/services/stageHistoryService';

// Record a stage transition
await stageHistoryService.recordStageTransition({
  projectId: 'project-123',
  fromStageId: 'stage-1',
  toStageId: 'stage-2',
  userId: 'user-456',
  reason: 'Requirements completed'
});

// Get project stage history
const history = await stageHistoryService.getProjectStageHistory('project-123');

// Get transition statistics
const stats = await stageHistoryService.getStageTransitionStats('org-789');
```

## Conclusion

The workflow stage system, combining the `StageConfigurationPanel` component and `StageHistoryService`, provides a comprehensive solution for workflow stage management in Factory Pulse. The intelligent requirement generation, visual progress tracking, stage advancement validation, and complete audit trail capabilities make it a critical system for manufacturing project workflow management and compliance.