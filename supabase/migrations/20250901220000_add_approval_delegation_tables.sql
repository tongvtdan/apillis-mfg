-- Create approval_delegations table
CREATE TABLE IF NOT EXISTS approval_delegations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    delegator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    delegate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    reason TEXT NOT NULL,
    include_new_approvals BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
    organization_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create approval_delegation_mappings table for specific approval delegations
CREATE TABLE IF NOT EXISTS approval_delegation_mappings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    delegation_id UUID NOT NULL REFERENCES approval_delegations(id) ON DELETE CASCADE,
    approval_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(delegation_id, approval_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_approval_delegations_delegator ON approval_delegations(delegator_id);
CREATE INDEX IF NOT EXISTS idx_approval_delegations_delegate ON approval_delegations(delegate_id);
CREATE INDEX IF NOT EXISTS idx_approval_delegations_dates ON approval_delegations(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_approval_delegations_status ON approval_delegations(status);
CREATE INDEX IF NOT EXISTS idx_approval_delegations_org ON approval_delegations(organization_id);
CREATE INDEX IF NOT EXISTS idx_approval_delegation_mappings_delegation ON approval_delegation_mappings(delegation_id);
CREATE INDEX IF NOT EXISTS idx_approval_delegation_mappings_approval ON approval_delegation_mappings(approval_id);

-- Add RLS policies
ALTER TABLE approval_delegations ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_delegation_mappings ENABLE ROW LEVEL SECURITY;

-- Policy for approval_delegations: users can see delegations they're involved in
CREATE POLICY "Users can view their own delegations" ON approval_delegations
    FOR SELECT USING (
        auth.uid() = delegator_id OR 
        auth.uid() = delegate_id OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.organization_id = approval_delegations.organization_id
            AND users.role IN ('admin', 'management')
        )
    );

-- Policy for creating delegations: users can create delegations for themselves
CREATE POLICY "Users can create their own delegations" ON approval_delegations
    FOR INSERT WITH CHECK (
        auth.uid() = delegator_id AND
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.organization_id = approval_delegations.organization_id
        )
    );

-- Policy for updating delegations: only delegator can update
CREATE POLICY "Delegators can update their delegations" ON approval_delegations
    FOR UPDATE USING (auth.uid() = delegator_id);

-- Policy for approval_delegation_mappings: same as parent delegation
CREATE POLICY "Users can view delegation mappings" ON approval_delegation_mappings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM approval_delegations 
            WHERE approval_delegations.id = approval_delegation_mappings.delegation_id
            AND (
                auth.uid() = approval_delegations.delegator_id OR 
                auth.uid() = approval_delegations.delegate_id OR
                EXISTS (
                    SELECT 1 FROM users 
                    WHERE users.id = auth.uid() 
                    AND users.organization_id = approval_delegations.organization_id
                    AND users.role IN ('admin', 'management')
                )
            )
        )
    );

CREATE POLICY "Users can create delegation mappings" ON approval_delegation_mappings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM approval_delegations 
            WHERE approval_delegations.id = approval_delegation_mappings.delegation_id
            AND auth.uid() = approval_delegations.delegator_id
        )
    );

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_approval_delegations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_approval_delegations_updated_at
    BEFORE UPDATE ON approval_delegations
    FOR EACH ROW
    EXECUTE FUNCTION update_approval_delegations_updated_at();

-- Function to automatically expire delegations
CREATE OR REPLACE FUNCTION expire_approval_delegations()
RETURNS void AS $$
BEGIN
    UPDATE approval_delegations 
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'active' 
    AND end_date < NOW();
END;
$$ LANGUAGE plpgsql;

-- Add the tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE approval_delegations;
ALTER PUBLICATION supabase_realtime ADD TABLE approval_delegation_mappings;