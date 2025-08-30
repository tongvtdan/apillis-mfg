-- Add performance indexes for project queries
-- This migration adds indexes to improve query performance for common filtering and sorting operations

-- Index for status filtering (most common filter)
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- Index for priority level filtering and sorting
CREATE INDEX IF NOT EXISTS idx_projects_priority_level ON projects(priority_level);

-- Index for created_at sorting (most common sort)
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- Index for updated_at sorting (for recent updates)
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);

-- Index for current_stage_id filtering (workflow stage queries)
CREATE INDEX IF NOT EXISTS idx_projects_current_stage_id ON projects(current_stage_id);

-- Index for project_type filtering
CREATE INDEX IF NOT EXISTS idx_projects_project_type ON projects(project_type);

-- Composite index for organization + status (multi-tenant filtering)
CREATE INDEX IF NOT EXISTS idx_projects_org_status ON projects(organization_id, status);

-- Composite index for status + priority (common combined filter)
CREATE INDEX IF NOT EXISTS idx_projects_status_priority ON projects(status, priority_level);

-- Composite index for status + created_at (filtered sorting)
CREATE INDEX IF NOT EXISTS idx_projects_status_created_at ON projects(status, created_at DESC);

-- Index for assigned_to filtering (user-specific queries)
CREATE INDEX IF NOT EXISTS idx_projects_assigned_to ON projects(assigned_to);

-- Index for customer_id filtering (customer-specific queries)
CREATE INDEX IF NOT EXISTS idx_projects_customer_id ON projects(customer_id);

-- Partial index for active projects only (most common subset)
CREATE INDEX IF NOT EXISTS idx_projects_active ON projects(created_at DESC) 
WHERE status IN ('active', 'inquiry_received', 'technical_review', 'supplier_rfq_sent', 'quoted', 'order_confirmed', 'procurement_planning', 'in_production');

-- Add comments for documentation
COMMENT ON INDEX idx_projects_status IS 'Improves performance for status filtering queries';
COMMENT ON INDEX idx_projects_priority_level IS 'Improves performance for priority filtering and sorting';
COMMENT ON INDEX idx_projects_created_at IS 'Improves performance for date-based sorting';
COMMENT ON INDEX idx_projects_updated_at IS 'Improves performance for recent updates queries';
COMMENT ON INDEX idx_projects_current_stage_id IS 'Improves performance for workflow stage filtering';
COMMENT ON INDEX idx_projects_project_type IS 'Improves performance for project type filtering';
COMMENT ON INDEX idx_projects_org_status IS 'Improves performance for multi-tenant status queries';
COMMENT ON INDEX idx_projects_status_priority IS 'Improves performance for combined status and priority filtering';
COMMENT ON INDEX idx_projects_status_created_at IS 'Improves performance for filtered date sorting';
COMMENT ON INDEX idx_projects_assigned_to IS 'Improves performance for user assignment queries';
COMMENT ON INDEX idx_projects_customer_id IS 'Improves performance for customer-specific queries';
COMMENT ON INDEX idx_projects_active IS 'Improves performance for active projects queries (partial index)';