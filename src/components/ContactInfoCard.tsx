import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { formatAddress, formatBusinessHours } from "../lib/address";
import { trackEmailClick, trackPhoneClick } from "../lib/analytics";
import type { SiteSettings } from "../types";

export function ContactInfoCard({ settings }: { settings: SiteSettings }) {
  const hoursRows = formatBusinessHours(settings.business_hours);

  const items = [
    {
      icon: Phone,
      label: "Phone",
      value: settings.phone,
      href: `tel:${settings.phone.replace(/[^\d+]/g, "")}`,
      onClick: trackPhoneClick,
    },
    { icon: Mail, label: "Email", value: settings.email, href: `mailto:${settings.email}`, onClick: trackEmailClick },
    { icon: MapPin, label: "Office", value: formatAddress(settings), href: undefined, onClick: undefined },
  ];

  return (
    <div className="flex flex-col gap-6 rounded-md bg-charcoal-900 p-8 text-white">
      <h3 className="font-heading text-xl font-semibold">Get In Touch</h3>
      <div className="flex flex-col gap-5">
        {items.map(({ icon: Icon, label, value, href, onClick }) => (
          <div key={label} className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-safety-500/15 text-safety-400">
              <Icon className="h-4 w-4" />
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wide text-steel-400">{label}</span>
              {href ? (
                <a href={href} onClick={() => onClick?.()} className="text-sm text-white hover:text-safety-400">
                  {value}
                </a>
              ) : (
                <span className="text-sm text-white">{value}</span>
              )}
            </div>
          </div>
        ))}
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-safety-500/15 text-safety-400">
            <Clock className="h-4 w-4" />
          </span>
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wide text-steel-400">Hours</span>
            {hoursRows.map((row) => (
              <span key={row.label} className="text-sm text-white">
                {row.label}: {row.value}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
