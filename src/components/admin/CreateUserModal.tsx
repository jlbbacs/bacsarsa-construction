import { useState, type FormEvent } from "react";
import { Modal } from "../Modal";
import { Button } from "../Button";
import { ErrorNotice } from "../ErrorNotice";
import { callAdminUsers } from "../../lib/adminUsersApi";
import { useToast } from "../../context/ToastContext";

const inputClass =
  "w-full rounded-md border border-concrete-200 px-4 py-2.5 text-sm font-normal outline-none focus:border-safety-500 focus-visible:ring-2 focus-visible:ring-safety-500 focus-visible:ring-offset-2";

export function CreateUserModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const toast = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setFirstName("");
    setLastName("");
    setUsername("");
    setEmail("");
    setPhone("");
    setError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await callAdminUsers("create", {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        username: username.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
      });
      toast.success(`Invited ${email.trim()} as an Administrator.`);
      reset();
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Create Administrator">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <ErrorNotice message={error} />}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          Username
          <input
            required
            value={username}
            onChange={(e) => setUsername(e.target.value.trim())}
            className={inputClass}
            placeholder="jsmith"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="you@example.com"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal-900">
          Mobile Number <span className="font-normal text-steel-500">(optional)</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
        </label>

        <p className="text-xs text-steel-500">
          Role is always Administrator here -- there can only be one Super Admin. An invite email will be sent; the
          account stays Pending Verification until they accept it and set a password.
        </p>

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Sending Invite..." : "Create User"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
