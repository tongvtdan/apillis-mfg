# API Documentation - Project Management Endpoints

## Overview

This document provides comprehensive API documentation for all project-related endpoints in the Factory Pulse system. The API is built on Supabase and follows REST principles with real-time capabilities.

## Base Configuration

### Supabase Client Setup

```typescript
import { createClient } from '@supabase/supabase-js';

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

### Authentication

All API calls require authentication via Supabase Auth. The system uses Row Level Security (RLS) to ensure data isolation by organization.

**Authentication**: All API calls require authentication via Supabase Auth. The system uses Row Level Security (RLS) to ensure data isolation by organization.

**ID Synchronization**: Perfect ID synchronization has been achieved between `auth.users` and `public.users` tables. All users now have matching IDs, eliminating the need for ID mapping.

```typescript
// Authentication check with direct ID matching
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  throw new Error('Authentication required');
}

// Direct ID usage - no mapping needed
const getUserProfile = async (authUserId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUserId) // Direct ID matching
    .single();
  
  return { data, error };
};
```

## Project Endpoints

### GET /projects - List Projects

**Purpose**: Retrieve paginated list of projects with optional filtering and sorting.

**Query Parameters**:
```typescript
interface ProjectListParams {
  page?: number;           // Page number (default: 1)
  limit?: number;          // Items per page (default: 50, max: 100)
  status?: ProjectStatus;  // Filter by status
  priority?: ProjectPriority; // Filter by priority
  assigned_to?: string;    // Filter by assignee UUID
  customer_id?: string;    // Filter by customer UUID
  stage_id?: string;       // Filter by workflow stage UUID
  search?: string;         // Search in title and description
  sort_by?: string;        // Sort field (default: 'updated_at')
  sort_order?: 'asc' | 'desc'; // Sort direction (default: 'desc')
}
```

**Implementation**:
```typescript
async function fetchProjects(params: ProjectListParams = {}) {
  const {
    page = 1,
    limit = 50,
    status,
    priority,
    assigned_to,
    customer_id,
    stage_id,
    search,
    sort_by = 'updated_at',
    sort_order = 'desc'
  } = params;

  let query = supabase
    .from('projects')
    .select(`
      id,
      project_id,
      title,
      description,
      status,
      priority_level,
      estimated_value,
      tags,
      project_type,
      created_at,
      updated_at,
      customer:contacts(
        id,
        name,
        company,
        email
      ),
      current_stage:workflow_stages(
        id,
        name,
        color,
        order_index
      ),
      assignee:users!assigned_to(
        id,
        name,
        email
      )
    `, { count: 'exact' });

  // Apply filters
  if (status) query = query.eq('status', status);
  if (priority) query = query.eq('priority_level', priority);
  if (assigned_to) query = query.eq('assigned_to', assigned_to);
  if (customer_id) query = query.eq('customer_id', customer_id);
  if (stage_id) query = query.eq('current_stage_id', stage_id);
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  // Apply sorting and pagination
  const offset = (page - 1) * limit;
  const { data, error, count } = await query
    .order(sort_by, { ascending: sort_order === 'asc' })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    projects: data,
    total: count,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit)
  };
}
```

**Response**:
```typescript
interface ProjectListResponse {
  projects: Project[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

### GET /projects/:id - Get Project Details

**Purpose**: Retrieve detailed information for a specific project.

**Implementation**:
```typescript
async function getProjectById(id: string) {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      customer:contacts(
        id,
        name,
        company,
        email,
        phone,
        address
      ),
      current_stage:workflow_stages(
        id,
        name,
        description,
        color,
        order_index,
        exit_criteria
      ),
      assignee:users!assigned_to(
        id,
        name,
        email,
        role
      ),
      creator:users!created_by(
        id,
        name,
        email
      ),
      organization:organizations(
        id,
        name
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}
```

**Response**: Complete `Project` object with all joined relationships.

### POST /projects - Create Project

**Purpose**: Create a new project with validation and workflow initialization.

**Request Body**:
```typescript
interface CreateProjectRequest {
  project_id: string;        // Unique project identifier
  title: string;             // Project title
  description?: string;      // Project description
  customer_id?: string;      // Customer UUID
  priority_level?: ProjectPriority; // Default: 'medium'
  estimated_value?: number;  // Project value
  project_type?: string;     // Project category
  tags?: string[];           // Project tags
  notes?: string;            // Additional notes
  assigned_to?: string;      // Assignee UUID
}
```

**Implementation**:
```typescript
async function createProject(data: CreateProjectRequest) {
  // Get user info for created_by
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required');

  // Get organization info
  const { data: profile } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single();

  if (!profile) throw new Error('User profile not found');

  // Get initial workflow stage
  const { data: initialStage } = await supabase
    .from('workflow_stages')
    .select('id')
    .eq('organization_id', profile.organization_id)
    .eq('is_active', true)
    .order('order_index')
    .limit(1)
    .single();

  const projectData = {
    ...data,
    organization_id: profile.organization_id,
    created_by: user.id,
    current_stage_id: initialStage?.id,
    status: 'active' as ProjectStatus,
    source: 'portal',
    stage_entered_at: new Date().toISOString(),
  };

  const { data: project, error } = await supabase
    .from('projects')
    .insert(projectData)
    .select()
    .single();

  if (error) throw error;
  return project;
}
```

**Response**: Created `Project` object.

### PUT /projects/:id - Update Project

**Purpose**: Update existing project with validation and optimistic locking.

**Request Body**:
```typescript
interface UpdateProjectRequest {
  title?: string;
  description?: string;
  customer_id?: string;
  status?: ProjectStatus;
  priority_level?: ProjectPriority;
  estimated_value?: number;
  project_type?: string;
  tags?: string[];
  notes?: string;
  assigned_to?: string;
  current_stage_id?: string;
}
```

**Implementation**:
```typescript
async function updateProject(id: string, data: UpdateProjectRequest) {
  const updateData = {
    ...data,
    updated_at: new Date().toISOString(),
  };

  // If stage is changing, update stage_entered_at
  if (data.current_stage_id) {
    updateData.stage_entered_at = new Date().toISOString();
  }

  const { data: project, error } = await supabase
    .from('projects')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      customer:contacts(name, company),
      current_stage:workflow_stages(name, color),
      assignee:users!assigned_to(name, email)
    `)
    .single();

