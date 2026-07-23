import { useMemo, useState } from "react";
import { Users as UsersIcon, Pencil, Trash2, Ban, CheckCircle2, Lock, Mail, Search } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useUsers } from "../../hooks/useUsers";
import { useCurrentProfile } from "../../context/ProfileContext";
import { useToast } from "../../context/ToastContext";
import { Button } from "../Button";
import { PageLoader } from "../PageLoader";
import { CreateUserModal } from "./CreateUserModal";
import { EditUserModal } from "./EditUserModal";
import { ConfirmActionModal } from "./ConfirmActionModal";
import { USER_STATUS_BADGE_CLASSES, USER_STATUS_LABELS } from "../../lib/userStatus";
import type { Profile, UserStatus } from "../../types";

const PAGE_SIZE = 10;

type PendingAction =
  | { type: "delete"; user: Profile }
  | { type: "disable"; user: Profile }
  | { type: "suspend"; user: Profile }
  | { type: "enable"; user: Profile }
  | { type: "unlock"; user: Profile };

function formatDate(iso: string | null) {
  if (!iso) return "Never";
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function UsersPanel() {
  const { users, loading, refresh } = useUsers();
  const { profile: currentProfile } = useCurrentProfile();
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "super_admin" | "admin">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | UserStatus>("all");
  const [page, setPage] = useState(0);

  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<Profile | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (statusFilter !== "all" && u.status !== statusFilter) return false;
      if (!q) return true;
      return (
        u.username.toLowerCase().includes(q) ||
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) ||
        (u.email ?? "").toLowerCase().includes(q)
      );
    });
  }, [users, search, roleFilter, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  function resetToFirstPage<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setPage(0);
    };
  }

  async function callAdminUsers(action: string, body: Record<string, unknown>) {
    const { data, error } = await supabase.functions.invoke(`admin-users?action=${action}`, { body });
    const responseError = (data as { error?: string } | null)?.error ?? error?.message;
    if (responseError) throw new Error(responseError);
  }

  async function handleConfirmAction() {
    if (!pendingAction) return;
    setActionSubmitting(true);
    try {
      if (pendingAction.type === "delete") {
        await callAdminUsers("delete", { user_id: pendingAction.user.id });
        toast.success(`Deleted ${pendingAction.user.username}.`);
      } else if (pendingAction.type === "unlock") {
        const { error } = await supabase.rpc("admin_unlock_user", { p_user_id: pendingAction.user.id });
        if (error) throw new Error(error.message);
        toast.success(`Unlocked ${pendingAction.user.username}.`);
      } else {
        const statusMap: Record<"disable" | "suspend" | "enable", UserStatus> = {
          disable: "disabled",
          suspend: "suspended",
          enable: "active",
        };
        await callAdminUsers("set-status", { user_id: pendingAction.user.id, status: statusMap[pendingAction.type] });
        toast.success(`${pendingAction.user.username} is now ${USER_STATUS_LABELS[statusMap[pendingAction.type]]}.`);
      }
      refresh();
      setPendingAction(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setActionSubmitting(false);
    }
  }

  async function handleResendInvite(user: Profile) {
    setResendingId(user.id);
    try {
      await callAdminUsers("resend-invite", { user_id: user.id });
      toast.success(`Invite resent to ${user.email}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setResendingId(null);
    }
  }

  async function handleResetPassword(user: Profile) {
    if (!user.email) return;
    setResettingId(user.id);
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setResettingId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Password reset email sent to ${user.email}.`);
  }

  const confirmCopy: Record<PendingAction["type"], { title: string; message: (u: Profile) => string; label: string; danger?: boolean }> = {
    delete: {
      title: "Delete User",
      message: (u) => `Permanently delete ${u.first_name} ${u.last_name} (${u.username})? This cannot be undone.`,
      label: "Delete",
      danger: true,
    },
    disable: {
      title: "Disable User",
      message: (u) => `${u.username} will no longer be able to log in until re-enabled.`,
      label: "Disable",
      danger: true,
    },
    suspend: {
      title: "Suspend User",
      message: (u) => `${u.username} will be suspended pending your approval to reinstate.`,
      label: "Suspend",
      danger: true,
    },
    enable: {
      title: "Enable User",
      message: (u) => `Restore login access for ${u.username}?`,
      label: "Enable",
    },
    unlock: {
      title: "Unlock Account",
      message: (u) => `Clear the lockout on ${u.username} and let them sign in again?`,
      label: "Unlock",
    },
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold text-charcoal-900">Users</h2>
        <Button type="button" onClick={() => setCreateOpen(true)}>
          New User
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-400" />
          <input
            value={search}
            onChange={(e) => resetToFirstPage(setSearch)(e.target.value)}
            placeholder="Search name, username, or email..."
            className="w-full rounded-md border border-concrete-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-safety-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => resetToFirstPage(setRoleFilter)(e.target.value as typeof roleFilter)}
          className="rounded-md border border-concrete-200 py-2 px-3 text-sm outline-none focus:border-safety-500"
        >
          <option value="all">All Roles</option>
          <option value="super_admin">Super Admin</option>
          <option value="admin">Administrator</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => resetToFirstPage(setStatusFilter)(e.target.value as typeof statusFilter)}
          className="rounded-md border border-concrete-200 py-2 px-3 text-sm outline-none focus:border-safety-500"
        >
          <option value="all">All Statuses</option>
          {(Object.keys(USER_STATUS_LABELS) as UserStatus[]).map((s) => (
            <option key={s} value={s}>
              {USER_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <PageLoader />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-concrete-200 py-16 text-center">
          <UsersIcon className="h-8 w-8 text-steel-400" />
          <p className="text-sm text-steel-600">No users match your filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-concrete-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-concrete-200 bg-concrete-50 text-xs font-semibold uppercase tracking-wide text-steel-600">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last Login</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((user) => {
                const isSelf = user.id === currentProfile?.id;
                return (
                  <tr key={user.id} className="border-b border-concrete-200 last:border-0">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2.5 font-semibold text-charcoal-900">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
                        ) : (
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-charcoal-900 text-xs font-bold text-white">
                            {(user.first_name[0] ?? user.username[0] ?? "?").toUpperCase()}
                          </span>
                        )}
                        {user.first_name} {user.last_name}
                        {isSelf && <span className="text-xs font-normal text-steel-500">(you)</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-steel-600">{user.username}</td>
                    <td className="px-4 py-3 text-steel-600">{user.email ?? "--"}</td>
                    <td className="px-4 py-3 text-steel-600">{user.role === "super_admin" ? "Super Admin" : "Administrator"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-sm px-2 py-1 text-xs font-semibold ${USER_STATUS_BADGE_CLASSES[user.status]}`}>
                        {USER_STATUS_LABELS[user.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-steel-600">{formatDate(user.last_login_at)}</td>
                    <td className="px-4 py-3 text-steel-600">{formatDate(user.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setEditUser(user)}
                          aria-label="Edit user"
                          className="flex h-8 w-8 items-center justify-center rounded-md text-steel-600 hover:bg-concrete-50 hover:text-charcoal-900"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        {user.status === "pending_verification" && (
                          <button
                            type="button"
                            onClick={() => handleResendInvite(user)}
                            disabled={resendingId === user.id}
                            aria-label="Resend invite"
                            className="flex h-8 w-8 items-center justify-center rounded-md text-steel-600 hover:bg-concrete-50 hover:text-charcoal-900 disabled:opacity-50"
                          >
                            <Mail className="h-4 w-4" />
                          </button>
                        )}

                        {user.status !== "pending_verification" && (
                          <button
                            type="button"
                            onClick={() => handleResetPassword(user)}
                            disabled={resettingId === user.id}
                            aria-label="Send password reset"
                            className="flex h-8 w-8 items-center justify-center rounded-md text-steel-600 hover:bg-concrete-50 hover:text-charcoal-900 disabled:opacity-50"
                          >
                            <Lock className="h-4 w-4" />
                          </button>
                        )}

                        {!isSelf && user.status === "locked" && (
                          <button
                            type="button"
                            onClick={() => setPendingAction({ type: "unlock", user })}
                            aria-label="Unlock user"
                            className="flex h-8 w-8 items-center justify-center rounded-md text-steel-600 hover:bg-green-50 hover:text-green-700"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        )}

                        {!isSelf && user.role !== "super_admin" && (user.status === "active" || user.status === "pending_verification") && (
                          <button
                            type="button"
                            onClick={() => setPendingAction({ type: "disable", user })}
                            aria-label="Disable user"
                            className="flex h-8 w-8 items-center justify-center rounded-md text-steel-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        )}

                        {!isSelf && (user.status === "disabled" || user.status === "suspended") && (
                          <button
                            type="button"
                            onClick={() => setPendingAction({ type: "enable", user })}
                            aria-label="Enable user"
                            className="flex h-8 w-8 items-center justify-center rounded-md text-steel-600 hover:bg-green-50 hover:text-green-700"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        )}

                        {!isSelf && user.role !== "super_admin" && (
                          <button
                            type="button"
                            onClick={() => setPendingAction({ type: "delete", user })}
                            aria-label="Delete user"
                            className="flex h-8 w-8 items-center justify-center rounded-md text-steel-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
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

      <CreateUserModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={refresh} />
      <EditUserModal user={editUser} onClose={() => setEditUser(null)} onSaved={refresh} />

      {pendingAction && (
        <ConfirmActionModal
          open
          title={confirmCopy[pendingAction.type].title}
          message={confirmCopy[pendingAction.type].message(pendingAction.user)}
          confirmLabel={confirmCopy[pendingAction.type].label}
          danger={confirmCopy[pendingAction.type].danger}
          submitting={actionSubmitting}
          onConfirm={handleConfirmAction}
          onCancel={() => setPendingAction(null)}
        />
      )}
    </div>
  );
}
