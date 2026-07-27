import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { ensureUniqueBlogSlug, slugify } from "../../lib/slug";
import { Button } from "../Button";
import { ErrorNotice } from "../ErrorNotice";
import { ImageUploadField } from "./ImageUploadField";
import { RichTextEditor } from "./RichTextEditor";
import { TagsField } from "./TagsField";
import { useBlogTags } from "../../hooks/useBlogTags";
import { BLOG_STATUS_BADGE_CLASSES } from "../../lib/blogStatus";
import type { BlogCategory, BlogPost, BlogPostStatus, BlogTag } from "../../types";

const inputClass =
  "w-full rounded-md border border-concrete-200 px-4 py-2.5 text-sm font-normal outline-none focus:border-safety-500 focus-visible:ring-2 focus-visible:ring-safety-500 focus-visible:ring-offset-2";

const STATUS_OPTIONS: { value: BlogPostStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

function wordCount(html: string): number {
  const text = html.replace(/<[^>]*>/g, " ").trim();
  if (!text) return 0;
  return text.split(/\s+/).length;
}

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function PostEditor({
  post,
  categories,
  onSaved,
  onCancel,
}: {
  post: BlogPost | null;
  categories: BlogCategory[];
  onSaved: () => void;
  onCancel: () => void;
}) {
  const { tags: allTags, refresh: refreshTags } = useBlogTags();

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [contentHtml, setContentHtml] = useState(post?.content_html ?? "");
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(post?.featured_image_url ?? null);
  const [categoryId, setCategoryId] = useState<string>(post?.category_id ?? "");
  const [selectedTags, setSelectedTags] = useState<BlogTag[]>(post?.blog_post_tags?.map((pt) => pt.blog_tags) ?? []);
  const [status, setStatus] = useState<BlogPostStatus>(post?.status ?? "draft");
  const [scheduledAt, setScheduledAt] = useState(toDatetimeLocal(post?.scheduled_at ?? null));
  const [metaDescription, setMetaDescription] = useState(post?.meta_description ?? "");
  const [seoTitle, setSeoTitle] = useState(post?.seo_title ?? "");
  const [focusKeyword, setFocusKeyword] = useState(post?.focus_keyword ?? "");
  const [ogTitle, setOgTitle] = useState(post?.og_title ?? "");
  const [ogDescription, setOgDescription] = useState(post?.og_description ?? "");
  const [ogImageUrl, setOgImageUrl] = useState<string | null>(post?.og_image_url ?? null);

  const [saving, setSaving] = useState(false);
  const [autosaving, setAutosaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Tracks the persisted row this editor session is writing to, since a
  // brand-new post gets its id from the first autosave rather than from props.
  const savedPostRef = useRef<{ id: string; published_at: string | null } | null>(
    post ? { id: post.id, published_at: post.published_at } : null
  );

  async function syncTags(postId: string) {
    await supabase.from("blog_post_tags").delete().eq("post_id", postId);
    if (selectedTags.length > 0) {
      await supabase.from("blog_post_tags").insert(selectedTags.map((tag) => ({ post_id: postId, tag_id: tag.id })));
    }
  }

  async function persist(targetStatus: BlogPostStatus, { silent }: { silent: boolean }): Promise<boolean> {
    if (!title.trim()) {
      if (!silent) setError("Title is required.");
      return false;
    }
    if (targetStatus === "scheduled" && !scheduledAt) {
      if (!silent) setError("Pick a date and time to schedule this post for.");
      return false;
    }

    const existing = savedPostRef.current;
    const baseSlug = slugify(slug.trim() || title);
    const uniqueSlug = await ensureUniqueBlogSlug(baseSlug, existing?.id);
    const now = new Date().toISOString();

    const payload = {
      title: title.trim(),
      slug: uniqueSlug,
      excerpt: excerpt.trim() || null,
      content_html: contentHtml,
      featured_image_url: featuredImageUrl,
      category_id: categoryId || null,
      status: targetStatus,
      meta_description: metaDescription.trim() || null,
      seo_title: seoTitle.trim() || null,
      focus_keyword: focusKeyword.trim() || null,
      og_title: ogTitle.trim() || null,
      og_description: ogDescription.trim() || null,
      og_image_url: ogImageUrl,
      scheduled_at: targetStatus === "scheduled" && scheduledAt ? new Date(scheduledAt).toISOString() : null,
      published_at: targetStatus === "published" ? (existing?.published_at ?? now) : (existing?.published_at ?? null),
      updated_at: now,
    };

    const { data, error: saveError } = existing
      ? await supabase.from("blog_posts").update(payload).eq("id", existing.id).select("id, published_at").single()
      : await supabase.from("blog_posts").insert(payload).select("id, published_at").single();

    if (saveError || !data) {
      if (!silent) setError(saveError?.message ?? "Save failed.");
      return false;
    }

    savedPostRef.current = { id: data.id as string, published_at: data.published_at as string | null };
    await syncTags(data.id as string);
    setLastSavedAt(new Date());
    return true;
  }

  async function handleSave(targetStatus: BlogPostStatus) {
    setSaving(true);
    setError(null);
    const ok = await persist(targetStatus, { silent: false });
    setSaving(false);
    if (ok) {
      setStatus(targetStatus);
      onSaved();
    }
  }

  // Autosave every 30s once there's a title to save; reuses the current
  // status selection rather than forcing draft, so it never fights the
  // user's own publish/schedule choice. The interval is set up once and
  // reads from refs so it always sees the latest field values instead of
  // the stale closure from whichever render started it.
  const latestRef = useRef({ persist, status, title, saving });
  useEffect(() => {
    latestRef.current = { persist, status, title, saving };
  });

  useEffect(() => {
    const interval = setInterval(async () => {
      const { persist, status, title, saving } = latestRef.current;
      if (!title.trim() || saving) return;
      setAutosaving(true);
      await persist(status, { silent: true });
      setAutosaving(false);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const words = wordCount(contentHtml);
  const readingMinutes = Math.max(1, Math.round(words / 200));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-steel-600 hover:text-charcoal-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back To Posts
        </button>
        <div className="flex items-center gap-3">
          {autosaving ? (
            <span className="text-xs font-semibold uppercase tracking-wide text-steel-500">Saving...</span>
          ) : (
            lastSavedAt && (
              <span className="text-xs font-semibold uppercase tracking-wide text-steel-500">
                Saved {lastSavedAt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
              </span>
            )
          )}
          <span className={`rounded-sm px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${BLOG_STATUS_BADGE_CLASSES[status]}`}>
            {status}
          </span>
        </div>
      </div>

      {error && <ErrorNotice message={error} />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
              placeholder="Post title"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
            URL Slug
            <input
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
              placeholder={slugTouched ? "post-url-slug" : slugify(title) || "auto-generated-from-title"}
              className={`${inputClass} font-mono text-xs`}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
            Excerpt
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              className={`resize-none ${inputClass}`}
              placeholder="Short summary shown on the blog listing page"
            />
          </label>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-charcoal-900">Content</span>
              <span className="text-xs font-semibold uppercase tracking-wide text-steel-500">
                {words} words &middot; {readingMinutes} min read
              </span>
            </div>
            <RichTextEditor content={contentHtml} onChange={setContentHtml} />
          </div>

          <div className="flex flex-col gap-5 rounded-md border border-concrete-200 p-4">
            <span className="text-sm font-bold uppercase tracking-wide text-charcoal-900">SEO</span>

            <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
              SEO Title <span className="font-normal normal-case text-steel-600">(defaults to the post title)</span>
              <input
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className={inputClass}
                placeholder={title || "SEO title"}
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
              Meta Description <span className="font-normal normal-case text-steel-600">(for search engines)</span>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={2}
                className={`resize-none ${inputClass}`}
                placeholder="Shown in Google search results"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
              Focus Keyword
              <input
                value={focusKeyword}
                onChange={(e) => setFocusKeyword(e.target.value)}
                className={inputClass}
                placeholder="e.g. general contractor estimate"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
              OG Title <span className="font-normal normal-case text-steel-600">(social share title)</span>
              <input
                value={ogTitle}
                onChange={(e) => setOgTitle(e.target.value)}
                className={inputClass}
                placeholder={title || "Social share title"}
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
              OG Description
              <textarea
                value={ogDescription}
                onChange={(e) => setOgDescription(e.target.value)}
                rows={2}
                className={`resize-none ${inputClass}`}
                placeholder="Shown when this post is shared on social media"
              />
            </label>

            <ImageUploadField label="OG Image" bucket="blog-images" value={ogImageUrl} onChange={setOgImageUrl} />
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <ImageUploadField label="Featured Image" bucket="blog-images" value={featuredImageUrl} onChange={setFeaturedImageUrl} />

          <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
            Category
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </label>

          <TagsField allTags={allTags} selected={selectedTags} onChange={setSelectedTags} onTagCreated={refreshTags} />

          <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
            Status
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as BlogPostStatus)}
              className={inputClass}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          {status === "scheduled" && (
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
              Scheduled For
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className={inputClass}
              />
              <span className="text-xs font-normal normal-case text-steel-600">
                This post becomes publicly visible once the scheduled time passes -- it still shows as "Scheduled" in
                this list until you open and save it again.
              </span>
            </label>
          )}

          <div className="flex flex-col gap-3 rounded-md border border-concrete-200 bg-concrete-50 p-4">
            <Button type="button" onClick={() => handleSave(status)} disabled={saving} className="disabled:opacity-60">
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleSave("draft")}
              disabled={saving}
              className="disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save As Draft"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
