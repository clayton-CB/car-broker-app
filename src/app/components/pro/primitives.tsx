/**
 * OC Pro shared primitives — intent badges, KPI tiles, colour swatches, and the
 * loading / empty / error states every portal page uses.
 *
 * Visual language follows the Owners Circle design system: dark `bg-background` cards with
 * `border-border/80`, `rounded-2xl`, muted secondary text, OC green #1fb85a for movement.
 */

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import type { PurchaseIntent, SupplyIntent } from "../../pro/types";
import { PURCHASE_INTENT_OPTIONS, SUPPLY_INTENT_OPTIONS } from "../../pro/types";

/* ---------------------------------------------------------------------- */
/* Intent badge — one component for both vocabularies (as in the Vue app) */
/* ---------------------------------------------------------------------- */

type IntentBadgeProps =
  | { kind: "supply"; value: SupplyIntent }
  | { kind: "purchase"; value: PurchaseIntent };

export function IntentBadge(props: IntentBadgeProps) {
  const option =
    props.kind === "supply"
      ? SUPPLY_INTENT_OPTIONS.find((o) => o.value === props.value)
      : PURCHASE_INTENT_OPTIONS.find((o) => o.value === props.value);

  if (!option) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs ${option.tone}`}
      title={option.description}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
      {option.label}
    </span>
  );
}

/* ---------------------------------------------------------------------- */
/* KPI stat tile                                                          */
/* ---------------------------------------------------------------------- */

interface StatTileProps {
  label: string;
  value: string;
  /** Signed change; rendered green up / red down with a trend icon. */
  delta?: { text: string; positive: boolean };
  sub?: string;
}

export function StatTile({ label, value, delta, sub }: StatTileProps) {
  return (
    <div className="bg-background border border-border/80 rounded-2xl p-4 transition-colors">
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl">{value}</p>
      {delta && (
        <p
          className={`flex items-center gap-1 text-sm mt-1 ${
            delta.positive ? "text-[#1fb85a]" : "text-red-500"
          }`}
        >
          {delta.positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{delta.text}</span>
        </p>
      )}
      {sub && <p className="text-sm text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Vehicle photo — real photography, colour swatch as the fallback        */
/* ---------------------------------------------------------------------- */

interface VehicleSwatchProps {
  colourHex: string | null;
  /** e.g. "Porsche" — rendered as the placeholder monogram. */
  makeName: string | null;
  className?: string;
}

/**
 * Colour-driven placeholder artwork, shown when a vehicle has no photo — or when its photo
 * fails to load. Keeps `colour_hex` doing visual work rather than rendering a dead grey box.
 */
export function VehicleSwatch({ colourHex, makeName, className = "" }: VehicleSwatchProps) {
  const base = colourHex ?? "#6b7280";
  return (
    <div
      className={`relative overflow-hidden flex items-end ${className}`}
      style={{
        background: `linear-gradient(135deg, ${base} 0%, ${base}cc 60%, #11111133 100%)`,
      }}
      aria-hidden="true"
    >
      <span className="px-3 py-2 text-xs uppercase tracking-widest text-white/80 select-none">
        {makeName ?? ""}
      </span>
    </div>
  );
}

interface VehiclePhotoProps {
  /** First entry of the vehicle's `images[]`, or the variant's reference photo. */
  src: string | null;
  colourHex: string | null;
  makeName: string | null;
  /** Describes the vehicle, e.g. "2023 Porsche 911 GT3 (992)". */
  alt: string;
  /** Sizing/rounding for the frame — the image fills it via object-cover. */
  className?: string;
}

/**
 * A vehicle's photograph. Falls back to the colour swatch when there is no image, and again
 * at runtime if the image 404s — so a dead URL degrades to the old placeholder rather than a
 * broken-image icon.
 *
 * One source serves both card and thumbnail sizes: the frame is sized by `className` and the
 * image is lazy-loaded. TODO(engineering): when photography moves to the `cars` storage
 * bucket, request a narrower rendition here for list rows via storage image transforms.
 */
export function VehiclePhoto({
  src,
  colourHex,
  makeName,
  alt,
  className = "",
}: VehiclePhotoProps) {
  const [failed, setFailed] = useState(false);

  // A new src deserves a fresh attempt — otherwise one bad photo poisons the slot.
  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return <VehicleSwatch colourHex={colourHex} makeName={makeName} className={className} />;
  }

  return (
    <div className={`relative overflow-hidden bg-muted/30 ${className}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Page states                                                            */
/* ---------------------------------------------------------------------- */

export function LoadingPanel({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-4" role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="bg-muted/20 border border-border/60 rounded-2xl h-28 animate-pulse"
        />
      ))}
    </div>
  );
}

export function ErrorPanel({ message }: { message: string }) {
  return (
    <div className="bg-destructive/10 border border-destructive/40 rounded-2xl p-6 text-red-400" role="alert">
      {message}
    </div>
  );
}

interface EmptyPanelProps {
  title: string;
  body: string;
  action?: ReactNode;
}

export function EmptyPanel({ title, body, action }: EmptyPanelProps) {
  return (
    <div className="bg-background border border-border/80 rounded-2xl p-10 text-center">
      <h3 className="text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{body}</p>
      {action}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Table shell — the container every section's table view shares          */
/* ---------------------------------------------------------------------- */

interface TableShellProps {
  headers: string[];
  children: ReactNode;
}

export function TableShell({ headers, children }: TableShellProps) {
  return (
    <div className="bg-background rounded-2xl border border-border/80 overflow-hidden transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30 border-b border-border/60 transition-colors">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="text-left px-6 py-4 text-sm font-medium text-muted-foreground whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}

/** Standard row for a TableShell. */
export function TableRow({ children }: { children: ReactNode }) {
  return (
    <tr className="border-b border-border/60 last:border-b-0 hover:bg-muted/20 transition-colors">
      {children}
    </tr>
  );
}
