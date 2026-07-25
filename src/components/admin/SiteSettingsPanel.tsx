import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useSiteSettingsContext } from "../../context/SiteSettingsContext";
import { Button } from "../Button";
import { ErrorNotice } from "../ErrorNotice";
import { PageLoader } from "../PageLoader";
import { ImageUploadField } from "./ImageUploadField";
import type { SiteSettings } from "../../types";

const inputClass =
  "rounded-md border border-concrete-200 px-4 py-2.5 text-sm font-normal outline-none focus:border-safety-500";

export function SiteSettingsPanel() {
  const { settings, loading, refresh } = useSiteSettingsContext();
  const [form, setForm] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const current = form ?? settings;

  function update<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setForm({ ...current, [key]: value });
    setSuccess(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);
    const { id, ...payload } = current;
    const { error: saveError } = await supabase.from("site_settings").update(payload).eq("id", 1);
    setSaving(false);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    setSuccess(true);
    refresh();
  }

  if (loading && !form) return <PageLoader />;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-heading text-xl font-semibold text-charcoal-900">Site &amp; Contact Settings</h2>

      {error && <ErrorNotice message={error} />}
      {success && (
        <div className="flex items-center gap-3 rounded-md border border-green-600/30 bg-green-600/10 px-4 py-3 text-sm text-charcoal-900">
          Saved.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <span className="text-sm font-bold uppercase tracking-wide text-charcoal-900">Branding</span>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
              Brand Name
              <input value={current.brand_name} onChange={(e) => update("brand_name", e.target.value)} className={inputClass} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
              Tagline
              <input value={current.tagline} onChange={(e) => update("tagline", e.target.value)} className={inputClass} />
            </label>
          </div>

          <span className="mt-2 border-t border-concrete-200 pt-5 text-sm font-bold uppercase tracking-wide text-charcoal-900">
            Contact Details
          </span>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
              Phone
              <input value={current.phone} onChange={(e) => update("phone", e.target.value)} className={inputClass} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
              Email
              <input value={current.email} onChange={(e) => update("email", e.target.value)} className={inputClass} />
            </label>
          </div>

          <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
            Address
            <input value={current.address} onChange={(e) => update("address", e.target.value)} className={inputClass} />
          </label>

          <span className="mt-2 border-t border-concrete-200 pt-5 text-sm font-bold uppercase tracking-wide text-charcoal-900">
            Social Links
          </span>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
              Facebook URL
              <input
                value={current.facebook_url ?? ""}
                onChange={(e) => update("facebook_url", e.target.value || null)}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
              Instagram URL
              <input
                value={current.instagram_url ?? ""}
                onChange={(e) => update("instagram_url", e.target.value || null)}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
              LinkedIn URL
              <input
                value={current.linkedin_url ?? ""}
                onChange={(e) => update("linkedin_url", e.target.value || null)}
                className={inputClass}
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
            Footer Text
            <textarea
              value={current.footer_text}
              onChange={(e) => update("footer_text", e.target.value)}
              rows={2}
              className={`resize-none ${inputClass}`}
            />
          </label>

          <span className="mt-2 border-t border-concrete-200 pt-5 text-sm font-bold uppercase tracking-wide text-charcoal-900">
            Page Header Images
          </span>
          <p className="-mt-3 text-sm text-steel-600">
            Optional background image for the dark banner at the top of each page. Leave blank to keep the plain
            dark background.
          </p>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <ImageUploadField
              label="Services Page"
              bucket="site-images"
              value={current.services_header_image_url}
              onChange={(url) => update("services_header_image_url", url)}
            />
            <ImageUploadField
              label="Projects Page"
              bucket="site-images"
              value={current.projects_header_image_url}
              onChange={(url) => update("projects_header_image_url", url)}
            />
            <ImageUploadField
              label="Contact Page"
              bucket="site-images"
              value={current.contact_header_image_url}
              onChange={(url) => update("contact_header_image_url", url)}
            />
            <ImageUploadField
              label="Blog Page"
              bucket="site-images"
              value={current.blog_header_image_url}
              onChange={(url) => update("blog_header_image_url", url)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <ImageUploadField label="Logo" bucket="site-images" value={current.logo_url} onChange={(url) => update("logo_url", url)} />

          <Button type="button" onClick={handleSave} disabled={saving} className="disabled:opacity-60">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
