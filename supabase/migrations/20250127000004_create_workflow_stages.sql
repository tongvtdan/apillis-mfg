-- Create workflow stages table (Step 4 of the sequence)
CREATE TABLE workflow_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    estimated_duration_days INTEGER,
    required_approvals JSONB DEFAULT '[]',
    auto_advance_conditions JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_workflow_stages_order_index ON workflow_stages(order_index);
CREATE INDEX idx_workflow_stages_is_active ON workflow_stages(is_active);

-- Add trigger for updated_at
CREATE TRIGGER update_workflow_stages_updated_at 
    BEFORE UPDATE ON workflow_stages 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
