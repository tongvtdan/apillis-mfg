-- Insert demo profiles with 6-digit IDs for testing different roles
INSERT INTO public.profiles (
  user_id, 
  display_name, 
  role, 
  status, 
  department,
  created_by
) VALUES 
  -- Customer demo account
  ('000001'::uuid, 'Demo Customer', 'Customer', 'Active', 'External', '000001'::uuid),
  
  -- Supplier demo account  
  ('000002'::uuid, 'Demo Supplier', 'Supplier', 'Active', 'External', '000002'::uuid),
  
  -- Engineering demo account
  ('000003'::uuid, 'Demo Engineer', 'Engineering', 'Active', 'Engineering', '000003'::uuid),
  
  -- QA demo account
  ('000004'::uuid, 'Demo QA Analyst', 'QA', 'Active', 'Quality Assurance', '000004'::uuid),
  
  -- Production demo account
  ('000005'::uuid, 'Demo Production Manager', 'Production', 'Active', 'Production', '000005'::uuid),
  
  -- Procurement demo account
  ('000006'::uuid, 'Demo Procurement Specialist', 'Procurement', 'Active', 'Procurement', '000006'::uuid),
  
  -- Management demo account
  ('000007'::uuid, 'Demo Manager', 'Management', 'Active', 'Management', '000007'::uuid)

ON CONFLICT (user_id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  department = EXCLUDED.department;