# Centralized Approval System Design

**Date:** September 2, 2025  
**Version:** 1.0  
**System:** Factory Pulse Manufacturing Execution System

## Overview

The centralized approval system replaces the current makeshift use of the `reviews` table for approvals with a dedicated, comprehensive approval management system. This system serves as a central point for all types of approvals across the manufacturing workflow.

## Problem Statement

### Current Issues with Reviews Table Approach

1. **Misuse of Reviews Table**: The `reviews` table is being used for both actual reviews and approvals, creating confusion
2. **Limited Approval Types**: Only supports stage transition approvals
3. **Poor Scalability**: Not designed for complex approval workflows
4. **Missing Features**: No delegation, escalation, auto-approval, or attachment support
5. **Inconsistent Data Model**: Reviews and approvals have different requirements

### Business Requirements

The system needs to support approvals for:
- **Stage Transitions**: Workflow stage progression approvals
- **Document Approvals**: RFQ, drawings, specifications, contracts
- **Engineering Changes**: Design modifications and technical changes
- **Supplier Qualifications**: Supplier evaluation and approval
- **Purchase Orders**: Procurement and spending approvals
- **Cost Approvals**: Budget and financial approvals
- **Quality Reviews**: Quality control and compliance approvals
- **Production Releases**: Manufacturing and production approvals
- **Shipping Approvals**: Delivery and logistics approvals
- **Contract Approvals**: Legal and contractual approvals
- **Budget Approvals**: Financial planning and budget approvals
- **Safety Reviews**: Safety and compliance approvals

## Solution Architecture

### Database Design

#### Core Tables

1. **`approvals`** - Main approval table
2. **`approval_history`** - Audit trail for all approval actions
3. **`approval_attachments`** - Supporting documents and files
4. **`approval_notifications`** - Notification history and tracking

#### Key Features

- **Multi-step Approval Chains**: Support for complex approval workflows
- **Role-based Assignment**: Automatic approver assignment based on roles
- **Priority Management**: 5 priority levels with automatic due dates
- **Delegation System**: Temporary approval delegation to other users
- **Escalation Management**: Escalation to higher authorities
- **Auto-approval Rules**: Configurable automatic approval based on conditions
- **Attachment Support**: File uploads and document management
- **Notification System**: Comprehensive notification tracking
- **Audit Trail**: Complete history of all approval actions

### Type System

#### Approval Types
```typescript
type ApprovalType = 
  | 'stage_transition'           // Workflow stage transitions
  | 'document_approval'           // Document approvals
  | 'engineering_change'          // Engineering change requests
  | 'supplier_qualification'      // Supplier qualification approvals
  | 'purchase_order'             // Purchase order approvals
  | 'cost_approval'               // Cost/budget approvals
  | 'quality_review'              // Quality control approvals
  | 'production_release'          // Production release approvals
  | 'shipping_approval'           // Shipping and delivery approvals
  | 'contract_approval'           // Contract and legal approvals
  | 'budget_approval'             // Budget and financial approvals
  | 'safety_review'               // Safety and compliance approvals
  | 'custom'                      // Custom approval types
```

#### Approval Statuses
```typescript
type ApprovalStatus = 
  | 'pending'                     // Waiting for approval
  | 'in_review'                   // Under review
  | 'approved'                    // Approved
  | 'rejected'                    // Rejected
  | 'delegated'                   // Delegated to another user
  | 'expired'                     // Approval request expired
  | 'cancelled'                   // Cancelled by requester
  | 'auto_approved'               // Automatically approved
  | 'escalated'                   // Escalated to higher authority
```

#### Priority Levels
```typescript
type ApprovalPriority = 
  | 'low'                         // Low priority (7+ days)
  | 'normal'                      // Normal priority (3-7 days)
  | 'high'                        // High priority (1-3 days)
  | 'urgent'                      // Urgent (same day)
  | 'critical'                    // Critical (immediate)
```

## Implementation Details

### Database Migration

The migration creates:
- **4 new tables** with proper relationships
- **3 custom enum types** for type safety
- **Comprehensive indexes** for performance
- **Row Level Security (RLS)** policies for data protection
- **Database functions** for common operations
- **Triggers** for automatic updates

### Service Layer

