-- Fix institutions access for registration
-- Drop existing policy and create new one that allows anonymous access
DROP POLICY IF EXISTS "institutions_select_all" ON public.institutions;

-- Allow anonymous users to read institutions for registration
CREATE POLICY "institutions_select_public" ON public.institutions FOR SELECT TO anon, authenticated;

-- Also ensure institutions are properly seeded if they're missing
-- This will only insert if the table is empty
INSERT INTO public.institutions (name, domain) 
SELECT * FROM (VALUES
  ('University of Hyderabad', 'uohyd.ac.in'),
  ('Osmania University', 'osmania.ac.in'),
  ('Jawaharlal Nehru Technological University Hyderabad', 'jntuh.ac.in'),
  ('Indian Institute of Technology Hyderabad', 'iith.ac.in'),
  ('International Institute of Information Technology Hyderabad', 'iiit.ac.in'),
  ('Indian School of Business', 'isb.edu'),
  ('Kakatiya University', 'kakatiya.ac.in'),
  ('Telangana University', 'telanganauniversity.ac.in'),
  ('Mahatma Gandhi University', 'mguniversity.ac.in'),
  ('Palamuru University', 'palamuruuniversity.ac.in')
) AS v(name, domain)
WHERE NOT EXISTS (SELECT 1 FROM public.institutions LIMIT 1);
