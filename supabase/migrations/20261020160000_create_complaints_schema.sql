CREATE TABLE IF NOT EXISTS complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL DEFAULT 'Anonymous',
  category text NOT NULL,
  location_name text NOT NULL,
  room_no text DEFAULT '',
  problem_type text NOT NULL,
  description text DEFAULT '',
  image_urls text[] DEFAULT '{}',
  ai_analysis jsonb DEFAULT '{}',
  priority text NOT NULL DEFAULT 'Medium',
  status text NOT NULL DEFAULT 'Pending',
  assigned_to text DEFAULT '',
  admin_remark text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_insert_complaints" ON complaints;
CREATE POLICY "public_insert_complaints" ON complaints
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "admin_select_complaints" ON complaints;
CREATE POLICY "admin_select_complaints" ON complaints
  FOR SELECT TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "admin_update_complaints" ON complaints;
CREATE POLICY "admin_update_complaints" ON complaints
  FOR UPDATE TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "admin_delete_complaints" ON complaints;
CREATE POLICY "admin_delete_complaints" ON complaints
  FOR DELETE TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  name text NOT NULL,
  block text NOT NULL DEFAULT 'Main Block'
);

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_locations" ON locations;
CREATE POLICY "public_select_locations" ON locations
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "admin_insert_locations" ON locations;
CREATE POLICY "admin_insert_locations" ON locations
  FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "admin_update_locations" ON locations;
CREATE POLICY "admin_update_locations" ON locations
  FOR UPDATE TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "admin_delete_locations" ON locations;
CREATE POLICY "admin_delete_locations" ON locations
  FOR DELETE TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_locations_type ON locations(type);

INSERT INTO locations (type, name, block) VALUES
  ('classroom', 'Block A - 1st Floor', 'Block A'),
  ('classroom', 'Block A - 2nd Floor', 'Block A'),
  ('classroom', 'Block B - 1st Floor', 'Block B'),
  ('classroom', 'Block B - 2nd Floor', 'Block B'),
  ('bathroom', 'Block A - Ground Floor Bathroom', 'Block A'),
  ('bathroom', 'Block A - 1st Floor Bathroom', 'Block A'),
  ('bathroom', 'Block B - Ground Floor Bathroom', 'Block B'),
  ('lab', 'Computer Lab 1', 'Block A'),
  ('lab', 'Computer Lab 2', 'Block A'),
  ('lab', 'Electronics Lab', 'Block B'),
  ('library', 'Main Library - 1st Floor', 'Library Block'),
  ('library', 'Reference Section', 'Library Block'),
  ('playground', 'Main Playground', 'Sports Block'),
  ('playground', 'Basketball Court', 'Sports Block'),
  ('canteen', 'Main Canteen', 'Canteen Block')
ON CONFLICT DO NOTHING;

