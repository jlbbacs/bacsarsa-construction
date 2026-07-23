import { useMemo, useState } from "react";
import { ShieldAlert, Search } from "lucide-react";
import { useActivityLogs } from "../../hooks/useActivityLogs";
import { useUsers } from "../../hooks/useUsers";
import { PageLoader } from "../PageLoader";

const PAGE_SIZE = 20;

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function actionLabel(action: string) {
  return action
    .split("_")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

export function ActivityLogsPanel() {
  const { logs, loading } = useActivityLogs();
  const { users } = useUsers();

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [page, setPage] = useState(0);

  const userLookup = useMemo(() => {
    const map = new Map<string, string>();
    for (const u of users) map.set(u.id, `${u.first_name} ${u.last_name}`.trim() || u.username);
    return map;
  }, [users]);

  const actionOptions = useMemo(() => Array.from(new Set(logs.map((l) => l.action))).sort(), [logs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return logs.filter((log) => {
      if (actionFilter !== "all" && log.action !== actionFilter) return false;
      if (!q) return true;
      const actorName = (userLookup.get(log.actor_user_id ?? "") ?? "").toLowerCase();
      const targetName = (userLookup.get(log.target_user_id ?? "") ?? "").toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        actorName.includes(q) ||
        targetName.includes(q) ||
        (log.ip_address ?? "").toLowerCase().includes(q)
      );
    });
  }, [logs, search, actionFilter, userLookup]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-xl font-semibold text-charcoal-900">Activity Logs</h2>
        <p className="text-sm text-steel-600">Read-only audit trail of sensitive account and system actions.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search by user, action, or IP..."
            className="w-full rounded-md border border-concrete-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-safety-500"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(0);
          }}
          className="rounded-md border border-concrete-200 py-2 px-3 text-sm outline-none focus:border-safety-500"
        >
          <option value="all">All Actions</option>
          {actionOptions.map((a) => (
            <option key={a} value={a}>
              {actionLabel(a)}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <PageLoader />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-concrete-200 py-16 text-center">
          <ShieldAlert className="h-8 w-8 text-steel-400" />
          <p className="text-sm text-steel-600">No activity recorded yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-concrete-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-concrete-200 bg-concrete-50 text-xs font-semibold uppercase tracking-wide text-steel-600">
              <tr>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">IP Address</th>
                <th className="px-4 py-3">When</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((log) => (
                <tr key={log.id} className="border-b border-concrete-200 last:border-0">
                  <td className="px-4 py-3 font-semibold text-charcoal-900">{actionLabel(log.action)}</td>
                  <td className="px-4 py-3 text-steel-600">
                    {log.actor_user_id ? (userLookup.get(log.actor_user_id) ?? "Unknown") : "--"}
                  </td>
                  <td className="px-4 py-3 text-steel-600">
                    {log.target_user_id ? (userLookup.get(log.target_user_id) ?? "Unknown") : "--"}
                  </td>
                  <td className="px-4 py-3 text-steel-600">{log.ip_address ?? "--"}</td>
                  <td className="px-4 py-3 text-steel-600">{formatDateTime(log.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pageCount > 1 && (
        <div className="flex items-center justify-between text-sm text-steel-600">
          <span>
            Page {page + 1} of {pageCount}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-md border border-concrete-200 px-3 py-1.5 font-semibold disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={page >= pageCount - 1}
              className="rounded-md border border-concrete-200 px-3 py-1.5 font-semibold disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
