import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
  },
});

export type Complaint = {
  id: string;
  student_name: string;
  student_id: string;
  category: string;
  location_name: string;
  room_no: string;
  problem_type: string;
  description: string;
  image_urls: string[];
  ai_analysis: {
    problem_detected?: string;
    category?: string;
    priority?: string;
    auto_assign_to?: string;
    is_valid_complaint?: boolean;
  };
  priority: string;
  status: string;
  assigned_to: string;
  admin_remark: string;
  created_at: string;
  updated_at: string;
};

export type Location = {
  id: string;
  type: string;
  name: string;
  block: string;
};
