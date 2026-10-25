INSERT INTO storage.buckets (id, name, public)
VALUES ('complaint-photos', 'complaint-photos', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "public_upload_complaint_photos" ON storage.objects;
DROP POLICY IF EXISTS "admin_read_complaint_photos" ON storage.objects;
DROP POLICY IF EXISTS "admin_delete_complaint_photos" ON storage.objects;

DROP POLICY IF EXISTS "anon_upload_complaint_photos" ON storage.objects;
CREATE POLICY "anon_upload_complaint_photos" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'complaint-photos');

DROP POLICY IF EXISTS "anon_read_complaint_photos" ON storage.objects;
CREATE POLICY "anon_read_complaint_photos" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'complaint-photos');

DROP POLICY IF EXISTS "anon_delete_complaint_photos" ON storage.objects;
CREATE POLICY "anon_delete_complaint_photos" ON storage.objects
  FOR DELETE TO anon, authenticated
  USING (bucket_id = 'complaint-photos');
