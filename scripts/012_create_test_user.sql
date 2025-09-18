-- Create a test user account for testing login
-- This will create both auth.users entry and profiles entry

-- First, let's create a test institution if it doesn't exist
INSERT INTO institutions (id, name, domain, created_at)
VALUES (
    'test-institution-id',
    'Test University',
    'test.edu',
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Note: In a real Supabase setup, you would create users through the auth.signUp() method
-- This is just for demonstration of the expected data structure

-- The profiles table should have entries like this after successful registration:
-- INSERT INTO profiles (id, email, full_name, role, institution_id, created_at)
-- VALUES (
--     'user-uuid-here',
--     'test@test.edu',
--     'Test User',
--     'student',
--     'test-institution-id',
--     NOW()
-- );

-- To create a proper test user, you need to:
-- 1. Go to /auth/register
-- 2. Fill out the registration form
-- 3. Check your email for verification
-- 4. Click the verification link
-- 5. The user will be created in both auth.users and profiles tables

SELECT 'To create a test user, use the registration form at /auth/register' as instruction;
