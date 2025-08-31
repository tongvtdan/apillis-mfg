-- Fix RLS Policies to Resolve Circular Dependency and Implement Role-Based Access Control
-- This migration fixes the circular dependency issue and implements comprehensive role-based access control

-- Drop ALL existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can view users in their org" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can create profiles" ON users;

DROP POLICY IF EXISTS "Users can view their organization" ON organizations;
DROP POLICY IF EXISTS "Users can update their organization" ON organizations;

DROP POLICY IF EXISTS "Users can view workflow stages in their org" ON workflow_stages;
DROP POLICY IF EXISTS "Users can modify workflow stages" ON workflow_stages;

DROP POLICY IF EXISTS "Users can view contacts in their org" ON contacts;
DROP POLICY IF EXISTS "Users can modify contacts" ON contacts;

DROP POLICY IF EXISTS "Users can view projects in their org" ON projects;
DROP POLICY IF EXISTS "Users can modify projects in their org" ON projects;
DROP POLICY IF EXISTS "Users can view projects" ON projects;
DROP POLICY IF EXISTS "Users can modify projects" ON projects;

DROP POLICY IF EXISTS "Users can view documents in their org" ON documents;
DROP POLICY IF EXISTS "Users can modify documents in their org" ON documents;
DROP POLICY IF EXISTS "Users can view documents" ON documents;
DROP POLICY IF EXISTS "Users can modify documents" ON documents;

DROP POLICY IF EXISTS "Users can view reviews in their org" ON reviews;
DROP POLICY IF EXISTS "Users can modify reviews in their org" ON reviews;
DROP POLICY IF EXISTS "Users can view reviews" ON reviews;
DROP POLICY IF EXISTS "Users can modify reviews" ON reviews;

DROP POLICY IF EXISTS "Users can view messages in their org" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their org" ON messages;
DROP POLICY IF EXISTS "Users can view messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;

DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;

DROP POLICY IF EXISTS "Users can view activity in their org" ON activity_log;
DROP POLICY IF EXISTS "Users can view activity" ON activity_log;

DROP POLICY IF EXISTS "Users can view project assignments in their org" ON project_assignments;
DROP POLICY IF EXISTS "Users can view project assignments" ON project_assignments;
DROP POLICY IF EXISTS "Users can modify project assignments" ON project_assignments;

DROP POLICY IF EXISTS "Users can view supplier quotes in their org" ON supplier_quotes;
DROP POLICY IF EXISTS "Users can view supplier quotes" ON supplier_quotes;
DROP POLICY IF EXISTS "Users can modify supplier quotes" ON supplier_quotes;

-- Drop existing helper functions if they exist
DROP FUNCTION IF EXISTS get_current_user_org_id();
DROP FUNCTION IF EXISTS get_current_user_role();
DROP FUNCTION IF EXISTS is_internal_user();
DROP FUNCTION IF EXISTS is_portal_user();
DROP FUNCTION IF EXISTS can_access_project(UUID);

-- Create helper functions for role-based access control
CREATE OR REPLACE FUNCTION get_current_user_org_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN (
        SELECT organization_id 
        FROM users 
        WHERE id = auth.uid()
    );
END;
$$;

CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN (
        SELECT role::TEXT
        FROM users 
        WHERE id = auth.uid()
    );
END;
$$;

CREATE OR REPLACE FUNCTION is_internal_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN (
        SELECT role IN ('admin', 'management', 'sales', 'procurement', 'engineering', 'qa', 'production')
        FROM users 
        WHERE id = auth.uid()
    );
END;
$$;

CREATE OR REPLACE FUNCTION is_portal_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN (
        SELECT role IN ('customer', 'supplier')
        FROM users 
        WHERE id = auth.uid()
    );
END;
$$;

