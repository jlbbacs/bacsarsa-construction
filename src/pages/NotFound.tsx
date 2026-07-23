import { HardHat } from "lucide-react";
import { SEO } from "../components/SEO";
import { Container } from "../components/Container";
import { ButtonLink } from "../components/Button";

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] items-center bg-concrete-50 py-16">
      <SEO title="Page Not Found" description="The page you're looking for doesn't exist." path="/404" />
      <Container className="flex flex-col items-center gap-5 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-charcoal-900 text-safety-500">
          <HardHat className="h-8 w-8" />
        </span>
        <h1 className="font-heading text-5xl font-bold text-charcoal-900">404</h1>
        <p className="max-w-md text-base text-steel-600">
          Looks like this page hasn&apos;t been built yet. Let&apos;s get you back on solid ground.
        </p>
        <ButtonLink to="/">Back To Home</ButtonLink>
      </Container>
    </section>
  );
}
