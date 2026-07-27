import { Link } from "react-router-dom";
import { m } from "framer-motion";
import { Calendar, Newspaper } from "lucide-react";
import type { BlogPost } from "../types";

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export function BlogCard({ post, index = 0 }: { post: BlogPost; index?: number }) {
  return (
    <m.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={{ y: -4 }}
      className="flex flex-col overflow-hidden rounded-md border border-concrete-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <Link to={`/blog/${post.slug}`} className="flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br from-charcoal-800 to-charcoal-900">
        {post.featured_image_url ? (
          <img
            src={post.featured_image_url}
            alt={post.title}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <Newspaper className="h-10 w-10 text-charcoal-700" />
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-5">
        {post.blog_categories?.name && (
          <span className="w-fit rounded-sm bg-safety-500/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-safety-600">
            {post.blog_categories.name}
          </span>
        )}
        <Link to={`/blog/${post.slug}`}>
          <h3 className="font-heading text-lg font-semibold text-charcoal-900 transition-colors hover:text-safety-600">
            {post.title}
          </h3>
        </Link>
        {post.excerpt && <p className="text-sm leading-relaxed text-steel-600">{post.excerpt}</p>}
        <span className="mt-auto flex items-center gap-1.5 pt-2 text-xs font-semibold uppercase tracking-wide text-steel-600">
          <Calendar className="h-3.5 w-3.5 text-safety-500" />
          {formatDate(post.published_at)}
        </span>
      </div>
    </m.article>
  );
}
