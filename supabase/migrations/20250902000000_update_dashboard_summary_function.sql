-- Update get_dashboard_summary function to include stage distribution data
CREATE OR REPLACE FUNCTION "public"."get_dashboard_summary"() RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    user_org_id UUID;
    current_user_id UUID;
    result JSONB;
    project_counts JSONB;
    recent_projects JSONB;
    status_counts JSONB;
    type_counts JSONB;
    priority_counts JSONB;
    stage_counts JSONB;
    project_record RECORD;
    debug_info JSONB;
BEGIN
    -- Get current user ID and log it for debugging
    current_user_id := auth.uid();
    
    -- Try to get user's organization ID
    SELECT organization_id INTO user_org_id 
    FROM users 
    WHERE id = current_user_id;
    
    -- Create debug info
    debug_info := jsonb_build_object(
        'current_user_id', current_user_id,
        'organization_id', user_org_id,
        'timestamp', extract(epoch from now())
    );
    
    -- If no organization found, try to get any organization for demo purposes
    IF user_org_id IS NULL THEN
        -- For demo/development purposes, get the first organization
        SELECT id INTO user_org_id FROM organizations LIMIT 1;
        
        -- Update debug info
        debug_info := debug_info || jsonb_build_object('fallback_to_first_org', true);
        
        -- If still no organization, return empty result with debug info
        IF user_org_id IS NULL THEN
            RETURN jsonb_build_object(
                'projects', jsonb_build_object('total', 0, 'by_status', '{}', 'by_type', '{}', 'by_priority', '{}', 'by_stage', '{}'),
                'recent_projects', '[]',
                'generated_at', extract(epoch from now()),
                'debug', debug_info
            );
        END IF;
    END IF;
    
    -- Add organization ID to debug info
    debug_info := debug_info || jsonb_build_object('using_organization_id', user_org_id);

    -- Get project counts by status
    status_counts := '{}';
    FOR project_record IN 
        SELECT 
            status,
            COUNT(*) as count
        FROM projects 
        WHERE organization_id = user_org_id
        GROUP BY status
    LOOP
        status_counts := status_counts || jsonb_build_object(project_record.status, project_record.count);
    END LOOP;

    -- Get project counts by type
    type_counts := '{}';
    FOR project_record IN 
        SELECT 
            project_type,
            COUNT(*) as count
        FROM projects 
        WHERE organization_id = user_org_id
        GROUP BY project_type
    LOOP
        -- Use 'other' for null project_type instead of 'unspecified' to avoid enum issues
        type_counts := type_counts || jsonb_build_object(COALESCE(project_record.project_type, 'other'), project_record.count);
    END LOOP;

    -- Get project counts by priority - FIX: Use valid enum values for priority_level
    priority_counts := '{}';
    FOR project_record IN 
        SELECT 
            COALESCE(priority_level, 'medium') as priority, -- Set default to 'medium' instead of 'unspecified'
            COUNT(*) as count
        FROM projects 
        WHERE organization_id = user_org_id
        GROUP BY COALESCE(priority_level, 'medium') -- Group with the default value
    LOOP
        priority_counts := priority_counts || jsonb_build_object(project_record.priority, project_record.count);
    END LOOP;

    -- Get project counts by stage
    stage_counts := '{}';
    FOR project_record IN 
        SELECT 
            current_stage_id,
            COUNT(*) as count
        FROM projects 
        WHERE organization_id = user_org_id AND current_stage_id IS NOT NULL
        GROUP BY current_stage_id
    LOOP
        stage_counts := stage_counts || jsonb_build_object(project_record.current_stage_id, project_record.count);
    END LOOP;

    -- Build project counts object
    project_counts := jsonb_build_object(
        'total', (SELECT COUNT(*) FROM projects WHERE organization_id = user_org_id),
        'by_status', status_counts,
        'by_type', type_counts,
        'by_priority', priority_counts,
        'by_stage', stage_counts
    );

    -- Get recent projects with customer information
    recent_projects := (
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', p.id,
                'organization_id', p.organization_id,
                'project_id', p.project_id,
                'title', p.title,
                'status', p.status,
                'priority_level', COALESCE(p.priority_level, 'medium'), -- Set default to 'medium' for NULL values
                'project_type', p.project_type,
                'created_at', p.created_at,
                'customer_name', c.company_name,
                'estimated_delivery_date', p.estimated_delivery_date,
                'current_stage', p.current_stage_id,
                'days_in_stage', 
                CASE 
                    WHEN p.stage_entered_at IS NOT NULL THEN
                        EXTRACT(DAY FROM (NOW() - p.stage_entered_at))
                    ELSE NULL
                END
            )
        )
        FROM (
            SELECT *
            FROM projects 
            WHERE organization_id = user_org_id
            ORDER BY created_at DESC
            LIMIT 10
        ) p
        LEFT JOIN contacts c ON p.customer_id = c.id
    );

    -- If no recent projects, set to empty array
    IF recent_projects IS NULL THEN
        recent_projects := '[]';
    END IF;

    -- Count projects for debug info
    debug_info := debug_info || jsonb_build_object(
        'project_count', (SELECT COUNT(*) FROM projects WHERE organization_id = user_org_id),
        'project_query', format('SELECT * FROM projects WHERE organization_id = %L', user_org_id)
    );

    -- Build final result
    result := jsonb_build_object(
        'projects', project_counts,
        'recent_projects', recent_projects,
        'generated_at', extract(epoch from now()),
        'debug', debug_info
    );

    RETURN result;
END;
$$;