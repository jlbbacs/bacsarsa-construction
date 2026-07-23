import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SEO } from "../components/SEO";
import { Container } from "../components/Container";
import { PageHeader } from "../components/PageHeader";
import { PageLoader } from "../components/PageLoader";
import { Modal } from "../components/Modal";
import { ButtonLink } from "../components/Button";
import { getServiceIcon } from "../lib/serviceIcons";
import { useServices } from "../hooks/useServices";
import { useServiceCategories } from "../hooks/useServiceCategories";
import { useSiteSettingsContext } from "../context/SiteSettingsContext";
import type { Service } from "../types";

type ActiveCategory = { id: string; name: string; icon_name: string };

const UNCATEGORIZED: ActiveCategory = { id: "__uncategorized__", name: "Other Services", icon_name: "HardHat" };

export default function Services() {
  const { services, loading: servicesLoading } = useServices();
  const { categories, loading: categoriesLoading } = useServiceCategories();
  const { settings } = useSiteSettingsContext();
  const [activeCategory, setActiveCategory] = useState<ActiveCategory | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  function openCategory(category: ActiveCategory) {
    setSelectedService(null);
    setActiveCategory(category);
  }

  function closeModal() {
    setActiveCategory(null);
    setSelectedService(null);
  }

  const loading = servicesLoading || categoriesLoading;

  function servicesFor(category: ActiveCategory): Service[] {
    if (category.id === UNCATEGORIZED.id) return services.filter((s) => !s.category_id);
    return services.filter((s) => s.category_id === category.id);
  }

  const uncategorized = services.filter((s) => !s.category_id);

  return (
    <>
      <SEO
        title="Services"
        description="Commercial construction, residential building, industrial projects, renovations, and project management services."
        path="/services"
      />

      <PageHeader
        eyebrow="What We Do"
        title="Full-Service Construction Services"
        subtitle="From ground-up builds to renovations, we handle every phase of the project under one roof."
        imageUrl={settings.services_header_image_url}
      />

      <section className="bg-concrete-50 py-16 md:py-24">
        <Container>
          {loading ? (
            <PageLoader />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => {
                const Icon = getServiceIcon(category.icon_name);
                const count = servicesFor(category).length;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => openCategory(category)}
                    className="group flex flex-col items-start gap-4 rounded-md border border-concrete-200 bg-white p-8 text-left shadow-sm transition-shadow hover:shadow-md"
                  >
                    <span className="flex h-14 w-14 items-center justify-center rounded-md bg-charcoal-900 text-safety-500 transition-colors group-hover:bg-safety-500 group-hover:text-white">
                      <Icon className="h-7 w-7" />
                    </span>
                    <div className="flex flex-col gap-1">
                      <h3 className="font-heading text-xl font-semibold text-charcoal-900">{category.name}</h3>
                      <p className="text-sm text-steel-600">
                        {count} {count === 1 ? "service" : "services"}
                      </p>
                    </div>
                    <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-safety-600">
                      View Services
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </button>
                );
              })}

              {uncategorized.length > 0 && (
                <button
                  type="button"
                  onClick={() => openCategory(UNCATEGORIZED)}
                  className="group flex flex-col items-start gap-4 rounded-md border border-dashed border-concrete-200 bg-white p-8 text-left shadow-sm transition-shadow hover:shadow-md"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-md bg-charcoal-900 text-safety-500 transition-colors group-hover:bg-safety-500 group-hover:text-white">
                    {(() => {
                      const Icon = getServiceIcon(UNCATEGORIZED.icon_name);
                      return <Icon className="h-7 w-7" />;
                    })()}
                  </span>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-heading text-xl font-semibold text-charcoal-900">{UNCATEGORIZED.name}</h3>
                    <p className="text-sm text-steel-600">
                      {uncategorized.length} {uncategorized.length === 1 ? "service" : "services"}
                    </p>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-safety-600">
                    View Services
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </button>
              )}
            </div>
          )}
        </Container>
      </section>

      <section className="bg-safety-500 py-14">
        <Container className="flex flex-col items-center gap-5 text-center">
          <h2 className="font-heading text-2xl font-semibold text-white sm:text-3xl">
            Don&apos;t See What You Need? Ask Us Anyway.
          </h2>
          <ButtonLink to="/contact" className="bg-charcoal-900 hover:bg-charcoal-800">
            Get a Free Quote
          </ButtonLink>
        </Container>
      </section>

      <Modal
        open={activeCategory !== null}
        onClose={closeModal}
        title={selectedService ? selectedService.title : activeCategory?.name ?? ""}
      >
        {selectedService ? (
          <div className="flex flex-col gap-5">
            <button
              type="button"
              onClick={() => setSelectedService(null)}
              className="flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-wide text-steel-600 hover:text-charcoal-900"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back To {activeCategory?.name}
            </button>

            {selectedService.image_url && (
              <img
                src={selectedService.image_url}
                alt={selectedService.title}
                className="aspect-video w-full rounded-md object-cover"
              />
            )}

            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-charcoal-900 text-safety-500">
                {(() => {
                  const Icon = getServiceIcon(selectedService.icon_name);
                  return <Icon className="h-6 w-6" />;
                })()}
              </span>
              <h4 className="font-heading text-xl font-semibold text-charcoal-900">{selectedService.title}</h4>
            </div>

            <p className="text-base leading-relaxed text-steel-600">{selectedService.description}</p>

            <ButtonLink to="/contact" className="w-fit">
              Get a Quote For This Service
            </ButtonLink>
          </div>
        ) : (
          activeCategory &&
          (servicesFor(activeCategory).length === 0 ? (
            <p className="text-sm text-steel-600">No services added to this category yet.</p>
          ) : (
            <div className="flex flex-col divide-y divide-concrete-200">
              {servicesFor(activeCategory).map((service) => {
                const Icon = getServiceIcon(service.icon_name);
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => setSelectedService(service)}
                    className="flex items-center gap-4 py-4 text-left first:pt-0 last:pb-0"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-charcoal-900 text-safety-500">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="flex flex-1 flex-col gap-1">
                      <h4 className="font-heading text-base font-semibold text-charcoal-900">{service.title}</h4>
                      <p className="text-sm leading-relaxed text-steel-600">{service.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-steel-400" />
                  </button>
                );
              })}
            </div>
          ))
        )}
      </Modal>
    </>
  );
}
