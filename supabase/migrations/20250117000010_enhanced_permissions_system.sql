-- =========================================
-- Enhanced Permissions System - Complete Implementation
-- Migration: Granular Permissions, Custom Roles, and Feature Control
-- =========================================

-- =========================================
-- 1. PERMISSION SYSTEM TABLES
-- =========================================

-- Permission definitions table (system-wide permissions catalog)
CREATE TABLE IF NOT EXISTS permissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE, -- e.g., 'customer:create', 'rfq:approve'
    resource TEXT NOT NULL, -- e.g., 'customer', 'rfq', 'supplier'
    action TEXT NOT NULL, -- e.g., 'create', 'read', 'update', 'delete', 'approve'
    description TEXT,
    category TEXT DEFAULT 'general', -- 'general', 'admin', 'financial', 'approval'
    is_system BOOLEAN DEFAULT false, -- System permissions cannot be deleted
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(resource, action)
);

-- Custom roles table (beyond basic user roles)
CREATE TABLE IF NOT EXISTS custom_roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT false, -- System roles cannot be deleted
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(organization_id, name)
);

-- Role permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    custom_role_id UUID NOT NULL REFERENCES custom_roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(custom_role_id, permission_id)
);

-- User permissions table (overrides and additional permissions)
CREATE TABLE IF NOT EXISTS user_permissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    permission_type TEXT NOT NULL CHECK (permission_type IN ('grant', 'deny')), -- Grant or deny override
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ, -- Optional expiration
    reason TEXT, -- Why this permission was granted/denied

    UNIQUE(user_id, permission_id)
);

-- User roles junction table (many-to-many for custom roles)
CREATE TABLE IF NOT EXISTS user_custom_roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    custom_role_id UUID NOT NULL REFERENCES custom_roles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ, -- Optional expiration

    UNIQUE(user_id, custom_role_id)
);

-- Feature toggles table (enable/disable specific features)
CREATE TABLE IF NOT EXISTS feature_toggles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    feature_name TEXT NOT NULL,
    feature_key TEXT NOT NULL UNIQUE, -- e.g., 'advanced_analytics', 'supplier_rating'
    description TEXT,
    is_enabled BOOLEAN DEFAULT true,
    required_role user_role, -- Minimum role required to access feature
    required_permissions TEXT[], -- Array of required permissions
    config JSONB DEFAULT '{}'::jsonb, -- Feature-specific configuration
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(organization_id, feature_key)
);

-- User feature access table (user-specific feature overrides)
CREATE TABLE IF NOT EXISTS user_feature_access (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    feature_toggle_id UUID NOT NULL REFERENCES feature_toggles(id) ON DELETE CASCADE,
    has_access BOOLEAN DEFAULT true,
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,

    UNIQUE(user_id, feature_toggle_id)
);

-- Permission audit log table
CREATE TABLE IF NOT EXISTS permission_audit_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id), -- Who performed the action
    target_user_id UUID REFERENCES users(id), -- Who was affected
    action_type TEXT NOT NULL, -- 'grant_permission', 'revoke_permission', 'create_role', etc.
    entity_type TEXT NOT NULL, -- 'permission', 'role', 'feature', 'user'
    entity_id UUID, -- ID of the affected entity
    old_values JSONB,
    new_values JSONB,
    reason TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- 2. ENHANCED USER PROFILE WITH PERMISSIONS
-- =========================================

-- Add permission-related columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS permission_override BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS custom_permissions_cache JSONB DEFAULT '{}'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_permission_update TIMESTAMPTZ DEFAULT NOW();

-- =========================================
-- 3. PERMISSION SYSTEM FUNCTIONS
-- =========================================

