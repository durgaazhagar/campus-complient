import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.",
  );
}

const cookieStorage = {
  getItem(key: string) {
    if (typeof document === "undefined") return null;

    const cookieValue = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith(`${key}=`));

    return cookieValue ? decodeURIComponent(cookieValue.split("=").slice(1).join("=")) : null;
  },
  setItem(key: string, value: string) {
    if (typeof document === "undefined") return;

    const isSecure = window.location.protocol === "https:";
    document.cookie = `${key}=${encodeURIComponent(value)}; path=/; SameSite=Lax${isSecure ? "; secure" : ""}`;
  },
  removeItem(key: string) {
    if (typeof document === "undefined") return;

    document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: cookieStorage,
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
