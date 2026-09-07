/**
 * Add-vehicle dialog — My Garage and (via client linking) the Black Book.
 *
 * KNOWN GAP carried over from the Vue portal: the variant picker is a static list from the
 * dummy dataset. TODO(engineering): replace with the shared vehicle-hierarchy search so
 * brokers write into the same `car_model_variant` rows as the consumer app.
 */

import { useState } from "react";
import type { FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import type { CarModelVariant, ProVehicleSource, SupplyIntent } from "../../pro/types";
import { SUPPLY_INTENT_OPTIONS } from "../../pro/types";
import { VARIANTS } from "../../pro/dummy-data";
import { createVehicle } from "../../pro/api";

export const inputClass =
  "w-full bg-muted/30 border border-border/80 rounded-xl px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring/60 transition-colors";

export const labelClass = "block text-sm text-muted-foreground mb-1";

const variantList: CarModelVariant[] = Object.values(VARIANTS);

interface VehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source: ProVehicleSource;
  /** Black Book only — pre-links the new vehicle to a client. */
  clientId?: string | null;
  onSaved: () => void;
}

export function VehicleDialog({ open, onOpenChange, source, clientId, onSaved }: VehicleDialogProps) {
  const [variantSlug, setVariantSlug] = useState("");
  const [year, setYear] = useState("");
  const [mileage, setMileage] = useState("");
  const [colourName, setColourName] = useState("");
  const [colourHex, setColourHex] = useState("#374151");
  const [acquisitionPrice, setAcquisitionPrice] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [supplyIntent, setSupplyIntent] = useState<SupplyIntent>("holding");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();

  const reset = () => {
    setVariantSlug("");
    setYear("");
    setMileage("");
    setColourName("");
    setColourHex("#374151");
    setAcquisitionPrice("");
    setTargetPrice("");
    setSupplyIntent("holding");
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
    const { error } = await createVehicle({
      source,
      model: variant.slug,
      variant,
      year: year ? Number(year) : null,
      mileage: mileage ? Number(mileage) : null,
      colour_name: colourName || null,
      colour_hex: colourHex || null,
      acquisition_price: source === "stock" && acquisitionPrice ? Number(acquisitionPrice) : null,
      target_price: targetPrice ? Number(targetPrice) : null,
      supply_intent: supplyIntent,
      notes: notes || null,
      client_id: clientId ?? null,
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{source === "stock" ? "Add vehicle to My Garage" : "Add client vehicle"}</DialogTitle>
          <DialogDescription>
            {source === "stock"
              ? "A vehicle you own or hold under mandate."
              : "A vehicle owned by one of your clients."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="veh-variant" className={labelClass}>
              Model
            </label>
            <select
              id="veh-variant"
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
              <label htmlFor="veh-year" className={labelClass}>
                Year
              </label>
              <input
                id="veh-year"
                type="number"
                min={1950}
                max={2030}
                className={inputClass}
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="veh-mileage" className={labelClass}>
                Mileage (km)
              </label>
              <input
                id="veh-mileage"
                type="number"
                min={0}
                className={inputClass}
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-4">
            <div>
              <label htmlFor="veh-colour" className={labelClass}>
                Colour
              </label>
              <input
                id="veh-colour"
                type="text"
                className={inputClass}
                value={colourName}
                onChange={(e) => setColourName(e.target.value)}
                placeholder="e.g. Shark Blue"
              />
            </div>
            <div>
              <label htmlFor="veh-colour-hex" className={labelClass}>
                Swatch
              </label>
              <input
                id="veh-colour-hex"
                type="color"
                className="h-[42px] w-14 bg-muted/30 border border-border/80 rounded-xl cursor-pointer"
                value={colourHex}
                onChange={(e) => setColourHex(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {source === "stock" && (
              <div>
                <label htmlFor="veh-acquisition" className={labelClass}>
                  Acquisition price (R)
                </label>
                <input
                  id="veh-acquisition"
                  type="number"
                  min={0}
                  className={inputClass}
                  value={acquisitionPrice}
                  onChange={(e) => setAcquisitionPrice(e.target.value)}
                />
              </div>
            )}
            <div>
              <label htmlFor="veh-target" className={labelClass}>
                Target price (R)
              </label>
              <input
                id="veh-target"
                type="number"
                min={0}
                className={inputClass}
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="veh-intent" className={labelClass}>
              Supply intent
            </label>
            <select
              id="veh-intent"
              className={inputClass}
              value={supplyIntent}
              onChange={(e) => setSupplyIntent(e.target.value as SupplyIntent)}
            >
              {SUPPLY_INTENT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} — {option.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="veh-notes" className={labelClass}>
              Notes
            </label>
            <textarea
              id="veh-notes"
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
              {saving ? "Saving…" : "Add vehicle"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
