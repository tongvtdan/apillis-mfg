# Factory Pulse - Architecture Diagrams

## System Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        A[React SPA<br/>TypeScript + Vite]
        B[Tailwind CSS<br/>+ Radix UI]
        C[React Query<br/>+ Context API]
    end

    subgraph "API & Integration Layer"
        D[Supabase Client]
        E[REST API]
        F[GraphQL Support]
        G[Real-time Subscriptions]
    end

    subgraph "Backend Services"
        H[Supabase Platform]
        I[PostgreSQL Database]
        J[Supabase Auth]
        K[Supabase Storage]
        L[Supabase Realtime]
    end

    subgraph "External Systems"
        M[Google Drive API]
        N[Firebase Data Connect]
        O[Email Services]
        P[File Storage]
    end

    A --> D
    B --> A
    C --> A
    D --> H
    E --> H
    F --> H
    G --> H
    H --> I
    H --> J
    H --> K
    H --> L
    M --> H
    N --> H
    O --> J
    P --> K

    style A fill:#e1f5fe
    style H fill:#f3e5f5
    style I fill:#fff3e0
```

## Data Flow Architecture

```mermaid
graph TD
    subgraph "User Interface"
        UI1[Dashboard Components]
        UI2[Project Components]
        UI3[Form Components]
        UI4[Navigation Components]
    end

    subgraph "State Management"
        SM1[React Query Cache]
        SM2[Auth Context]
        SM3[UI State Context]
        SM4[Custom Hooks]
    end

    subgraph "Service Layer"
        SL1[Project Service]
        SL2[User Service]
        SL3[Document Service]
        SL4[Workflow Service]
    end

    subgraph "API Layer"
        API1[Supabase Client]
        API2[REST Endpoints]
        API3[Real-time Channels]
        API4[Storage API]
    end

    subgraph "Database Layer"
        DB1[Projects Table]
        DB2[Users Table]
        DB3[Workflow Stages]
        DB4[Documents Table]
        DB5[Activity Log]
    end

    UI1 --> SM1
    UI2 --> SM1
    UI3 --> SM2
    UI4 --> SM3

    SM1 --> SL1
    SM2 --> SL2
    SM3 --> SL3
    SM4 --> SL4

    SL1 --> API1
    SL2 --> API1
    SL3 --> API2
    SL4 --> API3

    API1 --> DB1
    API1 --> DB2
    API2 --> DB3
    API3 --> DB4
    API4 --> DB5

    style UI1 fill:#e8f5e8
    style SM1 fill:#e3f2fd
    style SL1 fill:#f3e5f5
    style API1 fill:#fff3e0
    style DB1 fill:#fce4ec