-- Function to check if user has permission (enhanced version)
CREATE OR REPLACE FUNCTION has_user_permission_enhanced(
    p_user_id UUID,
    p_resource TEXT,
    p_action TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    user_role user_role;
    permission_name TEXT;
    has_permission BOOLEAN := false;
    has_deny BOOLEAN := false;
BEGIN
    -- Build permission name
    permission_name := p_resource || ':' || p_action;

    -- Get user's base role
    SELECT role INTO user_role
    FROM users
    WHERE id = p_user_id;

    -- Check for explicit deny (takes precedence)
    SELECT EXISTS(
        SELECT 1 FROM user_permissions up
        JOIN permissions p ON up.permission_id = p.id
        WHERE up.user_id = p_user_id
        AND p.name = permission_name
        AND up.permission_type = 'deny'
        AND (up.expires_at IS NULL OR up.expires_at > NOW())
    ) INTO has_deny;

    -- If explicitly denied, return false
    IF has_deny THEN
        RETURN false;
    END IF;

    -- Check for explicit grant
    SELECT EXISTS(
        SELECT 1 FROM user_permissions up
        JOIN permissions p ON up.permission_id = p.id
        WHERE up.user_id = p_user_id
        AND p.name = permission_name
        AND up.permission_type = 'grant'
        AND (up.expires_at IS NULL OR up.expires_at > NOW())
    ) INTO has_permission;

    -- If explicitly granted, return true
    IF has_permission THEN
        RETURN true;
    END IF;

    -- Check custom roles
    SELECT EXISTS(
        SELECT 1 FROM user_custom_roles ucr
        JOIN role_permissions rp ON ucr.custom_role_id = rp.custom_role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE ucr.user_id = p_user_id
        AND p.name = permission_name
        AND (ucr.expires_at IS NULL OR ucr.expires_at > NOW())
    ) INTO has_permission;

    -- If found in custom roles, return true
    IF has_permission THEN
        RETURN true;
    END IF;

    -- Fall back to role-based permissions (original logic)
    CASE user_role
        WHEN 'admin' THEN RETURN true;
        WHEN 'management' THEN
            RETURN permission_name IN (
                'rfq:read', 'rfq:create', 'rfq:update', 'rfq:assign', 'rfq:delete',
                'customer:read', 'customer:create', 'customer:update',
                'supplier:read', 'supplier:create', 'supplier:update',
                'dashboard:read', 'analytics:read', 'analytics:export',
                'users:read', 'users:create', 'users:update', 'users:delete',
                'workflow:read', 'workflow:create', 'workflow:update', 'workflow:delete',
                'approvals:read', 'approvals:update'
            );
        WHEN 'procurement' THEN
            RETURN permission_name IN (
                'rfq:read', 'rfq:create', 'rfq:update', 'rfq:assign', 'rfq:delete',
                'supplier:read', 'supplier:create', 'supplier:update',
                'dashboard:read', 'workflow:read', 'workflow:update',
                'approvals:read', 'approvals:update'
            );
        WHEN 'sales' THEN
            RETURN permission_name IN (
                'rfq:read', 'rfq:create', 'rfq:update', 'rfq:assign', 'rfq:delete',
                'customer:read', 'customer:create', 'customer:update',
                'dashboard:read', 'workflow:read', 'workflow:update'
            );
        WHEN 'engineering' THEN
            RETURN permission_name IN (
                'rfq:read', 'rfq:update', 'rfq:review',
                'technical_specs:read', 'technical_specs:create', 'technical_specs:update',
                'dashboard:read', 'documents:read', 'documents:create', 'documents:update',
                'workflow:read', 'workflow:update'
            );
        WHEN 'qa' THEN
            RETURN permission_name IN (
                'rfq:read', 'rfq:review', 'rfq:approve', 'rfq:reject',
                'quality_specs:read', 'quality_specs:create', 'quality_specs:update',
                'dashboard:read', 'audit:read', 'audit:create',
                'workflow:read', 'workflow:update'
            );
        WHEN 'production' THEN
            RETURN permission_name IN (
                'rfq:read', 'rfq:update', 'rfq:schedule',
                'production_schedule:read', 'production_schedule:create', 'production_schedule:update',
                'dashboard:read', 'capacity:read', 'capacity:update',
                'workflow:read', 'workflow:update'
            );
        ELSE RETURN false;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has access to a feature
CREATE OR REPLACE FUNCTION has_user_feature_access(
    p_user_id UUID,
    p_feature_key TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    user_role user_role;
    feature_enabled BOOLEAN;
    required_role user_role;
    required_permissions TEXT[];
    has_required_role BOOLEAN;
    has_required_permissions BOOLEAN;
BEGIN
    -- Check if feature is enabled for organization
    SELECT ft.is_enabled, ft.required_role, ft.required_permissions
    INTO feature_enabled, required_role, required_permissions
    FROM feature_toggles ft
    JOIN users u ON ft.organization_id = u.organization_id
    WHERE u.id = p_user_id AND ft.feature_key = p_feature_key;

    -- If feature is disabled, return false
    IF NOT feature_enabled THEN
        RETURN false;
    END IF;

    -- Check user-specific override
    SELECT ufa.has_access
    INTO feature_enabled
    FROM user_feature_access ufa
    JOIN feature_toggles ft ON ufa.feature_toggle_id = ft.id
    WHERE ufa.user_id = p_user_id AND ft.feature_key = p_feature_key;

    -- If user has specific override, use it
    IF feature_enabled IS NOT NULL THEN
        RETURN feature_enabled;
    END IF;

    -- Get user role
    SELECT role INTO user_role
    FROM users
    WHERE id = p_user_id;

    -- Check role hierarchy
    CASE
        WHEN user_role = 'admin' THEN RETURN true;
        WHEN user_role = 'management' AND required_role IN ('management', 'sales', 'procurement', 'engineering', 'qa', 'production') THEN RETURN true;
        WHEN user_role = 'sales' AND required_role IN ('sales', 'procurement', 'engineering', 'qa', 'production') THEN RETURN true;
        WHEN user_role = 'procurement' AND required_role IN ('procurement', 'engineering', 'qa', 'production') THEN RETURN true;
        WHEN user_role = 'engineering' AND required_role IN ('engineering', 'qa', 'production') THEN RETURN true;
        WHEN user_role = 'qa' AND required_role IN ('qa', 'production') THEN RETURN true;
        WHEN user_role = 'production' AND required_role = 'production' THEN RETURN true;
        ELSE RETURN false;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to refresh user permissions cache
CREATE OR REPLACE FUNCTION refresh_user_permissions_cache(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    permissions_data JSONB;
BEGIN
    -- Build comprehensive permissions object
    SELECT jsonb_build_object(
        'base_role', u.role,
        'custom_roles', COALESCE(
            jsonb_agg(DISTINCT jsonb_build_object(
                'id', cr.id,
                'name', cr.name,
                'permissions', (
                    SELECT jsonb_agg(p.name)
                    FROM role_permissions rp
                    JOIN permissions p ON rp.permission_id = p.id
                    WHERE rp.custom_role_id = cr.id
                )
            )) FILTER (WHERE cr.id IS NOT NULL), '[]'::jsonb
        ),
        'user_overrides', COALESCE(
            jsonb_agg(jsonb_build_object(
                'permission', p.name,
                'type', up.permission_type,
                'expires_at', up.expires_at
            )) FILTER (WHERE p.id IS NOT NULL), '[]'::jsonb
        ),
        'feature_access', COALESCE(
            jsonb_agg(jsonb_build_object(
                'feature_key', ft.feature_key,
                'has_access', COALESCE(ufa.has_access, ft.is_enabled)
            )) FILTER (WHERE ft.id IS NOT NULL), '[]'::jsonb
        ),
        'last_updated', NOW()
    ) INTO permissions_data
    FROM users u
    LEFT JOIN user_custom_roles ucr ON u.id = ucr.user_id
        AND (ucr.expires_at IS NULL OR ucr.expires_at > NOW())
    LEFT JOIN custom_roles cr ON ucr.custom_role_id = cr.id AND cr.is_active = true
    LEFT JOIN user_permissions up ON u.id = up.user_id
        AND (up.expires_at IS NULL OR up.expires_at > NOW())
    LEFT JOIN permissions p ON up.permission_id = p.id
    LEFT JOIN user_feature_access ufa ON u.id = ufa.user_id
    LEFT JOIN feature_toggles ft ON ufa.feature_toggle_id = ft.id AND ft.is_enabled = true
    WHERE u.id = p_user_id
    GROUP BY u.id, u.role;

    -- Update cache
    UPDATE users
    SET custom_permissions_cache = permissions_data,
        last_permission_update = NOW()
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================
-- 4. ENHANCED RLS POLICIES
-- =========================================

-- Enable RLS on new tables
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_custom_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_toggles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feature_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_audit_log ENABLE ROW LEVEL SECURITY;

-- Permissions table policies (system-wide, admin only)
CREATE POLICY "permissions_admin_policy" ON permissions FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
        AND u.role IN ('admin', 'management')
    )
);

-- Custom roles policies (organization-scoped)
CREATE POLICY "custom_roles_org_policy" ON custom_roles FOR ALL USING (
    organization_id = (SELECT get_current_user_org_id())
);

-- Role permissions policies
CREATE POLICY "role_permissions_org_policy" ON role_permissions FOR ALL USING (
    EXISTS (
        SELECT 1 FROM custom_roles cr
        WHERE cr.id = custom_role_id
        AND cr.organization_id = (SELECT get_current_user_org_id())
    )
);

-- User permissions policies
CREATE POLICY "user_permissions_org_policy" ON user_permissions FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = user_id
        AND u.organization_id = (SELECT get_current_user_org_id())
    )
);

