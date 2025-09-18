-- Check if the specific user exists in both auth and profiles tables
SELECT 'AUTH USERS' as table_name, id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'chandurushilsaikarthik@gmail.com'

UNION ALL

SELECT 'PROFILES' as table_name, id::text, email, null as email_confirmed_at, created_at 
FROM profiles 
WHERE email = 'chandurushilsaikarthik@gmail.com';
