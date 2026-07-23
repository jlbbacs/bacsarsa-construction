import { useRef, useState } from "react";
import { ImagePlus, Loader2, Video, X } from "lucide-react";
import { deleteImage, uploadImage } from "../../lib/storage";

const MAX_VIDEO_MB = 50;

export function HeroMediaField({
  bucket,
  imageUrl,
  videoUrl,
  onChange,
}: {
  bucket: string;
  imageUrl: string | null;
  videoUrl: string | null;
  onChange: (next: { imageUrl: string | null; videoUrl: string | null }) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    const isVideo = file.type.startsWith("video/");
    if (isVideo && file.size > MAX_VIDEO_MB * 1024 * 1024) {
      setError(`Video must be under ${MAX_VIDEO_MB}MB.`);
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const newUrl = await uploadImage(file, bucket);
      const previousImageUrl = imageUrl;
      const previousVideoUrl = videoUrl;
      onChange(isVideo ? { imageUrl: null, videoUrl: newUrl } : { imageUrl: newUrl, videoUrl: null });
      // The hero only ever shows one background, so drop whichever one this upload replaced.
      if (previousImageUrl) void deleteImage(previousImageUrl, bucket);
      if (previousVideoUrl) void deleteImage(previousVideoUrl, bucket);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    if (imageUrl) await deleteImage(imageUrl, bucket);
    if (videoUrl) await deleteImage(videoUrl, bucket);
    onChange({ imageUrl: null, videoUrl: null });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-charcoal-900">Hero Background</span>

      {videoUrl ? (
        <div className="relative w-fit">
          <video
            src={videoUrl}
            className="h-32 w-56 rounded-md border border-concrete-200 object-cover"
            muted
            loop
            autoPlay
            playsInline
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-charcoal-900 text-white shadow"
            aria-label="Remove video"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : imageUrl ? (
        <div className="relative w-fit">
          <img src={imageUrl} alt="" className="h-32 w-56 rounded-md border border-concrete-200 object-cover" />
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
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <span className="flex items-center gap-1">
              <ImagePlus className="h-6 w-6" />
              <Video className="h-6 w-6" />
            </span>
          )}
          <span className="text-xs font-semibold uppercase tracking-wide">
            {uploading ? "Uploading..." : "Upload Image Or Video"}
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />

      <span className="text-xs font-normal normal-case text-steel-600">
        Videos autoplay muted and loop; keep them under {MAX_VIDEO_MB}MB so the page still loads fast.
      </span>

      {error && <span className="text-xs font-semibold text-red-700">{error}</span>}
    </div>
  );
}
