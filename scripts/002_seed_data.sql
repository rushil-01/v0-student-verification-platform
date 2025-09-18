-- Insert sample institutions
INSERT INTO public.institutions (name, domain) VALUES
('University of Technology', 'utech.edu'),
('State College', 'statecollege.edu'),
('Community Institute', 'ci.edu')
ON CONFLICT (domain) DO NOTHING;

-- Insert comprehensive list of institutions in Telangana
INSERT INTO public.institutions (name, domain) VALUES
-- Central Universities
('University of Hyderabad', 'uohyd.ac.in'),
('Indian Institute of Technology Hyderabad', 'iith.ac.in'),
('Indian Institute of Information Technology Hyderabad', 'iiit.ac.in'),
('National Institute of Technology Warangal', 'nitw.ac.in'),
('Indian School of Business', 'isb.edu'),
('Tata Institute of Social Sciences Hyderabad', 'tiss.edu'),
('National Academy of Legal Studies and Research', 'nalsar.ac.in'),
('English and Foreign Languages University', 'efluniversity.ac.in'),

-- State Universities
('Osmania University', 'osmania.ac.in'),
('Kakatiya University', 'kakatiya.ac.in'),
('Telangana University', 'telanganauniversity.ac.in'),
('Mahatma Gandhi University', 'mguniversity.ac.in'),
('Palamuru University', 'palamuru.ac.in'),
('Satavahana University', 'satavahana.ac.in'),
('Jawaharlal Nehru Technological University Hyderabad', 'jntuh.ac.in'),
('Jawaharlal Nehru Technological University Kakinada', 'jntuk.edu.in'),

-- Deemed Universities
('International Institute of Information Technology Hyderabad', 'iiit.ac.in'),
('Birla Institute of Technology and Science Pilani Hyderabad', 'bits-pilani.ac.in'),
('ICFAI Foundation for Higher Education', 'ifheindia.org'),
('Mahindra University', 'mahindrauniversity.edu.in'),
('Woxsen University', 'woxsen.edu.in'),

-- Medical Colleges
('Osmania Medical College', 'omc.gov.in'),
('Gandhi Medical College', 'gmc.ac.in'),
('Kakatiya Medical College', 'kmc.ac.in'),
('Rajiv Gandhi Institute of Medical Sciences', 'rims.gov.in'),
('Prathima Institute of Medical Sciences', 'prathima.ac.in'),
('Mamata Medical College', 'mamatamedicalcollege.com'),
('Kamineni Institute of Medical Sciences', 'kims.ac.in'),

-- Engineering Colleges
('Chaitanya Bharathi Institute of Technology', 'cbit.ac.in'),
('Vasavi College of Engineering', 'vce.ac.in'),
('CVR College of Engineering', 'cvr.ac.in'),
('Gokaraju Rangaraju Institute of Engineering and Technology', 'griet.ac.in'),
('VNR Vignana Jyothi Institute of Engineering and Technology', 'vnrvjiet.ac.in'),
('Sreenidhi Institute of Science and Technology', 'sreenidhi.edu.in'),
('CMR College of Engineering and Technology', 'cmrcet.ac.in'),
('Malla Reddy College of Engineering and Technology', 'mrcet.ac.in'),
('G Narayanamma Institute of Technology and Science', 'gnits.ac.in'),
('Matrusri Engineering College', 'matrusri.edu.in'),

-- Arts and Science Colleges
('St Francis College for Women', 'sfcollege.ac.in'),
('Loyola Academy', 'loyolaacademy.ac.in'),
('St Josephs College for Women', 'stjosephs.ac.in'),
('Aurora Degree College', 'aurora.ac.in'),
('Nizam College', 'nizamcollege.ac.in'),
('Government City College', 'gcc.ac.in'),
('Kasturba Gandhi Degree College for Women', 'kgdcw.ac.in'),

-- Management Institutes
('Indian School of Business', 'isb.edu'),
('Institute of Public Enterprise', 'ipeindia.org'),
('Hyderabad Business School', 'hbs.edu.in'),
('ICFAI Business School', 'ibsindia.org'),
('Aurora Business School', 'aurora.ac.in'),

-- Pharmacy Colleges
('University College of Pharmaceutical Sciences', 'ucpsc.ac.in'),
('Sultan-ul-Uloom College of Pharmacy', 'suc.edu.in'),
('Vaagdevi Pharmacy College', 'vaagdevi.edu.in'),
('Anurag Pharmacy College', 'anurag.edu.in'),

-- Agriculture Universities
('Professor Jayashankar Telangana State Agricultural University', 'pjtsau.edu.in'),
('Sri Konda Laxman Telangana State Horticultural University', 'skltshu.ac.in'),

-- Veterinary Universities
('PV Narsimha Rao Telangana Veterinary University', 'pvnrtvu.ac.in'),

-- Other Notable Institutions
('Administrative Staff College of India', 'asci.org.in'),
('National Institute of Rural Development and Panchayati Raj', 'nird.org.in'),
('Centre for Cellular and Molecular Biology', 'ccmb.res.in'),
('Indian Institute of Chemical Technology', 'iict.res.in'),
('National Geophysical Research Institute', 'ngri.org.in'),
('Defence Research and Development Laboratory', 'drdl.drdo.in'),
('Sardar Vallabhbhai Patel National Police Academy', 'svpnpa.gov.in')
ON CONFLICT (domain) DO NOTHING;

-- Create trigger function for audit logging
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, new_values)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_values)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers
CREATE TRIGGER achievements_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.achievements
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER queries_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.queries
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
