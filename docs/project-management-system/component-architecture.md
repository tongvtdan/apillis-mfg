# Component Architecture and Data Flow

## Overview

This document outlines the component architecture of the Factory Pulse project management system, including data flow patterns, component relationships, and integration points.

## High-Level Architecture

```mermaid
graph TB
    subgraph "Pages Layer"
        A[Projects Page]
        B[ProjectDetail Page]
        C[Dashboard Page]
    end
    
    subgraph "Component Layer"
        D[ProjectTable]
        E[ProjectDetail Components]
        F[ProjectIntakeForm]
        G[WorkflowStepper]
        H[ProjectTabs]
    end
    
    subgraph "Hook Layer"
        I[useProjects]
        J[useProjectReviews]
        K[useDashboardData]
    end
    
    subgraph "Service Layer"
        L[projectService]
        M[RealtimeManager]
        N[CacheService]
    end
    
    subgraph "Data Layer"
        O[Supabase Client]
        P[Database]
    end
    
    A --> D
    A --> F
    B --> E
    B --> G
    B --> H
    C --> K
    
    D --> I
    E --> I
    F --> I
    G --> I
    H --> J
    
    I --> L
    J --> L
    K --> L
    
    L --> O
    M --> O
    N --> O
    O --> P
```

## Core Components

### ProjectTable Component

**Purpose**: Main project listing with sorting, filtering, and bulk operations

**Location**: `src/components/project/ProjectTable.tsx`

**Props Interface**:
```typescript
interface ProjectTableProps {
  projects: Project[];
  loading?: boolean;
  onProjectSelect?: (project: Project) => void;
  onStatusChange?: (projectId: string, status: ProjectStatus) => void;
  onStageChange?: (projectId: string, stageId: string) => void;
  filters?: ProjectFilters;
  onFiltersChange?: (filters: ProjectFilters) => void;
}
```

**Data Flow**:
```mermaid
sequenceDiagram
    participant PT as ProjectTable
    participant UP as useProjects
    participant PS as projectService
    participant SC as Supabase Client
    
    PT->>UP: Request projects data
    UP->>PS: fetchProjects()
    PS->>SC: Query with joins
    SC-->>PS: Raw project data
    PS-->>UP: Transformed projects
    UP-->>PT: Projects with loading state
    
    PT->>UP: Update project status
    UP->>PS: updateProject()
    PS->>SC: UPDATE query
    SC-->>PS: Updated project
    PS-->>UP: Success response
    UP-->>PT: Optimistic update
```

**Key Features**:
- Sortable columns with database field mapping
- Real-time updates via Supabase subscriptions
- Optimistic updates for better UX
- Bulk operations support
- Advanced filtering and search

### ProjectDetail Components

**Purpose**: Comprehensive project view with workflow management

**Location**: `src/components/project/ProjectDetail.tsx`

**Component Hierarchy**:
```mermaid
graph TD
    A[ProjectDetail] --> B[ProjectTabs]
    B --> C[OverviewTab]
    B --> D[WorkflowTab]
    B --> E[CommunicationTab]
    B --> F[DocumentsTab]
    
    C --> G[ProjectSummary]
    C --> H[CustomerInfo]
    C --> I[AssignmentInfo]
    
    D --> J[WorkflowStepper]
    D --> K[StageActions]
    D --> L[ReviewList]
    
    E --> M[MessageList]
    E --> N[MessageForm]
    
    F --> O[DocumentList]
    F --> P[FileUpload]
```

**Data Dependencies**:
```typescript
interface ProjectDetailData {
  project: Project;
  workflowStages: WorkflowStage[];
  reviews: Review[];
  messages: Message[];
  documents: Document[];
  activities: ActivityLog[];
}
```

### ProjectIntakeForm Component

**Purpose**: New project creation with validation and workflow integration

**Location**: `src/components/project/ProjectIntakeForm.tsx`

