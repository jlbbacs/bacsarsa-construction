import { useState } from "react";
import { HardHat, Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { deleteImage } from "../../lib/storage";
import { getServiceIcon } from "../../lib/serviceIcons";
import { useAdminServices } from "../../hooks/useAdminServices";
import { useServiceCategories } from "../../hooks/useServiceCategories";
import { Button } from "../Button";
import { PageLoader } from "../PageLoader";
import { ServiceEditor } from "./ServiceEditor";
import { ServiceCategoriesPanel } from "./ServiceCategoriesPanel";
import type { Service } from "../../types";

type View = { mode: "list" } | { mode: "editor"; service: Service | null };

export function ServicesPanel() {
  const { services, loading, refresh } = useAdminServices();
  const { categories, loading: categoriesLoading, refresh: refreshCategories } = useServiceCategories();
  const [view, setView] = useState<View>({ mode: "list" });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(service: Service) {
    if (!window.confirm(`Delete "${service.title}"?`)) return;
    setDeletingId(service.id);
    await supabase.from("services").delete().eq("id", service.id);
    if (service.image_url) await deleteImage(service.image_url, "site-images");
    setDeletingId(null);
    refresh();
  }

  if (view.mode === "editor") {
    return (
      <ServiceEditor
        service={view.service}
        onCancel={() => setView({ mode: "list" })}
        onSaved={() => {
          refresh();
          setView({ mode: "list" });
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold text-charcoal-900">Services</h2>
        <Button type="button" onClick={() => setView({ mode: "editor", service: null })}>
          <Plus className="h-4 w-4" />
          New Service
        </Button>
      </div>

      <ServiceCategoriesPanel categories={categories} loading={categoriesLoading} onRefresh={refreshCategories} />

      {loading ? (
        <PageLoader />
      ) : services.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-concrete-200 py-16 text-center">
          <HardHat className="h-8 w-8 text-steel-400" />
          <p className="text-sm text-steel-600">No services yet -- add your first one.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-concrete-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-concrete-200 bg-concrete-50 text-xs font-semibold uppercase tracking-wide text-steel-600">
              <tr>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => {
                const Icon = getServiceIcon(service.icon_name);
                return (
                  <tr key={service.id} className="border-b border-concrete-200 last:border-0">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2.5 font-semibold text-charcoal-900">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-safety-500 text-white">
                          <Icon className="h-4 w-4" />
                        </span>
                        {service.title}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-steel-600">{service.service_categories?.name ?? "Uncategorized"}</td>
                    <td className="max-w-sm truncate px-4 py-3 text-steel-600">{service.description}</td>
                    <td className="px-4 py-3 text-steel-600">{service.display_order}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setView({ mode: "editor", service })}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-steel-600 hover:bg-concrete-50 hover:text-charcoal-900"
                          aria-label="Edit service"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(service)}
                          disabled={deletingId === service.id}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-steel-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                          aria-label="Delete service"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
