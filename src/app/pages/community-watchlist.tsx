/**
 * COMMUNITY WATCHLIST — anonymised network demand.
 *
 * One row per variant per purchase-intent tier. Deliberately carries no user identity of
 * any kind: brokers see counts, never people. In production this is served by a
 * broker-gated edge function that suppresses small cohorts — see the seam's TODO.
 * Migrated from the Vue portal's `/pro/watchlist`.
 */

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { ProWatchlistDemand, PurchaseIntent } from "../pro/types";
import { PURCHASE_INTENT_OPTIONS } from "../pro/types";
import { fetchWatchlistDemand } from "../pro/api";
import { useAsyncData } from "../pro/use-async-data";
import { useProViewMode } from "../pro/view-mode";
import { formatZARCompact, formatRelativeDate } from "../pro/format";
import {
  EmptyPanel,
  ErrorPanel,
  IntentBadge,
  LoadingPanel,
  TableRow,
  TableShell,
  VehiclePhoto,
} from "../components/pro/primitives";
import { ViewToggle } from "../components/pro/view-toggle";

type SortKey = "volume" | "growth" | "value" | "recency";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "volume", label: "Most watched" },
  { value: "growth", label: "Fastest growing" },
  { value: "value", label: "Highest value" },
  { value: "recency", label: "Most recent" },
];

const sortRows = (rows: ProWatchlistDemand[], key: SortKey): ProWatchlistDemand[] => {
  const sorted = [...rows];
  switch (key) {
    case "volume":
      return sorted.sort((a, b) => b.watchers - a.watchers);
    case "growth":
      return sorted.sort((a, b) => b.watchers_change_30d - a.watchers_change_30d);
    case "value":
      return sorted.sort((a, b) => (b.average_value ?? 0) - (a.average_value ?? 0));
    case "recency":
      return sorted.sort(
        (a, b) => new Date(b.last_added_at).getTime() - new Date(a.last_added_at).getTime()
      );
  }
};

