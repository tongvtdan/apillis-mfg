# Troubleshooting Guide

## Overview

This comprehensive troubleshooting guide provides step-by-step solutions for common issues in the Factory Pulse project management system. It covers database problems, frontend issues, performance problems, and integration failures.

## Quick Diagnostic Checklist

### System Health Check

```bash
# Check if services are running
curl -f http://localhost:8080/health || echo "Frontend not responding"
curl -f https://your-supabase-url.supabase.co/rest/v1/ || echo "Database not responding"

# Check browser console for errors
# Open Developer Tools (F12) and check Console tab

# Check network connectivity
ping google.com

# Check local environment
node --version
npm --version
```

### Common Error Patterns

| Error Pattern                       | Likely Cause            | Quick Fix                                       |
| ----------------------------------- | ----------------------- | ----------------------------------------------- |
| `fetch failed`                      | Network/API issue       | Check internet connection, verify API endpoints |
| `Cannot read property of undefined` | Data structure mismatch | Check API response format                       |
| `Validation error`                  | Form input issue        | Check required fields and data types            |
| `Permission denied`                 | Authentication issue    | Check user login status and permissions         |
| `Constraint violation`              | Database rule violation | Check data integrity and foreign keys           |

## Database Issues

### Connection Problems

#### Symptom: "Connection refused" or timeout errors

**Diagnosis Steps**:
```typescript
// Test database connection
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Database connection failed:', error);
      return false;
    }
    
    console.log('Database connection successful');
    return true;
  } catch (err) {
    console.error('Network error:', err);
    return false;
  }
};
```

**Solutions**:
1. **Check Environment Variables**:
   ```bash
   # Verify .env.local file exists and contains:
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

2. **Verify Supabase Project Status**:
   - Log into Supabase dashboard
   - Check project status and health
   - Verify API keys are correct

3. **Network Troubleshooting**:
   ```bash
   # Test direct API access
   curl -H "apikey: YOUR_ANON_KEY" \
        -H "Authorization: Bearer YOUR_ANON_KEY" \
        "https://your-project.supabase.co/rest/v1/projects?select=*&limit=1"
   ```

### Query Performance Issues

#### Symptom: Slow loading times, timeouts

**Diagnosis**:
```sql
-- Check slow queries
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements 
WHERE query LIKE '%projects%'
ORDER BY total_time DESC
LIMIT 10;

-- Check missing indexes
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE tablename = 'projects'
ORDER BY n_distinct DESC;
```

**Solutions**:
1. **Add Missing Indexes**:
   ```sql
   -- Common indexes for projects table
   CREATE INDEX IF NOT EXISTS idx_projects_organization_id ON projects(organization_id);
   CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
   CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);
   CREATE INDEX IF NOT EXISTS idx_projects_customer_id ON projects(customer_id);
   ```

2. **Optimize Queries**:
   ```typescript
   // Instead of loading all fields
   const { data } = await supabase
     .from('projects')
     .select('*');
   
   // Load only required fields
   const { data } = await supabase
     .from('projects')
     .select(`
       id,
       project_id,
       title,
       status,
       customer:contacts(name, company)
     `);
   ```

3. **Implement Pagination**:
   ```typescript
   const ITEMS_PER_PAGE = 50;
   const { data, count } = await supabase
     .from('projects')
     .select('*', { count: 'exact' })
     .range(offset, offset + ITEMS_PER_PAGE - 1);
   ```

### Data Integrity Issues

#### Symptom: Foreign key violations, constraint errors

**Diagnosis**:
```sql
-- Check for orphaned records
SELECT p.id, p.project_id, p.customer_id
FROM projects p
LEFT JOIN contacts c ON p.customer_id = c.id
WHERE p.customer_id IS NOT NULL AND c.id IS NULL;

