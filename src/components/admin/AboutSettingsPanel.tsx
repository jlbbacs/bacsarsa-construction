import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { FALLBACK_ABOUT_CONFIG } from "../../data/fallback";
import { Button } from "../Button";
import { ErrorNotice } from "../ErrorNotice";
import { PageLoader } from "../PageLoader";
import { ImageUploadField } from "./ImageUploadField";
import type { AboutConfig, AboutStat } from "../../types";

const inputClass =
  "rounded-md border border-concrete-200 px-4 py-2.5 text-sm font-normal outline-none focus:border-safety-500 focus-visible:ring-2 focus-visible:ring-safety-500 focus-visible:ring-offset-2";

export function AboutSettingsPanel() {
  const [config, setConfig] = useState<AboutConfig>(FALLBACK_ABOUT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("about_config").select("*").eq("id", 1).single();
      setConfig((data as AboutConfig | null) ?? FALLBACK_ABOUT_CONFIG);
      setLoading(false);
    })();
  }, []);

  function update<K extends keyof AboutConfig>(key: K, value: AboutConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setSuccess(false);
  }

  function updateStat(index: number, field: keyof AboutStat, value: string) {
    const stats = config.stats.map((stat, i) => (i === index ? { ...stat, [field]: value } : stat));
    update("stats", stats);
  }

  function addStat() {
    update("stats", [...config.stats, { label: "", value: "" }]);
  }

  function removeStat(index: number) {
    update(
      "stats",
      config.stats.filter((_, i) => i !== index)
    );
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);
    const { id, ...payload } = config;
    const { error: saveError } = await supabase.from("about_config").update(payload).eq("id", 1);
    setSaving(false);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    setSuccess(true);
  }

  if (loading) return <PageLoader />;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-heading text-xl font-semibold text-charcoal-900">About Page</h2>

      {error && <ErrorNotice message={error} />}
      {success && (
        <div className="flex items-center gap-3 rounded-md border border-green-600/30 bg-green-600/10 px-4 py-3 text-sm text-charcoal-900">
          Saved.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
            Heading
            <input value={config.heading} onChange={(e) => update("heading", e.target.value)} className={inputClass} />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
            Subheading
            <input value={config.subheading} onChange={(e) => update("subheading", e.target.value)} className={inputClass} />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
            Body
            <textarea
              value={config.body_markdown}
              onChange={(e) => update("body_markdown", e.target.value)}
              rows={6}
              className={`resize-none ${inputClass}`}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
            Mission Statement
            <textarea
              value={config.mission_statement}
              onChange={(e) => update("mission_statement", e.target.value)}
              rows={2}
              className={`resize-none ${inputClass}`}
            />
          </label>

          <div className="flex flex-col gap-3 rounded-md border border-concrete-200 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold uppercase tracking-wide text-charcoal-900">Stats Row</span>
              <Button type="button" variant="secondary" size="md" onClick={addStat} className="px-3 py-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" />
                Add Stat
              </Button>
            </div>

            {config.stats.length === 0 ? (
              <p className="text-sm text-steel-600">No stats yet -- add one above.</p>
            ) : (
              config.stats.map((stat, i) => (
                <div key={i} className="flex items-end gap-3">
                  <label className="flex flex-1 flex-col gap-1.5 text-xs font-semibold uppercase tracking-wide text-charcoal-900">
                    Value
                    <input
                      value={stat.value}
                      onChange={(e) => updateStat(i, "value", e.target.value)}
                      placeholder="20+"
                      className={inputClass}
                    />
                  </label>
                  <label className="flex flex-[2] flex-col gap-1.5 text-xs font-semibold uppercase tracking-wide text-charcoal-900">
                    Label
                    <input
                      value={stat.label}
                      onChange={(e) => updateStat(i, "label", e.target.value)}
                      placeholder="Years in Business"
                      className={inputClass}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removeStat(i)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-steel-600 hover:bg-red-50 hover:text-red-700"
                    aria-label="Remove stat"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <ImageUploadField label="Image" bucket="site-images" value={config.image_url} onChange={(url) => update("image_url", url)} />

          <Button type="button" onClick={handleSave} disabled={saving} className="disabled:opacity-60">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
