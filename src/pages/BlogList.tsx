import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Newspaper } from "lucide-react";
import { SEO } from "../components/SEO";
import { Container } from "../components/Container";
import { PageHeader } from "../components/PageHeader";
import { BlogCard } from "../components/BlogCard";
import { BlogCategoryFilter } from "../components/BlogCategoryFilter";
import { BlogSearchBar } from "../components/BlogSearchBar";
import { PageLoader } from "../components/PageLoader";
import { useBlogPosts } from "../hooks/useBlogPosts";
import { useBlogCategories } from "../hooks/useBlogCategories";
import { useSiteSettingsContext } from "../context/SiteSettingsContext";
import { buildCollectionPage } from "../lib/schema";

export default function BlogList() {
  const { categories } = useBlogCategories();
  const { settings } = useSiteSettingsContext();
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const { posts, totalCount, loading, pageSize } = useBlogPosts({ categoryId, search, page });

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  useEffect(() => {
    setPage(0);
  }, [categoryId, search]);

  return (
    <>
      <SEO
        title="Blog"
        description="News, project spotlights, and industry insights from our construction team."
        path="/blog"
        jsonLd={buildCollectionPage({
          name: `Blog | ${settings.brand_name}`,
          description: "News, project spotlights, and industry insights from our construction team.",
          path: "/blog",
        })}
      />

      <PageHeader
        eyebrow="Our Blog"
        title="News & Insights"
        subtitle="Project spotlights, safety guidance, and company news from our team."
        imageUrl={settings.blog_header_image_url}
        breadcrumbs={[{ name: "Blog", path: "/blog" }]}
      />

      <section className="bg-concrete-50 py-16 md:py-24">
        <Container className="flex flex-col gap-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <BlogCategoryFilter categories={categories} activeId={categoryId} onChange={setCategoryId} />
            <BlogSearchBar value={search} onChange={setSearch} />
          </div>

          {loading ? (
            <PageLoader />
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Newspaper className="h-10 w-10 text-steel-400" />
              <p className="text-sm text-steel-600">No articles match your search yet.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post, i) => (
                  <BlogCard key={post.id} post={post} index={i} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-concrete-200 bg-white text-charcoal-900 transition-colors hover:bg-concrete-100 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-xs font-semibold uppercase tracking-wide text-steel-600">
                    Page {page + 1} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-concrete-200 bg-white text-charcoal-900 transition-colors hover:bg-concrete-100 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </Container>
      </section>
    </>
  );
}