INSERT INTO complaints (student_name, category, location_name, room_no, problem_type, description, image_urls, ai_analysis, priority, status, assigned_to, admin_remark, created_at) VALUES
  ('Arun Kumar', 'classroom', 'Block A - 1st Floor', 'A-101', 'Fan Not Working', 'Fan in classroom A-101 is not working for 3 days. Students feeling very hot during classes.', '{}', '{"problem_detected":"Ceiling fan not rotating, possible motor failure","category":"electrical","priority":"Medium","auto_assign_to":"Electrician","is_valid_complaint":true}', 'Medium', 'Pending', '', '', now() - interval '2 hours'),
  ('Priya S', 'bathroom', 'Block A - Ground Floor Bathroom', 'GF', 'No Water', 'No water in the bathroom tap since morning. Very difficult for students.', '{}', '{"problem_detected":"Water supply disconnected, tap dry","category":"plumbing","priority":"High","auto_assign_to":"Plumber","is_valid_complaint":true}', 'High', 'In Progress', 'Plumber - Ramesh', 'Plumber assigned, will fix by today evening', now() - interval '5 hours'),
  ('Karthik R', 'lab', 'Computer Lab 1', 'CL-1', 'PC Not Working', 'PC number 5 and 8 not booting. Shows blue screen error.', '{}', '{"problem_detected":"Computer hardware failure, blue screen indicates RAM or disk issue","category":"it","priority":"Medium","auto_assign_to":"IT Support","is_valid_complaint":true}', 'Medium', 'Pending', '', '', now() - interval '1 hour'),
  ('Deepa M', 'library', 'Main Library - 1st Floor', 'LIB-1', 'AC Not Working', 'Library AC not working. Very hot inside, cant study properly.', '{}', '{"problem_detected":"Air conditioner not cooling, possible gas refill needed","category":"electrical","priority":"Medium","auto_assign_to":"Electrician","is_valid_complaint":true}', 'Medium', 'Pending', '', '', now() - interval '3 hours'),
  ('Vignesh P', 'playground', 'Basketball Court', 'BC-1', 'Equipment Damaged', 'Basketball hoop broken, net missing. Cant play properly.', '{}', '{"problem_detected":"Basketball hoop structure damaged, net missing","category":"other","priority":"Low","auto_assign_to":"Maintenance","is_valid_complaint":true}', 'Low', 'Pending', '', '', now() - interval '1 day'),
  ('Saranya K', 'classroom', 'Block B - 2nd Floor', 'B-201', 'Light Not Working', 'Two tube lights not working in classroom B-201. Very dark during evening classes.', '{}', '{"problem_detected":"Tube light failure, likely starter or tube needs replacement","category":"electrical","priority":"Medium","auto_assign_to":"Electrician","is_valid_complaint":true}', 'Medium', 'In Progress', 'Electrician - Suresh', 'Electrician notified, parts ordered', now() - interval '8 hours'),
  ('Murugan T', 'bathroom', 'Block B - Ground Floor Bathroom', 'GF', 'Dirty', 'Bathroom very dirty and smelling bad. Not cleaned for 2 days.', '{}', '{"problem_detected":"Bathroom unclean, hygiene issue, needs immediate cleaning","category":"cleaning","priority":"High","auto_assign_to":"Cleaning Staff","is_valid_complaint":true}', 'High', 'Pending', '', '', now() - interval '30 minutes'),
  ('Lakshmi N', 'canteen', 'Main Canteen', 'CT-1', 'Food Quality', 'Canteen food quality very bad today. Many students complained about stale food.', '{}', '{"problem_detected":"Food quality issue, possible stale food served","category":"other","priority":"High","auto_assign_to":"Canteen Manager","is_valid_complaint":true}', 'High', 'Pending', '', '', now() - interval '4 hours'),
  ('Rajesh V', 'lab', 'Electronics Lab', 'EL-1', 'Equipment Issue', 'Oscilloscope not working properly. Showing wrong readings. 3 students could not complete practical.', '{}', '{"problem_detected":"Lab equipment malfunction, oscilloscope calibration issue","category":"it","priority":"Medium","auto_assign_to":"IT Support","is_valid_complaint":true}', 'Medium', 'Pending', '', '', now() - interval '6 hours'),
  ('Anitha R', 'classroom', 'Block A - 2nd Floor', 'A-202', 'Projector Not Working', 'Projector in A-202 not showing any display. Teacher couldnt present slides today.', '{}', '{"problem_detected":"Projector display failure, possible lamp or cable issue","category":"electrical","priority":"Medium","auto_assign_to":"Electrician","is_valid_complaint":true}', 'Medium', 'Pending', '', '', now() - interval '10 hours'),
  ('Suresh K', 'lab', 'Computer Lab 2', 'CL-2', 'Internet Not Working', 'Internet very slow in lab 2. Cant access online resources for project work.', '{}', '{"problem_detected":"Network connectivity issue, slow internet speed","category":"it","priority":"Low","auto_assign_to":"IT Support","is_valid_complaint":true}', 'Low', 'Pending', '', '', now() - interval '2 days'),
  ('Bhavana S', 'library', 'Reference Section', 'LIB-2', 'Noisy', 'Reference section very noisy. Students talking loudly, cant concentrate on studies.', '{}', '{"problem_detected":"Noise disturbance in quiet zone, discipline issue","category":"other","priority":"Low","auto_assign_to":"Librarian","is_valid_complaint":true}', 'Low', 'Pending', '', '', now() - interval '12 hours')
ON CONFLICT DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('complaint-photos', 'complaint-photos', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public_upload_complaint_photos" ON storage.objects;
CREATE POLICY "public_upload_complaint_photos" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'complaint-photos');

DROP POLICY IF EXISTS "admin_read_complaint_photos" ON storage.objects;
CREATE POLICY "admin_read_complaint_photos" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'complaint-photos'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

DROP POLICY IF EXISTS "admin_update_complaint_photos" ON storage.objects;
CREATE POLICY "admin_update_complaint_photos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'complaint-photos'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    bucket_id = 'complaint-photos'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

DROP POLICY IF EXISTS "admin_delete_complaint_photos" ON storage.objects;
CREATE POLICY "admin_delete_complaint_photos" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'complaint-photos'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
