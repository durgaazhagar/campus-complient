import { supabase } from "./supabase-client";

export async function uploadComplaintPhoto(file: File): Promise<string | null> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error("Could not verify the user before uploading a photo:", userError);
    return null;
  }

  const fileExt = file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "");
  const fileName = `${Date.now()}-${crypto.randomUUID()}${fileExt ? `.${fileExt}` : ""}`;
  const filePath = `${user.id}/complaints/${fileName}`;

  const { error } = await supabase.storage
    .from("complaint-photos")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Upload error:", error);
    return null;
  }

  const { data } = supabase.storage
    .from("complaint-photos")
    .getPublicUrl(filePath);

  return data.publicUrl;
}