-- Check constraint violations
SELECT * FROM projects 
WHERE status NOT IN ('active', 'on_hold', 'delayed', 'cancelled', 'completed');
```

**Solutions**:
1. **Fix Orphaned Records**:
   ```sql
   -- Option 1: Set to NULL
   UPDATE projects 
   SET customer_id = NULL 
   WHERE customer_id NOT IN (SELECT id FROM contacts);
   
   -- Option 2: Create missing records
   INSERT INTO contacts (id, name, organization_id)
   SELECT DISTINCT 
     p.customer_id,
     'Unknown Customer',
     p.organization_id
   FROM projects p
   WHERE p.customer_id NOT IN (SELECT id FROM contacts);
   ```

2. **Fix Constraint Violations**:
   ```sql
   -- Fix invalid status values
   UPDATE projects 
   SET status = 'active' 
   WHERE status NOT IN ('active', 'on_hold', 'delayed', 'cancelled', 'completed');
   ```

## Frontend Issues

### Component Rendering Problems

#### Symptom: Components not displaying, blank screens

**Diagnosis Steps**:
1. **Check Browser Console**:
   ```javascript
   // Look for JavaScript errors
   // Check Network tab for failed requests
   // Verify React DevTools shows component tree
   ```

2. **Check Component Props**:
   ```typescript
   // Add debugging to component
   const ProjectTable = ({ projects, loading }) => {
     console.log('ProjectTable props:', { projects, loading });
     
     if (loading) return <div>Loading...</div>;
     if (!projects) return <div>No data</div>;
     if (projects.length === 0) return <div>No projects found</div>;
     
     return (
       <div>
         {projects.map(project => (
           <div key={project.id}>{project.title}</div>
         ))}
       </div>
     );
   };
   ```

**Solutions**:
1. **Add Error Boundaries**:
   ```typescript
   <ProjectErrorBoundary>
     <ProjectTable projects={projects} />
   </ProjectErrorBoundary>
   ```

2. **Implement Loading States**:
   ```typescript
   const ProjectList = () => {
     const { projects, loading, error } = useProjects();
     
     if (loading) return <LoadingSpinner />;
     if (error) return <ErrorMessage error={error} />;
     if (!projects?.length) return <EmptyState />;
     
     return <ProjectTable projects={projects} />;
   };
   ```

### State Management Issues

#### Symptom: Data not updating, stale state

**Diagnosis**:
```typescript
// Check React Query cache
import { useQueryClient } from '@tanstack/react-query';

