# Factory Pulse - System Architecture

## Overview

Factory Pulse is a modern Manufacturing Execution System (MES) designed to streamline manufacturing workflows, project management, and operational efficiency. This document outlines the complete system architecture, technology stack, and design patterns.

## Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        A[React SPA]
        B[Vite Build System]
        C[Tailwind CSS]
    end

    subgraph "State Management"
        D[React Query]
        E[Context API]
        F[Custom Hooks]
    end

    subgraph "API Layer"
        G[Supabase Client]
        H[REST API]
        I[GraphQL Support]
    end

    subgraph "Backend Services"
        J[Supabase]
        K[PostgreSQL]
        L[Supabase Auth]
        M[Supabase Storage]
        N[Supabase Realtime]
    end

    subgraph "External Integrations"
        O[Google Drive]
        P[Firebase Data Connect]
        Q[Email Services]
    end

    A --> D
    D --> G
    E --> G
    F --> G
    G --> J
    J --> K
    J --> L
    J --> M
    J --> N
    O --> J
    P --> J

    style A fill:#e1f5fe
    style J fill:#f3e5f5
```

## Technology Stack

### Frontend
- **React 18** - Component-based UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component library
- **Framer Motion** - Animation library
- **React Router** - Client-side routing
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Data Management
- **Release Notes System** - Structured version tracking and user communication
- **Version Management** - Centralized application version information

### Backend & Database
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Primary database
- **Supabase Auth** - Authentication & authorization
- **Supabase Storage** - File storage
- **Supabase Realtime** - Real-time subscriptions

### Development Tools
- **ESLint** - Code linting
- **Vitest** - Unit testing
- **Bun** - Package manager
- **Git** - Version control

## Application Architecture

### Component Architecture

```mermaid
graph TD
    subgraph "Layout Components"
        A[AppLayout]
        B[AppSidebar]
        C[AppHeader]
    end

    subgraph "Page Components"
        D[Dashboard]
        E[Projects]
        F[ProjectDetail]
        G[Users]
        H[Settings]
    end

    subgraph "Feature Components"
        I[ProjectList]
        J[ProjectForm]
        K[WorkflowStage]
        L[DocumentViewer]
    end

    subgraph "UI Components"
        M[Button]
        N[Input]
        O[Table]
        P[Modal]
        Q[Toast]
    end

    A --> D
    A --> E
    A --> F
    D --> I
    E --> J
    F --> K
    I --> L
    J --> M
    K --> N
    L --> O

    style A fill:#e8f5e8
    style D fill:#fff3e0
    style I fill:#fce4ec
```

### Data Flow Architecture

```mermaid
graph LR
    subgraph "User Interface"
        A[Components]
        B[Pages]
        C[Forms]
    end

    subgraph "State Management"
        D[React Query]
        E[Context Providers]
        F[Custom Hooks]
    end

    subgraph "Data Services"
        G[API Services]
        H[Data Hooks]
        I[Cache Layer]
    end

    subgraph "External APIs"
        J[Supabase Client]
        K[REST Endpoints]
        L[GraphQL Queries]
    end

    subgraph "Database"
        M[PostgreSQL]
        N[Real-time Updates]
        O[File Storage]
    end

    A --> D
    B --> D
    C --> D
    D --> G
    E --> G
    F --> H
    G --> J
    H --> J
    I --> J
    J --> M
    J --> N
    J --> O
    K --> M
    L --> M

    style D fill:#e3f2fd
    style G fill:#f3e5f5
    style J fill:#fff3e0
```

## Core Architecture Patterns

### 1. Component Composition Pattern

```typescript
// Higher-order components for reusability
const withDataFetching = (WrappedComponent: React.ComponentType<any>) => {
  return (props: any) => {
    const { data, loading, error } = useDataHook();
    return <WrappedComponent {...props} data={data} loading={loading} error={error} />;
  };
};

