import React, { useEffect, useRef, useState } from "react";

type CommonProps = {
  open: boolean;
  onClose: () => void;
  initialName?: string;
  title?: string;
  maxLength?: number;
};

type BaseProps = CommonProps & {
  actionLabel: string;
  submittingLabel?: string;
  onSubmit?: (name: string) => Promise<void> | void;
  showDelete?: boolean;
  onDelete?: () => Promise<void> | void;
};

function HouseholdModalBase({
  open,
  onClose,
  initialName = "",
  title = "Household",
  maxLength = 60,
  actionLabel,
  submittingLabel = "Saving...",
  onSubmit,
  showDelete = false,
  onDelete,
}: BaseProps) {
  const [name, setName] = useState<string>(initialName);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) {
      setName(initialName);
      setError(null);
      setSaving(false);
      setTimeout(() => inputRef.current?.focus(), 0);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, initialName]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const validate = (value: string) => {
    const v = value.trim();
    if (!v) return "Name is required.";
    if (v.length > maxLength)
      return `Name must be at most ${maxLength} characters.`;
    return null;
  };

  const handleSubmit = async () => {
    const validation = validate(name);
    if (validation) {
      setError(validation);
      inputRef.current?.focus();
      return;
    }

    if (!onSubmit) {
      onClose();
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await onSubmit(name.trim());
      onClose();
    } catch (err: any) {
      setError(
        err?.message ?? `Failed to ${actionLabel.toLowerCase()}. Try again.`
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (
      !confirm(
        "Are you sure you want to delete this household? This action cannot be undone."
      )
    )
      return;
    try {
      setSaving(true);
      setError(null);
      await onDelete();
      onClose();
    } catch (err: any) {
      setError(err?.message ?? "Failed to delete household. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onMouseDown={handleBackdropClick}
      aria-hidden={!open}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="household-modal-title"
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 520,
          background: "#fff",
          borderRadius: 8,
          padding: 20,
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
          <h2 id="household-modal-title" style={{ margin: 0, fontSize: 18 }}>
            {title}
          </h2>
          <button
            aria-label="Close"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              fontSize: 20,
              lineHeight: 1,
              cursor: "pointer",
            }}>
            ×
          </button>
        </div>

        <div style={{ marginTop: 12 }}>
          <label
            htmlFor="household-name"
            style={{ display: "block", fontSize: 13, marginBottom: 6 }}>
            Household name
          </label>
          <input
            id="household-name"
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit();
              }
            }}
            maxLength={maxLength}
            placeholder="e.g. The Johnsons"
            style={{
              width: "100%",
              padding: "10px 12px",
              fontSize: 15,
              borderRadius: 6,
              border: "1px solid #d1d5db",
              boxSizing: "border-box",
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "household-name-error" : undefined}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 6,
            }}>
            <div
              id="household-name-error"
              role="alert"
              style={{ color: "var(--error,#b00020)", fontSize: 13 }}>
              {error ?? " "}
            </div>
            <div style={{ color: "#6b7280", fontSize: 13 }}>
              {name.length}/{maxLength}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: showDelete ? "space-between" : "flex-end",
            gap: 8,
            marginTop: 18,
            alignItems: "center",
          }}>
          {showDelete ? (
            <div>
              <button
                onClick={handleDelete}
                disabled={saving}
                style={{
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "1px solid #ef4444",
                  background: "#fff",
                  color: "#b91c1c",
                  cursor: saving ? "not-allowed" : "pointer",
                }}>
                Delete
              </button>
            </div>
          ) : null}

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={onClose}
              disabled={saving}
              style={{
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid #d1d5db",
                background: "#fff",
                cursor: saving ? "not-allowed" : "pointer",
              }}>
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              style={{
                padding: "8px 14px",
                borderRadius: 6,
                border: "none",
                background: saving ? "#94a3b8" : "#111827",
                color: "#fff",
                cursor: saving ? "not-allowed" : "pointer",
              }}>
              {saving ? submittingLabel : actionLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

type CreateProps = CommonProps & {
  onCreate?: (name: string) => Promise<void> | void;
};

export function CreateHouseholdModal({ onCreate, ...rest }: CreateProps) {
  return (
    <HouseholdModalBase
      {...rest}
      title={rest.title ?? "Create household"}
      actionLabel="Create"
      submittingLabel="Creating..."
      onSubmit={onCreate}
    />
  );
}

type EditProps = CommonProps & {
  onUpdate?: (name: string) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
};

export function EditHouseholdModal({ onUpdate, onDelete, ...rest }: EditProps) {
  return (
    <HouseholdModalBase
      {...rest}
      title={rest.title ?? "Edit household"}
      actionLabel="Update"
      submittingLabel="Updating..."
      onSubmit={onUpdate}
      showDelete={Boolean(onDelete)}
      onDelete={onDelete}
    />
  );
}

export default CreateHouseholdModal;
