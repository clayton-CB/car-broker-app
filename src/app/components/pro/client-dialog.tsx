/**
 * Client capture — name, contact, and repeatable brand/model preferences,
 * exactly the field set the Vue portal's Black Book flow captured.
 */

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import type { ProClient, ProClientPreference } from "../../pro/types";
import { VARIANTS } from "../../pro/dummy-data";
import { saveClient } from "../../pro/api";
import { inputClass, labelClass } from "./vehicle-dialog";

/** Distinct makes/models from the variant catalogue, for the preference picker. */
const makeOptions = Array.from(
  new Map(
    Object.values(VARIANTS)
      .filter((v) => v.make)
      .map((v) => [v.make!.slug, v.make!])
  ).values()
);

const modelOptionsFor = (makeSlug: string) =>
  Array.from(
    new Map(
      Object.values(VARIANTS)
        .filter((v) => v.make?.slug === makeSlug && v.model)
        .map((v) => [v.model!.slug, v.model!])
    ).values()
  );

interface ClientDialogProps {
  open: boolean;
  /** Existing client to edit, or null to create. */
  client: ProClient | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function ClientDialog({ open, client, onOpenChange, onSaved }: ClientDialogProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [cell, setCell] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [preferences, setPreferences] = useState<ProClientPreference[]>([]);
  const [prefMake, setPrefMake] = useState("");
  const [prefModel, setPrefModel] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();

  // Seed the form whenever the dialog opens for a different client.
  useEffect(() => {
    setFirstName(client?.first_name ?? "");
    setLastName(client?.last_name ?? "");
    setCell(client?.cell_number ?? "");
    setEmail(client?.email ?? "");
    setNotes(client?.notes ?? "");
    setPreferences(client?.preferences ?? []);
    setPrefMake("");
    setPrefModel("");
    setFormError(undefined);
  }, [client, open]);

  const addPreference = () => {
    const makeRef = makeOptions.find((m) => m.slug === prefMake);
    if (!makeRef) return;
    const modelRef = modelOptionsFor(prefMake).find((m) => m.slug === prefModel) ?? null;

    const exists = preferences.some(
      (p) => p.make === makeRef.slug && p.model === (modelRef?.slug ?? null)
    );
    if (exists) return;

    setPreferences([
      ...preferences,
      {
        make: makeRef.slug,
        make_name: makeRef.name ?? makeRef.slug,
        model: modelRef?.slug ?? null,
        model_name: modelRef?.name ?? null,
      },
    ]);
    setPrefMake("");
    setPrefModel("");
  };

  const removePreference = (index: number) =>
    setPreferences(preferences.filter((_, i) => i !== index));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const { error } = await saveClient({
      id: client?.id,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      cell_number: cell.trim() || null,
      email: email.trim() || null,
      preferences,
      notes: notes.trim() || null,
    });
    setSaving(false);

    if (error) {
      setFormError(error.message);
      return;
    }
    onOpenChange(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{client ? "Edit client" : "Add client"}</DialogTitle>
          <DialogDescription>
            Client details are private to you. They are never shown on the marketplace.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="cli-first" className={labelClass}>
                First name
              </label>
              <input
                id="cli-first"
                type="text"
                className={inputClass}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="cli-last" className={labelClass}>
                Surname
              </label>
              <input
                id="cli-last"
                type="text"
                className={inputClass}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="cli-cell" className={labelClass}>
                Cell number
              </label>
              <input
                id="cli-cell"
                type="tel"
                className={inputClass}
                value={cell}
                onChange={(e) => setCell(e.target.value)}
                placeholder="+27 …"
              />
            </div>
            <div>
              <label htmlFor="cli-email" className={labelClass}>
                Email
              </label>
              <input
                id="cli-email"
                type="email"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <fieldset>
            <legend className={labelClass}>Brand preferences</legend>
            {preferences.length > 0 && (
              <ul className="flex flex-wrap gap-2 mb-2">
                {preferences.map((pref, index) => (
                  <li
                    key={`${pref.make}-${pref.model ?? "any"}`}
                    className="flex items-center gap-1.5 bg-muted/40 px-3 py-1 rounded-full text-sm"
                  >
                    {pref.make_name}
                    {pref.model_name ? ` ${pref.model_name}` : " (any model)"}
                    <button
                      type="button"
                      onClick={() => removePreference(index)}
                      className="text-muted-foreground/70 hover:text-red-500 transition-colors"
                      aria-label={`Remove ${pref.make_name} preference`}
                    >
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2">
              <select
                aria-label="Preferred make"
                className={inputClass}
                value={prefMake}
                onChange={(e) => {
                  setPrefMake(e.target.value);
                  setPrefModel("");
                }}
              >
                <option value="">Make…</option>
                {makeOptions.map((m) => (
                  <option key={m.slug} value={m.slug}>
                    {m.name}
                  </option>
                ))}
              </select>
              <select
                aria-label="Preferred model"
                className={inputClass}
                value={prefModel}
                onChange={(e) => setPrefModel(e.target.value)}
                disabled={!prefMake}
              >
                <option value="">Any model</option>
                {prefMake &&
                  modelOptionsFor(prefMake).map((m) => (
                    <option key={m.slug} value={m.slug}>
                      {m.name}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={addPreference}
                disabled={!prefMake}
                className="bg-muted/50 border border-transparent px-3 rounded-xl hover:bg-muted transition-colors disabled:opacity-50"
                aria-label="Add preference"
              >
                <Plus size={18} />
              </button>
            </div>
          </fieldset>

          <div>
            <label htmlFor="cli-notes" className={labelClass}>
              Notes
            </label>
            <textarea
              id="cli-notes"
              rows={2}
              className={inputClass}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {formError && (
            <p className="text-sm text-red-400" role="alert">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="bg-muted/50 border border-transparent px-5 py-2.5 rounded-xl hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-primary text-primary-foreground font-medium px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {saving ? "Saving…" : client ? "Save changes" : "Add client"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
