-- Populate institutions table with Telangana educational institutions
INSERT INTO institutions (id, name, domain) VALUES
  (gen_random_uuid(), 'University of Hyderabad', 'uohyd.ac.in'),
  (gen_random_uuid(), 'Osmania University', 'osmania.ac.in'),
  (gen_random_uuid(), 'Jawaharlal Nehru Technological University Hyderabad', 'jntuh.ac.in'),
  (gen_random_uuid(), 'Kakatiya University', 'kakatiya.ac.in'),
  (gen_random_uuid(), 'Telangana University', 'telanganauniversity.ac.in'),
  (gen_random_uuid(), 'Mahatma Gandhi University', 'mguniversity.ac.in'),
  (gen_random_uuid(), 'Palamuru University', 'palamuruuniversity.ac.in'),
  (gen_random_uuid(), 'Satavahana University', 'satavahana.ac.in'),
  (gen_random_uuid(), 'International Institute of Information Technology Hyderabad', 'iiit.ac.in'),
  (gen_random_uuid(), 'Indian Institute of Technology Hyderabad', 'iith.ac.in'),
  (gen_random_uuid(), 'National Institute of Technology Warangal', 'nitw.ac.in'),
  (gen_random_uuid(), 'Indian School of Business', 'isb.edu'),
  (gen_random_uuid(), 'Hyderabad Central University', 'uohyd.ernet.in'),
  (gen_random_uuid(), 'Nizam College', 'nizamcollege.ac.in'),
  (gen_random_uuid(), 'Government City College', 'gcc.edu'),
  (gen_random_uuid(), 'St. Francis College for Women', 'sfcollege.ac.in'),
  (gen_random_uuid(), 'Loyola Academy', 'loyolaacademy.ac.in'),
  (gen_random_uuid(), 'CBIT', 'cbit.ac.in'),
  (gen_random_uuid(), 'BITS Pilani Hyderabad Campus', 'hyderabad.bits-pilani.ac.in'),
  (gen_random_uuid(), 'Vasavi College of Engineering', 'vce.ac.in'),
  (gen_random_uuid(), 'CVR College of Engineering', 'cvr.ac.in'),
  (gen_random_uuid(), 'Gokaraju Rangaraju Institute of Engineering and Technology', 'griet.ac.in'),
  (gen_random_uuid(), 'Mahindra University', 'mahindrauniversity.edu.in'),
  (gen_random_uuid(), 'ICFAI Foundation for Higher Education', 'ifheindia.org'),
  (gen_random_uuid(), 'Woxsen University', 'woxsen.edu.in')
ON CONFLICT (name) DO NOTHING;

-- Verify the data was inserted
SELECT COUNT(*) as institution_count FROM institutions;
