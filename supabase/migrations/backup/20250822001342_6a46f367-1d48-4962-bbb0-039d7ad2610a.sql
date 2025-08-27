-- Add missing role types to user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'Procurement';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'Engineering';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'QA';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'Production';