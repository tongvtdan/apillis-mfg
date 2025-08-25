-- Add avatar_url column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN avatar_url TEXT;

-- Update demo profiles with complete information
UPDATE public.profiles SET
  display_name = 'John Customer',
  department = 'Customer Service',
  status = 'Active'::user_status,
  avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=customer'
WHERE user_id = '000001'::uuid;

UPDATE public.profiles SET
  display_name = 'Sarah Supplier',
  department = 'Supplier Relations',
  status = 'Active'::user_status,
  avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=supplier'
WHERE user_id = '000002'::uuid;

UPDATE public.profiles SET
  display_name = 'Mike Engineer',
  department = 'Engineering',
  status = 'Active'::user_status,
  avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=engineering'
WHERE user_id = '000003'::uuid;

UPDATE public.profiles SET
  display_name = 'Lisa QA Lead',
  department = 'Quality Assurance',
  status = 'Active'::user_status,
  avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=qa'
WHERE user_id = '000004'::uuid;

UPDATE public.profiles SET
  display_name = 'Tom Production',
  department = 'Production',
  status = 'Active'::user_status,
  avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=production'
WHERE user_id = '000005'::uuid;

UPDATE public.profiles SET
  display_name = 'Anna Procurement',
  department = 'Procurement',
  status = 'Active'::user_status,
  avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=procurement'
WHERE user_id = '000006'::uuid;

UPDATE public.profiles SET
  display_name = 'David Manager',
  department = 'Management',
  status = 'Active'::user_status,
  avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=management'
WHERE user_id = '000007'::uuid;