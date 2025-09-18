-- Check existing user accounts in the profiles table
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

-- Also check auth.users table to see if there are any users there
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC;

-- Count total users
SELECT 
    (SELECT COUNT(*) FROM profiles) as profiles_count,
    (SELECT COUNT(*) FROM auth.users) as auth_users_count;
