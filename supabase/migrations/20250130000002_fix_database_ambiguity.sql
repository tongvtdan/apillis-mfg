-- Fix database function ambiguity issues
-- This migration fixes the can_access_project function and RLS policies

-- 1. Fix the can_access_project function to resolve current_stage_id ambiguity
CREATE OR REPLACE FUNCTION public.can_access_project(project_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    user_role TEXT;
    project_org_id UUID;
    project_current_stage_id UUID;
    responsible_roles user_role[];
    role_exists BOOLEAN;
BEGIN
    -- Get user role and project organization
    SELECT role::TEXT INTO user_role FROM users WHERE id = auth.uid();
    SELECT organization_id, current_stage_id INTO project_org_id, project_current_stage_id 
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
        WHERE project_assignments.project_id = $1 AND user_id = auth.uid()
    ) THEN
        RETURN TRUE;
    END IF;
    
    -- Check workflow stage responsible roles
    IF project_current_stage_id IS NOT NULL THEN
        SELECT responsible_roles INTO responsible_roles 
        FROM workflow_stages 
        WHERE id = project_current_stage_id;
        
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
            WHERE projects.id = $1 AND (
                (user_role = 'customer' AND customer_id IN (
                    SELECT id FROM contacts WHERE email = (
                        SELECT email FROM auth.users WHERE id = auth.uid()
                    )
                )) OR
                (user_role = 'supplier' AND projects.id IN (
                    SELECT supplier_rfqs.project_id FROM supplier_rfqs WHERE supplier_id IN (
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
$function$;

-- 2. Fix the RLS policy to resolve current_stage_id ambiguity
DROP POLICY IF EXISTS "Users can modify projects" ON projects;

CREATE POLICY "Users can modify projects" ON projects
FOR ALL
USING (
  can_access_project(id) AND (
    (get_current_user_role() = ANY (ARRAY['admin'::text, 'management'::text])) OR
    ((get_current_user_role() = 'sales'::text) AND (projects.current_stage_id IN (
      SELECT workflow_stages.id
      FROM workflow_stages
      WHERE workflow_stages.organization_id = get_current_user_org_id()
      AND 'sales'::user_role = ANY (workflow_stages.responsible_roles)
    ))) OR
    ((get_current_user_role() = 'procurement'::text) AND (projects.current_stage_id IN (
      SELECT workflow_stages.id
      FROM workflow_stages
      WHERE workflow_stages.organization_id = get_current_user_org_id()
      AND 'procurement'::user_role = ANY (workflow_stages.responsible_roles)
    ))) OR
    ((get_current_user_role() = 'engineering'::text) AND (projects.current_stage_id IN (
      SELECT workflow_stages.id
      FROM workflow_stages
      WHERE workflow_stages.organization_id = get_current_user_org_id()
      AND 'engineering'::user_role = ANY (workflow_stages.responsible_roles)
    ))) OR
    ((get_current_user_role() = 'qa'::text) AND (projects.current_stage_id IN (
      SELECT workflow_stages.id
      FROM workflow_stages
      WHERE workflow_stages.organization_id = get_current_user_org_id()
      AND 'qa'::user_role = ANY (workflow_stages.responsible_roles)
    ))) OR
    ((get_current_user_role() = 'production'::text) AND (projects.current_stage_id IN (
      SELECT workflow_stages.id
      FROM workflow_stages
      WHERE workflow_stages.organization_id = get_current_user_org_id()
      AND 'production'::user_role = ANY (workflow_stages.responsible_roles)
    )))
  )
);
