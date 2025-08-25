-- Insert demo profiles with simple UUIDs ending in 6-digit IDs for testing different roles
INSERT INTO public.profiles (
  user_id, 
  display_name, 
  role, 
  status, 
  department,
  created_by
) VALUES 
  -- Customer demo account
  ('00000000-0000-0000-0000-000000000001', 'Demo Customer', 'Customer', 'Active', 'External', '00000000-0000-0000-0000-000000000001'),
  
  -- Supplier demo account  
  ('00000000-0000-0000-0000-000000000002', 'Demo Supplier', 'Supplier', 'Active', 'External', '00000000-0000-0000-0000-000000000002'),
  
  -- Engineering demo account
  ('00000000-0000-0000-0000-000000000003', 'Demo Engineer', 'Engineering', 'Active', 'Engineering', '00000000-0000-0000-0000-000000000003'),
  
  -- QA demo account
  ('00000000-0000-0000-0000-000000000004', 'Demo QA Analyst', 'QA', 'Active', 'Quality Assurance', '00000000-0000-0000-0000-000000000004'),
  
  -- Production demo account
  ('00000000-0000-0000-0000-000000000005', 'Demo Production Manager', 'Production', 'Active', 'Production', '00000000-0000-0000-0000-000000000005'),
  
  -- Procurement demo account
  ('00000000-0000-0000-0000-000000000006', 'Demo Procurement Specialist', 'Procurement', 'Active', 'Procurement', '00000000-0000-0000-0000-000000000006'),
  
  -- Management demo account
  ('00000000-0000-0000-0000-000000000007', 'Demo Manager', 'Management', 'Active', 'Management', '00000000-0000-0000-0000-000000000007')

ON CONFLICT (user_id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  department = EXCLUDED.department;