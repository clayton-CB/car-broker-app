/**
 * MY WATCHLIST — vehicles the broker wants to source.
 *
 * Each entry shows live context pulled from the rest of the portal: how many OC members are
 * watching the same variant (aggregated, anonymous) and whether the community marketplace
 * currently has a matching listing. Renders as cards or a table per the shared preference.
 */

import { useMemo, useState } from "react";
import { Eye, Plus, Store, Trash2 } from "lucide-react";
import type { ProBrokerWatchlistEntry } from "../pro/types";
import {
  fetchMarketplace,
  fetchMyWatchlist,
  fetchWatchlistDemand,
  removeFromMyWatchlist,
} from "../pro/api";
import { useAsyncData } from "../pro/use-async-data";
import { useProViewMode } from "../pro/view-mode";
import { formatZAR, formatRelativeDate } from "../pro/format";
import {
  EmptyPanel,
  ErrorPanel,
  LoadingPanel,
  TableRow,
  TableShell,
  VehiclePhoto,
} from "../components/pro/primitives";
import { ViewToggle } from "../components/pro/view-toggle";
import { WatchlistDialog } from "../components/pro/watchlist-dialog";

const entryLabel = (entry: ProBrokerWatchlistEntry) =>
  `${entry.variant?.make?.name ?? ""} ${entry.variant?.name ?? entry.model}`.trim();

const yearRange = (entry: ProBrokerWatchlistEntry): string | null => {
  if (entry.year_from && entry.year_to) return `${entry.year_from}–${entry.year_to}`;
  if (entry.year_from) return `${entry.year_from} or newer`;
  if (entry.year_to) return `up to ${entry.year_to}`;
  return null;
};

