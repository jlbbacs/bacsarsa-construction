import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "../Modal";
import { Button } from "../Button";
import { ErrorNotice } from "../ErrorNotice";
import { supabase } from "../../lib/supabase";
import { useToast } from "../../context/ToastContext";
import type { Profile } from "../../types";

const inputClass =
  "w-full rounded-md border border-concrete-200 px-4 py-2.5 text-sm font-normal outline-none focus:border-safety-500";

// Editing a Super Admin's own name/phone happens through Account Settings,
// not here. Username is deliberately not editable from this modal -- it
// always goes through the verification flow in AccountSettingsPanel, even
// for a Super Admin editing their own; there's no "edit someone else's
// username" path in this build.
export function EditUserModal({
  user,
  onClose,
  onSaved,
}: {
  user: Profile | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.first_name);
    setLastName(user.last_name);
    setPhone(user.phone ?? "");
    setError(null);
  }, [user]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setSubmitting(true);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ first_name: firstName.trim(), last_name: lastName.trim(), phone: phone.trim() || null })
      .eq("id", user.id);

    setSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    toast.success("User updated.");
    onSaved();
    onClose();
  }

  return (
    <Modal open={!!user} onClose={onClose} title={user ? `Edit ${user.username}` : ""}>
      {user && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <ErrorNotice message={error} />}

          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
              First Name
              <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
              Last Name
              <input required value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} />
            </label>
          </div>

          <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
            Mobile Number <span className="font-normal text-steel-500">(optional)</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
          </label>

          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
