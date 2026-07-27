import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { compressImageToWebP, deleteImage, uploadImage } from "../../lib/storage";

export function ImageUploadField({
  label,
  bucket,
  value,
  onChange,
}: {
  label: string;
  bucket: string;
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const previousUrl = value;
      const compressed = await compressImageToWebP(file);
      const newUrl = await uploadImage(compressed, bucket);
      onChange(newUrl);
      if (previousUrl) void deleteImage(previousUrl, bucket);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    if (value) await deleteImage(value, bucket);
    onChange(null);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-charcoal-900">{label}</span>

      {value ? (
        <div className="relative w-fit">
          <img src={value} alt="" className="h-32 w-56 rounded-md border border-concrete-200 object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-charcoal-900 text-white shadow"
            aria-label="Remove image"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-32 w-56 flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-concrete-200 text-steel-600 transition-colors hover:border-safety-500 hover:text-safety-600 disabled:opacity-60"
        >
          {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
          <span className="text-xs font-semibold uppercase tracking-wide">
            {uploading ? "Uploading..." : "Upload Image"}
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />

      {error && <span className="text-xs font-semibold text-red-700">{error}</span>}
    </div>
  );
}
