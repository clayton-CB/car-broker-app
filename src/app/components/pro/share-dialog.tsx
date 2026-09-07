/**
 * Field-level marketplace sharing — "choose how much to share".
 *
 * Make, model and supply intent are always public; everything else is opt-in per field.
 * The acquisition price is not on this list by design: it is never shareable.
 */

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import type { ProShareableField, ProShareSettings, ProVehicle } from "../../pro/types";
import { PRO_SHAREABLE_FIELDS } from "../../pro/types";
import { updateListing } from "../../pro/api";

interface ShareDialogProps {
  vehicle: ProVehicle | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function ShareDialog({ vehicle, onOpenChange, onSaved }: ShareDialogProps) {
  const [settings, setSettings] = useState<ProShareSettings>({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();

  // Re-seed the toggles whenever a different vehicle is opened.
  useEffect(() => {
    setSettings(vehicle ? { ...vehicle.share_settings } : {});
    setFormError(undefined);
  }, [vehicle]);

  if (!vehicle) return null;

  const toggle = (field: ProShareableField) =>
    setSettings((prev) => ({ ...prev, [field]: !prev[field] }));

  const save = async (listed: boolean) => {
    setSaving(true);
    const { error } = await updateListing(vehicle.id, listed, settings);
    setSaving(false);
    if (error) {
      setFormError(error.message);
      return;
    }
    onOpenChange(false);
    onSaved();
  };

  const title = `${vehicle.variant?.make?.name ?? ""} ${vehicle.variant?.name ?? vehicle.model}`;

  return (
    <Dialog open={vehicle !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share to Community Marketplace</DialogTitle>
          <DialogDescription>
            {title} — make, model and supply intent are always shown. Choose what else buyers
            see. Your identity appears as your brokerage, never your client's name.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {PRO_SHAREABLE_FIELDS.map((field) => (
            <label
              key={field.value}
              className="flex items-start gap-3 bg-muted/20 border border-border/80 rounded-xl px-4 py-3 cursor-pointer hover:bg-muted/40 transition-colors"
            >
              <input
                type="checkbox"
                checked={settings[field.value] ?? false}
                onChange={() => toggle(field.value)}
                className="mt-1 accent-[#1fb85a]"
              />
              <span>
                <span className="block">{field.label}</span>
                <span className="block text-sm text-muted-foreground">{field.description}</span>
              </span>
            </label>
          ))}
        </div>

        {formError && (
          <p className="text-sm text-red-400" role="alert">
            {formError}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          {vehicle.listed && (
            <button
              type="button"
              disabled={saving}
              onClick={() => save(false)}
              className="bg-muted/50 border border-transparent px-5 py-2.5 rounded-xl hover:bg-muted transition-colors disabled:opacity-60"
            >
              Remove listing
            </button>
          )}
          <button
            type="button"
            disabled={saving}
            onClick={() => save(true)}
            className="bg-primary text-primary-foreground font-medium px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {saving ? "Saving…" : vehicle.listed ? "Update listing" : "Publish listing"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
