-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_stages_updated_at BEFORE UPDATE ON workflow_stages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supplier_quotes_updated_at BEFORE UPDATE ON supplier_quotes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate project ID
CREATE OR REPLACE FUNCTION generate_project_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.project_id IS NULL THEN
        NEW.project_id := 'P-' || TO_CHAR(NOW(), 'YYMMDD') || 
                         LPAD((
                             SELECT COALESCE(MAX(CAST(SUBSTRING(project_id FROM 9) AS INTEGER)), 0) + 1
                             FROM projects 
                             WHERE project_id LIKE 'P-' || TO_CHAR(NOW(), 'YYMMDD') || '%'
                         )::TEXT, 2, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for auto-generating project IDs
CREATE TRIGGER generate_project_id_trigger BEFORE INSERT ON projects
    FOR EACH ROW EXECUTE FUNCTION generate_project_id();

-- Function to log activity
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
DECLARE
    user_org_id UUID;
    entity_org_id UUID;
BEGIN
    -- Get user's organization ID
    SELECT organization_id INTO user_org_id 
    FROM users 
    WHERE id = auth.uid();

    -- Get entity's organization ID (fallback to user's org if not found)
    entity_org_id := COALESCE(NEW.organization_id, OLD.organization_id, user_org_id);

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
            new_values
        ) VALUES (
            entity_org_id,
            auth.uid(),
            TG_TABLE_NAME,
            COALESCE(NEW.id, OLD.id),
            TG_OP,
            CASE 
                WHEN TG_OP = 'INSERT' THEN 'Created ' || TG_TABLE_NAME
                WHEN TG_OP = 'UPDATE' THEN 'Updated ' || TG_TABLE_NAME
                WHEN TG_OP = 'DELETE' THEN 'Deleted ' || TG_TABLE_NAME
            END,
            CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
            CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END
        );
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create activity logging triggers for key tables
CREATE TRIGGER log_projects_activity AFTER INSERT OR UPDATE OR DELETE ON projects
    FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_contacts_activity AFTER INSERT OR UPDATE OR DELETE ON contacts
    FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_reviews_activity AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION log_activity();

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_title TEXT,
    p_message TEXT,
    p_type TEXT,
    p_priority priority_level DEFAULT 'medium',
    p_action_url TEXT DEFAULT NULL,
    p_action_label TEXT DEFAULT NULL,
    p_related_entity_type TEXT DEFAULT NULL,
    p_related_entity_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
    user_org_id UUID;
BEGIN
    -- Get user's organization ID
    SELECT organization_id INTO user_org_id 
    FROM users 
    WHERE id = p_user_id;

    -- Insert notification
    INSERT INTO notifications (
        organization_id,
        user_id,
        title,
        message,
        type,
        priority,
        action_url,
        action_label,
        related_entity_type,
        related_entity_id
    ) VALUES (
        user_org_id,
        p_user_id,
        p_title,
        p_message,
        p_type,
        p_priority,
        p_action_url,
        p_action_label,
        p_related_entity_type,
        p_related_entity_id
    ) RETURNING id INTO notification_id;

    RETURN notification_id;
END;
$$ language 'plpgsql';

-- Function to handle project stage changes
CREATE OR REPLACE FUNCTION handle_project_stage_change()
RETURNS TRIGGER AS $$
DECLARE
    stage_name TEXT;
    assigned_users UUID[];
    user_id UUID;
BEGIN
    -- Only proceed if stage actually changed
    IF OLD.current_stage_id IS DISTINCT FROM NEW.current_stage_id THEN
        -- Get stage name
        SELECT name INTO stage_name 
        FROM workflow_stages 
        WHERE id = NEW.current_stage_id;

        -- Update stage_entered_at
        NEW.stage_entered_at = NOW();

        -- Get assigned users for notifications
        SELECT ARRAY_AGG(user_id) INTO assigned_users
        FROM project_assignments 
        WHERE project_id = NEW.id AND is_active = true;

        -- Create notifications for assigned users
        FOREACH user_id IN ARRAY assigned_users
        LOOP
            PERFORM create_notification(
                user_id,
                'Project Stage Updated',
                'Project ' || NEW.project_id || ' moved to ' || stage_name,
                'stage_change',
                'medium',
                '/projects/' || NEW.id,
                'View Project',
                'project',
                NEW.id
            );
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for project stage changes
CREATE TRIGGER handle_project_stage_change_trigger BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION handle_project_stage_change();

-- Function to get user's organization
CREATE OR REPLACE FUNCTION get_user_organization()
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT organization_id FROM users WHERE id = auth.uid());
END;
$$ language 'plpgsql' SECURITY DEFINER;