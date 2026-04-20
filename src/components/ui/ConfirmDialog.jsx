"use client";

import Button from "./Button.jsx";

export default function ConfirmDialog({ open, title, description, onConfirm, onCancel, confirmLabel = "Bestätigen", danger = false }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-2 text-base font-semibold text-gray-900">{title}</h2>
        {description && (
          <p className="mb-6 text-sm text-gray-500">{description}</p>
        )}
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel}>
            Abbrechen
          </Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
