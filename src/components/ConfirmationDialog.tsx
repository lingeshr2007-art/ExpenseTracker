// src/components/ConfirmationDialog.tsx
import Modal from "./Modal";

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationDialog({ isOpen, title, message, onConfirm, onCancel }: ConfirmationDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {message}
        </p>
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
          <button
            type="button"
            className="btn btn-secondary !py-2 !px-4"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger !py-2 !px-4"
            onClick={onConfirm}
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}
