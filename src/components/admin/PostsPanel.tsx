import { useState } from "react";
import { Newspaper, Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { deleteImage } from "../../lib/storage";
import { BLOG_STATUS_BADGE_CLASSES } from "../../lib/blogStatus";
import { Button } from "../Button";
import { PageLoader } from "../PageLoader";
import type { BlogPost } from "../../types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function PostsPanel({
  posts,
  loading,
  onCreate,
  onEdit,
  onDeleted,
}: {
  posts: BlogPost[];
  loading: boolean;
  onCreate: () => void;
  onEdit: (post: BlogPost) => void;
  onDeleted: () => void;
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(post: BlogPost) {
    if (!window.confirm(`Delete "${post.title}"? This can't be undone.`)) return;
    setDeletingId(post.id);
    await supabase.from("blog_posts").delete().eq("id", post.id);
    if (post.featured_image_url) await deleteImage(post.featured_image_url, "blog-images");
    setDeletingId(null);
    onDeleted();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold text-charcoal-900">Blog Posts</h2>
        <Button type="button" onClick={onCreate}>
          <Plus className="h-4 w-4" />
          New Post
        </Button>
      </div>

      {loading ? (
        <PageLoader />
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-concrete-200 py-16 text-center">
          <Newspaper className="h-8 w-8 text-steel-400" />
          <p className="text-sm text-steel-600">No posts yet -- create your first one.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-concrete-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-concrete-200 bg-concrete-50 text-xs font-semibold uppercase tracking-wide text-steel-600">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-concrete-200 last:border-0">
                  <td className="max-w-xs truncate px-4 py-3 font-semibold text-charcoal-900">{post.title}</td>
                  <td className="px-4 py-3 text-steel-600">{post.blog_categories?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-sm px-2 py-1 text-[11px] font-bold uppercase tracking-wide ${BLOG_STATUS_BADGE_CLASSES[post.status]}`}
                    >
                      {post.status}
                    </span>
                    {post.status === "scheduled" && post.scheduled_at && (
                      <span className="ml-2 text-xs text-steel-600">{formatDate(post.scheduled_at)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-steel-600">{formatDate(post.updated_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(post)}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-steel-600 hover:bg-concrete-50 hover:text-charcoal-900"
                        aria-label="Edit post"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(post)}
                        disabled={deletingId === post.id}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-steel-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                        aria-label="Delete post"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
