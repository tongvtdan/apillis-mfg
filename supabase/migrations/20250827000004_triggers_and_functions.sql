-- Triggers and Functions for Enhanced Factory Pulse Schema
-- This migration creates automated triggers for timestamps, logging, and business logic

-- =============================================
-- UTILITY FUNCTIONS
-- =============================================

-- Auto-update timestamps function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate project IDs function
CREATE OR REPLACE FUNCTION generate_project_id()
RETURNS TRIGGER AS $$
DECLARE
    date_part TEXT;
    sequence_num INTEGER;
    new_project_id TEXT;
BEGIN
    -- Generate date part (YYMMDD)
    date_part := TO_CHAR(NOW(), 'YYMMDD');
    
    -- Get next sequence number for today
    SELECT COALESCE(MAX(CAST(RIGHT(project_id, 2) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM projects
    WHERE project_id LIKE 'P-' || date_part || '%'
    AND organization_id = NEW.organization_id;
    
    -- Generate new project ID
    new_project_id := 'P-' || date_part || LPAD(sequence_num::TEXT, 2, '0');
    
    NEW.project_id := new_project_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Activity logging function
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
DECLARE
    org_id UUID;
    proj_id UUID;
BEGIN
    -- Get organization_id and project_id from the record
    org_id := COALESCE(NEW.organization_id, OLD.organization_id);
    proj_id := COALESCE(NEW.project_id, OLD.project_id);
    
    -- If no organization_id in record, try to get it from related project
    IF org_id IS NULL AND proj_id IS NOT NULL THEN
        SELECT organization_id INTO org_id FROM projects WHERE id = proj_id;
    END IF;
    
    -- If still no organization_id, try to get it from user
    IF org_id IS NULL THEN
        SELECT organization_id INTO org_id FROM users WHERE id = auth.uid();
    END IF;
    
    INSERT INTO activity_log (
        organization_id, 
        project_id, 
        user_id, 
        action, 
        entity_type, 
        entity_id, 
        old_values, 
        new_values,
        ip_address,
        user_agent
    ) VALUES (
        org_id,
        proj_id,
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' THEN to_jsonb(NEW) 
             WHEN TG_OP = 'UPDATE' THEN to_jsonb(NEW) 
             ELSE NULL END,
        inet_client_addr(),
        current_setting('request.headers', true)::json->>'user-agent'
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Project stage transition function
CREATE OR REPLACE FUNCTION handle_project_stage_transition()
RETURNS TRIGGER AS $$
DECLARE
    old_stage_id UUID;
    new_stage_id UUID;
    stage_entered_at TIMESTAMPTZ;
BEGIN
    -- Get old and new stage IDs
    old_stage_id := OLD.current_stage_id;
    new_stage_id := NEW.current_stage_id;
    
    -- If stage changed, handle the transition
    IF old_stage_id IS DISTINCT FROM new_stage_id THEN
        -- Get the stage entered timestamp
        stage_entered_at := COALESCE(NEW.stage_entered_at, NOW());
        
        -- Close the previous stage history record if it exists
        IF old_stage_id IS NOT NULL THEN
            UPDATE project_stage_history 
            SET 
                exited_at = stage_entered_at,
                duration_minutes = EXTRACT(EPOCH FROM (stage_entered_at - entered_at)) / 60
            WHERE project_id = NEW.id 
            AND stage_id = old_stage_id 
            AND exited_at IS NULL;
        END IF;
        
        -- Create new stage history record
        IF new_stage_id IS NOT NULL THEN
            INSERT INTO project_stage_history (
                project_id,
                stage_id,
                entered_at,
                entered_by
            ) VALUES (
                NEW.id,
                new_stage_id,
                stage_entered_at,
                auth.uid()
            );
        END IF;
        
        -- Update stage_entered_at if not already set
        IF NEW.stage_entered_at IS NULL THEN
            NEW.stage_entered_at := stage_entered_at;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Calculate days in stage function
CREATE OR REPLACE FUNCTION calculate_days_in_stage()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate days in current stage
    IF NEW.stage_entered_at IS NOT NULL THEN
        NEW.days_in_stage := EXTRACT(DAY FROM (NOW() - NEW.stage_entered_at))::INTEGER;
    ELSE
        NEW.days_in_stage := 0;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Document version management function
CREATE OR REPLACE FUNCTION handle_document_version()
RETURNS TRIGGER AS $$
BEGIN
    -- If this is a new version of an existing document
    IF NEW.version > 1 THEN
        -- Mark all previous versions as not latest
        UPDATE documents 
        SET is_latest = false 
        WHERE project_id = NEW.project_id 
        AND filename = NEW.filename 
        AND id != NEW.id;
        
        -- Create version history record
        INSERT INTO document_versions (
            document_id,
            version_number,
            file_url,
            created_by,
            change_description
        ) VALUES (
            NEW.id,
            NEW.version,
            NEW.file_url,
            auth.uid(),
            'Document updated'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Notification creation function
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type VARCHAR,
    p_title VARCHAR,
    p_message TEXT,
    p_link VARCHAR DEFAULT NULL,
    p_project_id UUID DEFAULT NULL,
    p_priority VARCHAR DEFAULT 'normal'
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        link,
        project_id,
        priority
    ) VALUES (
        p_user_id,
        p_type,
        p_title,
        p_message,
        p_link,
        p_project_id,
        p_priority
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TIMESTAMP TRIGGERS
-- =============================================

-- Apply timestamp triggers to relevant tables
CREATE TRIGGER update_organizations_updated_at 
    BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at 
    BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_stages_updated_at 
    BEFORE UPDATE ON workflow_stages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at 
    BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at 
    BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supplier_rfqs_updated_at 
    BEFORE UPDATE ON supplier_rfqs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at 
    BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- PROJECT-SPECIFIC TRIGGERS
-- =============================================

-- Auto-generate project IDs
CREATE TRIGGER generate_project_id_trigger
    BEFORE INSERT ON projects
    FOR EACH ROW
    WHEN (NEW.project_id IS NULL)
    EXECUTE FUNCTION generate_project_id();

-- Handle project stage transitions
CREATE TRIGGER project_stage_transition_trigger
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION handle_project_stage_transition();

-- Calculate days in stage
CREATE TRIGGER calculate_days_in_stage_trigger
    BEFORE INSERT OR UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION calculate_days_in_stage();

-- =============================================
-- ACTIVITY LOGGING TRIGGERS
-- =============================================

-- Log project activities
CREATE TRIGGER log_projects_activity
    AFTER INSERT OR UPDATE OR DELETE ON projects
    FOR EACH ROW EXECUTE FUNCTION log_activity();

-- Log document activities
CREATE TRIGGER log_documents_activity
    AFTER INSERT OR UPDATE OR DELETE ON documents
    FOR EACH ROW EXECUTE FUNCTION log_activity();

-- Log contact activities
CREATE TRIGGER log_contacts_activity
    AFTER INSERT OR UPDATE OR DELETE ON contacts
    FOR EACH ROW EXECUTE FUNCTION log_activity();

-- Log review activities
CREATE TRIGGER log_reviews_activity
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION log_activity();

-- Log supplier RFQ activities
CREATE TRIGGER log_supplier_rfqs_activity
    AFTER INSERT OR UPDATE OR DELETE ON supplier_rfqs
    FOR EACH ROW EXECUTE FUNCTION log_activity();

-- Log supplier quote activities
CREATE TRIGGER log_supplier_quotes_activity
    AFTER INSERT OR UPDATE OR DELETE ON supplier_quotes
    FOR EACH ROW EXECUTE FUNCTION log_activity();

-- =============================================
-- DOCUMENT MANAGEMENT TRIGGERS
-- =============================================

-- Handle document versioning
CREATE TRIGGER handle_document_version_trigger
    AFTER INSERT OR UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION handle_document_version();

-- =============================================
-- COMMIT TRANSACTION
-- =============================================

COMMIT;