CREATE OR REPLACE FUNCTION can_access_project(project_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_role TEXT;
    project_org_id UUID;
    current_stage_id UUID;
    responsible_roles user_role[];
    role_exists BOOLEAN;
BEGIN
    -- Get user role and project organization
    SELECT role::TEXT INTO user_role FROM users WHERE id = auth.uid();
    SELECT organization_id, current_stage_id INTO project_org_id, current_stage_id 
    FROM projects WHERE id = project_id;
    
    -- Check organization access
    IF project_org_id != get_current_user_org_id() THEN
        RETURN FALSE;
    END IF;
    
    -- Admin and management have full access
    IF user_role IN ('admin', 'management') THEN
        RETURN TRUE;
    END IF;
    
    -- Check if user is assigned to the project
    IF EXISTS (
        SELECT 1 FROM project_assignments 
        WHERE project_id = $1 AND user_id = auth.uid()
    ) THEN
        RETURN TRUE;
    END IF;
    
    -- Check workflow stage responsible roles
    IF current_stage_id IS NOT NULL THEN
        SELECT responsible_roles INTO responsible_roles 
        FROM workflow_stages 
        WHERE id = current_stage_id;
        
        -- Check if user role exists in the responsible roles array
        SELECT user_role::user_role = ANY(responsible_roles) INTO role_exists;
        IF role_exists THEN
            RETURN TRUE;
        END IF;
    END IF;
    
    -- Sales can access all projects (customer relationship management)
    IF user_role = 'sales' THEN
        RETURN TRUE;
    END IF;
    
    -- Portal users can only access their own projects
    IF user_role IN ('customer', 'supplier') THEN
        RETURN EXISTS (
            SELECT 1 FROM projects 
            WHERE id = $1 AND (
                (user_role = 'customer' AND customer_id IN (
                    SELECT id FROM contacts WHERE email = (
                        SELECT email FROM auth.users WHERE id = auth.uid()
                    )
                )) OR
                (user_role = 'supplier' AND id IN (
                    SELECT project_id FROM supplier_rfqs WHERE supplier_id IN (
                        SELECT id FROM contacts WHERE email = (
                            SELECT email FROM auth.users WHERE id = auth.uid()
                        )
                    )
                ))
            )
        );
    END IF;
    
    RETURN FALSE;
END;
$$;

-- Create new RLS policies with role-based access control

-- Organizations: Users can only access their own organization
CREATE POLICY "Users can view their organization" ON organizations
    FOR SELECT USING (id = get_current_user_org_id());

CREATE POLICY "Users can update their organization" ON organizations
    FOR UPDATE USING (
        id = get_current_user_org_id() AND 
        get_current_user_role() IN ('admin', 'management')
    );

-- Users: Resolve circular dependency with role-based access
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can view other users in their org" ON users
    FOR SELECT USING (
        organization_id = get_current_user_org_id() AND 
        id != auth.uid() AND
        (
            get_current_user_role() IN ('admin', 'management') OR
            (get_current_user_role() = 'sales' AND role IN ('sales', 'procurement', 'engineering', 'qa', 'production')) OR
            (get_current_user_role() = 'procurement' AND role IN ('procurement', 'engineering', 'qa', 'production')) OR
            (get_current_user_role() = 'engineering' AND role IN ('engineering', 'qa', 'production')) OR
            (get_current_user_role() = 'qa' AND role IN ('qa', 'production')) OR
            (get_current_user_role() = 'production' AND role = 'production')
        )
    );

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can create profiles" ON users
    FOR INSERT WITH CHECK (
        organization_id = get_current_user_org_id() AND
        get_current_user_role() IN ('admin', 'management')
    );

-- Workflow stages: Users can access stages in their organization
CREATE POLICY "Users can view workflow stages in their org" ON workflow_stages
    FOR SELECT USING (organization_id = get_current_user_org_id());

CREATE POLICY "Users can modify workflow stages" ON workflow_stages
    FOR ALL USING (
        organization_id = get_current_user_org_id() AND
        get_current_user_role() IN ('admin', 'management')
    );

-- Contacts: Role-based access control
CREATE POLICY "Users can view contacts in their org" ON contacts
    FOR SELECT USING (
        organization_id = get_current_user_org_id() AND
        (
            get_current_user_role() IN ('admin', 'management') OR
            (get_current_user_role() = 'sales' AND type = 'customer') OR
            (get_current_user_role() = 'procurement' AND type = 'supplier') OR
            (get_current_user_role() IN ('engineering', 'qa', 'production') AND type IN ('customer', 'supplier'))
        )
    );

CREATE POLICY "Users can modify contacts" ON contacts
    FOR ALL USING (
        organization_id = get_current_user_org_id() AND
        get_current_user_role() IN ('admin', 'management', 'sales', 'procurement')
    );

-- Projects: Comprehensive role-based access control
CREATE POLICY "Users can view projects" ON projects
    FOR SELECT USING (can_access_project(id));

CREATE POLICY "Users can modify projects" ON projects
    FOR ALL USING (
        can_access_project(id) AND
        (
            get_current_user_role() IN ('admin', 'management') OR
            (get_current_user_role() = 'sales' AND current_stage_id IN (
                SELECT id FROM workflow_stages 
                WHERE organization_id = get_current_user_org_id() 
                AND 'sales'::user_role = ANY(responsible_roles)
            )) OR
            (get_current_user_role() = 'procurement' AND current_stage_id IN (
                SELECT id FROM workflow_stages 
                WHERE organization_id = get_current_user_org_id() 
                AND 'procurement'::user_role = ANY(responsible_roles)
            )) OR
            (get_current_user_role() = 'engineering' AND current_stage_id IN (
                SELECT id FROM workflow_stages 
                WHERE organization_id = get_current_user_org_id() 
                AND 'engineering'::user_role = ANY(responsible_roles)
            )) OR
            (get_current_user_role() = 'qa' AND current_stage_id IN (
                SELECT id FROM workflow_stages 
                WHERE organization_id = get_current_user_org_id() 
                AND 'qa'::user_role = ANY(responsible_roles)
            )) OR
            (get_current_user_role() = 'production' AND current_stage_id IN (
                SELECT id FROM workflow_stages 
                WHERE organization_id = get_current_user_org_id() 
                AND 'production'::user_role = ANY(responsible_roles)
            ))
        )
    );

-- Documents: Role-based access control
CREATE POLICY "Users can view documents" ON documents
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM projects WHERE can_access_project(id)
        ) AND
        (
            get_current_user_role() IN ('admin', 'management') OR
            access_level IN ('public', 'internal') OR
            (get_current_user_role() = 'customer' AND access_level IN ('public', 'customer')) OR
            (get_current_user_role() = 'supplier' AND access_level IN ('public', 'supplier'))
        )
    );

