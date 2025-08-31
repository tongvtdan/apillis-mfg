# Row Level Security (RLS) Policy Documentation

## Overview

This document describes the comprehensive Row Level Security (RLS) policies implemented in the Factory Pulse system. These policies ensure data security, role-based access control, and proper multi-tenant isolation while resolving the circular dependency issues.

## Key Features

### 1. **Circular Dependency Resolution**
- **Problem**: Original `users` table policy created circular dependency when users tried to fetch their own profile
- **Solution**: Separate policies for self-access (`id = auth.uid()`) and organization access
- **Result**: Users can now fetch their profiles without triggering RLS evaluation loops

### 2. **Role-Based Access Control (RBAC)**
- **Hierarchy**: `admin` > `management` > `sales` > `procurement` > `engineering` > `qa` > `production`
- **External Roles**: `customer`, `supplier`
- **Principle**: Higher roles can access data accessible to lower roles

### 3. **Workflow Stage Integration**
- **Responsible Roles**: Each workflow stage has defined responsible roles
- **Dynamic Access**: Users can access projects based on current stage responsibilities
- **Stage Progression**: Access changes as projects move through workflow stages

### 4. **Project Assignment Logic**
- **Direct Assignment**: Users assigned to projects have full access
- **Role-Based Assignment**: Access based on user role and project stage
- **Customer/Supplier Access**: Portal users can only access their own projects

## Helper Functions

### `get_current_user_org_id()`
Returns the organization ID of the currently authenticated user.

### `get_current_user_role()`
Returns the role of the currently authenticated user.

### `is_internal_user()`
Returns true if the user has an internal role (admin, management, sales, procurement, engineering, qa, production).

### `is_portal_user()`
Returns true if the user has a portal role (customer, supplier).

### `can_access_project(project_id UUID)`
Comprehensive function that determines if a user can access a specific project based on:
- Organization membership
- User role hierarchy
- Project assignment
- Workflow stage responsibilities
- Customer/supplier relationships

## Policy Details

### Organizations
- **View**: Users can only view their own organization
- **Update**: Only admin and management roles can update organization settings

### Users
- **Self Access**: Users can always view and update their own profile
- **Other Users**: Role-based access to other users in the organization
- **Creation**: Only admin and management can create new user profiles

### Workflow Stages
- **View**: All users in the organization can view workflow stages
- **Modify**: Only admin and management can modify workflow configuration

### Contacts
- **Sales**: Can view and modify customer contacts
- **Procurement**: Can view and modify supplier contacts
- **Engineering/QA/Production**: Can view both customer and supplier contacts
- **Admin/Management**: Full access to all contacts

### Projects
- **Admin/Management**: Full access to all projects
- **Sales**: Access to all projects (customer relationship management)
- **Role-Based**: Access based on current workflow stage responsibilities
- **Assigned Users**: Full access to assigned projects
- **Portal Users**: Access only to their own projects

### Documents
- **Access Levels**: Public, Internal, Customer, Supplier, Restricted
- **Role-Based**: Different access based on user role and document type
- **Project Context**: Access tied to project access permissions

### Reviews
- **Reviewers**: Full access to their own reviews
- **Stage Responsible**: Users responsible for current stage can access reviews
- **Admin/Management**: Full access to all reviews

### Messages
- **Sender/Recipient**: Users can view messages they sent or received
- **Role-Based**: Users can view messages sent to their role or department
- **Organization**: All messages are organization-scoped

### Notifications
- **Personal**: Users can only access their own notifications
- **Self-Management**: Users can update their own notification status

### Activity Log
- **Personal**: Users can view their own activities
- **Project Context**: Users can view activities for accessible projects
- **Admin/Management**: Full access to all activities

### Project Assignments
- **Assigned Users**: Can view their own assignments
- **Admin/Management**: Can view and modify all assignments

### Supplier Quotes
- **Procurement**: Full access to supplier quotes
- **Sales**: Access to quotes for projects in sales-responsible stages
- **Admin/Management**: Full access to all quotes

## Workflow Stage Access Matrix

| Stage                | Sales | Procurement | Engineering | QA  | Production | Management | Admin |
| -------------------- | ----- | ----------- | ----------- | --- | ---------- | ---------- | ----- |
| Inquiry Received     | ✅     | ✅           | ❌           | ❌   | ❌          | ✅          | ✅     |
| Technical Review     | ❌     | ❌           | ✅           | ✅   | ✅          | ✅          | ✅     |
| Supplier RFQ Sent    | ❌     | ✅           | ❌           | ❌   | ❌          | ✅          | ✅     |
| Quoted               | ✅     | ✅           | ❌           | ❌   | ❌          | ✅          | ✅     |
| Order Confirmed      | ✅     | ✅           | ❌           | ❌   | ✅          | ✅          | ✅     |
| Procurement Planning | ❌     | ✅           | ❌           | ❌   | ✅          | ✅          | ✅     |
| In Production        | ❌     | ❌           | ❌           | ✅   | ✅          | ✅          | ✅     |
| Shipped & Closed     | ✅     | ❌           | ❌           | ❌   | ✅          | ✅          | ✅     |

## Security Benefits

### 1. **Data Isolation**
- Multi-tenant architecture ensures complete data separation
- Organization-based policies prevent cross-organization data access

### 2. **Principle of Least Privilege**
- Users only have access to data they need for their role
- Access is dynamically adjusted based on project stage and assignments

### 3. **Audit Trail**
- All access is logged through activity_log table
- Complete audit trail for compliance and security monitoring

### 4. **Flexible Access Control**
- Role-based policies adapt to organizational changes
- Workflow stage integration provides dynamic access control

## Testing and Validation

### Test Cases
1. **User Profile Access**: Verify users can fetch their own profiles
2. **Role-Based Access**: Test access restrictions based on user roles
3. **Workflow Integration**: Verify access changes with project stage progression
4. **Portal User Access**: Test customer/supplier access limitations
5. **Cross-Organization Isolation**: Verify no cross-organization data access

### Performance Considerations
- Helper functions are SECURITY DEFINER for optimal performance
- Indexes support efficient policy evaluation
- Caching strategies minimize repeated policy evaluations

## Migration Notes

### Breaking Changes
- Previous circular dependency issues resolved
- More restrictive access policies implemented
- Role-based access control enforced

### Backward Compatibility
- Existing user sessions continue to work
- API endpoints maintain same interface
- Frontend components may need role-based UI adjustments

## Future Enhancements

### Planned Improvements
1. **Fine-Grained Permissions**: More granular permission system
2. **Dynamic Role Assignment**: Runtime role assignment capabilities
3. **Temporary Access**: Time-limited access grants
4. **Approval Workflows**: Access approval and delegation systems
5. **Audit Enhancements**: Enhanced logging and monitoring

### Integration Points
- **API Gateway**: Integration with API rate limiting and authentication
- **Monitoring**: Integration with security monitoring systems
- **Compliance**: Support for regulatory compliance requirements
