# Factory Pulse Architecture Diagrams

**Generated:** September 2, 2025  
**Version:** 1.0  
**System:** Factory Pulse Manufacturing Execution System (MES)

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Database Schema Relationships](#database-schema-relationships)
3. [Component Architecture](#component-architecture)
4. [Data Flow Patterns](#data-flow-patterns)
5. [Project Workflow Management](#project-workflow-management)
6. [Approval System Flow](#approval-system-flow)
7. [Authentication & Authorization](#authentication--authorization)
8. [Service Layer Architecture](#service-layer-architecture)
9. [Real-time Communication](#real-time-communication)
10. [Error Handling & Recovery](#error-handling--recovery)

---

## System Overview

### High-Level System Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[React App]
        B[Vite Build System]
        C[TypeScript]
        D[Tailwind CSS]
    end
    
    subgraph "Component Layer"
        E[Project Components]
        F[Approval Components]
        G[UI Components]
        H[Layout Components]
    end
    
    subgraph "Hook Layer"
        I[useProjects]
        J[useApprovals]
        K[useAuth]
        L[useDashboardData]
    end
    
    subgraph "Service Layer"
        M[ProjectService]
        N[ApprovalService]
        O[NotificationService]
        P[WorkflowService]
    end
    
    subgraph "Data Layer"
        Q[Supabase Client]
        R[PostgreSQL Database]
        S[Real-time Subscriptions]
    end
    
    subgraph "External Services"
        T[Email Service]
        U[File Storage]
        V[Analytics]
    end
    
    A --> E
    A --> F
    A --> G
    A --> H
    
    E --> I
    F --> J
    H --> K
    H --> L
    
    I --> M
    J --> N
    M --> O
    M --> P
    
    M --> Q
    N --> Q
    O --> Q
    P --> Q
    
    Q --> R
    Q --> S
    
    O --> T
    M --> U
    P --> V
```

---

## Database Schema Relationships

### Core Entity Relationships

```mermaid
erDiagram
    organizations ||--o{ users : "belongs to"
    organizations ||--o{ contacts : "manages"
    organizations ||--o{ workflow_stages : "configures"
    organizations ||--o{ workflow_sub_stages : "configures"
    organizations ||--o{ projects : "owns"
    organizations ||--o{ documents : "contains"
    organizations ||--o{ reviews : "requires"
    organizations ||--o{ messages : "communicates"
    organizations ||--o{ notifications : "generates"
    organizations ||--o{ activity_log : "tracks"
    
    users ||--o{ users : "manages"
    users ||--o{ projects : "creates/assigns"
    users ||--o{ project_assignments : "assigned to"
    users ||--o{ documents : "uploads"
    users ||--o{ reviews : "performs"
    users ||--o{ messages : "sends"
    users ||--o{ notifications : "receives"
    users ||--o{ activity_log : "performs actions"
    
    contacts ||--o{ projects : "customer"
    contacts ||--o{ supplier_rfqs : "supplier"
    
    workflow_stages ||--o{ workflow_sub_stages : "contains"
    workflow_stages ||--o{ projects : "current stage"
    workflow_stages ||--o{ project_stage_history : "tracks"
    
    workflow_sub_stages ||--o{ project_sub_stage_progress : "has progress"
    
    projects ||--o{ documents : "contains"
    projects ||--o{ reviews : "requires"
    projects ||--o{ messages : "related to"
    projects ||--o{ notifications : "generates"
    projects ||--o{ project_stage_history : "tracks progression"
    projects ||--o{ project_assignments : "has assignments"
    projects ||--o{ activity_log : "logs activities"
    projects ||--o{ project_sub_stage_progress : "tracks sub-stages"
    
    documents ||--o{ document_comments : "has comments"
    documents ||--o{ document_access_log : "tracks access"
    
    reviews ||--o{ review_checklist_items : "contains items"
    
    organizations {
        uuid id PK
        varchar name
        varchar slug UK
        varchar domain
        text logo_url
        text description
        varchar industry
        jsonb settings
        varchar subscription_plan
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    users {
        uuid id PK
        uuid organization_id FK
        varchar email UK
        varchar name
        varchar role
        varchar department
        varchar phone
        text avatar_url
        boolean is_active
        text description
        varchar employee_id
        uuid direct_manager_id FK
        uuid_array direct_reports
        timestamp last_login_at
        jsonb preferences
        timestamp created_at
        timestamp updated_at
    }
    
    contacts {
        uuid id PK
        uuid organization_id FK
        varchar type
        varchar company_name
        varchar contact_name
        varchar email
        varchar phone
        text address
        varchar city
        varchar state
        varchar country
        varchar postal_code
        varchar website
        varchar tax_id
        varchar payment_terms
        decimal credit_limit
        boolean is_active
        text notes
        jsonb metadata
        timestamp created_at
        timestamp updated_at
        uuid created_by FK
    }
    
    projects {
        uuid id PK
        uuid organization_id FK
        varchar project_id UK
        varchar title
        text description
        uuid customer_id FK
        uuid current_stage_id FK
        varchar status
        integer priority_score
        varchar priority_level
        decimal estimated_value
        date estimated_delivery_date
        date actual_delivery_date
        varchar source
        text_array tags
        jsonb metadata
        timestamp created_at
        timestamp updated_at
        uuid created_by FK
        uuid assigned_to FK
    }
    
    workflow_stages {
        uuid id PK
        uuid organization_id FK
        varchar name
        varchar slug
        text description
        varchar color
        integer stage_order
        boolean is_active
        text exit_criteria
        text_array responsible_roles
        integer sub_stages_count
        integer estimated_duration_days
        jsonb required_approvals
        jsonb auto_advance_conditions
        timestamp created_at
        timestamp updated_at
    }
    
    workflow_sub_stages {
        uuid id PK
        uuid organization_id FK
        uuid workflow_stage_id FK
        varchar name
        varchar slug
        text description
        varchar color
        integer sub_stage_order
        boolean is_active
        text exit_criteria
        text_array responsible_roles
        integer estimated_duration_hours
        boolean is_required
        boolean can_skip
        boolean auto_advance
        boolean requires_approval
        text_array approval_roles
        jsonb metadata
        timestamp created_at
        timestamp updated_at
    }
    
    project_sub_stage_progress {
        uuid id PK
        uuid organization_id FK
        uuid project_id FK
        uuid workflow_stage_id FK
        uuid sub_stage_id FK
        varchar status
        timestamp started_at
        timestamp completed_at
        uuid assigned_to FK
        text notes
        jsonb metadata
        timestamp created_at
        timestamp updated_at
    }
    
    documents {
        uuid id PK
        uuid project_id FK
        varchar file_name
        varchar original_file_name
        varchar file_type
        bigint file_size
        text file_url
        varchar mime_type
        integer version
        boolean is_latest
        varchar document_type
        varchar access_level
        varchar checksum
        jsonb metadata
        timestamp uploaded_at
        uuid uploaded_by FK
        timestamp approved_at
        uuid approved_by FK
    }
    
    reviews {
        uuid id PK
        uuid project_id FK
        uuid reviewer_id FK
        varchar reviewer_role
        varchar review_type
        varchar status
        varchar priority
        text comments
        jsonb risks
        text recommendations
        boolean tooling_required
        decimal estimated_cost
        integer estimated_lead_time
        date due_date
        timestamp reviewed_at
        timestamp created_at
        timestamp updated_at
    }
    
    messages {
        uuid id PK
        uuid project_id FK
        uuid thread_id
        uuid sender_id FK
        varchar sender_type
        uuid sender_contact_id FK
        varchar recipient_type
        uuid recipient_id
        varchar recipient_role
        varchar recipient_department
        varchar subject
        text content
        varchar message_type
        varchar priority
        boolean is_read
        timestamp read_at
        jsonb attachments
        jsonb metadata
        timestamp created_at
        timestamp updated_at
    }
    
    notifications {
        uuid id PK
        uuid organization_id FK
        uuid user_id FK
        varchar type
        varchar title
        text message
        jsonb data
        boolean is_read
        timestamp read_at
        timestamp created_at
        timestamp updated_at
    }
    
    activity_log {
        uuid id PK
        uuid organization_id FK
        varchar action
        uuid user_id FK
        varchar entity_type
        uuid entity_id
        jsonb old_values
        jsonb new_values
        varchar user_agent
        timestamp created_at
    }
```

---

## Component Architecture

### React Component Hierarchy

```mermaid
graph TB
    subgraph "App Level"
        A[App.tsx]
        B[AuthProvider]
        C[SessionManagerWrapper]
        D[TooltipProvider]
    end
    
    subgraph "Layout Components"
        E[AppLayout]
        F[ProtectedRoute]
        G[ProjectDetailLayout]
        H[ResponsiveNavigationWrapper]
    end
    
    subgraph "Page Components"
        I[Dashboard]
        J[Projects]
        K[ProjectDetail]
        L[Approvals]
        M[Customers]
        N[Suppliers]
    end
    
    subgraph "Project Components"
        O[EnhancedProjectList]
        P[ProjectDetailHeader]
        Q[WorkflowStepper]
        R[StageConfigurationPanel]
        S[ProjectStatusManager]
        T[ProjectAttributesManager]
        U[EnhancedProjectCreationModal]
        V[StageTransitionValidator]
        W[ProjectReviewForm]
        X[DocumentManager]
        Y[ProjectCommunication]
    end
    
    subgraph "Approval Components"
        Z[ApprovalDashboard]
        AA[ApprovalModal]
        BB[ApprovalStatusWidget]
        CC[ApprovalHistoryList]
        DD[BulkApprovalModal]
        EE[ApprovalDelegationModal]
    end
    
    subgraph "UI Components"
        FF[Modal]
        GG[Button]
        HH[Card]
        II[Table]
        JJ[Form]
        KK[Toast]
    end
    
    A --> B
    A --> C
    A --> D
    
    B --> E
    C --> E
    D --> E
    
    E --> F
    E --> I
    E --> J
    E --> K
    E --> L
    E --> M
    E --> N
    
    F --> G
    K --> G
    
    G --> O
    G --> P
    G --> Q
    G --> R
    G --> S
    G --> T
    G --> U
    G --> V
    G --> W
    G --> X
    G --> Y
    
    L --> Z
    L --> AA
    L --> BB
    L --> CC
    L --> DD
    L --> EE
    
    O --> FF
    P --> GG
    Q --> HH
    R --> II
    S --> JJ
    T --> KK
```

### Component Data Flow

```mermaid
graph LR
    subgraph "User Interface"
        A[User Action]
        B[Component Event]
        C[Form Submission]
    end
    
    subgraph "Hook Layer"
        D[useProjects]
        E[useApprovals]
        F[useAuth]
        G[useDashboardData]
        H[useDocuments]
        I[useProjectReviews]
    end
    
    subgraph "Service Layer"
        J[ProjectService]
        K[ApprovalService]
        L[NotificationService]
        M[WorkflowService]
        N[DocumentService]
    end
    
    subgraph "Data Layer"
        O[Supabase Client]
        P[Database]
        Q[Real-time Manager]
    end
    
    A --> B
    B --> C
    C --> D
    C --> E
    C --> F
    
    D --> J
    E --> K
    F --> L
    G --> M
    H --> N
    I --> K
    
    J --> O
    K --> O
    L --> O
    M --> O
    N --> O
    
    O --> P
    O --> Q
```

---

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
    
    Note over C,RT: Delete Project
    C->>H: deleteProject(id)
    H->>S: deleteProject(id)
    S->>DB: DELETE project
    DB-->>S: Confirmation
    S-->>H: Success
    H-->>C: Updated state
    DB->>RT: Change notification
    RT-->>H: Real-time update
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

---

## Project Workflow Management

### Workflow Stage System

```mermaid
graph LR
    A[Inquiry Received] --> B[Technical Review]
    B --> C[Supplier RFQ Sent]
    C --> D[Quoted]
    D --> E[Order Confirmed]
    E --> F[Procurement Planning]
    F --> G[In Production]
    G --> H[Shipped & Closed]
    
    style A fill:#3B82F6
    style B fill:#F59E0B
    style C fill:#8B5CF6
    style D fill:#10B981
    style E fill:#6366F1
    style F fill:#8B5CF6
    style G fill:#84CC16
    style H fill:#6B7280
```

### Sub-Stage Workflow Detail

```mermaid
graph TB
    subgraph "Inquiry Received"
        A1[RFQ Documentation Review]
        A2[Initial Feasibility Assessment]
        A3[Customer Requirements Clarification]
    end
    
    subgraph "Technical Review"
        B1[Engineering Technical Review]
        B2[QA Requirements Review]
        B3[Production Capability Assessment]
        B4[Cross-Team Meeting]
    end
    
    subgraph "Supplier RFQ Sent"
        C1[Supplier Identification]
        C2[RFQ Preparation]
        C3[RFQ Distribution]
        C4[Supplier Response Collection]
    end
    
    subgraph "Quoted"
        D1[Cost Analysis]
        D2[Quote Preparation]
        D3[Quote Review and Approval]
        D4[Quote Submission]
    end
    
    subgraph "Order Confirmed"
        E1[Customer PO Review]
        E2[Contract Finalization]
        E3[Production Planning Initiation]
    end
    
    subgraph "Procurement Planning"
        F1[BOM Finalization]
        F2[Purchase Order Issuance]
        F3[Material Planning]
        F4[Production Schedule Confirmation]
    end
    
    subgraph "In Production"
        G1[Manufacturing Setup]
        G2[Assembly Process]
        G3[Quality Control Testing]
        G4[Final Assembly and Packaging]
    end
    
    subgraph "Shipped & Closed"
        H1[Shipping Preparation]
        H2[Product Delivery]
        H3[Project Documentation]
        H4[Project Closure]
    end
    
    A1 --> A2 --> A3
    B1 --> B2 --> B3 --> B4
    C1 --> C2 --> C3 --> C4
    D1 --> D2 --> D3 --> D4
    E1 --> E2 --> E3
    F1 --> F2 --> F3 --> F4
    G1 --> G2 --> G3 --> G4
    H1 --> H2 --> H3 --> H4
```

### Stage Transition Logic

```mermaid
graph TD
    A[User Requests Stage Change] --> B{Validate User Permissions}
    B -->|Fail| C[Show Permission Error]
    B -->|Pass| D{Check Prerequisites}
    
    D -->|Fail| E[Show Prerequisite Errors]
    D -->|Pass| F{Check Approval Requirements}
    
    F -->|Required| G[Create Approval Requests]
    F -->|Not Required| H[Execute Stage Transition]
    
    G --> I[Send Notifications]
    I --> J[Wait for Approvals]
    J --> K{All Approvals Received?}
    
    K -->|No| L[Show Pending Approvals]
    K -->|Yes| H
    
    H --> M[Update Project Stage]
    M --> N[Log Activity]
    N --> O[Send Notifications]
    O --> P[Update UI]
    
    C --> Q[Error Handling]
    E --> Q
    L --> Q
```

---

## Approval System Flow

### Approval Request Creation

```mermaid
sequenceDiagram
    participant P as Project
    participant WS as Workflow Stage
    participant AS as ApprovalService
    participant U as Users
    participant R as Reviews Table
    participant N as NotificationService
    
    P->>WS: Stage transition requested
    WS->>AS: Check approval requirements
    AS->>U: Find users with approval roles
    AS->>R: Create approval requests
    AS->>N: Send approval notifications
    N->>U: Notify approvers
    
    Note over P,N: Approval requests created and notifications sent
```

### Approval Decision Flow

```mermaid
graph TD
    A[Approver Receives Notification] --> B[Review Project Details]
    B --> C[View Approval Requirements]
    C --> D{Make Decision}
    
    D -->|Approve| E[Submit Approval]
    D -->|Reject| F[Submit Rejection]
    D -->|Delegate| G[Delegate to Another User]
    
    E --> H[Update Approval Status]
    F --> H
    G --> I[Create Delegation Record]
    I --> J[Notify Delegate]
    J --> B
    
    H --> K{All Approvals Complete?}
    K -->|Yes| L[Enable Stage Transition]
    K -->|No| M[Continue Waiting]
    
    L --> N[Update Project Stage]
    M --> O[Show Pending Status]
    
    N --> P[Send Notifications]
    O --> Q[Update UI]
```

### Approval System Architecture

```mermaid
graph TB
    subgraph "Approval Components"
        A[ApprovalDashboard]
        B[ApprovalModal]
        C[ApprovalStatusWidget]
        D[ApprovalHistoryList]
        E[BulkApprovalModal]
        F[ApprovalDelegationModal]
    end
    
    subgraph "Approval Services"
        G[ApprovalService]
        H[NotificationService]
        I[useApprovals Hook]
        J[useProjectApprovalStatus Hook]
    end
    
    subgraph "Data Storage"
        K[Reviews Table]
        L[Activity Log]
        M[Notifications Table]
    end
    
    subgraph "Integration Points"
        N[Project Detail Page]
        O[Workflow Stepper]
        P[Stage Transition Validator]
    end
    
    A --> G
    B --> G
    C --> I
    D --> G
    E --> G
    F --> G
    
    G --> H
    G --> K
    G --> L
    
    H --> M
    
    N --> C
    O --> C
    P --> G
```

---

## Authentication & Authorization

### Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant A as Auth Component
    participant AC as AuthContext
    participant S as Supabase Auth
    participant DB as Database
    participant RT as Realtime Manager
    
    U->>A: Enter credentials
    A->>AC: signIn(email, password)
    AC->>S: signInWithPassword()
    S-->>AC: Session & User
    AC->>DB: Fetch user profile
    DB-->>AC: User profile
    AC->>RT: Set authentication status
    AC-->>A: Authentication success
    A-->>U: Redirect to dashboard
    
    Note over U,RT: User is now authenticated and authorized
```

### Role-Based Access Control

```mermaid
graph TB
    subgraph "User Roles"
        A[Admin]
        B[Management]
        C[Sales]
        D[Engineering]
        E[QA]
        F[Production]
        G[Procurement]
        H[Supplier]
        I[Customer]
    end
    
    subgraph "System Access Levels"
        J[Full System Access]
        K[Project Management]
        L[Approval Management]
        M[Read-Only Access]
        N[Limited Access]
    end
    
    subgraph "Protected Routes"
        O[admin]
        P[projects]
        Q[approvals]
        R[dashboard]
        S[customers]
        T[suppliers]
    end
    
    A --> J
    B --> K
    B --> L
    C --> K
    D --> K
    E --> K
    F --> K
    G --> K
    G --> L
    H --> N
    I --> M
    
    J --> O
    J --> P
    J --> Q
    J --> R
    J --> S
    J --> T
    
    K --> P
    K --> R
    L --> Q
    M --> R
    N --> S
```

### Session Management

```mermaid
graph TD
    A[User Login] --> B[Create Session]
    B --> C[Store Session Token]
    C --> D[Set Authentication State]
    D --> E[Initialize Real-time Manager]
    E --> F[Load User Profile]
    F --> G[Set Role Permissions]
    G --> H[Enable Protected Features]
    
    I[Session Expiry] --> J[Clear Session]
    J --> K[Redirect to Login]
    K --> L[Clear Local State]
    L --> M[Disconnect Real-time]
    
    N[User Logout] --> O[Sign Out]
    O --> P[Clear Auth Data]
    P --> Q[Redirect to Login]
    Q --> R[Reset Application State]
```

---

## Service Layer Architecture

### Service Dependencies

```mermaid
graph TB
    subgraph "Core Services"
        A[ProjectService]
        B[ApprovalService]
        C[NotificationService]
        D[WorkflowService]
        E[DocumentService]
        F[UserService]
    end
    
    subgraph "Support Services"
        G[CacheService]
        H[RetryService]
        I[OptimizedQueryService]
        J[ActivityAnalyticsService]
        K[StageHistoryService]
        L[WorkflowSubStageService]
    end
    
    subgraph "Data Access"
        M[Supabase Client]
        N[Real-time Manager]
        O[Cache Manager]
    end
    
    A --> G
    A --> H
    A --> I
    A --> M
    A --> N
    
    B --> C
    B --> G
    B --> M
    B --> N
    
    C --> M
    C --> N
    
    D --> K
    D --> L
    D --> M
    D --> N
    
    E --> G
    E --> M
    E --> N
    
    F --> M
    F --> N
    
    G --> O
    I --> G
    I --> M
    J --> M
    K --> M
    L --> M
```

### Service Method Relationships

```mermaid
graph LR
    subgraph "Project Operations"
        A[createProject]
        B[updateProject]
        C[deleteProject]
        D[getProjectById]
        E[getAllProjects]
    end
    
    subgraph "Workflow Operations"
        F[advanceStage]
        G[validateTransition]
        H[getWorkflowStages]
        I[getSubStages]
    end
    
    subgraph "Approval Operations"
        J[createApprovalRequests]
        K[submitApproval]
        L[getApprovalStatus]
        M[getApprovalHistory]
    end
    
    subgraph "Notification Operations"
        N[sendNotification]
        O[sendEmail]
        P[createActivityLog]
    end
    
    A --> N
    B --> N
    C --> N
    F --> J
    F --> N
    G --> L
    J --> N
    K --> N
    K --> P
```

---

## Real-time Communication

### Real-time Manager Architecture

```mermaid
graph TB
    subgraph "Real-time Manager"
        A[RealtimeManager]
        B[Channel Manager]
        C[Subscription Manager]
        D[Event Processor]
        E[Rate Limiter]
        F[Connection Monitor]
    end
    
    subgraph "Channels"
        G[Project Updates]
        H[Approval Notifications]
        I[Document Changes]
        J[Message Updates]
        K[Activity Log]
    end
    
    subgraph "Event Types"
        L[INSERT]
        M[UPDATE]
        N[DELETE]
        O[Custom Events]
    end
    
    A --> B
    A --> C
    A --> D
    A --> E
    A --> F
    
    B --> G
    B --> H
    B --> I
    B --> J
    B --> K
    
    D --> L
    D --> M
    D --> N
    D --> O
```

### Real-time Event Flow

```mermaid
sequenceDiagram
    participant DB as Database
    participant RT as Realtime Manager
    participant C as Component
    participant H as Hook
    participant S as Service
    
    DB->>RT: Database change event
    RT->>RT: Process event
    RT->>RT: Apply rate limiting
    RT->>C: Broadcast change
    C->>H: Update local state
    H->>S: Sync with service
    S->>DB: Verify change
    DB-->>S: Confirmation
    S-->>H: Update confirmed
    H-->>C: Update UI
```

---

## Error Handling & Recovery

### Error Handling Architecture

```mermaid
graph TD
    A[Error Occurs] --> B{Error Type}
    
    B -->|Validation Error| C[Show Field Errors]
    B -->|Network Error| D[Retry with Backoff]
    B -->|Permission Error| E[Redirect to Auth]
    B -->|Database Error| F[Show Database Error]
    B -->|System Error| G[Show Generic Error]
    
    C --> H[User Corrects Input]
    D --> I{Retry Success?}
    I -->|Yes| J[Continue Operation]
    I -->|No| K[Show Error Message]
    
    E --> L[User Re-authenticates]
    F --> M[Log Error Details]
    G --> N[Show Error Boundary]
    
    H --> O[Retry Operation]
    J --> P[Success Flow]
    K --> Q[Error Recovery]
    L --> R[Resume Operation]
    M --> S[Error Logging]
    N --> T[Graceful Degradation]
```

### Recovery Mechanisms

```mermaid
graph LR
    subgraph "Error Recovery"
        A[Automatic Retry]
        B[Exponential Backoff]
        C[Fallback Data]
        D[Offline Mode]
        E[Error Boundaries]
        F[Graceful Degradation]
    end
    
    subgraph "User Recovery"
        G[Manual Retry]
        H[Refresh Page]
        I[Clear Cache]
        J[Re-authenticate]
        K[Contact Support]
    end
    
    subgraph "System Recovery"
        L[Connection Recovery]
        M[State Synchronization]
        N[Cache Invalidation]
        O[Service Restart]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    
    G --> H
    H --> I
    I --> J
    J --> K
    
    L --> M
    M --> N
    N --> O
```

---

## Summary

This comprehensive architecture diagram set provides a complete view of the Factory Pulse Manufacturing Execution System, covering:

1. **System Overview**: High-level architecture showing frontend, component, hook, service, and data layers
2. **Database Schema**: Complete entity relationships with all tables and their connections
3. **Component Architecture**: React component hierarchy and data flow patterns
4. **Data Flow**: CRUD operations, real-time synchronization, and error handling
5. **Project Workflow**: 8-stage workflow system with sub-stages and transition logic
6. **Approval System**: Complete approval workflow with request creation, decision flow, and integration
7. **Authentication**: User authentication, role-based access control, and session management
8. **Service Layer**: Service dependencies and method relationships
9. **Real-time Communication**: Real-time manager architecture and event flow
10. **Error Handling**: Comprehensive error handling and recovery mechanisms

The system is designed as a multi-tenant SaaS application with:
- **Scalable Architecture**: Component-based design with clear separation of concerns
- **Real-time Updates**: Live synchronization across all users
- **Role-based Security**: Granular permissions based on user roles
- **Workflow Management**: Configurable stages with approval requirements
- **Comprehensive Logging**: Activity tracking and audit trails
- **Error Resilience**: Multiple recovery mechanisms and graceful degradation

This architecture supports the complete manufacturing project lifecycle from initial inquiry through production to final delivery and closure.
