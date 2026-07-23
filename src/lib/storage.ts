import { supabase } from "./supabase";

export async function uploadImage(file: File, bucket: string): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file);
  if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return publicUrl;
}

/**
 * Deletes the storage object behind a public URL previously returned by
 * uploadImage(). Safe to call with null/empty/external URLs -- it's a no-op
 * unless the URL actually looks like one of our own bucket public URLs.
 */
export async function deleteImage(publicUrl: string | null | undefined, bucket: string): Promise<void> {
  if (!publicUrl) return;
  const marker = `/storage/v1/object/public/${bucket}/`;
  const markerIndex = publicUrl.indexOf(marker);
  if (markerIndex === -1) return;

  const path = publicUrl.slice(markerIndex + marker.length);
  if (!path) return;

  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) console.warn(`Failed to delete storage object "${path}" from "${bucket}":`, error.message);
}
