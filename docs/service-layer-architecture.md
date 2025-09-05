# Service Layer Architecture

## Overview

The Factory Pulse application uses a layered service architecture that separates data access, business logic, and presentation concerns. This document outlines the service layer structure and the relationships between different service classes.

## Service Layer Hierarchy

### 1. Data Layer Services
**Purpose**: Direct database interaction and basic CRUD operations

#### ProjectServiceSimplified
- **File**: `src/services/projectServiceSimplified.ts`
- **Purpose**: Core data operations for projects using simplified contact model
- **Key Features**:
  - Direct Supabase database operations
  - Uses `point_of_contacts` array for contact management
  - Organization-based customer relationships via `customer_organization_id`
  - Contact resolution and relationship management

#### ProjectContactService
- **File**: `src/services/projectContactService.ts`
- **Purpose**: Specialized contact management for projects
- **Key Features**:
  - Array-based contact operations
  - Primary contact management (first in array)
  - Contact validation and organization filtering
  - Bulk contact operations

### 2. Business Logic Layer Services
**Purpose**: High-level operations with authentication, validation, and business rules

#### ProjectActionServiceSimplified
- **File**: `src/services/projectActionServiceSimplified.ts`
- **Purpose**: Action-oriented project operations with business logic
- **Key Features**:
  - Automatic user authentication and context
  - Project lifecycle management (create, update, archive, restore)
  - Advanced operations (duplicate, bulk update, tag management)
  - Workflow integration (stage transitions, assignments)
  - Comprehensive error handling and logging

## Service Integration Patterns

### Data Flow Architecture
```
UI Components
    ↓
Business Logic Services (ProjectActionServiceSimplified)
    ↓
Data Layer Services (ProjectServiceSimplified, ProjectContactService)
    ↓
Supabase Database
```

### Authentication Integration
All business logic services automatically handle:
- User authentication validation
- Organization context resolution
- Permission checking
- Audit trail creation

### Error Handling Strategy
- **Data Layer**: Basic error catching and database error translation
- **Business Logic Layer**: Comprehensive error handling with context
- **UI Layer**: User-friendly error messages and fallback states

## Service Usage Examples

### Creating a Project
```typescript
// Business Logic Layer (Recommended)
const project = await ProjectActionServiceSimplified.createProject({
  title: "New Manufacturing Project",
  customer_organization_id: "org-uuid",
  point_of_contacts: ["contact-1", "contact-2"],
  project_type: "manufacturing"
});

// Data Layer (Direct database access)
const project = await ProjectServiceSimplified.createProject({
  title: "New Manufacturing Project",
  customer_organization_id: "org-uuid",
  point_of_contacts: ["contact-1", "contact-2"],
  // ... requires manual user context handling
});
```

### Contact Management
```typescript
// Add contact to project
await ProjectContactService.addContactToProject(projectId, contactId, true);

// Get project contacts with details
const contacts = await ProjectContactService.getProjectContacts(projectId);

// Set primary contact
await ProjectContactService.setPrimaryContact(projectId, contactId);
```

### Advanced Operations
```typescript
// Duplicate project with modifications
const newProject = await ProjectActionServiceSimplified.duplicateProject(
  sourceProjectId,
  "Copy of Original",
  { priority_level: "high" }
);

// Bulk update multiple projects
await ProjectActionServiceSimplified.bulkUpdateProjects(
  ["project-1", "project-2"],
  { status: "on_hold" }
);

// Tag management
await ProjectActionServiceSimplified.addTagsToProject(projectId, ["urgent", "manufacturing"]);
```

## Migration Benefits

### Before: Complex Junction Table Model
- Multiple service calls for contact operations
- Complex JOIN queries for project data
- Manual relationship management
- Inconsistent error handling

### After: Simplified Array Model
- Single service calls for most operations
- Direct array access for contacts
- Automatic relationship management
- Consistent error handling across services

## Best Practices

### Service Selection Guidelines
1. **Use Business Logic Services** for UI components and application logic
2. **Use Data Layer Services** for specialized operations or when you need direct control
3. **Use Contact Service** for complex contact management operations

### Error Handling
- Always use try-catch blocks with service calls
- Log errors at the service layer for debugging
- Provide user-friendly error messages in UI components

### Performance Considerations
- Business logic services include caching where appropriate
- Batch operations are available for bulk updates
- Contact resolution is optimized with array operations

## Future Enhancements

### Planned Service Additions
- **ProjectWorkflowService**: Advanced workflow management
- **ProjectAnalyticsService**: Project metrics and reporting
- **ProjectNotificationService**: Event-driven notifications
- **ProjectIntegrationService**: External system integrations

### Service Layer Evolution
- Implement service-level caching strategies
- Add service-to-service communication patterns
- Develop service health monitoring
- Create service documentation automation

## Conclusion

The layered service architecture provides clear separation of concerns while maintaining flexibility and performance. The simplified contact model reduces complexity while the business logic layer ensures consistent behavior across the application.

This architecture supports the Factory Pulse system's evolution from internal tool to SaaS platform by providing scalable, maintainable service patterns.