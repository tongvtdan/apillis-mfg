-- Realtime Configuration for Enhanced Factory Pulse Schema
-- This migration configures Supabase Realtime for key tables

-- =============================================
-- ENABLE REALTIME FOR KEY TABLES
-- =============================================

-- Core project management tables
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE project_stage_history;
ALTER PUBLICATION supabase_realtime ADD TABLE project_assignments;

-- Communication tables
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Document management
ALTER PUBLICATION supabase_realtime ADD TABLE documents;
ALTER PUBLICATION supabase_realtime ADD TABLE document_comments;

-- Review and approval workflow
ALTER PUBLICATION supabase_realtime ADD TABLE reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE review_checklist_items;
ALTER PUBLICATION supabase_realtime ADD TABLE approval_requests;

-- Supplier management
ALTER PUBLICATION supabase_realtime ADD TABLE supplier_rfqs;
ALTER PUBLICATION supabase_realtime ADD TABLE supplier_quotes;

-- Activity tracking
ALTER PUBLICATION supabase_realtime ADD TABLE activity_log;

-- Workflow management
ALTER PUBLICATION supabase_realtime ADD TABLE workflow_stages;
ALTER PUBLICATION supabase_realtime ADD TABLE workflow_rule_executions;

-- AI processing
ALTER PUBLICATION supabase_realtime ADD TABLE ai_processing_queue;

-- BOM management
ALTER PUBLICATION supabase_realtime ADD TABLE bom_items;

-- =============================================
-- REALTIME NOTIFICATION FUNCTIONS
-- =============================================