  if (error) throw error;
  return project;
}
```

**Response**: Updated `Project` object with relationships.

### DELETE /projects/:id - Delete Project

**Purpose**: Soft delete or hard delete project based on business rules.

**Implementation**:
```typescript
async function deleteProject(id: string, hardDelete = false) {
  if (hardDelete) {
    // Hard delete - removes all related data
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  } else {
    // Soft delete - mark as cancelled
    return updateProject(id, { status: 'cancelled' });
  }
}
```

## Workflow Stage Endpoints

### GET /workflow-stages - List Workflow Stages

**Purpose**: Retrieve active workflow stages for the organization.

**Implementation**:
```typescript
async function getWorkflowStages() {
  const { data, error } = await supabase
    .from('workflow_stages')
    .select('*')
    .eq('is_active', true)
    .order('order_index');

  if (error) throw error;
  return data;
}
```

### PUT /projects/:id/stage - Update Project Stage

**Purpose**: Advance or revert project to a different workflow stage with comprehensive history tracking.

**Request Body**:
```typescript
interface UpdateStageRequest {
  stage_id: string;
  notes?: string;
  bypass_validation?: boolean;
  bypass_reason?: string;
}
```

**Implementation**:
```typescript
import { stageHistoryService } from '@/services/stageHistoryService';

