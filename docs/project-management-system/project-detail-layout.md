# ProjectDetailLayout Component Documentation

## Overview

The `ProjectDetailLayout` component serves as the foundation layout for project detail pages, providing a comprehensive tabbed interface with real-time status monitoring and health assessment capabilities.

## Component Location

`src/components/project/ProjectDetailLayout.tsx`

## Purpose

- Provide a unified layout structure for project detail pages
- Display real-time project status and health metrics
- Manage tabbed navigation for different project aspects
- Calculate and visualize project progress based on workflow stages
- Monitor project health with automated risk assessment

## Key Features

### 1. Tabbed Interface System

The component provides six main tabs for organizing project information:

- **Overview**: Project summary and key information
- **Documents**: File management and document organization
- **Communication**: Messages and project communication
- **Reviews**: Internal reviews and approvals
- **Analytics**: Project metrics and performance data
- **Settings**: Project configuration and management

### 2. Project Status Summary Card

Real-time status monitoring with three key metrics:

#### Progress Indicator
- Visual progress bar showing workflow completion percentage
- Calculated based on current stage position in workflow
- Animated transitions for smooth user experience

#### Time in Stage Tracking
- Days spent in current workflow stage
- Stage entry date display
- Visual time indicator with clock icon

#### Health Monitoring System
- Automated health score calculation (Good/At Risk/Critical)
- Color-coded health indicators with descriptive icons
- Risk assessment based on multiple factors

### 3. Health Scoring Algorithm

The component implements an intelligent health scoring system:

```typescript
function getHealthStatus(project: Project): string {
  const daysInStage = getDaysInStage(project);
  
  // Simple health calculation based on time in stage and priority
  if (project.priority_level === 'critical' && daysInStage > 3) return 'Critical';
  if (project.priority_level === 'high' && daysInStage > 7) return 'At Risk';
  if (daysInStage > 14) return 'At Risk';
  
  return 'Good';
}
```

#### Health Levels:
- **Good**: Normal project progression
- **At Risk**: Attention needed, potential delays
- **Critical**: Immediate action required

#### Risk Factors:
- Time spent in current stage
- Project priority level
- Delivery date proximity
- Stage-specific thresholds

### 4. Progress Calculation

Stage-based progress calculation with visual representation:

```typescript
function calculateProgress(project: Project, stages: WorkflowStage[]): number {
  if (!project.current_stage_id || stages.length === 0) return 0;
  
  const currentStageIndex = stages.findIndex(stage => stage.id === project.current_stage_id);
  if (currentStageIndex === -1) return 0;
  
  return Math.round((currentStageIndex / (stages.length - 1)) * 100);
}
```

## Component Interface

### Props

```typescript
interface ProjectDetailLayoutProps {
  project: Project;                    // Required project data
  workflowStages?: WorkflowStage[];   // Optional workflow stages for progress calculation
  activeTab?: string;                 // Current active tab (default: 'overview')
  onTabChange?: (tab: string) => void; // Tab change callback
  children?: React.ReactNode;         // Tab content components
  className?: string;                 // Additional CSS classes
}
```

### Tab Configuration

```typescript
interface TabConfig {
  id: string;                         // Unique tab identifier
  label: string;                      // Display label
  icon: React.ElementType;            // Lucide React icon component
  badge?: number;                     // Optional notification badge count
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  disabled?: boolean;                 // Tab disabled state
}
```

## Usage Examples

### Basic Implementation

```typescript
import { ProjectDetailLayout } from '@/components/project/ProjectDetailLayout';
import { TabsContent } from '@/components/ui/tabs';

function ProjectDetailPage() {
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <ProjectDetailLayout
      project={project}
      workflowStages={workflowStages}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <TabsContent value="overview">
        <ProjectOverview project={project} />
      </TabsContent>
      
      <TabsContent value="documents">
        <DocumentManager projectId={project.id} />
      </TabsContent>
      
      <TabsContent value="communication">
        <ProjectCommunication projectId={project.id} />
      </TabsContent>
      
      {/* Additional tab content */}
    </ProjectDetailLayout>
  );
}
```

### With Custom Tab Badges

```typescript
// Parent component can pass badge counts for dynamic updates
<ProjectDetailLayout
  project={project}
  workflowStages={workflowStages}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  // Badge counts would be calculated by parent component
  // based on actual data (documents count, unread messages, etc.)
>
  {/* Tab content */}
</ProjectDetailLayout>
```

## Integration Points

### 1. EnhancedProjectDetail Component

