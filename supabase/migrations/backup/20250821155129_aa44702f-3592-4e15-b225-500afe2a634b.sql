
-- Promote a user (by email) to Management and ensure profile + role record exist
-- Replace the email below if needed
WITH u AS (
  SELECT id, COALESCE(raw_user_meta_data->>'display_name', email) AS display_name
  FROM auth.users
  WHERE email = 'dantong@apillis.com'
  LIMIT 1
),
ins_profile AS (
  INSERT INTO public.profiles (user_id, display_name, role, status, created_by)
  SELECT u.id, u.display_name, 'Management'::user_role, 'Active'::user_status, u.id
  FROM u
  WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.user_id = u.id
  )
  RETURNING user_id
),
upd_profile AS (
  UPDATE public.profiles p
  SET role = 'Management'::user_role,
      status = 'Active'::user_status,
      login_attempts = 0,
      locked_until = NULL,
      updated_at = now(),
      updated_by = (SELECT id FROM u)
  FROM u
  WHERE p.user_id = u.id
  RETURNING p.user_id
),
ins_user_role AS (
  INSERT INTO public.user_roles (user_id, role, assigned_by)
  SELECT u.id, 'Management'::user_role, u.id
  FROM u
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = u.id AND ur.role = 'Management'::user_role
  )
  RETURNING user_id
)
-- Show the final state for verification
SELECT p.user_id, p.display_name, p.role, p.status, p.updated_at
FROM public.profiles p
WHERE p.user_id = (SELECT id FROM auth.users WHERE email = 'dantong@apillis.com' LIMIT 1);
