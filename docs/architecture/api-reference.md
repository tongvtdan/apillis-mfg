# Factory Pulse - API Reference

## Overview

Factory Pulse uses Supabase as the backend API, providing REST and GraphQL endpoints. This document outlines the key API endpoints, data structures, and integration patterns.

## Authentication API

### Sign In
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});
```

### Sign Up
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
  options: {
    data: {
      display_name: 'John Doe'
    }
  }
});
```

### Sign Out
```typescript
const { error } = await supabase.auth.signOut();
```

### Session Management
```typescript
const { data: { session } } = await supabase.auth.getSession();
const { data: { user } } = await supabase.auth.getUser();
```

## Projects API

### Get Projects
```typescript
// Get all projects
const { data, error } = await supabase
  .from('projects')
  .select(`
    *,
    customer_organization:organizations(*),
    current_stage:workflow_stages(*),
    assignee:users(*)
  `);

// Get projects with filters
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .eq('status', 'active')
  .eq('organization_id', orgId)
  .order('created_at', { ascending: false });
```

### Create Project
```typescript
const { data, error } = await supabase
  .from('projects')
  .insert({
    organization_id: orgId,
    project_id: 'P-25082001',
    title: 'New Manufacturing Project',
    description: 'Project description',
    customer_organization_id: customerId,
    point_of_contacts: [contactId],
    status: 'active',
    priority_level: 'medium',
    intake_type: 'rfq',
    intake_source: 'portal'
  })
  .select();
```

### Update Project
```typescript
const { data, error } = await supabase
  .from('projects')
  .update({
    title: 'Updated Title',
    status: 'completed',
    updated_at: new Date().toISOString()
  })
  .eq('id', projectId);
```

### Delete Project
```typescript
const { error } = await supabase
  .from('projects')
  .delete()
  .eq('id', projectId);
```

## Users API

### Get Users
```typescript
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('organization_id', orgId)
  .eq('status', 'active');
```

### Update User Profile
```typescript
const { data, error } = await supabase
  .from('users')
  .update({
    name: 'Updated Name',
    role: 'engineering',
    department: 'R&D',
    updated_at: new Date().toISOString()
  })
  .eq('id', userId);
```

## Workflow API

### Get Workflow Stages
```typescript
const { data, error } = await supabase
  .from('workflow_stages')
  .select(`
    *,
    sub_stages:workflow_sub_stages(*)
  `)
  .eq('organization_id', orgId)
  .eq('is_active', true)
  .order('stage_order');
```

### Update Project Stage
```typescript
const { data, error } = await supabase
  .from('projects')
  .update({
    current_stage_id: newStageId,
    stage_entered_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })
  .eq('id', projectId);
```

### Track Sub-Stage Progress
```typescript
const { data, error } = await supabase
  .from('project_sub_stage_progress')
  .insert({
    organization_id: orgId,
    project_id: projectId,
    workflow_stage_id: stageId,
    sub_stage_id: subStageId,
    status: 'in_progress',
    started_at: new Date().toISOString()
  });
```

## Documents API

### Upload Document
```typescript
const { data, error } = await supabase.storage
  .from('documents')
  .upload(filePath, file, {
    cacheControl: '3600',
    upsert: false
  });
```

### Save Document Metadata
```typescript
const { data, error } = await supabase
  .from('documents')
  .insert({
    organization_id: orgId,
    project_id: projectId,
    file_name: file.name,
    title: title,
    description: description,
    file_path: filePath,
    file_size: file.size,
    mime_type: file.type,
    uploaded_by: userId
  });
```

### Get Documents
```typescript
const { data, error } = await supabase
  .from('documents')
  .select(`
    *,
    uploaded_by:users(name, email),
    approved_by:users(name, email)
  `)
  .eq('project_id', projectId)
  .order('created_at', { ascending: false });
```

## Real-time Subscriptions

### Project Updates
```typescript
const channel = supabase
  .channel('projects')
  .on('postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'projects',
      filter: `organization_id=eq.${orgId}`
    },
    (payload) => {
      console.log('Project change:', payload);
      // Handle real-time update
    }
  )
  .subscribe();
```

### Workflow Progress
```typescript
const channel = supabase
  .channel('workflow-progress')
  .on('postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'project_sub_stage_progress',
      filter: `project_id=eq.${projectId}`
    },
    (payload) => {
      // Update progress in UI
      updateProgress(payload.new);
    }
  )
  .subscribe();
```

### Notifications
```typescript
const channel = supabase
  .channel('notifications')
  .on('postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      // Show notification
      showNotification(payload.new);
    }
  )
  .subscribe();
```

## Activity Logging API