The layout is designed to be used within the main `EnhancedProjectDetail` component:

```typescript
// src/components/project/EnhancedProjectDetail.tsx
export function EnhancedProjectDetail() {
  return (
    <div className="min-h-screen bg-background">
      <ProjectDetailHeader {...headerProps} />
      
      <div className="p-6">
        <ProjectDetailLayout {...layoutProps}>
          {/* Tab content components */}
        </ProjectDetailLayout>
      </div>
    </div>
  );
}
```

### 2. Tab Content Components

The layout works with various tab content components:

- `InlineProjectEditor` - Project information editing
- `ProjectStatusManager` - Status management and transitions
- `DocumentManager` - Document management interface
- `ProjectCommunication` - Communication and messaging
- `ReviewList` - Review management and tracking

### 3. Data Dependencies

The component requires the following data structures:

```typescript
// Project data with required fields
interface Project {
  id: string;
  status: ProjectStatus;
  priority_level: 'low' | 'medium' | 'high' | 'critical';
  current_stage_id?: string;
  stage_entered_at?: string;
  created_at: string;
  updated_at?: string;
  // ... other project fields
}

// Workflow stages for progress calculation
interface WorkflowStage {
  id: string;
  name: string;
  order: number;
  // ... other stage fields
}
```

## Styling and Theming

### CSS Classes

The component uses Tailwind CSS classes with shadcn/ui components:

- **Layout**: `space-y-6` for vertical spacing
- **Cards**: shadcn/ui Card components with proper padding
- **Grid**: Responsive grid layout (`grid-cols-1 md:grid-cols-3`)
- **Progress Bar**: Custom progress bar with smooth transitions
- **Badges**: Color-coded status and health badges

### Color Coding

#### Status Colors
```typescript
const statusColors = {
  active: 'bg-green-100 text-green-800 border-green-200',
  on_hold: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  completed: 'bg-blue-100 text-blue-800 border-blue-200'
};
```

#### Health Indicators
- **Good**: Green CheckCircle2 icon
- **At Risk**: Yellow AlertCircle icon  
- **Critical**: Red AlertCircle icon

## Performance Considerations

### Optimizations Implemented

1. **Memoized Calculations**: Helper functions for progress and health calculations
2. **Efficient Rendering**: Conditional rendering of badges and indicators
3. **Callback Optimization**: Proper event handler implementation
4. **Responsive Design**: Mobile-first approach with efficient breakpoints

### Best Practices

1. **State Management**: Internal tab state with external control support
2. **Error Handling**: Graceful handling of missing data
3. **Accessibility**: Proper ARIA labels and keyboard navigation
4. **Type Safety**: Comprehensive TypeScript interfaces

## Testing Considerations

### Unit Tests

Test the following functionality:

1. **Progress Calculation**: Verify correct progress percentage calculation
2. **Health Scoring**: Test health status determination logic
3. **Tab Management**: Ensure proper tab switching and state management
4. **Time Calculations**: Verify days in stage calculations
5. **Responsive Behavior**: Test layout on different screen sizes

### Integration Tests

1. **Data Flow**: Test with real project and workflow stage data
2. **Tab Content**: Verify proper integration with tab content components
3. **Real-time Updates**: Test with changing project data
4. **User Interactions**: Test tab switching and callback functionality

## Future Enhancements

### Planned Features

1. **Custom Tab Configuration**: Allow dynamic tab configuration
2. **Advanced Health Metrics**: More sophisticated health scoring algorithms
3. **Real-time Notifications**: Live updates for health status changes
4. **Customizable Thresholds**: User-configurable health thresholds
5. **Export Functionality**: Export project status reports

### Extensibility

The component is designed to be easily extensible:

1. **New Tabs**: Easy to add new tabs to the configuration
2. **Custom Health Metrics**: Pluggable health scoring system
3. **Theme Customization**: Full theme support via CSS variables
4. **Internationalization**: Ready for i18n implementation

## Dependencies

### Required Packages

- `@/components/ui/*` - shadcn/ui components
- `lucide-react` - Icon components
- `@/lib/utils` - Utility functions
- `@/types/project` - TypeScript type definitions

### Peer Dependencies

- React 18+
- TypeScript 4.9+
- Tailwind CSS 3.0+

## Conclusion

The `ProjectDetailLayout` component provides a robust foundation for project detail pages with comprehensive status monitoring, health assessment, and intuitive tabbed navigation. Its modular design allows for easy integration and extension while maintaining high performance and user experience standards.