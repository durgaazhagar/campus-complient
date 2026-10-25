ALTER TABLE complaints
  ADD COLUMN IF NOT EXISTS student_id text NOT NULL DEFAULT 'anonymous';

CREATE INDEX IF NOT EXISTS idx_complaints_student_id
  ON complaints(student_id);