-- User custom roles policies
CREATE POLICY "user_custom_roles_org_policy" ON user_custom_roles FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = user_id
        AND u.organization_id = (SELECT get_current_user_org_id())
    )
);

-- Feature toggles policies
CREATE POLICY "feature_toggles_org_policy" ON feature_toggles FOR ALL USING (
    organization_id = (SELECT get_current_user_org_id())
);

-- User feature access policies
CREATE POLICY "user_feature_access_org_policy" ON user_feature_access FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = user_id
        AND u.organization_id = (SELECT get_current_user_org_id())
    )
);

-- Permission audit log policies
CREATE POLICY "permission_audit_org_policy" ON permission_audit_log FOR ALL USING (
    organization_id = (SELECT get_current_user_org_id())
);

-- =========================================
-- 5. DEFAULT PERMISSIONS DATA
-- =========================================

-- Insert default permissions
INSERT INTO permissions (name, resource, action, description, category, is_system) VALUES
-- Customer permissions
('customer:create', 'customer', 'create', 'Create new customers', 'general', true),
('customer:read', 'customer', 'read', 'View customer information', 'general', true),
('customer:update', 'customer', 'update', 'Update customer information', 'general', true),
('customer:delete', 'customer', 'delete', 'Delete customers', 'general', true),
('customer:archive', 'customer', 'archive', 'Archive customers', 'general', true),

