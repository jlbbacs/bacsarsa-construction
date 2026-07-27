import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { FALLBACK_HOME_CONFIG } from "../../data/fallback";
import { Button } from "../Button";
import { ErrorNotice } from "../ErrorNotice";
import { PageLoader } from "../PageLoader";
import { HeroMediaField } from "./HeroMediaField";
import type { HomeConfig } from "../../types";

const inputClass =
  "rounded-md border border-concrete-200 px-4 py-2.5 text-sm font-normal outline-none focus:border-safety-500 focus-visible:ring-2 focus-visible:ring-safety-500 focus-visible:ring-offset-2";

export function HomeSettingsPanel() {
  const [config, setConfig] = useState<HomeConfig>(FALLBACK_HOME_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("home_config").select("*").eq("id", 1).single();
      setConfig(data ? { ...FALLBACK_HOME_CONFIG, ...(data as HomeConfig) } : FALLBACK_HOME_CONFIG);
      setLoading(false);
    })();
  }, []);

  function update<K extends keyof HomeConfig>(key: K, value: HomeConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setSuccess(false);
  }

  function updateBullet(index: number, value: string) {
    update(
      "intro_bullets",
      config.intro_bullets.map((b, i) => (i === index ? value : b))
    );
  }

  function addBullet() {
    update("intro_bullets", [...config.intro_bullets, ""]);
  }

  function removeBullet(index: number) {
    update(
      "intro_bullets",
      config.intro_bullets.filter((_, i) => i !== index)
    );
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);
    const { id, ...payload } = config;
    const { error: saveError } = await supabase.from("home_config").update(payload).eq("id", 1);
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
      <h2 className="font-heading text-xl font-semibold text-charcoal-900">Home Page</h2>

      {error && <ErrorNotice message={error} />}
      {success && (
        <div className="flex items-center gap-3 rounded-md border border-green-600/30 bg-green-600/10 px-4 py-3 text-sm text-charcoal-900">
          Saved.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <span className="text-sm font-bold uppercase tracking-wide text-charcoal-900">Hero Section</span>

          <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
            Hero Heading
            <input value={config.hero_heading} onChange={(e) => update("hero_heading", e.target.value)} className={inputClass} />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
            Hero Subheading
            <textarea
              value={config.hero_subheading}
              onChange={(e) => update("hero_subheading", e.target.value)}
              rows={2}
              className={`resize-none ${inputClass}`}
            />
          </label>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
              Primary CTA Text
              <input value={config.hero_cta_text} onChange={(e) => update("hero_cta_text", e.target.value)} className={inputClass} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
              Primary CTA Link
              <input value={config.hero_cta_link} onChange={(e) => update("hero_cta_link", e.target.value)} className={inputClass} />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
              Secondary CTA Text
              <input
                value={config.secondary_cta_text}
                onChange={(e) => update("secondary_cta_text", e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
              Secondary CTA Link
              <input
                value={config.secondary_cta_link}
                onChange={(e) => update("secondary_cta_link", e.target.value)}
                className={inputClass}
              />
            </label>
          </div>

          <span className="mt-2 border-t border-concrete-200 pt-5 text-sm font-bold uppercase tracking-wide text-charcoal-900">
            Intro Section
          </span>

          <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
            Eyebrow Label <span className="font-normal normal-case text-steel-600">(small text above the heading)</span>
            <input value={config.intro_eyebrow} onChange={(e) => update("intro_eyebrow", e.target.value)} className={inputClass} />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
            Intro Heading
            <input value={config.intro_heading} onChange={(e) => update("intro_heading", e.target.value)} className={inputClass} />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
            Intro Text
            <textarea
              value={config.intro_text}
              onChange={(e) => update("intro_text", e.target.value)}
              rows={4}
              className={`resize-none ${inputClass}`}
            />
          </label>

          <div className="flex flex-col gap-3 rounded-md border border-concrete-200 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold uppercase tracking-wide text-charcoal-900">Checklist Bullets</span>
              <Button type="button" variant="secondary" size="md" onClick={addBullet} className="px-3 py-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" />
                Add Bullet
              </Button>
            </div>

            {config.intro_bullets.length === 0 ? (
              <p className="text-sm text-steel-600">No bullets yet -- add one above.</p>
            ) : (
              config.intro_bullets.map((bullet, i) => (
                <div key={i} className="flex items-center gap-3">
                  <input
                    value={bullet}
                    onChange={(e) => updateBullet(i, e.target.value)}
                    placeholder="Licensed, bonded & fully insured"
                    className={`flex-1 ${inputClass}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeBullet(i)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-steel-600 hover:bg-red-50 hover:text-red-700"
                    aria-label="Remove bullet"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <HeroMediaField
            bucket="site-images"
            imageUrl={config.hero_image_url}
            videoUrl={config.hero_video_url}
            onChange={({ imageUrl, videoUrl }) => {
              setConfig((prev) => ({ ...prev, hero_image_url: imageUrl, hero_video_url: videoUrl }));
              setSuccess(false);
            }}
          />

          <Button type="button" onClick={handleSave} disabled={saving} className="disabled:opacity-60">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
