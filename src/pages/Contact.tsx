import { SEO } from "../components/SEO";
import { Container } from "../components/Container";
import { PageHeader } from "../components/PageHeader";
import { ContactForm } from "../components/ContactForm";
import { ContactInfoCard } from "../components/ContactInfoCard";
import { useSiteSettingsContext } from "../context/SiteSettingsContext";

export default function Contact() {
  const { settings } = useSiteSettingsContext();

  return (
    <>
      <SEO
        title="Contact"
        description="Get a free quote from Meridian Construction Group. Tell us about your commercial, residential, or industrial project."
        path="/contact"
      />

      <PageHeader
        eyebrow="Contact Us"
        title="Let's Talk About Your Project"
        subtitle="Fill out the form below or give us a call -- we typically respond within one business day."
        imageUrl={settings.contact_header_image_url}
      />

      <section className="bg-white py-16 md:py-24">
        <Container className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="rounded-md border border-concrete-200 p-6 sm:p-8 lg:col-span-2">
            <ContactForm />
          </div>
          <ContactInfoCard settings={settings} />
        </Container>
      </section>
    </>
  );
}