-- Supplier permissions
('supplier:create', 'supplier', 'create', 'Create new suppliers', 'general', true),
('supplier:read', 'supplier', 'read', 'View supplier information', 'general', true),
('supplier:update', 'supplier', 'update', 'Update supplier information', 'general', true),
('supplier:delete', 'supplier', 'delete', 'Delete suppliers', 'general', true),
('supplier:archive', 'supplier', 'archive', 'Archive suppliers', 'general', true),

-- RFQ permissions
('rfq:create', 'rfq', 'create', 'Create new RFQs', 'general', true),
('rfq:read', 'rfq', 'read', 'View RFQ information', 'general', true),
('rfq:update', 'rfq', 'update', 'Update RFQ information', 'general', true),
('rfq:delete', 'rfq', 'delete', 'Delete RFQs', 'general', true),
('rfq:approve', 'rfq', 'approve', 'Approve RFQs', 'approval', true),
('rfq:reject', 'rfq', 'reject', 'Reject RFQs', 'approval', true),
('rfq:review', 'rfq', 'review', 'Review RFQs', 'general', true),

-- User management permissions
('users:read', 'users', 'read', 'View user information', 'admin', true),
('users:create', 'users', 'create', 'Create new users', 'admin', true),
('users:update', 'users', 'update', 'Update user information', 'admin', true),
('users:delete', 'users', 'delete', 'Delete users', 'admin', true),
('users:manage_roles', 'users', 'manage_roles', 'Manage user roles and permissions', 'admin', true),

-- Dashboard and analytics
('dashboard:read', 'dashboard', 'read', 'Access dashboard', 'general', true),
('dashboard:admin', 'dashboard', 'admin', 'Admin dashboard access', 'admin', true),
('analytics:read', 'analytics', 'read', 'View analytics', 'general', true),
('analytics:export', 'analytics', 'export', 'Export analytics data', 'general', true),

-- Workflow permissions
('workflow:read', 'workflow', 'read', 'View workflows', 'general', true),
('workflow:create', 'workflow', 'create', 'Create workflows', 'admin', true),
('workflow:update', 'workflow', 'update', 'Update workflows', 'general', true),
('workflow:delete', 'workflow', 'delete', 'Delete workflows', 'admin', true),
('workflow:bypass', 'workflow', 'bypass', 'Bypass workflow steps', 'admin', true),

-- Document permissions
('documents:read', 'documents', 'read', 'View documents', 'general', true),
('documents:create', 'documents', 'create', 'Create documents', 'general', true),
('documents:update', 'documents', 'update', 'Update documents', 'general', true),
('documents:delete', 'documents', 'delete', 'Delete documents', 'general', true),

-- Approval permissions
('approvals:read', 'approvals', 'read', 'View approvals', 'general', true),
('approvals:update', 'approvals', 'update', 'Update approvals', 'general', true),