async function updateProjectStage(
  projectId: string, 
  { stage_id, notes, bypass_validation = false, bypass_reason }: UpdateStageRequest
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required');

  // Get current project stage for transition tracking
  const { data: currentProject } = await supabase
    .from('projects')
    .select('current_stage_id')
    .eq('id', projectId)
    .single();

  // Validate stage transition if not bypassing
  if (!bypass_validation) {
    const isValidTransition = await validateStageTransition(projectId, stage_id);
    if (!isValidTransition) {
      throw new Error('Invalid stage transition');
    }
  }

  const { data, error } = await supabase
    .from('projects')
    .update({
      current_stage_id: stage_id,
      stage_entered_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId)
    .select(`
      *,
      current_stage:workflow_stages(name, color, order_index)
    `)
    .single();

  if (error) throw error;

  // Record stage transition in history
  await stageHistoryService.recordStageTransition({
    projectId,
    fromStageId: currentProject?.current_stage_id,
    toStageId: stage_id,
    userId: user.id,
    reason: notes,
    bypassRequired: bypass_validation,
    bypassReason: bypass_reason
  });

  return data;
}
```

### GET /projects/:id/stage-history - Get Project Stage History

**Purpose**: Retrieve complete stage transition history for a project.

**Implementation**:
```typescript
import { stageHistoryService } from '@/services/stageHistoryService';

async function getProjectStageHistory(projectId: string) {
  const history = await stageHistoryService.getProjectStageHistory(projectId);
  return history;
}
```

**Response**:
```typescript
interface ProjectStageHistory {
  id: string;
  project_id: string;
  stage_id: string;
  stage_name: string;
  entered_at: string;
  exited_at?: string;
  duration_minutes?: number;
  entered_by: string;
  user_name: string;
  user_email: string;
  exit_reason?: string;
  notes?: string;
  bypass_required: boolean;
  bypass_reason?: string;
  created_at: string;
}
```

### GET /organizations/:id/stage-transitions - Get Organization Stage Transition Analytics

**Purpose**: Retrieve stage transition statistics and analytics for an organization.

**Query Parameters**:
```typescript
interface StageTransitionStatsParams {
  from?: string;  // ISO date string
  to?: string;    // ISO date string
}
```

**Implementation**:
```typescript
import { stageHistoryService } from '@/services/stageHistoryService';

async function getStageTransitionStats(
  organizationId: string, 
  dateRange?: { from: string; to: string }
) {
  const stats = await stageHistoryService.getStageTransitionStats(organizationId, dateRange);
  return stats;
}
```

**Response**:
```typescript
interface StageTransitionStats {
  totalTransitions: number;
  bypassTransitions: number;
  stageTransitionCounts: Record<string, number>;
  averageStageTime: Record<string, number>;
  bypassReasons: string[];
}
```

### GET /organizations/:id/recent-transitions - Get Recent Stage Transitions

**Purpose**: Retrieve recent stage transitions across all projects in an organization.

**Query Parameters**:
```typescript
interface RecentTransitionsParams {
  limit?: number;  // Default: 10, Max: 50
}
```

**Implementation**:
```typescript
import { stageHistoryService } from '@/services/stageHistoryService';

async function getRecentStageTransitions(
  organizationId: string, 
  limit: number = 10
) {
  const transitions = await stageHistoryService.getRecentStageTransitions(organizationId, limit);
  return transitions;
}
```

**Response**:
```typescript
interface RecentStageTransition {
  id: string;
  action: 'stage_transition' | 'stage_transition_bypass';
  project_id: string;
  project_title: string;
  project_number: string;
  stage_name: string;
  user_name: string;
  bypass_required: boolean;
  created_at: string;
}
```

## Review System Endpoints

### GET /projects/:id/reviews - Get Project Reviews

**Purpose**: Retrieve all reviews for a specific project.

**Implementation**:
```typescript
async function getProjectReviews(projectId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      reviewer:users(name, email, role),
      project:projects(title, project_id)
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
```

### POST /projects/:id/reviews - Create Review

**Purpose**: Create a new review for a project.

**Request Body**:
```typescript
interface CreateReviewRequest {
  review_type: 'engineering' | 'qa' | 'production' | 'procurement';
  status: 'pending' | 'in_progress' | 'approved' | 'rejected';
  comments?: string;
  assigned_to?: string;
  due_date?: string;
  metadata?: Record<string, any>;
}
```

**Implementation**:
```typescript
async function createProjectReview(
  projectId: string, 
  data: CreateReviewRequest
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required');

  const reviewData = {
    ...data,
    project_id: projectId,
    created_by: user.id,
    status: data.status || 'pending',
  };

  const { data: review, error } = await supabase
    .from('reviews')
    .insert(reviewData)
    .select(`
      *,
      reviewer:users(name, email),
      creator:users!created_by(name, email)
    `)
    .single();

  if (error) throw error;
  return review;
}
```

## Real-time Subscriptions

### Project Changes Subscription

**Purpose**: Listen for real-time changes to projects.

**Implementation**:
```typescript
function subscribeToProjectChanges(
  organizationId: string,
  callback: (payload: any) => void
) {
  const subscription = supabase
    .channel('projects')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'projects',
      filter: `organization_id=eq.${organizationId}`,
    }, callback)
    .subscribe();

  return subscription;
}

// Usage
const subscription = subscribeToProjectChanges(orgId, (payload) => {
  console.log('Project changed:', payload);
  // Update local state
  refetchProjects();
});