**Form Schema**:
```typescript
const ProjectIntakeFormSchema = z.object({
  project_id: z.string().min(1).max(50),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  customer_id: z.string().uuid().optional(),
  priority_level: z.enum(['low', 'medium', 'high', 'urgent']),
  estimated_value: z.number().positive().optional(),
  project_type: z.string().max(100).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});
```

**Validation Flow**:
```mermaid
sequenceDiagram
    participant F as Form
    participant V as Validation
    participant S as Service
    participant D as Database
    
    F->>V: Submit form data
    V->>V: Client-side validation
    alt Validation passes
        V->>S: Create project
        S->>D: INSERT with constraints
        alt Database success
            D-->>S: New project ID
            S-->>F: Success response
        else Constraint violation
            D-->>S: Error details
            S-->>F: Validation errors
        end
    else Validation fails
        V-->>F: Field errors
    end
```

### WorkflowStepper Component

**Purpose**: Visual workflow progression with stage management

**Location**: `src/components/project/WorkflowStepper.tsx`

**Stage Visualization**:
```mermaid
graph LR
    A[Intake] --> B[Review]
    B --> C[Engineering]
    C --> D[Procurement]
    D --> E[Production]
    E --> F[Delivery]
    
    style A fill:#10b981
    style B fill:#f59e0b
    style C fill:#6b7280
    style D fill:#6b7280
    style E fill:#6b7280
    style F fill:#6b7280
```

**Props Interface**:
```typescript
interface WorkflowStepperProps {
  project: Project;
  stages: WorkflowStage[];
  onStageChange?: (stageId: string) => void;
  canAdvance?: boolean;
  canRevert?: boolean;
}
```

## Data Flow Patterns

### Project CRUD Operations

```mermaid
sequenceDiagram
    participant C as Component
    participant H as Hook
    participant S as Service
    participant DB as Database
    participant RT as Realtime
    
    Note over C,RT: Create Project
    C->>H: createProject(data)
    H->>S: createProject(data)
    S->>DB: INSERT project
    DB-->>S: New project
    S-->>H: Success
    H-->>C: Updated state
    DB->>RT: Change notification
    RT-->>H: Real-time update
    
    Note over C,RT: Update Project
    C->>H: updateProject(id, data)
    H->>H: Optimistic update
    H->>S: updateProject(id, data)
    S->>DB: UPDATE project
    DB-->>S: Updated project
    S-->>H: Confirmation
    DB->>RT: Change notification
    RT-->>H: Real-time sync
```

### Real-time Synchronization

```mermaid
sequenceDiagram
    participant U1 as User 1
    participant U2 as User 2
    participant RT as Realtime Manager
    participant DB as Database
    
    U1->>DB: Update project status
    DB->>RT: Broadcast change
    RT->>U1: Confirm update
    RT->>U2: Notify change
    U2->>U2: Update local state
    
    Note over U1,U2: Both users see synchronized data
```

### Error Handling Flow

```mermaid
graph TD
    A[Component Action] --> B{Validation}
    B -->|Pass| C[Service Call]
    B -->|Fail| D[Show Field Errors]
    
    C --> E{Database Operation}
    E -->|Success| F[Update State]
    E -->|Constraint Error| G[Show Specific Error]
    E -->|Network Error| H[Retry Mechanism]
    E -->|Permission Error| I[Show Auth Error]
    
    F --> J[Success Feedback]
    G --> K[Error Boundary]
    H --> L[Exponential Backoff]
    I --> M[Redirect to Auth]
```

## State Management

### Hook Architecture

```typescript
// useProjects - Main project state management
interface UseProjectsReturn {
  projects: Project[];
  loading: boolean;
  error: Error | null;
  createProject: (data: ProjectCreateData) => Promise<Project>;
  updateProject: (id: string, data: ProjectUpdateData) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

// useProjectReviews - Review system integration
interface UseProjectReviewsReturn {
  reviews: Review[];
  loading: boolean;
  createReview: (data: ReviewCreateData) => Promise<Review>;
  updateReview: (id: string, data: ReviewUpdateData) => Promise<Review>;
  assignReviewer: (reviewId: string, userId: string) => Promise<void>;
}
```

