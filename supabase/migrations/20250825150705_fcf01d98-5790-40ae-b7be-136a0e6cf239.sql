-- Add missing project status values to support the full workflow
-- This migration adds the new status values for the complete workflow

-- Check current enum values and add missing ones
DO $$
BEGIN
    -- Add 'supplier_rfq' status if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'supplier_rfq' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'project_status')) THEN
        ALTER TYPE project_status ADD VALUE 'supplier_rfq';
    END IF;
    
    -- Add 'procurement' status if it doesn't exist  
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'procurement' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'project_status')) THEN
        ALTER TYPE project_status ADD VALUE 'procurement';
    END IF;
END $$;