-- Fix Customer/Supplier Users in Users Table - Final Version
-- This script removes customer/supplier accounts from the users table
-- and updates all references to use internal employees

-- Step 1: Update project assignments to use internal employees instead of customer/supplier users
-- Assign projects to appropriate internal employees based on project type

-- Project P-25012703 (Aerospace Component Machining) - assign to engineering
UPDATE projects 
SET assigned_to = '80034f6f-b520-4bf4-9197-0379588b976e' -- mechanical.engineer@factorypulse.vn (Hoàng Thị Lan)
WHERE project_id = 'P-25012703';

-- Project P-25012706 (Demo-Medical Device Components) - assign to engineering  
UPDATE projects 
SET assigned_to = '00474d04-fe69-4823-91f2-c74b96c5c958' -- senior.engineer@factorypulse.vn (Phạm Văn Dũng)
WHERE project_id = 'P-25012706';

-- Project P-25012716 (Precision Robotics Components) - assign to engineering
UPDATE projects 
SET assigned_to = 'da918e06-7480-4b36-8368-456db3fba638' -- electrical.engineer@factorypulse.vn (Vũ Thế Ngọc)
WHERE project_id = 'P-25012716';

-- Step 2: Update project creators to use internal employees instead of customer/supplier users
-- All projects created by supplier user 550e8400-e29b-41d4-a716-446655440110 will be assigned to sales manager

UPDATE projects 
SET created_by = 'f111223f-0745-44ab-b996-1b4a726bc855' -- sales.manager@factorypulse.vn (Bùi Thị Thu)
WHERE created_by = '550e8400-e29b-41d4-a716-446655440110'; -- sales@electronics-assembly.vn (Vũ Đình Nam)

-- Step 3: Update activity log entries to reference internal employees instead of customer/supplier users
-- Activity log entries for customer user will be assigned to sales manager
UPDATE activity_log 
SET user_id = 'f111223f-0745-44ab-b996-1b4a726bc855' -- sales.manager@factorypulse.vn (Bùi Thị Thu)
WHERE user_id = '550e8400-e29b-41d4-a716-446655440104'; -- procurement@airbus.vn (customer)

-- Activity log entries for supplier user 1 will be assigned to procurement manager
UPDATE activity_log 
SET user_id = '5f7e1c5b-9f36-4e84-a670-45903bab3ee2' -- procurement@factorypulse.vn (Lê Văn Phúc)
WHERE user_id = '550e8400-e29b-41d4-a716-446655440106'; -- sales@precision-machining.vn (Trần Văn Phúc)

-- Activity log entries for supplier user 2 will be assigned to sales manager
UPDATE activity_log 
SET user_id = 'f111223f-0745-44ab-b996-1b4a726bc855' -- sales.manager@factorypulse.vn (Bùi Thị Thu)
WHERE user_id = '550e8400-e29b-41d4-a716-446655440110'; -- sales@electronics-assembly.vn (Vũ Đình Nam)

-- Step 4: Remove customer/supplier users from users table
-- These entities should only exist in the contacts table

DELETE FROM users 
WHERE id IN (
    '550e8400-e29b-41d4-a716-446655440104', -- procurement@airbus.vn (customer)
    '550e8400-e29b-41d4-a716-446655440106', -- sales@precision-machining.vn (supplier)
    '550e8400-e29b-41d4-a716-446655440110'  -- sales@electronics-assembly.vn (supplier)
);

-- Step 5: Verify the fix
-- Check that no projects are assigned to customer/supplier users
SELECT 'Projects assigned to customer/supplier users' as check_type, COUNT(*) as count
FROM projects 
WHERE assigned_to IN (
    '550e8400-e29b-41d4-a716-446655440104',
    '550e8400-e29b-41d4-a716-446655440106', 
    '550e8400-e29b-41d4-a716-446655440110'
);

-- Check that no projects are created by customer/supplier users
SELECT 'Projects created by customer/supplier users' as check_type, COUNT(*) as count
FROM projects 
WHERE created_by IN (
    '550e8400-e29b-41d4-a716-446655440104',
    '550e8400-e29b-41d4-a716-446655440106',
    '550e8400-e29b-41d4-a716-446655440110'
);

-- Check that no activity log entries reference customer/supplier users
SELECT 'Activity log entries for customer/supplier users' as check_type, COUNT(*) as count
FROM activity_log 
WHERE user_id IN (
    '550e8400-e29b-41d4-a716-446655440104',
    '550e8400-e29b-41d4-a716-446655440106',
    '550e8400-e29b-41d4-a716-446655440110'
);

-- Check that customer/supplier users are removed from users table
SELECT 'Customer/supplier users remaining' as check_type, COUNT(*) as count
FROM users 
WHERE id IN (
    '550e8400-e29b-41d4-a716-446655440104',
    '550e8400-e29b-41d4-a716-446655440106',
    '550e8400-e29b-41d4-a716-446655440110'
);

-- Verify entities still exist in contacts table
SELECT 'Entities in contacts table' as check_type, COUNT(*) as count
FROM contacts 
WHERE id IN (
    '550e8400-e29b-41d4-a716-446655440104',
    '550e8400-e29b-41d4-a716-446655440106',
    '550e8400-e29b-41d4-a716-446655440110'
);
