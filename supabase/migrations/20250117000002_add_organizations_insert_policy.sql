-- Add INSERT policy for organizations table
-- Allow authenticated users to create new organizations

-- Create organizations table if it doesn't exist
CREATE TABLE IF NOT EXISTS organizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT,
    description TEXT,
    industry TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    postal_code TEXT,
    website TEXT,
    logo_url TEXT,
    organization_type TEXT DEFAULT 'customer',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contacts table if it doesn't exist
CREATE TABLE IF NOT EXISTS contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id),
    type TEXT DEFAULT 'customer',
    company_name TEXT,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    postal_code TEXT,
    website TEXT,
    tax_id TEXT,
    payment_terms TEXT,
    credit_limit NUMERIC,
    is_active BOOLEAN DEFAULT true,
    role TEXT,
    is_primary_contact BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table if it doesn't exist (optimized)
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY, -- Links directly to auth.users.id
    organization_id UUID,
    email TEXT NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'sales',
    department TEXT,
    phone TEXT,
    avatar_url TEXT,
    status TEXT DEFAULT 'active',
    description TEXT,
    employee_id TEXT,
    direct_manager_id UUID,
    direct_reports UUID[],
    last_login_at TIMESTAMP WITH TIME ZONE,
    preferences JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for organizations
CREATE POLICY "Users can view all organizations" ON organizations FOR SELECT USING (true);
CREATE POLICY "Users can insert organizations" ON organizations FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their organization" ON organizations FOR UPDATE USING (auth.role() = 'authenticated');

-- Create RLS policies for contacts
CREATE POLICY "Users can view all contacts" ON contacts FOR SELECT USING (true);
CREATE POLICY "Users can insert contacts" ON contacts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update contacts" ON contacts FOR UPDATE USING (auth.role() = 'authenticated');

-- Create RLS policies for users
CREATE POLICY "Users can view users" ON users FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert users" ON users FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update users" ON users FOR UPDATE USING (auth.role() = 'authenticated');
