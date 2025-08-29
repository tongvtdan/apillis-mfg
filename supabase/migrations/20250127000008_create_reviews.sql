-- Create reviews table (Step 8 of the sequence)
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewer_role VARCHAR(100),
    review_type VARCHAR(50) DEFAULT 'technical' 
      CHECK (review_type IN ('technical', 'quality', 'safety', 'compliance', 'financial')),
    status VARCHAR(20) DEFAULT 'pending' 
      CHECK (status IN ('pending', 'approved', 'rejected', 'requires_changes')),
    reviewed_at TIMESTAMPTZ,
    risks TEXT[],
    recommendations TEXT[],
    tooling_required TEXT[],
    estimated_cost DECIMAL(15,2),
    estimated_lead_time INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_reviews_organization_id ON reviews(organization_id);
CREATE INDEX idx_reviews_project_id ON reviews(project_id);
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_review_type ON reviews(review_type);

-- Add trigger for updated_at
CREATE TRIGGER update_reviews_updated_at 
    BEFORE UPDATE ON reviews 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