export function CommunityWatchlist() {
  const demand = useAsyncData(fetchWatchlistDemand);
  const { viewMode } = useProViewMode();

  const [query, setQuery] = useState("");
  const [intentFilter, setIntentFilter] = useState<PurchaseIntent | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("volume");
  const [onlySupplied, setOnlySupplied] = useState(false);

  const rows = useMemo(() => {
    const all = demand.data ?? [];
    const q = query.trim().toLowerCase();
    const filtered = all.filter((row) => {
      if (intentFilter !== "all" && row.purchase_intent !== intentFilter) return false;
      if (onlySupplied && row.matched_supply === 0) return false;
      if (!q) return true;
      const haystack = [row.variant?.make?.name, row.variant?.name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
    return sortRows(filtered, sortKey);
  }, [demand.data, query, intentFilter, sortKey, onlySupplied]);

  const totalWatchers = useMemo(
    () => (demand.data ?? []).reduce((sum, row) => sum + row.watchers, 0),
    [demand.data]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-medium tracking-tight mb-2">Community Watchlist</h1>
        <p className="text-muted-foreground">
          {demand.data
            ? `${totalWatchers} watchlist entries across ${demand.data.length} variant + intent groups`
            : "What the OC network is watching"}{" "}
          • aggregated and anonymous — you see demand, never identities
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by make or model..."
            className="w-full bg-muted/30 border border-border/80 rounded-xl pl-10 pr-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring/60 transition-colors"
          />
        </div>
        <select
          aria-label="Filter by purchase intent"
          value={intentFilter}
          onChange={(e) => setIntentFilter(e.target.value as PurchaseIntent | "all")}
          className="bg-muted/30 border border-border/80 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-ring/60 transition-colors"
        >
          <option value="all">All intents</option>
          {PURCHASE_INTENT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          aria-label="Sort demand"
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="bg-muted/30 border border-border/80 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-ring/60 transition-colors"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
          <input
            type="checkbox"
            checked={onlySupplied}
            onChange={(e) => setOnlySupplied(e.target.checked)}
            className="accent-[#1fb85a] w-4 h-4"
          />
          Only models I can supply
        </label>
        <ViewToggle />
      </div>

      {/* Demand table */}
      {demand.error ? (
        <ErrorPanel message={demand.error} />
      ) : demand.loading ? (
        <LoadingPanel rows={4} />
      ) : rows.length === 0 ? (
        <EmptyPanel
          title="No demand rows match"
          body={
            onlySupplied
              ? "Nothing you currently hold matches these filters — try switching off the supply filter."
              : "Try widening your search or clearing the filters."
          }
        />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {rows.map((row) => (
            <div
              key={row.id}
              className="bg-background rounded-2xl border border-border/80 hover:border-border hover:bg-muted/20 transition-all duration-300 overflow-hidden flex flex-col"
            >
              <VehiclePhoto
                src={row.image_url}
                colourHex={null}
                makeName={row.variant?.make?.name ?? null}
                alt={`${row.variant?.make?.name ?? ""} ${row.variant?.name ?? row.model}`.trim()}
                className="h-36 w-full"
              />
              <div className="p-5 flex flex-col gap-3 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg leading-tight">
                  {row.variant?.make?.name} {row.variant?.name ?? row.model}
                </h3>
                <IntentBadge kind="purchase" value={row.purchase_intent} />
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl">{row.watchers}</span>
                <span className="text-sm text-muted-foreground">watching</span>
                {row.watchers_change_30d !== 0 && (
                  <span
                    className={`text-sm whitespace-nowrap ${
                      row.watchers_change_30d > 0 ? "text-[#1fb85a]" : "text-red-500"
                    }`}
                  >
                    {row.watchers_change_30d > 0 ? "+" : ""}
                    {row.watchers_change_30d} / 30d
                  </span>
                )}
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">Years</dt>
                  <dd>
                    {row.year_from ?? "—"}–{row.year_to ?? "now"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Avg value</dt>
                  <dd>
                    {row.average_value !== null ? formatZARCompact(row.average_value) : "—"}
                  </dd>
                </div>
              </dl>

              <div className="mt-auto pt-2 flex items-center justify-between gap-2 flex-wrap">
                {row.matched_supply > 0 ? (
                  <span className="bg-primary text-primary-foreground font-medium px-3 py-1 rounded-full text-xs whitespace-nowrap">
                    You hold {row.matched_supply}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground/70">No matching supply</span>
                )}
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  last added {formatRelativeDate(row.last_added_at)}
                </span>
              </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <TableShell
          headers={[
            "Vehicle",
            "Intent",
            "Watchers",
            "Years",
            "Avg value",
            "Your supply",
            "Last added",
          ]}
        >
          {rows.map((row) => (
            <TableRow key={row.id}>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <VehiclePhoto
                    src={row.image_url}
                    colourHex={null}
                    makeName={row.variant?.make?.name ?? null}
                    alt={`${row.variant?.make?.name ?? ""} ${row.variant?.name ?? row.model}`.trim()}
                    className="w-16 h-11 rounded-lg shrink-0"
                  />
                  <span className="font-medium whitespace-nowrap">
                    {row.variant?.make?.name} {row.variant?.name ?? row.model}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <IntentBadge kind="purchase" value={row.purchase_intent} />
              </td>
              <td className="px-6 py-4">
                <span className="text-lg">{row.watchers}</span>
                {row.watchers_change_30d !== 0 && (
                  <span
                    className={`ml-2 text-sm whitespace-nowrap ${
                      row.watchers_change_30d > 0 ? "text-[#1fb85a]" : "text-red-500"
                    }`}
                  >
                    {row.watchers_change_30d > 0 ? "+" : ""}
                    {row.watchers_change_30d} / 30d
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                {row.year_from ?? "—"}–{row.year_to ?? "now"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {row.average_value !== null ? formatZARCompact(row.average_value) : "—"}
              </td>
              <td className="px-6 py-4">
                {row.matched_supply > 0 ? (
                  <span className="bg-primary text-primary-foreground font-medium px-3 py-1 rounded-full text-xs whitespace-nowrap">
                    You hold {row.matched_supply}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground/70">—</span>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                {formatRelativeDate(row.last_added_at)}
              </td>
            </TableRow>
          ))}
        </TableShell>
      )}
    </div>
  );
}
