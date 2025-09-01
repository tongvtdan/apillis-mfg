-- Fix log_activity function to handle edge cases better
CREATE OR REPLACE FUNCTION "public"."log_activity"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    user_org_id UUID;
    entity_org_id UUID;
    entity_project_id UUID;
    current_user_id UUID;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    -- Get user's organization ID
    IF current_user_id IS NOT NULL THEN
        SELECT organization_id INTO user_org_id 
        FROM users 
        WHERE id = current_user_id;
    END IF;

    -- Get entity's organization ID (fallback chain)
    entity_org_id := COALESCE(NEW.organization_id, OLD.organization_id, user_org_id);
    
    -- Try to determine project_id for better analytics
    -- Check if the entity itself is a project
    IF TG_TABLE_NAME = 'projects' THEN
        entity_project_id := COALESCE(NEW.id, OLD.id);
    -- Check if the entity has a project_id field (like documents, messages, etc.)
    ELSIF TG_TABLE_NAME IN ('documents', 'messages', 'project_assignments', 'project_sub_stage_progress') THEN
        entity_project_id := COALESCE(NEW.project_id, OLD.project_id);
    -- For other entities, try to get project_id from metadata if it's a JSON field
    ELSIF TG_TABLE_NAME = 'activity_log' THEN
        -- When inserting into activity_log directly, preserve existing project_id
        entity_project_id := COALESCE(NEW.project_id, OLD.project_id);
    END IF;

    -- Only log if we have an organization ID
    IF entity_org_id IS NOT NULL THEN
        INSERT INTO activity_log (
            organization_id,
            user_id,
            entity_type,
            entity_id,
            action,
            description,
            old_values,
            new_values,
            project_id  -- Add project_id to the insert
        ) VALUES (
            entity_org_id,
            current_user_id,  -- Use the variable instead of calling auth.uid() again
            TG_TABLE_NAME,
            COALESCE(NEW.id, OLD.id),
            TG_OP,
            CASE 
                WHEN TG_OP = 'INSERT' THEN 'Created ' || TG_TABLE_NAME
                WHEN TG_OP = 'UPDATE' THEN 'Updated ' || TG_TABLE_NAME
                WHEN TG_OP = 'DELETE' THEN 'Deleted ' || TG_TABLE_NAME
                ELSE TG_OP || ' ' || TG_TABLE_NAME
            END,
            CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
            CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END,
            entity_project_id  -- Include the determined project_id
        );
    ELSE
        -- Log to server logs when we can't determine organization_id for debugging
        RAISE LOG 'log_activity: Could not determine organization_id for table %, operation %', TG_TABLE_NAME, TG_OP;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add comment for documentation
COMMENT ON FUNCTION "public"."log_activity"() 
IS 'Enhanced activity logging function that automatically populates project_id for better analytics. Handles edge cases with better error logging.';