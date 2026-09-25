import { useEffect } from 'react';

interface Props {
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
  pending?: boolean;
}

export function ConfirmDeleteDialog({ title, onCancel, onConfirm, pending = false }: Props) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !pending) onCancel();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onCancel, pending]);

  return (
    <div
      className="confirm-delete-backdrop"
      role="presentation"
      onClick={() => {
        if (!pending) onCancel();
      }}
    >
      <div
        className="confirm-delete-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
        aria-describedby="confirm-delete-body"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-delete-title">{title}</h2>
        <p id="confirm-delete-body">This action cannot be undone.</p>
        <div className="confirm-delete-actions">
          <button type="button" onClick={onCancel} disabled={pending} autoFocus>
            Cancel
          </button>
          <button type="button" className="danger" onClick={onConfirm} disabled={pending}>
            {pending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