// Cleanup
subscription.unsubscribe();
```

### Review Status Subscription

**Purpose**: Listen for review status changes.

**Implementation**:
```typescript
function subscribeToReviewChanges(
  projectId: string,
  callback: (payload: any) => void
) {
  return supabase
    .channel(`reviews:${projectId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'reviews',
      filter: `project_id=eq.${projectId}`,
    }, callback)
    .subscribe();
}
```

## Error Handling

### Standard Error Responses

```typescript
interface APIError {
  error: {
    message: string;
    code?: string;
    details?: any;
    hint?: string;
  };
}

// Common error types
const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  CONSTRAINT_VIOLATION: 'CONSTRAINT_VIOLATION',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const;
```

### Error Handling Patterns

```typescript
import { handleDatabaseError, formatDatabaseError } from '@/lib/validation/error-handlers';

async function handleAPICall<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    // Use centralized database error handling
    if (error.code) {
      // Both functions are equivalent - use either for consistency
      throw handleDatabaseError(error);
      // or: throw formatDatabaseError(error);
    }
    
    // Network errors
    if (error.message?.includes('fetch')) {
      throw new Error('Network connection failed');
    }
    
    // Re-throw unknown errors
    throw error;
  }
}

// Example usage in service methods
export const projectService = {
  async createProject(data: CreateProjectRequest) {
    try {
      const { data: project, error } = await supabase
        .from('projects')
        .insert(data)
        .select()
        .single();

      if (error) throw handleDatabaseError(error);
      return project;
    } catch (error) {
      // Error is already formatted by handleDatabaseError
      throw error;
    }
  }
};
```

## Rate Limiting and Performance

### Query Optimization

```typescript
// Efficient project loading with minimal data
const optimizedProjectQuery = supabase
  .from('projects')
  .select(`
    id,
    project_id,
    title,
    status,
    priority_level,
    updated_at,
    customer:contacts(name, company),
    current_stage:workflow_stages(name, color)
  `)
  .limit(50);

// Avoid N+1 queries by using joins
const projectsWithDetails = supabase
  .from('projects')
  .select(`
    *,
    reviews(count),
    documents(count),
    messages(count)
  `);
```

### Caching Strategy

```typescript
// Cache configuration
const CACHE_DURATION = {
  projects: 5 * 60 * 1000,      // 5 minutes
  workflow_stages: 60 * 60 * 1000, // 1 hour
  users: 30 * 60 * 1000,       // 30 minutes
};

// Cache implementation
class APICache {
  private cache = new Map();
  
  async get<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION.projects) {
      return cached.data;
    }
    
    const data = await fetcher();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }
  
  invalidate(pattern: string) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}
```

## Testing API Endpoints

### Unit Tests

```typescript
describe('Project API', () => {
  beforeEach(() => {
    // Setup test database
    jest.clearAllMocks();
  });

  it('fetches projects with correct filters', async () => {
    const mockProjects = [createMockProject()];
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockResolvedValue({
        data: mockProjects,
        error: null,
        count: 1,
      }),
    });

    const result = await fetchProjects({ status: 'active' });
    expect(result.projects).toEqual(mockProjects);
  });

  it('handles create project validation', async () => {
    const invalidData = { title: '' }; // Missing required fields
    
    await expect(createProject(invalidData)).rejects.toThrow();
  });
});
```

### Integration Tests

```typescript
describe('Project API Integration', () => {
  it('creates and retrieves project successfully', async () => {
    const projectData = {
      project_id: 'P-250130001',
      title: 'Test Project',
      description: 'Integration test project',
    };

    const created = await createProject(projectData);
    expect(created.id).toBeDefined();

    const retrieved = await getProjectById(created.id);
    expect(retrieved.title).toBe(projectData.title);
  });
});
```

## Best Practices

### API Design

1. **Consistent Naming**: Use snake_case for database fields, camelCase for TypeScript
2. **Proper HTTP Methods**: GET for reads, POST for creates, PUT for updates, DELETE for deletes
3. **Pagination**: Always paginate list endpoints
4. **Filtering**: Support common filter patterns
5. **Sorting**: Allow sorting by relevant fields

### Security

1. **Row Level Security**: Enforce organization-based data isolation
2. **Input Validation**: Validate all inputs on both client and server
3. **Authentication**: Require authentication for all endpoints
4. **Authorization**: Check permissions before data access
5. **SQL Injection Prevention**: Use parameterized queries

### Performance

1. **Selective Loading**: Only fetch required fields
2. **Efficient Joins**: Use proper join strategies
3. **Caching**: Cache frequently accessed data
4. **Real-time Optimization**: Use selective subscriptions
5. **Query Optimization**: Monitor and optimize slow queries