CREATE POLICY "Users can modify documents" ON documents
    FOR ALL USING (
        project_id IN (
            SELECT id FROM projects WHERE can_access_project(id)
        ) AND
        (
            get_current_user_role() IN ('admin', 'management') OR
            uploaded_by = auth.uid() OR
            (get_current_user_role() IN ('sales', 'procurement', 'engineering', 'qa', 'production') AND access_level != 'restricted')
        )
    );

-- Reviews: Role-based access control
CREATE POLICY "Users can view reviews" ON reviews
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM projects WHERE can_access_project(id)
        ) AND
        (
            get_current_user_role() IN ('admin', 'management') OR
            reviewer_id = auth.uid() OR
            get_current_user_role()::user_role = ANY(
                SELECT responsible_roles FROM workflow_stages 
                WHERE id = (
                    SELECT current_stage_id FROM projects WHERE id = reviews.project_id
                )
            )
        )
    );

CREATE POLICY "Users can modify reviews" ON reviews
    FOR ALL USING (
        project_id IN (
            SELECT id FROM projects WHERE can_access_project(id)
        ) AND
        (
            get_current_user_role() IN ('admin', 'management') OR
            reviewer_id = auth.uid() OR
            get_current_user_role()::user_role = ANY(
                SELECT responsible_roles FROM workflow_stages 
                WHERE id = (
                    SELECT current_stage_id FROM projects WHERE id = reviews.project_id
                )
            )
        )
    );

-- Messages: Role-based access control
CREATE POLICY "Users can view messages" ON messages
    FOR SELECT USING (
        organization_id = get_current_user_org_id() AND
        (
            get_current_user_role() IN ('admin', 'management') OR
            sender_id = auth.uid() OR
            recipient_id = auth.uid() OR
            recipient_type = 'role' AND recipient_role = get_current_user_role() OR
            recipient_type = 'department' AND recipient_department = (
                SELECT department FROM users WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (
        organization_id = get_current_user_org_id() AND
        sender_id = auth.uid() AND
        (
            get_current_user_role() IN ('admin', 'management') OR
            recipient_id IS NOT NULL OR
            recipient_type IN ('role', 'department')
        )
    );

-- Notifications: Users can only access their own notifications
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Activity log: Role-based access control
CREATE POLICY "Users can view activity in their org" ON activity_log
    FOR SELECT USING (
        organization_id = get_current_user_org_id() AND
        (
            get_current_user_role() IN ('admin', 'management') OR
            user_id = auth.uid() OR
            entity_type = 'projects' AND entity_id IN (
                SELECT id FROM projects WHERE can_access_project(id)
            )
        )
    );

-- Project assignments: Role-based access control
CREATE POLICY "Users can view project assignments" ON project_assignments
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM projects WHERE can_access_project(id)
        ) AND
        (
            get_current_user_role() IN ('admin', 'management') OR
            user_id = auth.uid()
        )
    );

CREATE POLICY "Users can modify project assignments" ON project_assignments
    FOR ALL USING (
        project_id IN (
            SELECT id FROM projects WHERE can_access_project(id)
        ) AND
        get_current_user_role() IN ('admin', 'management')
    );

-- Supplier quotes: Role-based access control
CREATE POLICY "Users can view supplier quotes" ON supplier_quotes
    FOR SELECT USING (
        organization_id = get_current_user_org_id() AND
        (
            get_current_user_role() IN ('admin', 'management', 'procurement') OR
            (get_current_user_role() = 'sales' AND project_id IN (
                SELECT id FROM projects WHERE current_stage_id IN (
                    SELECT id FROM workflow_stages 
                    WHERE organization_id = get_current_user_org_id() 
                    AND 'sales'::user_role = ANY(responsible_roles)
                )
            ))
        )
    );

CREATE POLICY "Users can modify supplier quotes" ON supplier_quotes
    FOR ALL USING (
        organization_id = get_current_user_org_id() AND
        get_current_user_role() IN ('admin', 'management', 'procurement')
    );

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION get_current_user_org_id() TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION is_internal_user() TO authenticated;
GRANT EXECUTE ON FUNCTION is_portal_user() TO authenticated;
GRANT EXECUTE ON FUNCTION can_access_project(UUID) TO authenticated;
