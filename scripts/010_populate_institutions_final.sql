-- Create comprehensive script to populate institutions and fix RLS policies

-- First, ensure institutions table has proper RLS policies for anonymous access during registration
DROP POLICY IF EXISTS "Allow anonymous users to read institutions" ON institutions;
DROP POLICY IF EXISTS "Allow authenticated users to read institutions" ON institutions;

-- Allow both anonymous and authenticated users to read institutions
CREATE POLICY "Allow public read access to institutions" 
ON institutions FOR SELECT 
TO anon, authenticated 
USING (true);

-- Clear existing institutions to avoid duplicates
DELETE FROM institutions;

-- Insert comprehensive list of Telangana educational institutions
INSERT INTO institutions (name, domain) VALUES
-- Engineering Colleges
('Indian Institute of Technology Hyderabad', 'iith.ac.in'),
('National Institute of Technology Warangal', 'nitw.ac.in'),
('International Institute of Information Technology Hyderabad', 'iiit.ac.in'),
('Jawaharlal Nehru Technological University Hyderabad', 'jntuh.ac.in'),
('Osmania University', 'osmania.ac.in'),
('University of Hyderabad', 'uohyd.ac.in'),
('Kakatiya University', 'kakatiya.ac.in'),
('Telangana University', 'telanganauniversity.ac.in'),
('Mahatma Gandhi University', 'mguniversity.ac.in'),
('Palamuru University', 'palamuruuniversity.ac.in'),

-- Medical Colleges
('Gandhi Medical College', 'gmc.edu'),
('Osmania Medical College', 'omc.edu'),
('Kakatiya Medical College', 'kmc.edu'),
('Rajiv Gandhi Institute of Medical Sciences', 'rims.edu'),

-- Engineering and Technology Institutes
('Chaitanya Bharathi Institute of Technology', 'cbit.ac.in'),
('Vasavi College of Engineering', 'vce.ac.in'),
('CVR College of Engineering', 'cvr.ac.in'),
('Gokaraju Rangaraju Institute of Engineering and Technology', 'griet.ac.in'),
('Sreenidhi Institute of Science and Technology', 'sreenidhi.edu.in'),
('VNR Vignana Jyothi Institute of Engineering and Technology', 'vnrvjiet.ac.in'),
('Mahindra University', 'mahindrauniversity.edu.in'),
('BITS Pilani Hyderabad Campus', 'hyderabad.bits-pilani.ac.in'),

-- Management and Business Schools
('Indian School of Business', 'isb.edu'),
('ICFAI Business School', 'ibsindia.org'),
('Institute of Public Enterprise', 'ipeindia.org'),

-- Other Colleges
('St. Francis College for Women', 'sfcollege.ac.in'),
('Loyola Academy', 'loyolaacademy.ac.in'),
('Nizam College', 'nizamcollege.ac.in'),
('Government City College', 'gcc.edu');

-- Verify the data was inserted
SELECT COUNT(*) as institution_count FROM institutions;