// Render props for flexible data handling
const DataProvider = ({ children, render }) => {
  const data = useDataHook();
  return children ? children(data) : render(data);
};
```

### 2. Custom Hooks Pattern

```typescript
// Data fetching hooks
const useProjects = (filters?: ProjectFilters) => {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: () => projectService.getProjects(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Business logic hooks
const useProjectActions = (projectId: string) => {
  const queryClient = useQueryClient();

  const updateProject = useMutation({
    mutationFn: (updates: Partial<Project>) =>
      projectService.updateProject(projectId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  return { updateProject };
};
```

### 3. Context Provider Pattern

```typescript
// Auth context for global state
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Auth logic here...

  const value = {
    user,
    profile,
    signIn,
    signOut,
    // ... other methods
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

## Service Layer Architecture

### API Service Pattern

```typescript
// Base service class
class BaseService {
  protected supabase = createClient<Database>(url, key);

  protected async handleError(error: any): Promise<never> {
    console.error('Service error:', error);
    throw new Error(error.message || 'An unexpected error occurred');
  }

  protected async handleResponse<T>(response: any): Promise<T> {
    if (response.error) {
      return this.handleError(response.error);
    }
    return response.data;
  }
}

// Project service extending base
export class ProjectService extends BaseService {
  async getProjects(filters?: ProjectFilters): Promise<Project[]> {
    try {
      let query = this.supabase
        .from('projects')
        .select(`
          *,
          customer_organization:organizations(*),
          current_stage:workflow_stages(*),
          assignee:users(*)
        `);

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const response = await query;
      return this.handleResponse<Project[]>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }
}
```

### Data Transformation Layer

```typescript
// Data transformers for consistent API responses
export const projectTransformer = {
  fromApi: (apiData: any): Project => ({
    id: apiData.id,
    title: apiData.title,
    status: apiData.status,
    // ... other fields
    customer_organization: apiData.customer_organization,
    current_stage: apiData.current_stage,
    // Computed fields
    days_in_stage: calculateDaysInStage(apiData.stage_entered_at),
    due_date: apiData.estimated_delivery_date,
  }),

  toApi: (project: Project): any => ({
    title: project.title,
    status: project.status,
    // ... other fields
  }),
};
```

## State Management Architecture

### React Query for Server State

```typescript
// Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Custom retry logic
        if (error?.status === 401) return false;
        return failureCount < 3;
      },
    },
    mutations: {
      retry: false,
      onError: (error) => {
        console.error('Mutation error:', error);
        // Global error handling
      },
    },
  },
});
```

### Context for Client State

```typescript
// UI state management
const UIContext = createContext<{
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
} | undefined>(undefined);
```

## Security Architecture

### Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant A as AuthContext
    participant S as Supabase Auth
    participant DB as Database

    U->>A: Login Request
    A->>S: signInWithPassword
    S-->>S: Validate Credentials
    S-->>A: JWT Token
    A->>DB: Fetch User Profile
    DB-->>A: User Data
    A-->>U: Authenticated Session
```

### Authorization Pattern

```typescript
// Role-based access control hook
const usePermissions = (requiredRoles?: string[]) => {
  const { profile } = useAuth();
  const userRole = profile?.role;

  const hasPermission = useMemo(() => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    if (!userRole) return false;
    return requiredRoles.includes(userRole);
  }, [userRole, requiredRoles]);

  return { hasPermission, userRole };
};

// Usage in components
const AdminPanel = () => {
  const { hasPermission } = usePermissions(['admin', 'management']);

  if (!hasPermission) {
    return <AccessDenied />;
  }

  return <AdminContent />;
};
```

## Performance Optimization

### Code Splitting Strategy

```typescript
// Route-based code splitting
const Projects = lazy(() => import('../pages/Projects'));
const ProjectDetail = lazy(() => import('../pages/ProjectDetail'));

// Component-based code splitting for heavy components
const DocumentViewer = lazy(() => import('../components/documents/DocumentViewer'));

// With loading fallbacks
<Suspense fallback={<PageSkeleton />}>
  <Routes>
    <Route path="/projects" element={<Projects />} />
    <Route path="/project/:id" element={<ProjectDetail />} />
  </Routes>
</Suspense>
```

### Caching Strategy

```typescript
// Multi-layer caching
const useProjectsWithCache = (filters?: ProjectFilters) => {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: () => projectService.getProjects(filters),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    // Background refetching
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};
```

## Real-time Architecture

### Supabase Realtime Integration

```typescript
// Real-time subscriptions
const useRealtimeProjects = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('projects')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects'
        },
        (payload) => {
          // Update cache on real-time changes
          queryClient.invalidateQueries({ queryKey: ['projects'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};
```

## Deployment Architecture

### Build Pipeline

```mermaid
graph LR
    subgraph "Development"
        A[Local Development]
        B[Hot Reload]
        C[Dev Server]
    end

    subgraph "Build Process"
        D[Vite Build]
        E[Asset Optimization]
        F[Code Splitting]
    end

    subgraph "Deployment"
        G[Static Assets]
        H[CDN Distribution]
        I[Web Server]
    end

    A --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I

    style D fill:#e8f5e8
    style G fill:#fff3e0
```

### Environment Configuration

```typescript
// Environment-based configuration
const config = {
  development: {
    apiUrl: 'http://localhost:54321',
    enableDebug: true,
    logLevel: 'debug',
  },
  staging: {
    apiUrl: 'https://staging-api.supabase.co',
    enableDebug: false,
    logLevel: 'warn',
  },
  production: {
    apiUrl: 'https://api.supabase.co',
    enableDebug: false,
    logLevel: 'error',
  },
};

const currentConfig = config[import.meta.env.MODE] || config.development;
```

## Monitoring and Observability

### Error Handling

```typescript
// Global error boundary
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error reporting service
    errorReporting.captureException(error, { extra: errorInfo });

    // Log to activity log
    logActivity('error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }
}
```

### Performance Monitoring

```typescript
// Performance tracking hook
const usePerformanceTracking = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Track component render time
      analytics.track('component_render', {
        component: componentName,
        duration,
        timestamp: new Date().toISOString(),
      });
    };
  }, [componentName]);
};
```

This architecture provides a scalable, maintainable, and performant foundation for the Factory Pulse MES system, with clear separation of concerns and modern development practices.


```mermaid
erDiagram
    ORGANIZATIONS ||--o{ USERS : "has"
    ORGANIZATIONS ||--o{ PROJECTS : "has"
    ORGANIZATIONS ||--o{ CONTACTS : "has"
    ORGANIZATIONS ||--o{ WORKFLOW_STAGES : "has"
    ORGANIZATIONS ||--o{ WORKFLOW_DEFINITIONS : "has"
    ORGANIZATIONS ||--o{ DOCUMENTS : "has"
    ORGANIZATIONS ||--o{ MESSAGES : "has"
    ORGANIZATIONS ||--o{ NOTIFICATIONS : "has"
    ORGANIZATIONS ||--o{ ACTIVITY_LOG : "has"
    ORGANIZATIONS ||--o{ APPROVALS : "has"
    ORGANIZATIONS ||--o{ DOCUMENT_VERSIONS : "has"

    WORKFLOW_STAGES ||--o{ WORKFLOW_SUB_STAGES : "contains"

    WORKFLOW_DEFINITIONS ||--o{ WORKFLOW_DEFINITION_STAGES : "includes"
    WORKFLOW_DEFINITIONS ||--o{ WORKFLOW_DEFINITION_SUB_STAGES : "includes"
    WORKFLOW_DEFINITION_STAGES }o--|| WORKFLOW_STAGES : "references"
    WORKFLOW_DEFINITION_SUB_STAGES }o--|| WORKFLOW_SUB_STAGES : "references"

    PROJECTS }o--|| WORKFLOW_DEFINITIONS : "workflow_definition_id"
    PROJECTS }o--|| WORKFLOW_STAGES : "current_stage_id"
    PROJECTS ||--o{ PROJECT_SUB_STAGE_PROGRESS : "tracks"
    PROJECT_SUB_STAGE_PROGRESS }o--|| WORKFLOW_STAGES : "for_stage"
    PROJECT_SUB_STAGE_PROGRESS }o--|| WORKFLOW_SUB_STAGES : "for_sub_stage"

    APPROVALS ||--o{ APPROVAL_HISTORY : "has"
    APPROVALS ||--o{ APPROVAL_ATTACHMENTS : "has"
    APPROVALS ||--o{ APPROVAL_NOTIFICATIONS : "sends"
    APPROVALS }o--|| APPROVAL_CHAINS : "optional_chain"
    APPROVALS }o..o{ PROJECT_SUB_STAGE_PROGRESS : "entity_type='project_sub_stage' & entity_id"

    PROJECTS ||--o{ DOCUMENTS : "has"
    DOCUMENTS ||--o{ DOCUMENT_VERSIONS : "versioned"
    DOCUMENT_ACCESS_LOG }o--|| DOCUMENTS : "logs_access"

    USERS ||--o{ PROJECT_ASSIGNMENTS : "assigned_to"
    PROJECTS ||--o{ PROJECT_ASSIGNMENTS : "has_team"

    USERS ||--o{ MESSAGES : "sends/receives"
    PROJECTS ||--o{ MESSAGES : "context"

    USERS ||--o{ NOTIFICATIONS : "receives"

    USERS ||--o{ ACTIVITY_LOG : "performs"
    PROJECTS ||--o{ ACTIVITY_LOG : "generates"

    PROJECTS }o..o{ CONTACTS : "point_of_contacts[]"

    ORGANIZATIONS {
        uuid id PK
        text name
        text slug UK
        text organization_type
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }

    USERS {
        uuid id PK
        uuid organization_id FK
        text email UK
        text name
        user_role role
        user_status status
        uuid direct_manager_id FK
        timestamptz last_login_at
        jsonb preferences
        timestamptz created_at
        timestamptz updated_at
    }

    CONTACTS {
        uuid id PK
        uuid organization_id FK
        contact_type type
        text company_name
        text contact_name
        text email
        boolean is_primary_contact
        timestamptz created_at
        timestamptz updated_at
    }

    PROJECTS {
        uuid id PK
        uuid organization_id FK
        text project_id UK
        text title
        uuid customer_organization_id FK
        uuid workflow_definition_id FK
        uuid current_stage_id FK
        project_status status
        priority_level priority_level
        uuid created_by FK
        uuid assigned_to FK
        uuid[] point_of_contacts
        timestamptz stage_entered_at
        timestamptz created_at
        timestamptz updated_at
    }

    WORKFLOW_STAGES {
        uuid id PK
        uuid organization_id FK
        text name
        text slug
        int stage_order
        boolean is_active
        int estimated_duration_days
        timestamptz created_at
        timestamptz updated_at
    }

    WORKFLOW_SUB_STAGES {
        uuid id PK
        uuid organization_id FK
        uuid workflow_stage_id FK
        text name
        text slug
        int sub_stage_order
        boolean is_required
        boolean requires_approval
        jsonb metadata
        timestamptz created_at
        timestamptz updated_at
    }

    WORKFLOW_DEFINITIONS {
        uuid id PK
        uuid organization_id FK
        text name
        int version
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }

    WORKFLOW_DEFINITION_STAGES {
        uuid id PK
        uuid workflow_definition_id FK
        uuid workflow_stage_id FK
        boolean is_included
        int stage_order_override
        timestamptz created_at
        timestamptz updated_at
    }

    WORKFLOW_DEFINITION_SUB_STAGES {
        uuid id PK
        uuid workflow_definition_id FK
        uuid workflow_sub_stage_id FK
        boolean is_included
        int sub_stage_order_override
        boolean requires_approval_override
        timestamptz created_at
        timestamptz updated_at
    }

    PROJECT_SUB_STAGE_PROGRESS {
        uuid id PK
        uuid organization_id FK
        uuid project_id FK
        uuid workflow_stage_id FK
        uuid sub_stage_id FK
        text status
        timestamptz started_at
        timestamptz completed_at
        uuid assigned_to FK
        jsonb metadata
        timestamptz created_at
        timestamptz updated_at
    }

    APPROVALS {
        uuid id PK
        uuid organization_id FK
        approval_type approval_type
        text entity_type
        uuid entity_id
        approval_status status
        approval_priority priority
        uuid requested_by FK
        uuid current_approver_id FK
        timestamptz created_at
        timestamptz updated_at
    }

    APPROVAL_HISTORY {
        uuid id PK
        uuid approval_id FK
        uuid organization_id FK
        approval_status old_status
        approval_status new_status
        uuid action_by FK
        timestamptz action_at
        text comments
    }

    APPROVAL_ATTACHMENTS {
        uuid id PK
        uuid approval_id FK
        uuid organization_id FK
        uuid uploaded_by FK
        text file_url
        timestamptz uploaded_at
    }

    APPROVAL_NOTIFICATIONS {
        uuid id PK
        uuid approval_id FK
        uuid organization_id FK
        uuid recipient_id FK
        timestamptz sent_at
        timestamptz read_at
    }

    APPROVAL_CHAINS {
        uuid id PK
        uuid organization_id FK
        text chain_name
        jsonb conditions
        jsonb steps
        boolean is_active
    }

    DOCUMENTS {
        uuid id PK
        uuid organization_id FK
        uuid project_id FK
        text title
        text file_path
        int version
        boolean is_current_version
        uuid uploaded_by FK
        uuid approved_by FK
        timestamptz created_at
        timestamptz updated_at
    }

    DOCUMENT_VERSIONS {
        uuid id PK
        uuid organization_id FK
        uuid document_id FK
        int version_number
        text file_path
        uuid uploaded_by FK
        boolean is_current
        timestamptz uploaded_at
    }

    DOCUMENT_ACCESS_LOG {
        uuid id PK
        uuid document_id FK
        uuid user_id FK
        text action
        timestamptz accessed_at
    }

    MESSAGES {
        uuid id PK
        uuid organization_id FK
        uuid project_id FK
        uuid sender_id FK
        uuid recipient_id FK
        text subject
        text content
        timestamptz created_at
    }

    NOTIFICATIONS {
        uuid id PK
        uuid organization_id FK
        uuid user_id FK
        text type
        text title
        text message
        priority_level priority
        timestamptz created_at
        timestamptz read_at
    }

    ACTIVITY_LOG {
        uuid id PK
        uuid organization_id FK
        uuid user_id FK
        uuid project_id FK
        text entity_type
        uuid entity_id
        text action
        timestamptz created_at
    }
```

---

```mermaid
flowchart LR
    %% Entities (clusters)
    subgraph ORG_SCOPE["Organization & Identity"]
        ORG[(organizations)]
        USR[(users)]
        CNT[(contacts)]
    end

    subgraph WF_CATALOG["Workflow Catalog (Reusable)"]
        WS[(workflow_stages)]
        WSS[(workflow_sub_stages)]
    end

    subgraph WF_TEMPLATES["Workflow Templates (Option A)"]
        WD[(workflow_definitions)]
        WDS[(workflow_definition_stages)]
        WDSS[(workflow_definition_sub_stages)]
    end

    subgraph PRJ["Project Execution"]
        P[(projects)]
        PSSP[(project_sub_stage_progress)]
    end

    subgraph APV["Approvals"]
        AP[(approvals)]
        ACH[(approval_chains)]
        AH[(approval_history)]
        AAT[(approval_attachments)]
        ANO[(approval_notifications)]
    end

    subgraph DOCS["Documents"]
        D[(documents)]
        DV[(document_versions)]
        DAL[(document_access_log)]
    end

    subgraph COMMS["Communication"]
        MSG[(messages)]
        NOTI[(notifications)]
    end

    subgraph AUDIT["Audit"]
        AL[(activity_log)]
    end

    %% Org relationships
    ORG --> USR
    ORG --> P
    ORG --> WS
    ORG --> WD
    ORG --> D
    ORG --> MSG
    ORG --> NOTI
    ORG --> AL

    %% Template bindings
    WD -->|includes| WDS -->|ref| WS
    WD -->|includes| WDSS -->|ref| WSS
    WS -->|catalog_of| WSS

    %% Project picks a template and stage
    P -->|workflow_definition_id| WD
    P -->|current_stage_id| WS
    P -->|customer_organization_id| ORG
    P --- CNT:::dotted

    %% Stage-change seeding
    P -- "UPDATE current_stage_id" --> F1[("create_project_sub_stage_progress()")]
    F1 -->|seed included sub-stages| PSSP
    PSSP -->|for_stage| WS
    PSSP -->|for_sub_stage| WSS

    %% Sub-stage completion & approvals
    PSSP -- "requires_approval?" --> AP
    AP --> AH
    AP --> AAT
    AP --> ANO
    AP --> ACH
    AP -- "decision" --> PSSP

    %% Stage change notifications
    P -- "stage changed" --> F2[("handle_project_stage_change()")]
    F2 --> NOTI

    %% Documents versioning flow
    D -- "INSERT" --> T1[("create_initial_document_version()")]
    T1 --> DV
    DV -- "is_current=true" --> T2[("update_document_on_version_change()")]
    T2 --> D
    DAL -- "INSERT (view/download)" --> T3[("update_document_link_access()")]
    T3 --> D

    %% Project context for docs/messages
    P --> D
    P --> MSG
    USR --> MSG
    USR --> NOTI

    %% Activity logging (dotted lines)
    classDef dotted stroke-dasharray: 5 5,stroke:#666,color:#333;
    P -.->|logged| AL
    D -.->|logged| AL
    MSG -.->|logged| AL
    AP -.->|logged| AL
    PSSP -.->|logged| AL

    %% Styling
    classDef cluster fill:#f8f9fb,stroke:#ccd5e0,stroke-width:1px;
    class ORG_SCOPE,WF_CATALOG,WF_TEMPLATES,PRJ,APV,DOCS,COMMS,AUDIT cluster
```