export function MyWatchlist() {
  const watchlist = useAsyncData(fetchMyWatchlist);
  const demand = useAsyncData(fetchWatchlistDemand);
  const marketplace = useAsyncData(fetchMarketplace);
  const { viewMode } = useProViewMode();

  const [addOpen, setAddOpen] = useState(false);

  /** OC members watching each model, summed across intent tiers. */
  const demandByModel = useMemo(() => {
    const counts: Record<string, number> = {};
    (demand.data ?? []).forEach((row) => {
      counts[row.model] = (counts[row.model] ?? 0) + row.watchers;
    });
    return counts;
  }, [demand.data]);

  /** Live community listings per model. */
  const listingsByModel = useMemo(() => {
    const counts: Record<string, number> = {};
    (marketplace.data ?? []).forEach((listing) => {
      counts[listing.model] = (counts[listing.model] ?? 0) + 1;
    });
    return counts;
  }, [marketplace.data]);

  const handleRemove = async (entry: ProBrokerWatchlistEntry) => {
    if (!window.confirm(`Remove ${entryLabel(entry)} from your watchlist?`)) return;
    await removeFromMyWatchlist(entry.id);
    void watchlist.refresh();
  };

  const entries = watchlist.data ?? [];

  /* ---------------------------------------------------------------- */
  /* Card view                                                        */
  /* ---------------------------------------------------------------- */

  const cardView = (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {entries.map((entry) => {
        const watching = demandByModel[entry.model] ?? 0;
        const listings = listingsByModel[entry.model] ?? 0;
        const range = yearRange(entry);
        return (
          <div
            key={entry.id}
            className="bg-background rounded-2xl overflow-hidden border border-border/80 hover:border-border hover:bg-muted/20 transition-all duration-300"
          >
            <div className="flex gap-4 p-4">
              <VehiclePhoto
                src={entry.image_url}
                colourHex={null}
                makeName={entry.variant?.make?.name ?? null}
                alt={entryLabel(entry)}
                className="w-32 h-24 rounded-xl flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-xl">{entryLabel(entry)}</h3>
                  <button
                    onClick={() => handleRemove(entry)}
                    className="text-muted-foreground/70 hover:text-red-500 transition-colors flex-shrink-0"
                    title="Remove from watchlist"
                    aria-label={`Remove ${entryLabel(entry)} from watchlist`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2 flex-wrap">
                  {range && <span>{range}</span>}
                  {range && entry.max_price !== null && <span>•</span>}
                  {entry.max_price !== null && <span>up to {formatZAR(entry.max_price)}</span>}
                  <span>•</span>
                  <span>added {formatRelativeDate(entry.created_at)}</span>
                </div>
                {entry.notes && (
                  <p className="text-sm text-muted-foreground mb-2">{entry.notes}</p>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1.5 bg-muted/40 px-3 py-1 rounded-full text-sm text-muted-foreground whitespace-nowrap">
                    <Eye size={14} />
                    {demand.loading ? "…" : `${watching} OC members watching`}
                  </span>
                  <span
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                      listings > 0
                        ? "bg-primary text-primary-foreground font-medium"
                        : "bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    <Store size={14} />
                    {marketplace.loading
                      ? "…"
                      : listings > 0
                        ? `${listings} on the marketplace now`
                        : "No live listings"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  /* ---------------------------------------------------------------- */
  /* Table view                                                       */
  /* ---------------------------------------------------------------- */

  const tableView = (
    <TableShell
      headers={["Vehicle", "Years", "Max price", "OC demand", "Marketplace", "Notes", "Added", ""]}
    >
      {entries.map((entry) => {
        const watching = demandByModel[entry.model] ?? 0;
        const listings = listingsByModel[entry.model] ?? 0;
        return (
          <TableRow key={entry.id}>
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <VehiclePhoto
                  src={entry.image_url}
                  colourHex={null}
                  makeName={entry.variant?.make?.name ?? null}
                  alt={entryLabel(entry)}
                  className="w-16 h-11 rounded-lg shrink-0"
                />
                <span className="font-medium whitespace-nowrap">{entryLabel(entry)}</span>
              </div>
            </td>
            <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
              {yearRange(entry) ?? "Any"}
            </td>
            <td className="px-6 py-4 text-sm whitespace-nowrap">
              {entry.max_price !== null ? formatZAR(entry.max_price) : "—"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Eye size={14} />
                {demand.loading ? "…" : `${watching} watching`}
              </span>
            </td>
            <td className="px-6 py-4">
              {marketplace.loading ? (
                <span className="text-sm text-muted-foreground">…</span>
              ) : listings > 0 ? (
                <span className="bg-primary text-primary-foreground font-medium px-3 py-1 rounded-full text-xs whitespace-nowrap">
                  {listings} live
                </span>
              ) : (
                <span className="text-sm text-muted-foreground/70">—</span>
              )}
            </td>
            <td className="px-6 py-4 text-sm text-muted-foreground max-w-[260px]">
              {entry.notes ?? "—"}
            </td>
            <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
              {formatRelativeDate(entry.created_at)}
            </td>
            <td className="px-6 py-4">
              <button
                onClick={() => handleRemove(entry)}
                className="text-muted-foreground/70 hover:text-red-500 transition-colors"
                title="Remove from watchlist"
                aria-label={`Remove ${entryLabel(entry)} from watchlist`}
              >
                <Trash2 size={18} />
              </button>
            </td>
          </TableRow>
        );
      })}
    </TableShell>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight mb-2">My Watchlist</h1>
          <p className="text-muted-foreground">
            {entries.length} tracked {entries.length === 1 ? "vehicle" : "vehicles"} • matched
            against community demand and listings
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ViewToggle />
          <button
            onClick={() => setAddOpen(true)}
            className="bg-primary text-primary-foreground font-medium px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <Plus size={20} />
            Add Vehicle
          </button>
        </div>
      </div>

      {watchlist.error ? (
        <ErrorPanel message={watchlist.error} />
      ) : watchlist.loading ? (
        <LoadingPanel rows={3} />
      ) : entries.length === 0 ? (
        <EmptyPanel
          title="Nothing on your watchlist"
          body="Add the vehicles you're hunting for and we'll surface matching community listings and demand."
          action={
            <button
              onClick={() => setAddOpen(true)}
              className="bg-primary text-primary-foreground font-medium px-6 py-3 rounded-xl inline-flex items-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <Plus size={20} />
              Add your first vehicle
            </button>
          }
        />
      ) : viewMode === "grid" ? (
        cardView
      ) : (
        tableView
      )}

      <WatchlistDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSaved={() => void watchlist.refresh()}
      />
    </div>
  );
}