```

## Database Schema Relationships

```mermaid
erDiagram
    ORGANIZATIONS ||--o{ USERS : "has many"
    ORGANIZATIONS ||--o{ PROJECTS : "has many"
    ORGANIZATIONS ||--o{ CONTACTS : "has many"
    ORGANIZATIONS ||--o{ WORKFLOW_STAGES : "has many"
    ORGANIZATIONS ||--o{ DOCUMENTS : "has many"
    ORGANIZATIONS ||--o{ MESSAGES : "has many"
    ORGANIZATIONS ||--o{ NOTIFICATIONS : "has many"
    ORGANIZATIONS ||--o{ ACTIVITY_LOG : "has many"

    USERS ||--o{ PROJECT_ASSIGNMENTS : "assigned to"
    USERS ||--o{ DOCUMENTS : "uploads"
    USERS ||--o{ MESSAGES : "sends"
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--o{ ACTIVITY_LOG : "creates"

    PROJECTS ||--o{ PROJECT_ASSIGNMENTS : "has"
    PROJECTS ||--o{ DOCUMENTS : "contains"
    PROJECTS ||--o{ MESSAGES : "related to"
    PROJECTS ||--o{ ACTIVITY_LOG : "generates"
    PROJECTS ||--o{ PROJECT_SUB_STAGE_PROGRESS : "tracks"

    WORKFLOW_STAGES ||--o{ WORKFLOW_SUB_STAGES : "contains"
    WORKFLOW_STAGES ||--o{ PROJECT_SUB_STAGE_PROGRESS : "used in"

    WORKFLOW_SUB_STAGES ||--o{ PROJECT_SUB_STAGE_PROGRESS : "tracked by"

    CONTACTS ||--o{ PROJECTS : "associated with"

    ORGANIZATIONS {
        uuid id PK
        text name
        text slug UK
        text description
        text domain
        text industry
        text logo_url
        boolean is_active
        subscription_plan subscription_plan
        jsonb settings
        timestamptz created_at
        timestamptz updated_at
    }

    USERS {
        uuid id PK
        uuid organization_id FK
        text email UK
        text name
        user_role role
        text department
        text phone
        text avatar_url
        user_status status
        text description
        text employee_id
        uuid direct_manager_id FK
        uuid[] direct_reports
        timestamptz last_login_at
        jsonb preferences
        timestamptz created_at
        timestamptz updated_at
    }

    PROJECTS {
        uuid id PK
        uuid organization_id FK
        text project_id
        text title
        text description
        uuid customer_organization_id FK
        uuid[] point_of_contacts
        uuid current_stage_id FK
        project_status status
        priority_level priority_level
        numeric priority_score
        text source
        uuid assigned_to FK
        uuid created_by FK
        numeric estimated_value
        text[] tags
        jsonb metadata
        timestamptz stage_entered_at
        text project_type
        intake_type intake_type
        text intake_source
        text notes
        timestamptz created_at
        timestamptz updated_at
        date estimated_delivery_date
        date actual_delivery_date
    }

    WORKFLOW_STAGES {
        uuid id PK
        uuid organization_id FK
        text name
        text slug
        text description
        text color
        integer stage_order
        boolean is_active
        text exit_criteria
        text[] responsible_roles
        integer estimated_duration_days
        timestamptz created_at
        timestamptz updated_at
    }

    WORKFLOW_SUB_STAGES {
        uuid id PK
        uuid organization_id FK
        uuid workflow_stage_id FK
        text name
        text slug
        text description
        text color
        integer sub_stage_order
        boolean is_active
        text exit_criteria
        text[] responsible_roles
        integer estimated_duration_hours
        boolean is_required
        boolean can_skip
        boolean auto_advance
        boolean requires_approval
        text[] approval_roles
        jsonb metadata
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
        text phone
        text address
        text city
        text state
        text country
        text postal_code
        text website
        text tax_id
        text payment_terms
        numeric credit_limit
        boolean is_active
        text notes
        timestamptz created_at
        timestamptz updated_at
        uuid created_by FK
        jsonb metadata
        jsonb ai_category
        text[] ai_capabilities
        numeric ai_risk_score
        timestamptz ai_last_analyzed
    }
```

## Component Hierarchy

```mermaid
graph TD
    subgraph "App Root"
        A[App.tsx]
    end

    subgraph "Providers"
        B[AuthProvider]
        C[QueryClientProvider]
        D[TooltipProvider]
    end

    subgraph "Layout"
        E[AppLayout]
        F[AppSidebar]
        G[AppHeader]
        H[AppFooter]
    end

    subgraph "Pages"
        I[Dashboard]
        J[Projects]
        K[ProjectDetail]
        L[Users]
        M[Settings]
        N[Profile]
        O[Approvals]
    end

    subgraph "Feature Components"
        P[ProjectList]
        Q[ProjectForm]
        R[WorkflowViewer]
        S[DocumentManager]
        T[NotificationCenter]
    end

    subgraph "UI Components"
        U[Button]
        V[Input]
        W[Table]
        X[Modal]
        Y[Toast]
        Z[LoadingSpinner]
    end

    A --> B
    B --> C
    C --> D
    D --> E

    E --> F
    E --> G
    E --> H

    E --> I
    E --> J
    E --> K
    E --> L
    E --> M
    E --> N
    E --> O

    I --> P
    J --> Q
    K --> R
    L --> S
    M --> T

    P --> U
    Q --> V
    R --> W
    S --> X
    T --> Y
    U --> Z

    style A fill:#ffebee
    style E fill:#e8f5e8
    style I fill:#e3f2fd
    style P fill:#f3e5f5
    style U fill:#fff3e0
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Component
    participant A as AuthContext
    participant S as Supabase Auth
    participant DB as Database
    participant P as Profile

    U->>C: Click Login
    C->>A: signIn(email, password)
    A->>S: signInWithPassword()
    S-->>S: Validate Credentials
    S-->>A: JWT Token + User Data
    A->>A: Store Session
    A->>DB: Query User Profile
    DB-->>A: Profile Data
    A->>P: Set Profile State
    A-->>C: Authentication Success
    C-->>U: Redirect to Dashboard

    Note over U,P: User is now authenticated<br/>and can access protected routes
```

## Project Workflow

```mermaid
stateDiagram-v2
    [*] --> Intake
    Intake --> Assignment: Project Created
    Assignment --> Stage1: User Assigned

    state "Workflow Stages" as WS
    Stage1 --> Stage2: Stage Complete
    Stage2 --> Stage3: Stage Complete
    Stage3 --> Completed: All Stages Done

    WS --> OnHold: Pause Request
    OnHold --> WS: Resume
    WS --> Cancelled: Cancel Request

    Completed --> [*]
    Cancelled --> [*]

    note right of Intake
        RFQ received via:
        - Portal form
        - Email
        - API
        - Direct request
    end note

    note right of Assignment
        Assign based on:
        - User roles
        - Workload
        - Expertise
    end note

    note right of WS
        Dynamic stages:
        - Configurable per org
        - Role-based access
        - Progress tracking
    end note
```

## Data Synchronization Flow

```mermaid
graph TD
    subgraph "Real-time Updates"
        RT1[Supabase Realtime]
        RT2[WebSocket Connection]
        RT3[Change Events]
    end

    subgraph "Cache Management"
        CM1[React Query Cache]
        CM2[Cache Invalidation]
        CM3[Background Refetch]
    end

    subgraph "UI Updates"
        UI1[Component Re-render]
        UI2[Loading States]
        UI3[Error Handling]
    end

    subgraph "Optimistic Updates"
        OU1[Immediate UI Update]
        OU2[Rollback on Error]
        OU3[Conflict Resolution]
    end

    RT1 --> RT2
    RT2 --> RT3
    RT3 --> CM1
    CM1 --> CM2
    CM2 --> CM3
    CM3 --> UI1
    UI1 --> UI2
    UI2 --> UI3

    OU1 --> RT3
    RT3 --> OU2
    OU2 --> OU3

    style RT1 fill:#e8f5e8
    style CM1 fill:#e3f2fd
    style UI1 fill:#f3e5f5
    style OU1 fill:#fff3e0
```

## API Request Flow

```mermaid
sequenceDiagram
    participant Comp as Component
    participant Hook as Custom Hook
    participant RQ as React Query
    participant Serv as Service Layer
    participant Supa as Supabase Client
    participant API as Supabase API
    participant DB as PostgreSQL

    Comp->>Hook: useData()
    Hook->>RQ: useQuery()
    RQ->>Serv: service.getData()
    Serv->>Supa: supabase.from().select()
    Supa->>API: HTTP Request
    API->>DB: SQL Query
    DB-->>API: Result Set
    API-->>Supa: JSON Response
    Supa-->>Serv: Formatted Data
    Serv-->>RQ: Processed Data
    RQ-->>Hook: Cached Data
    Hook-->>Comp: Data + Loading State

    Note over Comp,DB: Complete request cycle<br/>with error handling
```

## File Upload Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Component
    participant H as Upload Hook
    participant S as Supabase Storage
    participant DB as Documents Table
    participant N as Notification

    U->>C: Select File
    C->>H: uploadFile(file)
    H->>S: upload(file, path)
    S-->>H: File URL
    H->>DB: INSERT document record
    DB-->>H: Document ID
    H->>N: Send notification
    N-->>U: Upload complete

    Note over U,N: File stored in Supabase Storage<br/>Metadata saved in database
```

## Error Handling Flow

```mermaid
graph TD
    subgraph "Error Sources"
        ES1[API Errors]
        ES2[Network Errors]
        ES3[Validation Errors]
        ES4[Authentication Errors]
    end

    subgraph "Error Handling"
        EH1[Service Layer]
        EH2[React Query]
        EH3[Error Boundary]
        EH4[Global Handler]
    end

    subgraph "User Feedback"
        UF1[Toast Notifications]
        UF2[Error Messages]
        UF3[Loading States]
        UF4[Fallback UI]
    end

    subgraph "Logging"
        LOG1[Console Logs]
        LOG2[Activity Log]
        LOG3[Error Reporting]
    end

    ES1 --> EH1
    ES2 --> EH2
    ES3 --> EH3
    ES4 --> EH4

    EH1 --> UF1
    EH2 --> UF2
    EH3 --> UF3
    EH4 --> UF4

    EH1 --> LOG1
    EH2 --> LOG2
    EH3 --> LOG3
    LOG1 --> LOG2
    LOG2 --> LOG3

    style ES1 fill:#ffebee
    style EH1 fill:#fff3e0
    style UF1 fill:#e8f5e8
    style LOG1 fill:#e3f2fd
```

## Deployment Pipeline

```mermaid
graph LR
    subgraph "Development"
        DEV1[Local Development]
        DEV2[Git Branch]
        DEV3[Code Review]
    end

    subgraph "Build"
        BLD1[Vite Build]
        BLD2[Asset Optimization]
        BLD3[Bundle Analysis]
    end

    subgraph "Testing"
        TST1[Unit Tests]
        TST2[Integration Tests]
        TST3[E2E Tests]
    end

    subgraph "Deployment"
        DEP1[Staging Environment]
        DEP2[Production Environment]
        DEP3[CDN Distribution]
    end

    subgraph "Monitoring"
        MON1[Error Tracking]
        MON2[Performance Monitoring]
        MON3[User Analytics]
    end

    DEV1 --> DEV2
    DEV2 --> DEV3
    DEV3 --> BLD1
    BLD1 --> BLD2
    BLD2 --> BLD3
    BLD3 --> TST1
    TST1 --> TST2
    TST2 --> TST3
    TST3 --> DEP1
    DEP1 --> DEP2
    DEP2 --> DEP3

    DEP1 --> MON1
    DEP2 --> MON2
    DEP3 --> MON3

    style DEV1 fill:#e8f5e8
    style BLD1 fill:#e3f2fd
    style TST1 fill:#fff3e0
    style DEP1 fill:#f3e5f5
    style MON1 fill:#fce4ec
```

## Security Architecture

```mermaid
graph TD
    subgraph "Authentication"
        AUTH1[JWT Tokens]
        AUTH2[Session Management]
        AUTH3[Password Policies]
        AUTH4[Multi-factor Auth]
    end

    subgraph "Authorization"
        AUTHZ1[Role-Based Access]
        AUTHZ2[Row Level Security]
        AUTHZ3[Organization Isolation]
        AUTHZ4[Resource Permissions]
    end

    subgraph "Data Protection"
        DP1[Encryption at Rest]
        DP2[Encryption in Transit]
        DP3[Input Validation]
        DP4[SQL Injection Prevention]
    end

    subgraph "Audit & Compliance"
        AUDIT1[Activity Logging]
        AUDIT2[Access Tracking]
        AUDIT3[Change History]
        AUDIT4[Compliance Reports]
    end

    AUTH1 --> AUTHZ1
    AUTH2 --> AUTHZ2
    AUTH3 --> AUTHZ3
    AUTH4 --> AUTHZ4

    AUTHZ1 --> DP1
    AUTHZ2 --> DP2
    AUTHZ3 --> DP3
    AUTHZ4 --> DP4

    DP1 --> AUDIT1
    DP2 --> AUDIT2
    DP3 --> AUDIT3
    DP4 --> AUDIT4

    style AUTH1 fill:#e8f5e8
    style AUTHZ1 fill:#e3f2fd
    style DP1 fill:#f3e5f5
    style AUDIT1 fill:#fff3e0
```

These diagrams provide a comprehensive visual representation of the Factory Pulse system architecture, showing how all components work together to deliver a robust, scalable manufacturing execution system.