-- Function to broadcast project updates
CREATE OR REPLACE FUNCTION broadcast_project_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Broadcast to project-specific channel
    PERFORM pg_notify(
        'project_' || NEW.id::text,
        json_build_object(
            'type', 'project_update',
            'project_id', NEW.id,
            'project_code', NEW.project_id,
            'old_stage', CASE WHEN TG_OP = 'UPDATE' THEN OLD.current_stage_id ELSE NULL END,
            'new_stage', NEW.current_stage_id,
            'status', NEW.status,
            'updated_by', auth.uid(),
            'updated_at', NEW.updated_at
        )::text
    );
    
    -- Broadcast to organization channel
    PERFORM pg_notify(
        'org_' || NEW.organization_id::text,
        json_build_object(
            'type', 'project_update',
            'project_id', NEW.id,
            'project_code', NEW.project_id,
            'action', TG_OP
        )::text
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to broadcast message updates
CREATE OR REPLACE FUNCTION broadcast_message_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Broadcast to project channel
    IF NEW.project_id IS NOT NULL THEN
        PERFORM pg_notify(
            'project_' || NEW.project_id::text,
            json_build_object(
                'type', 'new_message',
                'message_id', NEW.id,
                'thread_id', NEW.thread_id,
                'sender_id', NEW.sender_id,
                'project_id', NEW.project_id,
                'message_type', NEW.message_type,
                'priority', NEW.priority
            )::text
        );
    END IF;
    
    -- Broadcast to recipient if it's a user
    IF NEW.recipient_type = 'user' AND NEW.recipient_id IS NOT NULL THEN
        PERFORM pg_notify(
            'user_' || NEW.recipient_id::text,
            json_build_object(
                'type', 'new_message',
                'message_id', NEW.id,
                'from_user', NEW.sender_id,
                'subject', NEW.subject,
                'priority', NEW.priority
            )::text
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to broadcast notification updates
CREATE OR REPLACE FUNCTION broadcast_notification_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Broadcast to user channel
    PERFORM pg_notify(
        'user_' || NEW.user_id::text,
        json_build_object(
            'type', 'new_notification',
            'notification_id', NEW.id,
            'title', NEW.title,
            'message', NEW.message,
            'priority', NEW.priority,
            'project_id', NEW.project_id,
            'link', NEW.link
        )::text
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to broadcast document updates
CREATE OR REPLACE FUNCTION broadcast_document_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Broadcast to project channel
    PERFORM pg_notify(
        'project_' || NEW.project_id::text,
        json_build_object(
            'type', 'document_update',
            'document_id', NEW.id,
            'filename', NEW.filename,
            'document_type', NEW.document_type,
            'version', NEW.version,
            'is_latest', NEW.is_latest,
            'action', TG_OP
        )::text
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to broadcast review updates
CREATE OR REPLACE FUNCTION broadcast_review_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Broadcast to project channel
    PERFORM pg_notify(
        'project_' || NEW.project_id::text,
        json_build_object(
            'type', 'review_update',
            'review_id', NEW.id,
            'reviewer_id', NEW.reviewer_id,
            'reviewer_role', NEW.reviewer_role,
            'status', NEW.status,
            'review_type', NEW.review_type,
            'action', TG_OP
        )::text
    );
    
    -- Notify the reviewer
    IF NEW.reviewer_id IS NOT NULL THEN
        PERFORM pg_notify(
            'user_' || NEW.reviewer_id::text,
            json_build_object(
                'type', 'review_assignment',
                'review_id', NEW.id,
                'project_id', NEW.project_id,
                'review_type', NEW.review_type,
                'status', NEW.status,
                'due_date', NEW.due_date
            )::text
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to broadcast supplier quote updates
CREATE OR REPLACE FUNCTION broadcast_supplier_quote_update()
RETURNS TRIGGER AS $$
DECLARE
    project_id_var UUID;
BEGIN
    -- Get project_id from supplier_rfq
    SELECT sr.project_id INTO project_id_var
    FROM supplier_rfqs sr
    WHERE sr.id = NEW.supplier_rfq_id;
    
    -- Broadcast to project channel
    IF project_id_var IS NOT NULL THEN
        PERFORM pg_notify(
            'project_' || project_id_var::text,
            json_build_object(
                'type', 'supplier_quote_update',
                'quote_id', NEW.id,
                'rfq_id', NEW.supplier_rfq_id,
                'project_id', project_id_var,
                'total_price', NEW.total_price,
                'currency', NEW.currency,
                'is_selected', NEW.is_selected,
                'action', TG_OP
            )::text
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- REALTIME TRIGGERS
-- =============================================

-- Project update broadcasts
CREATE TRIGGER broadcast_project_update_trigger
    AFTER INSERT OR UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION broadcast_project_update();

-- Message broadcasts
CREATE TRIGGER broadcast_message_update_trigger
    AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION broadcast_message_update();

-- Notification broadcasts
CREATE TRIGGER broadcast_notification_update_trigger
    AFTER INSERT ON notifications
    FOR EACH ROW EXECUTE FUNCTION broadcast_notification_update();

-- Document broadcasts
CREATE TRIGGER broadcast_document_update_trigger
    AFTER INSERT OR UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION broadcast_document_update();

-- Review broadcasts
CREATE TRIGGER broadcast_review_update_trigger
    AFTER INSERT OR UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION broadcast_review_update();

-- Supplier quote broadcasts
CREATE TRIGGER broadcast_supplier_quote_update_trigger
    AFTER INSERT OR UPDATE ON supplier_quotes
    FOR EACH ROW EXECUTE FUNCTION broadcast_supplier_quote_update();

-- =============================================
-- REALTIME HELPER FUNCTIONS
-- =============================================

-- Function to get user's subscribed channels
CREATE OR REPLACE FUNCTION get_user_realtime_channels(user_id UUID)
RETURNS TEXT[] AS $$
DECLARE
    channels TEXT[] := ARRAY[]::TEXT[];
    org_id UUID;
    project_ids UUID[];
BEGIN
    -- Get user's organization
    SELECT organization_id INTO org_id FROM users WHERE id = user_id;
    
    -- Add user-specific channel
    channels := array_append(channels, 'user_' || user_id::text);
    
    -- Add organization channel
    IF org_id IS NOT NULL THEN
        channels := array_append(channels, 'org_' || org_id::text);
    END IF;
    
    -- Add project channels for assigned projects
    SELECT array_agg(DISTINCT p.id) INTO project_ids
    FROM projects p
    LEFT JOIN project_assignments pa ON pa.project_id = p.id
    WHERE p.assigned_to = user_id 
       OR pa.user_id = user_id
       OR p.organization_id = org_id;
    
    -- Add project channels
    IF project_ids IS NOT NULL THEN
        FOR i IN 1..array_length(project_ids, 1) LOOP
            channels := array_append(channels, 'project_' || project_ids[i]::text);
        END LOOP;
    END IF;
    
    RETURN channels;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can subscribe to channel
CREATE OR REPLACE FUNCTION can_user_subscribe_to_channel(user_id UUID, channel_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    org_id UUID;
    project_id UUID;
    target_user_id UUID;
BEGIN
    -- Get user's organization
    SELECT organization_id INTO org_id FROM users WHERE id = user_id;
    
    -- Check channel type and permissions
    CASE 
        -- User channels - can only subscribe to own channel
        WHEN channel_name LIKE 'user_%' THEN
            target_user_id := (regexp_split_to_array(channel_name, '_'))[2]::UUID;
            RETURN target_user_id = user_id;
            
        -- Organization channels - must be member of organization
        WHEN channel_name LIKE 'org_%' THEN
            RETURN org_id = (regexp_split_to_array(channel_name, '_'))[2]::UUID;
            
        -- Project channels - must have access to project
        WHEN channel_name LIKE 'project_%' THEN
            project_id := (regexp_split_to_array(channel_name, '_'))[2]::UUID;
            RETURN EXISTS (
                SELECT 1 FROM projects p
                WHERE p.id = project_id 
                AND p.organization_id = org_id
            );
            
        ELSE
            RETURN FALSE;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- COMMIT TRANSACTION
-- =============================================

COMMIT;