-- System permissions
('system_config:read', 'system_config', 'read', 'View system configuration', 'admin', true),
('system_config:update', 'system_config', 'update', 'Update system configuration', 'admin', true),
('organizations:read', 'organizations', 'read', 'View organizations', 'admin', true),
('organizations:create', 'organizations', 'create', 'Create organizations', 'admin', true),
('organizations:update', 'organizations', 'update', 'Update organizations', 'admin', true),
('organizations:delete', 'organizations', 'delete', 'Delete organizations', 'admin', true),

-- Database permissions (super admin only)
('database:read', 'database', 'read', 'Read database', 'admin', true),
('database:backup', 'database', 'backup', 'Backup database', 'admin', true),
('database:restore', 'database', 'restore', 'Restore database', 'admin', true)
ON CONFLICT (name) DO NOTHING;

-- Insert default feature toggles for each organization
INSERT INTO feature_toggles (
    organization_id,
    feature_name,
    feature_key,
    description,
    required_role,
    required_permissions,
    config
)
SELECT
    o.id,
    ft.feature_name,
    ft.feature_key,
    ft.description,
    ft.required_role,
    ft.required_permissions,
    ft.config
FROM organizations o
CROSS JOIN (
    VALUES
        ('Advanced Analytics', 'advanced_analytics', 'Access to advanced analytics and reporting features', 'management'::user_role, ARRAY['analytics:read', 'analytics:export'], '{"enabled_modules": ["forecasting", "trends", "comparisons"]}'),
        ('Supplier Rating System', 'supplier_rating', 'Rate and review suppliers', 'procurement'::user_role, ARRAY['supplier:read', 'supplier:update'], '{"rating_scale": 5, "allow_reviews": true}'),
        ('Bulk Operations', 'bulk_operations', 'Perform bulk operations on records', 'management'::user_role, ARRAY['rfq:update', 'customer:update'], '{"max_batch_size": 50}'),
        ('Custom Workflows', 'custom_workflows', 'Create and manage custom workflows', 'management'::user_role, ARRAY['workflow:create', 'workflow:update'], '{"max_custom_workflows": 10}'),
        ('Document Templates', 'document_templates', 'Use and manage document templates', 'engineering'::user_role, ARRAY['documents:create', 'documents:update'], '{"template_categories": ["rfq", "contract", "spec"]}'),
        ('Approval Notifications', 'approval_notifications', 'Receive approval notifications', 'sales'::user_role, ARRAY['approvals:read'], '{"email_notifications": true, "in_app_notifications": true}'),
        ('Export Data', 'data_export', 'Export data in various formats', 'management'::user_role, ARRAY['analytics:export'], '{"supported_formats": ["csv", "excel", "pdf"]}'),
        ('API Access', 'api_access', 'Access to REST API endpoints', 'admin'::user_role, ARRAY['system_config:read'], '{"rate_limit": 1000, "allowed_endpoints": ["*"]}'),
        ('Audit Trail', 'audit_trail', 'View detailed audit logs', 'management'::user_role, ARRAY['users:read'], '{"retention_days": 365}'),
        ('Multi-language Support', 'multi_language', 'Interface in multiple languages', 'sales'::user_role, ARRAY['profile:read_own'], '{"supported_languages": ["en", "vi"], "default_language": "en"}')
) AS ft(feature_name, feature_key, description, required_role, required_permissions, config)
ON CONFLICT (organization_id, feature_key) DO NOTHING;

-- =========================================
-- 6. INDEXES FOR PERFORMANCE
-- =========================================

