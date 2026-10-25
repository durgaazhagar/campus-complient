DROP POLICY IF EXISTS "public_insert_complaints" ON complaints;
DROP POLICY IF EXISTS "student_select_own_complaints" ON complaints;
DROP POLICY IF EXISTS "student_insert_own_complaints" ON complaints;

CREATE POLICY "student_select_own_complaints" ON complaints
  FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()::text
    AND COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', 'student') = 'student'
  );

CREATE POLICY "student_insert_own_complaints" ON complaints
  FOR INSERT TO authenticated
  WITH CHECK (
    student_id = auth.uid()::text
    AND COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', 'student') = 'student'
  );

DROP POLICY IF EXISTS "anon_upload_complaint_photos" ON storage.objects;
CREATE POLICY "student_upload_own_complaint_photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'complaint-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "anon_delete_complaint_photos" ON storage.objects;