### Log Activity
```typescript
const { error } = await supabase
  .from('activity_log')
  .insert({
    organization_id: orgId,
    user_id: userId,
    project_id: projectId,
    entity_type: 'project',
    entity_id: projectId,
    action: 'updated',
    description: 'Project status changed to completed',
    old_values: { status: 'active' },
    new_values: { status: 'completed' },
    metadata: { source: 'web_app' }
  });
```

### Get Activity History
```typescript
const { data, error } = await supabase
  .from('activity_log')
  .select(`
    *,
    user:users(name, email),
    project:projects(title)
  `)
  .eq('project_id', projectId)
  .order('created_at', { ascending: false })
  .limit(50);
```

## Contacts API

### Get Contacts
```typescript
const { data, error } = await supabase
  .from('contacts')
  .select('*')
  .eq('organization_id', orgId)
  .eq('type', 'customer')
  .eq('is_active', true)
  .order('company_name');
```

### Create Contact
```typescript
const { data, error } = await supabase
  .from('contacts')
  .insert({
    organization_id: orgId,
    type: 'customer',
    company_name: 'ABC Manufacturing',
    contact_name: 'John Smith',
    email: 'john@abc.com',
    phone: '+1-555-0123',
    created_by: userId
  });
```

## Messages API

### Send Message
```typescript
const { data, error } = await supabase
  .from('messages')
  .insert({
    organization_id: orgId,
    sender_id: userId,
    recipient_id: recipientId,
    subject: 'Project Update',
    content: 'The project has been completed successfully.',
    message_type: 'notification',
    priority: 'medium',
    project_id: projectId
  });
```

### Get Message Thread
```typescript
const { data, error } = await supabase
  .from('messages')
  .select(`
    *,
    sender:users(name, email),
    recipient:users(name, email)
  `)
  .eq('project_id', projectId)
  .order('created_at', { ascending: false });
```

## Organizations API

### Get Organization
```typescript
const { data, error } = await supabase
  .from('organizations')
  .select('*')
  .eq('id', orgId)
  .single();
```

### Update Organization Settings
```typescript
const { data, error } = await supabase
  .from('organizations')
  .update({
    settings: {
      ...currentSettings,
      workflow_enabled: true,
      notifications_enabled: false
    },
    updated_at: new Date().toISOString()
  })
  .eq('id', orgId);
```

## Error Handling

### API Error Response
```typescript
try {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId);

  if (error) {
    console.error('API Error:', error);
    throw new Error(error.message);
  }

  return data;
} catch (error) {
  // Handle network errors, timeouts, etc.
  console.error('Request failed:', error);
  throw error;
}
```

### Retry Logic
```typescript
const fetchWithRetry = async (queryFn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await queryFn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

## Rate Limiting

Supabase applies rate limits based on your plan:
- **Free Plan**: 50 requests per hour
- **Pro Plan**: 2,500 requests per hour
- **Team Plan**: 50,000 requests per hour

### Handling Rate Limits
```typescript
const { data, error } = await supabase
  .from('projects')
  .select('*');

if (error?.status === 429) {
  // Rate limit exceeded
  console.log('Rate limit exceeded, retrying in 60 seconds...');
  setTimeout(() => {
    // Retry the request
  }, 60000);
}
```

## Webhooks

### Setting Up Webhooks
Webhooks can be configured in the Supabase dashboard for:
- Database changes
- Authentication events
- Storage events

### Webhook Payload Example
```json
{
  "type": "INSERT",
  "table": "projects",
  "record": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "New Project",
    "status": "active",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "schema": "public",
  "old_record": null
}
```

## GraphQL Support

Supabase provides GraphQL support through the `graphql_public` schema:

```graphql
query GetProjects {
  projects {
    id
    title
    status
    customer_organization {
      name
    }
    current_stage {
      name
      color
    }
  }
}
```

## Best Practices

### Query Optimization
```typescript
// Use select to limit fields
const { data } = await supabase
  .from('projects')
  .select('id, title, status, created_at')
  .eq('organization_id', orgId);

// Use limit for pagination
const { data } = await supabase
  .from('projects')
  .select('*')
  .range(0, 49); // Get first 50 records
```

### Real-time Cleanup
```typescript
// Always clean up subscriptions
useEffect(() => {
  const channel = supabase.channel('updates').subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

### Type Safety
```typescript
// Use TypeScript interfaces for type safety
interface Project {
  id: string;
  title: string;
  status: 'active' | 'completed' | 'cancelled';
  // ... other fields
}

const { data }: { data: Project[] | null } = await supabase
  .from('projects')
  .select('*');
```

This API reference provides comprehensive coverage of the Factory Pulse backend integration, enabling developers to build robust applications with proper error handling, real-time updates, and optimal performance.