### Cache Strategy

```mermaid
graph TD
    A[Component Request] --> B{Cache Check}
    B -->|Hit| C[Return Cached Data]
    B -->|Miss| D[Fetch from API]
    D --> E[Store in Cache]
    E --> F[Return Fresh Data]
    
    G[Real-time Update] --> H[Invalidate Cache]
    H --> I[Update Components]
    
    J[Manual Refresh] --> K[Clear Cache]
    K --> D
```

## Integration Points

### Supabase Integration

**Client Configuration**:
```typescript
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);
```

**Real-time Subscriptions**:
```typescript
const subscription = supabase
  .channel('projects')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'projects',
    filter: `organization_id=eq.${organizationId}`,
  }, handleProjectChange)
  .subscribe();
```

### Authentication Integration

```mermaid
sequenceDiagram
    participant U as User
    participant A as Auth Context
    participant S as Supabase Auth
    participant C as Components
    
    U->>A: Login request
    A->>S: Authenticate
    S-->>A: User session
    A-->>C: Update auth state
    C->>C: Enable protected features
    
    Note over U,C: User can now access project data
```

## Performance Optimizations

### Query Optimization

1. **Selective Field Loading**:
```typescript
// Optimized project list query
const { data } = await supabase
  .from('projects')
  .select(`
    id,
    project_id,
    title,
    status,
    priority_level,
    estimated_value,
    updated_at,
    customer:contacts(name, company),
    current_stage:workflow_stages(name, color)
  `)
  .eq('organization_id', organizationId)
  .order('updated_at', { ascending: false });
```

2. **Pagination Strategy**:
```typescript
const ITEMS_PER_PAGE = 50;
const { data, count } = await supabase
  .from('projects')
  .select('*', { count: 'exact' })
  .range(offset, offset + ITEMS_PER_PAGE - 1);
```

### Component Optimization

1. **Memoization**:
```typescript
const ProjectTable = memo(({ projects, onProjectSelect }) => {
  const sortedProjects = useMemo(() => 
    projects.sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    ), [projects]
  );
  
  return <Table data={sortedProjects} />;
});
```

2. **Virtual Scrolling** (for large datasets):
```typescript
import { FixedSizeList as List } from 'react-window';

const VirtualizedProjectList = ({ projects }) => (
  <List
    height={600}
    itemCount={projects.length}
    itemSize={80}
    itemData={projects}
  >
    {ProjectRow}
  </List>
);
```

## Testing Strategy

### Component Testing

```typescript
describe('ProjectTable', () => {
  it('displays projects correctly', async () => {
    const mockProjects = [createMockProject()];
    render(<ProjectTable projects={mockProjects} />);
    
    expect(screen.getByText(mockProjects[0].title)).toBeInTheDocument();
  });
  
  it('handles status updates', async () => {
    const onStatusChange = jest.fn();
    render(<ProjectTable projects={[]} onStatusChange={onStatusChange} />);
    
    // Test status change interaction
  });
});
```

### Integration Testing

```typescript
describe('Project Management Flow', () => {
  it('creates and updates project successfully', async () => {
    // Test complete CRUD flow
    const project = await createProject(mockData);
    expect(project.id).toBeDefined();
    
    const updated = await updateProject(project.id, { status: 'completed' });
    expect(updated.status).toBe('completed');
  });
});
```

## Best Practices

### Component Design

1. **Single Responsibility**: Each component has one clear purpose
2. **Prop Drilling Prevention**: Use context for deeply nested data
3. **Error Boundaries**: Wrap components in error boundaries
4. **Loading States**: Always handle loading and error states
5. **Accessibility**: Follow ARIA guidelines and keyboard navigation

### Data Management

1. **Optimistic Updates**: Update UI immediately, sync with server
2. **Cache Invalidation**: Clear cache on mutations
3. **Real-time Sync**: Use Supabase real-time for live updates
4. **Error Recovery**: Implement retry mechanisms and fallbacks
5. **Type Safety**: Maintain strict TypeScript interfaces