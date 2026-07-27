import { BUSINESS_DAYS, BUSINESS_DAY_LABELS } from "../../lib/address";
import type { BusinessHours } from "../../types";

const inputClass =
  "rounded-md border border-concrete-200 px-3 py-2 text-sm font-normal outline-none focus:border-safety-500 focus-visible:ring-2 focus-visible:ring-safety-500 focus-visible:ring-offset-2";

export function BusinessHoursField({
  value,
  onChange,
}: {
  value: BusinessHours;
  onChange: (hours: BusinessHours) => void;
}) {
  function updateDay(day: keyof BusinessHours, patch: Partial<BusinessHours[keyof BusinessHours]>) {
    onChange({ ...value, [day]: { ...value[day], ...patch } });
  }

  return (
    <div className="flex flex-col gap-2">
      {BUSINESS_DAYS.map((day) => {
        const hours = value[day];
        return (
          <div key={day} className="flex flex-wrap items-center gap-3 rounded-md border border-concrete-200 px-3 py-2">
            <span className="w-24 shrink-0 text-sm font-semibold text-charcoal-900">{BUSINESS_DAY_LABELS[day]}</span>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-steel-600">
              <input
                type="checkbox"
                checked={hours.closed}
                onChange={(e) => updateDay(day, { closed: e.target.checked })}
                className="h-4 w-4"
              />
              Closed
            </label>
            {!hours.closed && (
              <>
                <input
                  type="time"
                  value={hours.open}
                  onChange={(e) => updateDay(day, { open: e.target.value })}
                  className={inputClass}
                />
                <span className="text-sm text-steel-600">to</span>
                <input
                  type="time"
                  value={hours.close}
                  onChange={(e) => updateDay(day, { close: e.target.value })}
                  className={inputClass}
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