The `CentralizedApprovalService` provides:
- **CRUD Operations**: Create, read, update, delete approvals
- **Decision Management**: Submit approval decisions with validation
- **Workflow Management**: Multi-step approval chains
- **Delegation & Escalation**: Advanced approval routing
- **Attachment Management**: File upload and management
- **Notification System**: Automated notifications
- **Statistics & Reporting**: Approval metrics and analytics
- **Migration Support**: Legacy data migration

### Key Functions

#### Database Functions
- `create_approval()` - Create new approval with validation
- `submit_approval_decision()` - Submit decision with audit trail
- `get_pending_approvals_for_user()` - Get user's pending approvals
- `is_approval_overdue()` - Check if approval is overdue
- `auto_expire_overdue_approvals()` - Auto-expire overdue approvals

#### Service Methods
- `createApproval()` - Create approval with notifications
- `submitApprovalDecision()` - Submit decision with validation
- `delegateApproval()` - Delegate to another user
- `escalateApproval()` - Escalate to higher authority
- `autoApproveApproval()` - Auto-approve based on rules
- `getApprovalStats()` - Get approval statistics

## Integration Points

### Workflow System Integration

The approval system integrates with:
- **Project Workflow**: Stage transition approvals
- **Document Management**: Document approval workflows
- **Supplier Management**: Supplier qualification approvals
- **Purchase Management**: Purchase order approvals
- **Quality Management**: Quality control approvals

### Notification Integration

Automatic notifications for:
- **Approval Requests**: Notify approvers of new requests
- **Decision Notifications**: Notify requesters of decisions
- **Delegation Notifications**: Notify delegates of assignments
- **Escalation Notifications**: Notify escalation targets
- **Overdue Reminders**: Remind approvers of overdue approvals

### Real-time Updates

- **Live Status Updates**: Real-time approval status changes
- **Dashboard Integration**: Live approval counts and metrics
- **Activity Feed**: Real-time approval activity tracking

## Migration Strategy

### Phase 1: Database Setup
1. Run migration to create new tables
2. Set up RLS policies and functions
3. Create storage buckets for attachments

### Phase 2: Service Implementation
1. Implement `CentralizedApprovalService`
2. Create TypeScript interfaces
3. Add migration helper methods

### Phase 3: Component Updates
1. Update approval components to use new service
2. Add new approval type support
3. Implement attachment functionality

### Phase 4: Data Migration
1. Migrate existing approval data from reviews table
2. Validate migrated data integrity
3. Update references to use new approval IDs

### Phase 5: Testing & Deployment
1. Comprehensive testing of new system
2. Performance testing with large datasets
3. Gradual rollout to production

## Benefits

### For Users
- **Unified Interface**: Single interface for all approval types
- **Better UX**: Improved approval workflow and notifications
- **Flexibility**: Support for delegation and escalation
- **Transparency**: Complete audit trail and history

### For Administrators
- **Centralized Management**: Single system for all approvals
- **Better Reporting**: Comprehensive approval analytics
- **Configurable Workflows**: Flexible approval chain configuration
- **Compliance**: Complete audit trail for regulatory compliance

### For Developers
- **Clean Architecture**: Dedicated approval system
- **Type Safety**: Strong TypeScript typing
- **Scalability**: Designed for growth and complexity
- **Maintainability**: Clear separation of concerns

## Future Enhancements

### Planned Features
- **Approval Templates**: Pre-configured approval workflows
- **Conditional Approvals**: Dynamic approval routing based on conditions
- **Bulk Operations**: Bulk approval processing
- **Advanced Analytics**: Predictive approval analytics
- **Mobile Support**: Mobile-optimized approval interface
- **API Integration**: External system integration
- **Workflow Designer**: Visual approval workflow designer

### Performance Optimizations
- **Caching Layer**: Redis caching for frequently accessed data
- **Background Processing**: Async processing for notifications
- **Database Optimization**: Query optimization and indexing
- **CDN Integration**: Content delivery for attachments

## Conclusion

The centralized approval system provides a robust, scalable foundation for managing all types of approvals in the Factory Pulse manufacturing system. It replaces the makeshift use of the reviews table with a dedicated, feature-rich approval management system that supports complex workflows, delegation, escalation, and comprehensive audit trails.

This system positions Factory Pulse for future growth and complexity while providing immediate benefits in terms of user experience, administrative control, and developer productivity.
