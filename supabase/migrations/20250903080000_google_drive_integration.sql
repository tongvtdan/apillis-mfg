-- Google Drive Integration Tables
-- Creates tables for Google Drive configuration and token storage

-- Google Drive Configuration Table
CREATE TABLE IF NOT EXISTS google_drive_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL,
    client_id TEXT NOT NULL,
    client_secret TEXT NOT NULL,
    redirect_uri TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Google Drive Tokens Table
CREATE TABLE IF NOT EXISTS google_drive_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    organization_id UUID NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_type TEXT DEFAULT 'Bearer',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    scope TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one token per user per organization
    UNIQUE(user_id, organization_id)
);

-- Enable RLS
ALTER TABLE google_drive_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_drive_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for google_drive_config
CREATE POLICY "Users can view their organization's Google Drive config"
    ON google_drive_config FOR SELECT
    USING (
        organization_id::text IN (
            SELECT organization_id::text FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage Google Drive config"
    ON google_drive_config FOR ALL
    USING (
        organization_id::text IN (
            SELECT organization_id::text FROM users 
            WHERE id = auth.uid() AND role IN ('admin')
        )
    );

-- RLS Policies for google_drive_tokens
CREATE POLICY "Users can view their own Google Drive tokens"
    ON google_drive_tokens FOR SELECT
    USING (
        user_id = auth.uid() AND
        organization_id::text IN (
            SELECT organization_id::text FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their own Google Drive tokens"
    ON google_drive_tokens FOR ALL
    USING (
        user_id = auth.uid() AND
        organization_id::text IN (
            SELECT organization_id::text FROM users WHERE id = auth.uid()
        )
    );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_google_drive_config_org_active 
    ON google_drive_config(organization_id, is_active);

CREATE INDEX IF NOT EXISTS idx_google_drive_tokens_user_org 
    ON google_drive_tokens(user_id, organization_id);

CREATE INDEX IF NOT EXISTS idx_google_drive_tokens_expires 
    ON google_drive_tokens(expires_at);

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_google_drive_config_updated_at 
    BEFORE UPDATE ON google_drive_config 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_google_drive_tokens_updated_at 
    BEFORE UPDATE ON google_drive_tokens 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default configuration using environment variables
-- This will be populated by the application setup
INSERT INTO google_drive_config (
    organization_id,
    client_id,
    client_secret,
    redirect_uri
) 
SELECT 
    '550e8400-e29b-41d4-a716-446655440001'::UUID, -- Default organization ID
    'your-google-client-id-here', -- Will be updated via application
    'your-google-client-secret-here', -- Will be updated via application
    'http://localhost:8080/auth/google/callback' -- Default redirect URI
WHERE NOT EXISTS (
    SELECT 1 FROM google_drive_config 
    WHERE organization_id = '550e8400-e29b-41d4-a716-446655440001'::UUID
);