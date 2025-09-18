-- Update RLS policies to enforce institutional hierarchy
-- Drop existing policies that don't enforce institutional boundaries
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "achievements_select_own" ON public.achievements;
DROP POLICY IF EXISTS "achievements_update_admin" ON public.achievements;
DROP POLICY IF EXISTS "queries_select_own" ON public.queries;
DROP POLICY IF EXISTS "queries_update_admin" ON public.queries;
DROP POLICY IF EXISTS "audit_logs_select_admin" ON public.audit_logs;

-- Updated RLS policies to enforce institutional boundaries
-- Profiles: Admins can only see users from their own institution
CREATE POLICY "profiles_select_admin_same_institution" ON public.profiles FOR SELECT USING (
  auth.uid() = id OR
  EXISTS (
    SELECT 1 FROM public.profiles current_user
    WHERE current_user.id = auth.uid() 
    AND current_user.role IN ('admin', 'super_admin')
    AND current_user.institution_id = profiles.institution_id
  )
);

-- Achievements: Admins can only see achievements from students in their institution
CREATE POLICY "achievements_select_institutional" ON public.achievements FOR SELECT USING (
  student_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.profiles current_user, public.profiles student
    WHERE current_user.id = auth.uid() 
    AND student.id = achievements.student_id
    AND (
      (current_user.role IN ('admin', 'super_admin') AND current_user.institution_id = student.institution_id) OR
      current_user.role = 'recruiter'
    )
  )
);

-- Achievements: Only admins from same institution can update
CREATE POLICY "achievements_update_admin_same_institution" ON public.achievements FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles current_user, public.profiles student
    WHERE current_user.id = auth.uid() 
    AND student.id = achievements.student_id
    AND current_user.role IN ('admin', 'super_admin')
    AND current_user.institution_id = student.institution_id
  )
);

-- Queries: Admins can only see queries from students in their institution
CREATE POLICY "queries_select_institutional" ON public.queries FOR SELECT USING (
  student_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.profiles current_user, public.profiles student
    WHERE current_user.id = auth.uid() 
    AND student.id = queries.student_id
    AND current_user.role IN ('admin', 'super_admin')
    AND current_user.institution_id = student.institution_id
  )
);

-- Queries: Only admins from same institution can update
CREATE POLICY "queries_update_admin_same_institution" ON public.queries FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles current_user, public.profiles student
    WHERE current_user.id = auth.uid() 
    AND student.id = queries.student_id
    AND current_user.role IN ('admin', 'super_admin')
    AND current_user.institution_id = student.institution_id
  )
);

-- Audit logs: Admins can only see logs from their institution
CREATE POLICY "audit_logs_select_institutional" ON public.audit_logs FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles current_user, public.profiles log_user
    WHERE current_user.id = auth.uid() 
    AND log_user.id = audit_logs.user_id
    AND current_user.role IN ('admin', 'super_admin')
    AND current_user.institution_id = log_user.institution_id
  )
);

-- Add function to get users by institution for admin dashboards
CREATE OR REPLACE FUNCTION get_institution_users(user_role TEXT DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT,
  institution_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    i.name as institution_name,
    p.created_at
  FROM public.profiles p
  JOIN public.institutions i ON p.institution_id = i.id
  WHERE EXISTS (
    SELECT 1 FROM public.profiles current_user
    WHERE current_user.id = auth.uid()
    AND current_user.role IN ('admin', 'super_admin')
    AND current_user.institution_id = p.institution_id
  )
  AND (user_role IS NULL OR p.role = user_role)
  ORDER BY p.created_at DESC;
END;
$$;

-- Add function to get institution statistics for dashboards
CREATE OR REPLACE FUNCTION get_institution_stats()
RETURNS TABLE (
  total_students BIGINT,
  total_achievements BIGINT,
  pending_achievements BIGINT,
  verified_achievements BIGINT,
  rejected_achievements BIGINT,
  open_queries BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.profiles p1 
     JOIN public.profiles current_user ON current_user.id = auth.uid()
     WHERE p1.role = 'student' AND p1.institution_id = current_user.institution_id) as total_students,
    
    (SELECT COUNT(*) FROM public.achievements a
     JOIN public.profiles student ON student.id = a.student_id
     JOIN public.profiles current_user ON current_user.id = auth.uid()
     WHERE current_user.institution_id = student.institution_id) as total_achievements,
     
    (SELECT COUNT(*) FROM public.achievements a
     JOIN public.profiles student ON student.id = a.student_id
     JOIN public.profiles current_user ON current_user.id = auth.uid()
     WHERE current_user.institution_id = student.institution_id 
     AND a.verification_status = 'pending') as pending_achievements,
     
    (SELECT COUNT(*) FROM public.achievements a
     JOIN public.profiles student ON student.id = a.student_id
     JOIN public.profiles current_user ON current_user.id = auth.uid()
     WHERE current_user.institution_id = student.institution_id 
     AND a.verification_status = 'verified') as verified_achievements,
     
    (SELECT COUNT(*) FROM public.achievements a
     JOIN public.profiles student ON student.id = a.student_id
     JOIN public.profiles current_user ON current_user.id = auth.uid()
     WHERE current_user.institution_id = student.institution_id 
     AND a.verification_status = 'rejected') as rejected_achievements,
     
    (SELECT COUNT(*) FROM public.queries q
     JOIN public.profiles student ON student.id = q.student_id
     JOIN public.profiles current_user ON current_user.id = auth.uid()
     WHERE current_user.institution_id = student.institution_id 
     AND q.status = 'open') as open_queries;
END;
$$;
