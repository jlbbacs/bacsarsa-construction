import { m } from "framer-motion";
import type { Service } from "../types";
import { getServiceIcon } from "../lib/serviceIcons";

export function ServiceCard({ service, index = 0 }: { service: Service; index?: number }) {
  const Icon = getServiceIcon(service.icon_name);

  return (
    <m.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={{ y: -4 }}
      className="group flex flex-col gap-4 rounded-md border border-concrete-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-md bg-charcoal-900 text-safety-500 transition-colors group-hover:bg-safety-500 group-hover:text-white">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="font-heading text-lg font-semibold text-charcoal-900">{service.title}</h3>
      <p className="text-sm leading-relaxed text-steel-600">{service.description}</p>
    </m.div>
  );
}
