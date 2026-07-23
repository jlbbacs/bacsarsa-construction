import { Modal } from "../Modal";
import { Button } from "../Button";

export function ConfirmActionModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  danger = false,
  submitting = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  submitting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <div className="flex flex-col gap-6">
        <p className="text-sm leading-relaxed text-steel-600">{message}</p>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className={danger ? "bg-red-600 text-white hover:bg-red-700" : undefined}
          >
            {submitting ? "Working..." : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
