import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { buildBreadcrumbList } from "../lib/schema";
import { JsonLd } from "./JsonLd";

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const full: BreadcrumbItem[] = [{ name: "Home", path: "/" }, ...items];

  return (
    <>
      <JsonLd data={buildBreadcrumbList(full)} />
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-semibold text-steel-400">
        {full.map((item, i) => (
          <span key={item.path} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3 w-3 shrink-0" />}
            {i === full.length - 1 ? (
              <span aria-current="page" className="text-white">
                {item.name}
              </span>
            ) : (
              <Link to={item.path} className="hover:text-white">
                {item.name}
              </Link>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}
