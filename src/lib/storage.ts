import { supabase } from "./supabase";

const MAX_DIMENSION = 1920;

/**
 * Re-encodes an uploaded image to WebP client-side (resizing to fit within
 * MAX_DIMENSION) before it reaches Supabase Storage, so newly-uploaded assets
 * are already compressed. Leaves GIFs/SVGs untouched (canvas re-encoding
 * would drop GIF animation and rasterize SVGs) and falls back to the
 * original file if anything in the pipeline fails.
 */
export async function compressImageToWebP(file: File, quality = 0.82): Promise<File> {
  if (file.type === "image/gif" || file.type === "image/svg+xml") return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
    if (!blob) return file;

    const newName = `${file.name.replace(/\.[^.]+$/, "")}.webp`;
    return new File([blob], newName, { type: "image/webp" });
  } catch {
    return file;
  }
}

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