const DebugComponent = () => {
  const queryClient = useQueryClient();
  
  const debugCache = () => {
    const cache = queryClient.getQueryCache();
    console.log('Query cache:', cache.getAll());
  };
  
  return <button onClick={debugCache}>Debug Cache</button>;
};
```

**Solutions**:
1. **Force Cache Invalidation**:
   ```typescript
   const { mutate: updateProject } = useMutation({
     mutationFn: projectService.updateProject,
     onSuccess: () => {
       // Invalidate and refetch
       queryClient.invalidateQueries(['projects']);
     },
   });
   ```

2. **Fix Optimistic Updates**:
   ```typescript
   const updateProjectMutation = useMutation({
     mutationFn: projectService.updateProject,
     onMutate: async (variables) => {
       // Cancel outgoing refetches
       await queryClient.cancelQueries(['projects']);
       
       // Snapshot previous value
       const previousProjects = queryClient.getQueryData(['projects']);
       
       // Optimistically update
       queryClient.setQueryData(['projects'], (old: Project[]) =>
         old.map(p => p.id === variables.id ? { ...p, ...variables.data } : p)
       );
       
       return { previousProjects };
     },
     onError: (err, variables, context) => {
       // Rollback on error
       if (context?.previousProjects) {
         queryClient.setQueryData(['projects'], context.previousProjects);
       }
     },
   });
   ```

### Form Validation Issues

#### Symptom: Form submissions failing, validation errors

**Diagnosis**:
```typescript
// Add form debugging
const ProjectForm = () => {
  const form = useForm({
    resolver: zodResolver(ProjectSchema),
    onInvalid: (errors) => {
      console.log('Form validation errors:', errors);
    },
  });
  
  const onSubmit = (data) => {
    console.log('Form data:', data);
    // Check if data matches expected schema
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* form fields */}
    </form>
  );
};
```

**Solutions**:
1. **Fix Schema Validation**:
   ```typescript
   // Ensure schema matches database constraints
   const ProjectSchema = z.object({
     project_id: z.string().min(1).max(50),
     title: z.string().min(1).max(255),
     status: z.enum(['active', 'on_hold', 'delayed', 'cancelled', 'completed']),
     priority_level: z.enum(['low', 'medium', 'high', 'urgent']),
   });
   ```

2. **Add Field-Level Validation**:
   ```typescript
   <FormField
     control={form.control}
     name="project_id"
     render={({ field }) => (
       <FormItem>
         <FormLabel>Project ID</FormLabel>
         <FormControl>
           <Input 
             {...field} 
             onChange={(e) => {
               // Custom validation
               const value = e.target.value.toUpperCase();
               field.onChange(value);
             }}
           />
         </FormControl>
         <FormMessage />
       </FormItem>
     )}
   />
   ```

## Real-time Issues

### Subscription Problems

#### Symptom: Real-time updates not working

**Diagnosis**:
```typescript
// Test subscription manually
const testSubscription = () => {
  const channel = supabase
    .channel('test-channel')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'projects',
    }, (payload) => {
      console.log('Received update:', payload);
    })
    .on('system', {}, (payload) => {
      console.log('System event:', payload);
    })
    .subscribe((status) => {
      console.log('Subscription status:', status);
    });
  
  return channel;
};
```

**Solutions**:
1. **Check Subscription Configuration**:
   ```typescript
   // Ensure proper filtering
   const subscription = supabase
     .channel('projects')
     .on('postgres_changes', {
       event: '*',
       schema: 'public',
       table: 'projects',
       filter: `organization_id=eq.${organizationId}`, // Important!
     }, handleUpdate)
     .subscribe();
   ```

2. **Implement Reconnection Logic**:
   ```typescript
   const useRealtimeProjects = (organizationId: string) => {
     const [reconnectAttempts, setReconnectAttempts] = useState(0);
     const maxAttempts = 5;
     
     useEffect(() => {
       const subscription = supabase
         .channel(`projects:${organizationId}`)
         .on('postgres_changes', {
           event: '*',
           schema: 'public',
           table: 'projects',
           filter: `organization_id=eq.${organizationId}`,
         }, handleUpdate)
         .on('system', {}, (payload) => {
           if (payload.type === 'error' && reconnectAttempts < maxAttempts) {
             setTimeout(() => {
               setReconnectAttempts(prev => prev + 1);
               subscription.subscribe();
             }, Math.pow(2, reconnectAttempts) * 1000);
           }
         })
         .subscribe();
       
       return () => subscription.unsubscribe();
     }, [organizationId, reconnectAttempts]);
   };
   ```

## Performance Issues

### Slow Page Loads

#### Symptom: Pages taking too long to load

**Diagnosis Tools**:
```typescript
// Performance monitoring
const measurePageLoad = () => {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  console.log('Page load metrics:', {
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
    firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
    firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
  });
};