CREATE INDEX IF NOT EXISTS idx_permissions_resource_action ON permissions(resource, action);
CREATE INDEX IF NOT EXISTS idx_custom_roles_org_active ON custom_roles(organization_id, is_active);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(custom_role_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_expires ON user_permissions(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_custom_roles_user ON user_custom_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_custom_roles_expires ON user_custom_roles(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_feature_toggles_org_key ON feature_toggles(organization_id, feature_key);
CREATE INDEX IF NOT EXISTS idx_user_feature_access_user ON user_feature_access(user_id);
CREATE INDEX IF NOT EXISTS idx_permission_audit_org_timestamp ON permission_audit_log(organization_id, created_at DESC);

-- =========================================
-- 7. TRIGGERS FOR AUTOMATIC UPDATES
-- =========================================

CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_custom_roles_updated_at BEFORE UPDATE ON custom_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feature_toggles_updated_at BEFORE UPDATE ON feature_toggles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to refresh permissions cache when permissions change
CREATE OR REPLACE FUNCTION refresh_permissions_cache_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Refresh cache for affected users
    IF TG_OP = 'DELETE' THEN
        -- Handle user_permissions changes
        IF TG_TABLE_NAME = 'user_permissions' THEN
            PERFORM refresh_user_permissions_cache(OLD.user_id);
        END IF;

        -- Handle user_custom_roles changes
        IF TG_TABLE_NAME = 'user_custom_roles' THEN
            PERFORM refresh_user_permissions_cache(OLD.user_id);
        END IF;

        -- Handle user_feature_access changes
        IF TG_TABLE_NAME = 'user_feature_access' THEN
            PERFORM refresh_user_permissions_cache(OLD.user_id);
        END IF;
    ELSE
        -- Handle inserts and updates
        IF TG_TABLE_NAME = 'user_permissions' THEN
            PERFORM refresh_user_permissions_cache(NEW.user_id);
        END IF;

        IF TG_TABLE_NAME = 'user_custom_roles' THEN
            PERFORM refresh_user_permissions_cache(NEW.user_id);
        END IF;

        IF TG_TABLE_NAME = 'user_feature_access' THEN
            PERFORM refresh_user_permissions_cache(NEW.user_id);
        END IF;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_user_permissions_cache_on_change
    AFTER INSERT OR UPDATE OR DELETE ON user_permissions
    FOR EACH ROW EXECUTE FUNCTION refresh_permissions_cache_trigger();

CREATE TRIGGER refresh_user_custom_roles_cache_on_change
    AFTER INSERT OR UPDATE OR DELETE ON user_custom_roles
    FOR EACH ROW EXECUTE FUNCTION refresh_permissions_cache_trigger();

CREATE TRIGGER refresh_user_feature_access_cache_on_change
    AFTER INSERT OR UPDATE OR DELETE ON user_feature_access
    FOR EACH ROW EXECUTE FUNCTION refresh_permissions_cache_trigger();

-- =========================================
-- 8. AUDIT LOGGING FUNCTIONS
-- =========================================

CREATE OR REPLACE FUNCTION log_permission_change(
    p_user_id UUID,
    p_target_user_id UUID,
    p_action_type TEXT,
    p_entity_type TEXT,
    p_entity_id UUID,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_reason TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
    org_id UUID;
BEGIN
    -- Get organization ID
    SELECT organization_id INTO org_id
    FROM users
    WHERE id = p_user_id;

    -- Insert audit log
    INSERT INTO permission_audit_log (
        organization_id,
        user_id,
        target_user_id,
        action_type,
        entity_type,
        entity_id,
        old_values,
        new_values,
        reason
    ) VALUES (
        org_id,
        p_user_id,
        p_target_user_id,
        p_action_type,
        p_entity_type,
        p_entity_id,
        p_old_values,
        p_new_values,
        p_reason
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================
-- MIGRATION COMPLETE
-- =========================================

-- Add comments for documentation
COMMENT ON TABLE permissions IS 'System-wide permissions catalog defining all available permissions';
COMMENT ON TABLE custom_roles IS 'Custom roles that can be assigned to users beyond basic user roles';
COMMENT ON TABLE role_permissions IS 'Junction table linking custom roles to specific permissions';
COMMENT ON TABLE user_permissions IS 'User-specific permission overrides (grants or denials)';
COMMENT ON TABLE user_custom_roles IS 'Junction table for user-custom role assignments';
COMMENT ON TABLE feature_toggles IS 'Feature flags to enable/disable specific application features';
COMMENT ON TABLE user_feature_access IS 'User-specific feature access overrides';
COMMENT ON TABLE permission_audit_log IS 'Audit trail for all permission-related changes';

COMMENT ON FUNCTION has_user_permission_enhanced(UUID, TEXT, TEXT) IS 'Enhanced permission checking function with custom roles and overrides';
COMMENT ON FUNCTION has_user_feature_access(UUID, TEXT) IS 'Check if user has access to a specific feature';
COMMENT ON FUNCTION refresh_user_permissions_cache(UUID) IS 'Refresh the cached permissions for a user';
COMMENT ON FUNCTION log_permission_change(UUID, UUID, TEXT, TEXT, UUID, JSONB, JSONB, TEXT) IS 'Log permission changes for audit purposes';
