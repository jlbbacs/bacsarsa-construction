import type { UserStatus } from "../types";

export const USER_STATUS_BADGE_CLASSES: Record<UserStatus, string> = {
  active: "bg-green-600/10 text-green-700",
  pending_verification: "bg-amber-400/15 text-amber-600",
  disabled: "bg-steel-400/15 text-steel-600",
  suspended: "bg-red-600/10 text-red-700",
  locked: "bg-red-600/10 text-red-700",
};

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  active: "Active",
  pending_verification: "Pending Verification",
  disabled: "Disabled",
  suspended: "Suspended",
  locked: "Locked",
};
