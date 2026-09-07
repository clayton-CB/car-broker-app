/** Add-to-My-Watchlist dialog — the vehicle the broker wants to source, and on what terms. */

import { useState } from "react";
import type { FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import type { CarModelVariant } from "../../pro/types";
import { VARIANTS } from "../../pro/dummy-data";
import { addToMyWatchlist } from "../../pro/api";
import { inputClass, labelClass } from "./vehicle-dialog";

const variantList: CarModelVariant[] = Object.values(VARIANTS);

interface WatchlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function WatchlistDialog({ open, onOpenChange, onSaved }: WatchlistDialogProps) {
  const [variantSlug, setVariantSlug] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();

  const reset = () => {
    setVariantSlug("");
    setYearFrom("");
    setYearTo("");
    setMaxPrice("");
    setNotes("");
    setFormError(undefined);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const variant = variantList.find((v) => v.slug === variantSlug);
    if (!variant) {
      setFormError("Choose a vehicle model.");
      return;
    }

    setSaving(true);
    const { error } = await addToMyWatchlist({
      model: variant.slug,
      variant,
      year_from: yearFrom ? Number(yearFrom) : null,
      year_to: yearTo ? Number(yearTo) : null,
      max_price: maxPrice ? Number(maxPrice) : null,
      notes: notes || null,
    });
    setSaving(false);

    if (error) {
      setFormError(error.message);
      return;
    }
    reset();
    onOpenChange(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add to My Watchlist</DialogTitle>
          <DialogDescription>
            A vehicle you want to source. You'll see matching community listings and demand.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="wl-variant" className={labelClass}>
              Model
            </label>
            <select
              id="wl-variant"
              className={inputClass}
              value={variantSlug}
              onChange={(e) => setVariantSlug(e.target.value)}
              required
            >
              <option value="">Choose a model…</option>
              {variantList.map((variant) => (
                <option key={variant.slug} value={variant.slug}>
                  {variant.make?.name} {variant.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="wl-year-from" className={labelClass}>
                Year from
              </label>
              <input
                id="wl-year-from"
                type="number"
                min={1950}
                max={2030}
                className={inputClass}
                value={yearFrom}
                onChange={(e) => setYearFrom(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="wl-year-to" className={labelClass}>
                Year to
              </label>
              <input
                id="wl-year-to"
                type="number"
                min={1950}
                max={2030}
                className={inputClass}
                value={yearTo}
                onChange={(e) => setYearTo(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="wl-max-price" className={labelClass}>
              Max price (R)
            </label>
            <input
              id="wl-max-price"
              type="number"
              min={0}
              className={inputClass}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="wl-notes" className={labelClass}>
              Notes
            </label>
            <textarea
              id="wl-notes"
              rows={2}
              className={inputClass}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Who is it for? What spec matters?"
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
              {saving ? "Saving…" : "Add to watchlist"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
