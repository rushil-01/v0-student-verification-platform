-- Add institution_ids column to support multiple institutions for admins
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS institution_ids JSONB;

-- Update existing admin profiles to use the new structure
UPDATE profiles 
SET institution_ids = CASE 
  WHEN role = 'admin' AND institution_id IS NOT NULL 
  THEN jsonb_build_array(institution_id::text)
  ELSE NULL 
END
WHERE role = 'admin';

-- Add index for better performance on institution_ids queries
CREATE INDEX IF NOT EXISTS idx_profiles_institution_ids ON profiles USING GIN (institution_ids);

-- Update RLS policies to handle multiple institutions for admins
DROP POLICY IF EXISTS "Admins can view profiles from their institution" ON profiles;

CREATE POLICY "Admins can view profiles from their institutions" ON profiles
FOR SELECT USING (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE role = 'admin' 
    AND (
      institution_id = profiles.institution_id 
      OR institution_ids ? profiles.institution_id::text
      OR (institution_ids IS NOT NULL AND profiles.institution_id::text = ANY(SELECT jsonb_array_elements_text(institution_ids)))
    )
  )
  OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'super_admin')
);
