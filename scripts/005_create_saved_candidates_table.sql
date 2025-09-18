-- Create saved candidates table for recruiters
CREATE TABLE IF NOT EXISTS public.saved_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(recruiter_id, student_id)
);

-- Enable Row Level Security
ALTER TABLE public.saved_candidates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved candidates
CREATE POLICY "saved_candidates_select_own" ON public.saved_candidates FOR SELECT USING (
  recruiter_id = auth.uid() AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'recruiter'
  )
);

CREATE POLICY "saved_candidates_insert_recruiter" ON public.saved_candidates FOR INSERT WITH CHECK (
  recruiter_id = auth.uid() AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'recruiter'
  )
);

CREATE POLICY "saved_candidates_update_own" ON public.saved_candidates FOR UPDATE USING (
  recruiter_id = auth.uid() AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'recruiter'
  )
);

CREATE POLICY "saved_candidates_delete_own" ON public.saved_candidates FOR DELETE USING (
  recruiter_id = auth.uid() AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'recruiter'
  )
);
