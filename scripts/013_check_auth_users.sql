-- Check if any users exist in Supabase auth system
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;

-- Also check profiles table
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.institution_id,
  i.name as institution_name,
  p.created_at
FROM profiles p
LEFT JOIN institutions i ON p.institution_id = i.id
ORDER BY p.created_at DESC;