// Component render timing
const ProfiledComponent = () => {
  const startTime = performance.now();
  
  useEffect(() => {
    const endTime = performance.now();
    console.log(`Component render time: ${endTime - startTime}ms`);
  });
  
  return <div>Component content</div>;
};
```

**Solutions**:
1. **Optimize Bundle Size**:
   ```bash
   # Analyze bundle
   npm run build
   npx vite-bundle-analyzer dist
   
   # Implement code splitting
   const ProjectDetail = lazy(() => import('./ProjectDetail'));
   ```

2. **Optimize Database Queries**:
   ```typescript
   // Use selective loading
   const { data: projects } = useQuery(['projects'], () =>
     supabase
       .from('projects')
       .select(`
         id,
         project_id,
         title,
         status,
         customer:contacts(name)
       `)
       .limit(50)
   );
   ```

3. **Implement Caching**:
   ```typescript
   const { data: projects } = useQuery(
     ['projects', filters],
     () => fetchProjects(filters),
     {
       staleTime: 5 * 60 * 1000, // 5 minutes
       cacheTime: 10 * 60 * 1000, // 10 minutes
     }
   );
   ```

### Memory Leaks

#### Symptom: Increasing memory usage, browser slowdown

**Diagnosis**:
```typescript
// Memory monitoring
const monitorMemory = () => {
  const memoryInfo = (performance as any).memory;
  if (memoryInfo) {
    console.log('Memory usage:', {
      used: Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024) + ' MB',
      total: Math.round(memoryInfo.totalJSHeapSize / 1024 / 1024) + ' MB',
      limit: Math.round(memoryInfo.jsHeapSizeLimit / 1024 / 1024) + ' MB',
    });
  }
};

// Check for memory leaks
setInterval(monitorMemory, 10000); // Every 10 seconds
```

**Solutions**:
1. **Fix Subscription Cleanup**:
   ```typescript
   useEffect(() => {
     const subscription = subscribeToProjects(organizationId, handleUpdate);
     
     // Always cleanup
     return () => {
       subscription.unsubscribe();
     };
   }, [organizationId]);
   ```

2. **Fix Timer Cleanup**:
   ```typescript
   useEffect(() => {
     const timer = setInterval(() => {
       // Some periodic task
     }, 1000);
     
     return () => clearInterval(timer);
   }, []);
   ```

3. **Fix Event Listener Cleanup**:
   ```typescript
   useEffect(() => {
     const handleResize = () => {
       // Handle window resize
     };
     
     window.addEventListener('resize', handleResize);
     return () => window.removeEventListener('resize', handleResize);
   }, []);
   ```

## Authentication Issues

### ID Synchronization Status

#### Current Status: Perfect ID synchronization achieved

**Resolution Completed**: All ID mismatches between `auth.users` and `public.users` tables have been resolved through database constraint fixes.

**Current Implementation**: Direct ID matching without mapping complexity.

```typescript
// Current: Direct ID matching (ID_MISMATCH_MAP removed)
const getUserProfile = async (authUser) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id) // Direct ID matching
    .single();
    
  return { data, error };
};
```

**Verification**:
```typescript
// Test direct ID synchronization
const testIdSynchronization = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  
  console.log(`Auth ID: ${user.id}`);
  
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id) // Direct matching
    .single();
    
  return !!profile;
};
```

**Benefits of Resolution**:
- Simplified authentication flow
- Better performance (no ID translation overhead)
- Cleaner, more maintainable code
- Direct database relationships work correctly

### Login Problems

#### Symptom: Users cannot log in, authentication failures

**Diagnosis**:
```typescript
// Test authentication
const testAuth = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Auth error:', error);
      return false;
    }
    
    if (!user) {
      console.log('No authenticated user');
      return false;
    }
    
    console.log('User authenticated:', user.email);
    return true;
  } catch (err) {
    console.error('Auth check failed:', err);
    return false;
  }
};
```

**Solutions**:
1. **Check Auth Configuration**:
   ```typescript
   // Verify Supabase client setup
   const supabase = createClient(
     process.env.VITE_SUPABASE_URL!,
     process.env.VITE_SUPABASE_ANON_KEY!,
     {
       auth: {
         persistSession: true,
         autoRefreshToken: true,
         detectSessionInUrl: true,
       },
     }
   );
   ```

2. **Fix Session Persistence**:
   ```typescript
   // Check for stored session
   useEffect(() => {
     const checkSession = async () => {
       const { data: { session } } = await supabase.auth.getSession();
       if (session) {
         setUser(session.user);
       }
     };
     
     checkSession();
     
     // Listen for auth changes
     const { data: { subscription } } = supabase.auth.onAuthStateChange(
       (event, session) => {
         setUser(session?.user ?? null);
       }
     );
     
     return () => subscription.unsubscribe();
   }, []);
   ```

### Permission Issues

#### Symptom: "Permission denied" errors, RLS violations

**Diagnosis**:
```sql
-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'projects';

