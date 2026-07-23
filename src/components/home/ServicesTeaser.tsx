import { ArrowRight } from "lucide-react";
import { Container } from "../Container";
import { SectionHeading } from "../SectionHeading";
import { ServiceCard } from "../ServiceCard";
import { ButtonLink } from "../Button";
import type { Service } from "../../types";

export function ServicesTeaser({ services, loading }: { services: Service[]; loading: boolean }) {
  return (
    <section className="bg-concrete-50 py-16 md:py-24">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading eyebrow="What We Do" title="Services Built Around Your Project" />
          <ButtonLink to="/services" variant="ghost">
            View All Services
            <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>

        {!loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.slice(0, 6).map((service, i) => (
              <ServiceCard key={service.id} service={service} index={i} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
