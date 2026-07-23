import {
  Building2,
  ClipboardCheck,
  Drill,
  Factory,
  Hammer,
  HardHat,
  Home,
  Paintbrush,
  Ruler,
  Truck,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export const SERVICE_ICONS: Record<string, LucideIcon> = {
  Building2,
  ClipboardCheck,
  Drill,
  Factory,
  Hammer,
  HardHat,
  Home,
  Paintbrush,
  Ruler,
  Truck,
  Wrench,
};

export const SERVICE_ICON_NAMES = Object.keys(SERVICE_ICONS);

export function getServiceIcon(name: string): LucideIcon {
  return SERVICE_ICONS[name] ?? HardHat;
}
