import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, Calendar } from "lucide-react";
import { SEO } from "../components/SEO";
import { Container } from "../components/Container";
import { PageLoader } from "../components/PageLoader";
import { ButtonLink } from "../components/Button";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { useBlogPost } from "../hooks/useBlogPost";
import { useSiteSettingsContext } from "../context/SiteSettingsContext";
import { buildBlogPosting, buildWebPage } from "../lib/schema";
import { sanitizeHtml } from "../lib/sanitize";
import NotFound from "./NotFound";

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { post, loading } = useBlogPost(slug);
  const { settings } = useSiteSettingsContext();

  if (loading || post === undefined) return <PageLoader />;
  if (post === null) return <NotFound />;

  const description = post.meta_description ?? post.excerpt ?? post.title;

  return (
    <>
      <SEO
        title={post.seo_title?.trim() || post.title}
        description={description}
        image={post.og_image_url ?? post.featured_image_url}
        path={`/blog/${post.slug}`}
        type="article"
        ogTitle={post.og_title}
        ogDescription={post.og_description}
        publishedTime={post.published_at}
        modifiedTime={post.updated_at}
        jsonLd={[
          buildWebPage({ name: post.title, description, path: `/blog/${post.slug}` }),
          buildBlogPosting(post, settings),
        ]}
      />

      <section className="bg-charcoal-900 py-16 sm:py-20">
        <Container className="flex max-w-3xl flex-col gap-4">
          <Breadcrumbs items={[{ name: "Blog", path: "/blog" }, { name: post.title, path: `/blog/${post.slug}` }]} />

          <ButtonLink to="/blog" variant="ghost" className="w-fit !text-steel-200 hover:!text-white">
            <ArrowLeft className="h-4 w-4" />
            Back To Blog
          </ButtonLink>

          {post.blog_categories?.name && (
            <span className="w-fit rounded-sm bg-safety-500/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-safety-400">
              {post.blog_categories.name}
            </span>
          )}

          <h1 className="font-heading text-3xl font-semibold text-white sm:text-4xl">{post.title}</h1>

          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-steel-400">
            <Calendar className="h-3.5 w-3.5 text-safety-400" />
            {formatDate(post.published_at)}
          </span>
        </Container>
      </section>

      {post.featured_image_url && (
        <Container className="max-w-3xl -translate-y-10">
          <img
            src={post.featured_image_url}
            alt={post.title}
            className="aspect-video w-full rounded-md object-cover shadow-lg"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </Container>
      )}

      <section className={`bg-white pb-16 md:pb-24 ${post.featured_image_url ? "pt-0" : "pt-16 md:pt-24"}`}>
        <Container className="max-w-3xl">
          {post.content_html ? (
            <div className="prose-post" dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content_html) }} />
          ) : (
            <div className="prose-post">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content_markdown}</ReactMarkdown>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
