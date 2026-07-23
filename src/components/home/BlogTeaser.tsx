import { ArrowRight } from "lucide-react";
import { Container } from "../Container";
import { SectionHeading } from "../SectionHeading";
import { BlogCard } from "../BlogCard";
import { ButtonLink } from "../Button";
import type { BlogPost } from "../../types";

export function BlogTeaser({ posts, loading }: { posts: BlogPost[]; loading: boolean }) {
  if (!loading && posts.length === 0) return null;

  return (
    <section className="bg-concrete-50 py-16 md:py-24">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading eyebrow="From The Blog" title="Latest News & Insights" />
          <ButtonLink to="/blog" variant="ghost">
            View All Posts
            <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>

        {!loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.slice(0, 3).map((post, i) => (
              <BlogCard key={post.id} post={post} index={i} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
