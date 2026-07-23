import { Clock, Mail, MapPin, Phone } from "lucide-react";
import type { SiteSettings } from "../types";

export function ContactInfoCard({ settings }: { settings: SiteSettings }) {
  const items = [
    { icon: Phone, label: "Phone", value: settings.phone, href: `tel:${settings.phone.replace(/[^\d+]/g, "")}` },
    { icon: Mail, label: "Email", value: settings.email, href: `mailto:${settings.email}` },
    { icon: MapPin, label: "Office", value: settings.address, href: undefined },
    { icon: Clock, label: "Hours", value: "Mon - Fri: 7:00 AM - 5:00 PM", href: undefined },
  ];

  return (
    <div className="flex flex-col gap-6 rounded-md bg-charcoal-900 p-8 text-white">
      <h3 className="font-heading text-xl font-semibold">Get In Touch</h3>
      <div className="flex flex-col gap-5">
        {items.map(({ icon: Icon, label, value, href }) => (
          <div key={label} className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-safety-500/15 text-safety-400">
              <Icon className="h-4 w-4" />
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wide text-steel-400">{label}</span>
              {href ? (
                <a href={href} className="text-sm text-white hover:text-safety-400">
                  {value}
                </a>
              ) : (
                <span className="text-sm text-white">{value}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
