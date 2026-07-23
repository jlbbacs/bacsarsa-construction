import type { BlogPostStatus } from "../types";

export const BLOG_STATUS_BADGE_CLASSES: Record<BlogPostStatus, string> = {
  draft: "bg-amber-400/15 text-amber-600",
  scheduled: "bg-blue-500/10 text-blue-700",
  published: "bg-green-600/10 text-green-700",
  archived: "bg-steel-400/15 text-steel-600",
};