-- Test policy with specific user
SET ROLE 'authenticated';
SELECT * FROM projects LIMIT 1;
```

**Solutions**:
1. **Verify RLS Policies**:
   ```sql
   -- Ensure proper organization filtering
   CREATE POLICY "Users can view projects in their organization" ON projects
   FOR SELECT USING (
     organization_id IN (
       SELECT organization_id FROM users WHERE id = auth.uid()
     )
   );
   ```

2. **Check User Profile**:
   ```typescript
   // Ensure user has organization_id
   const { data: profile } = await supabase
     .from('users')
     .select('organization_id, role')
     .eq('id', user.id)
     .single();
   
   if (!profile?.organization_id) {
     throw new Error('User not assigned to organization');
   }
   ```

## Integration Issues

### API Endpoint Problems

#### Symptom: API calls failing, incorrect responses

**Diagnosis**:
```typescript
// Test API endpoints
const testEndpoints = async () => {
  const endpoints = [
    { name: 'Projects', path: '/rest/v1/projects' },
    { name: 'Workflow Stages', path: '/rest/v1/workflow_stages' },
    { name: 'Contacts', path: '/rest/v1/contacts' },
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${supabaseUrl}${endpoint.path}?limit=1`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      });
      
      if (response.ok) {
        console.log(`✓ ${endpoint.name}: OK`);
      } else {
        console.error(`✗ ${endpoint.name}: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error(`✗ ${endpoint.name}: ${error.message}`);
    }
  }
};
```

**Solutions**:
1. **Verify API Configuration**:
   ```typescript
   // Check environment variables
   console.log('Supabase URL:', process.env.VITE_SUPABASE_URL);
   console.log('Supabase Key exists:', !!process.env.VITE_SUPABASE_ANON_KEY);
   ```

2. **Fix CORS Issues**:
   ```typescript
   // Ensure proper headers
   const { data, error } = await supabase
     .from('projects')
     .select('*')
     .eq('organization_id', organizationId);
   ```

## Emergency Recovery Procedures

### System Restore

1. **Database Recovery**:
   ```bash
   # Restore from backup
   supabase db reset
   supabase db push
   
   # Import sample data
   npm run import:sample-data
   ```

2. **Clear Application Cache**:
   ```typescript
   // Clear React Query cache
   queryClient.clear();
   
   // Clear browser storage
   localStorage.clear();
   sessionStorage.clear();
   
   // Clear service worker cache
   if ('serviceWorker' in navigator) {
     caches.keys().then(names => {
       names.forEach(name => caches.delete(name));
     });
   }
   ```

3. **Reset User Session**:
   ```typescript
   // Sign out and clear auth state
   await supabase.auth.signOut();
   window.location.reload();
   ```

### Contact Information

**Development Team**:
- Primary Developer: [Contact Info]
- Database Administrator: [Contact Info]
- DevOps Engineer: [Contact Info]

**Escalation Path**:
1. Check this troubleshooting guide
2. Search existing issues in project repository
3. Contact development team
4. Create new issue with detailed reproduction steps

**Support Resources**:
- Project Documentation: `/docs/`
- API Documentation: `/docs/project-management-system/api-documentation.md`
- Component Architecture: `/docs/project-management-system/component-architecture.md`
- Error Handling Guide: `/docs/project-management-system/error-handling.md`