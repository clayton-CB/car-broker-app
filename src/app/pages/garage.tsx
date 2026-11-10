/**
 * MY GARAGE — the broker's own stock.
 *
 * Value timeline, movement signals, KPI tiles, and a filterable stock list where each
 * vehicle carries a supply-intent selector and a marketplace share control. Migrated from
 * the Vue portal's `/pro/garage`.
 *
 * Renders as cards or as a dense table per the shared view preference. In table mode the
 * table takes the full width and the Movement panel drops beneath it, because a dense table
 * squeezed into two thirds of the page defeats the point of choosing it.
 */

import { useCallback, useMemo, useState } from "react";
import { Eye, Plus, Search, TrendingDown, TrendingUp, Trash2 } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import type { ProGarageSignal, ProVehicle, SupplyIntent } from "../pro/types";
import { SUPPLY_INTENT_OPTIONS } from "../pro/types";
import { fetchGarageOverview, fetchStock, removeVehicle, updateSupplyIntent } from "../pro/api";
import { useAsyncData } from "../pro/use-async-data";
import { useProViewMode } from "../pro/view-mode";
import { formatZAR, formatZARCompact, formatZARDelta } from "../pro/format";
import {
  EmptyPanel,
  ErrorPanel,
  LoadingPanel,
  StatTile,
  TableRow,
  TableShell,
  VehiclePhoto,
} from "../components/pro/primitives";
import { ViewToggle } from "../components/pro/view-toggle";
import { VehicleDialog } from "../components/pro/vehicle-dialog";
import { ShareDialog } from "../components/pro/share-dialog";

const monthLabel = (iso: string) =>
  new Date(iso).toLocaleDateString("en-ZA", { month: "short" });

const vehicleLabel = (vehicle: ProVehicle) =>
  `${vehicle.variant?.make?.name ?? ""} ${vehicle.variant?.name ?? vehicle.model}`.trim();

const intentSelectClass =
  "bg-muted/40 border border-border/80 rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-ring/60 transition-colors";

function SignalRow({ signal }: { signal: ProGarageSignal }) {
  const positive = signal.kind === "value_up" || signal.kind === "demand_up";
  const isValue = signal.kind === "value_up" || signal.kind === "value_down";
  return (
    <li className="flex items-start gap-3 py-3 border-b border-border/60 last:border-b-0">
      <span className={positive ? "text-[#1fb85a]" : "text-red-500"}>
        {isValue ? (
          positive ? <TrendingUp size={18} /> : <TrendingDown size={18} />
        ) : (
          <Eye size={18} />
        )}
      </span>
      <span className="min-w-0">
        <span className="block text-sm">{signal.vehicle_label}</span>
        <span className={`block text-sm ${positive ? "text-[#1fb85a]" : "text-red-500"}`}>
          {signal.summary}
        </span>
      </span>
    </li>
  );
}

export function Garage() {
  const stock = useAsyncData(fetchStock);
  const overview = useAsyncData(fetchGarageOverview);
  const { viewMode } = useProViewMode();

  const [query, setQuery] = useState("");
  const [intentFilter, setIntentFilter] = useState<SupplyIntent | "all">("all");
  const [addOpen, setAddOpen] = useState(false);
  const [shareVehicle, setShareVehicle] = useState<ProVehicle | null>(null);

  const refreshAll = useCallback(() => {
    void stock.refresh();
    void overview.refresh();
  }, [stock.refresh, overview.refresh]);

  const filtered = useMemo(() => {
    const vehicles = stock.data ?? [];
    const q = query.trim().toLowerCase();
    return vehicles.filter((vehicle) => {
      if (intentFilter !== "all" && vehicle.supply_intent !== intentFilter) return false;
      if (!q) return true;
      const haystack = [
        vehicle.variant?.make?.name,
        vehicle.variant?.name,
        vehicle.colour_name,
        vehicle.year?.toString(),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [stock.data, query, intentFilter]);

  const handleIntentChange = async (vehicleId: string, intent: SupplyIntent) => {
    await updateSupplyIntent(vehicleId, intent);
    refreshAll();
  };

  const handleRemove = async (vehicle: ProVehicle) => {
    if (!window.confirm(`Remove ${vehicleLabel(vehicle)} from your garage?`)) return;
    await removeVehicle(vehicle.id);
    refreshAll();
  };

  const ov = overview.data;

  const movementPanel = (
    <div
      className={`bg-background rounded-2xl border border-border/80 p-6 transition-colors ${
        viewMode === "grid" ? "sticky top-24" : ""
      }`}
    >
      <h2 className="text-xl mb-2">Movement</h2>
      <p className="text-sm text-muted-foreground mb-2">
        Valuation and demand changes across your stock.
      </p>
      {overview.loading ? (
        <div
          className="h-40 bg-muted/20 rounded-xl animate-pulse"
          role="status"
          aria-label="Loading"
        />
      ) : ov && ov.signals.length > 0 ? (
        <ul className={viewMode === "table" ? "grid gap-x-8 md:grid-cols-2 xl:grid-cols-4" : ""}>
          {ov.signals.map((signal) => (
            <SignalRow key={signal.id} signal={signal} />
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No movement in the last 30 days.</p>
      )}
    </div>
  );

  const emptyState = (
    <EmptyPanel
      title={query || intentFilter !== "all" ? "No vehicles match" : "Your garage is empty"}
      body={
        query || intentFilter !== "all"
          ? "Try a different search or intent filter."
          : "Add your first vehicle to start tracking its value and demand."
      }
    />
  );

  /* ---------------------------------------------------------------- */
  /* Card view                                                        */
  /* ---------------------------------------------------------------- */

  const cardView = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {filtered.map((vehicle) => (
        <div
          key={vehicle.id}
          className="bg-background rounded-2xl overflow-hidden border border-border/80 hover:border-border hover:bg-muted/20 transition-all duration-300 flex flex-col"
        >
          <div className="relative">
            <VehiclePhoto
              src={vehicle.images[0] ?? null}
              colourHex={vehicle.colour_hex}
              makeName={vehicle.variant?.make?.name ?? null}
              alt={`${vehicle.year ?? ""} ${vehicleLabel(vehicle)}`.trim()}
              className="h-44 w-full"
            />
            <button
              onClick={() => handleRemove(vehicle)}
              className="absolute top-3 right-3 rounded-lg bg-black/55 backdrop-blur-sm p-2 text-white/80 hover:text-red-400 transition-colors"
              title="Remove vehicle"
              aria-label={`Remove ${vehicleLabel(vehicle)}`}
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div className="p-4 flex-1 flex flex-col gap-2">
            <h3 className="text-lg leading-tight">
              {vehicle.year} {vehicleLabel(vehicle)}
            </h3>

            <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
              {vehicle.mileage !== null && <span>{vehicle.mileage.toLocaleString()} km</span>}
              {vehicle.mileage !== null && vehicle.colour_name && <span>•</span>}
              {vehicle.colour_name && <span>{vehicle.colour_name}</span>}
              <span>•</span>
              <span className="flex items-center gap-1">
                <Eye size={14} />
                {vehicle.watchers}
                {vehicle.watchers_change_30d !== 0 && (
                  <span
                    className={
                      vehicle.watchers_change_30d > 0 ? "text-[#1fb85a]" : "text-red-500"
                    }
                  >
                    ({vehicle.watchers_change_30d > 0 ? "+" : ""}
                    {vehicle.watchers_change_30d})
                  </span>
                )}
              </span>
            </div>

            <div>
              <p className="text-2xl text-[#1fb85a]">
                {vehicle.market_value !== null ? formatZAR(vehicle.market_value) : "—"}
              </p>
              {vehicle.market_value_change_30d !== null &&
                vehicle.market_value_change_30d !== 0 && (
                  <p
                    className={`text-sm ${
                      vehicle.market_value_change_30d > 0 ? "text-[#1fb85a]" : "text-red-500"
                    }`}
                  >
                    {formatZARDelta(vehicle.market_value_change_30d)} / 30d
                  </p>
                )}
            </div>

            <div className="mt-auto pt-2 flex items-center gap-2 flex-wrap">
              <select
                aria-label={`Supply intent for ${vehicleLabel(vehicle)}`}
                value={vehicle.supply_intent}
                onChange={(e) => handleIntentChange(vehicle.id, e.target.value as SupplyIntent)}
                className={intentSelectClass}
              >
                {SUPPLY_INTENT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShareVehicle(vehicle)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  vehicle.listed
                    ? "bg-primary text-primary-foreground font-medium hover:bg-primary/90"
                    : "bg-muted/50 border border-transparent hover:bg-muted"
                }`}
              >
                {vehicle.listed ? "Listed ✓" : "Share…"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  /* ---------------------------------------------------------------- */
  /* Table view                                                       */
  /* ---------------------------------------------------------------- */

  const tableView = (
    <TableShell
      headers={[
        "Vehicle",
        "Year",
        "Mileage",
        "Colour",
        "Market value",
        "Watchers",
        "Supply intent",
        "Marketplace",
        "",
      ]}
    >
      {filtered.map((vehicle) => (
        <TableRow key={vehicle.id}>
          <td className="px-6 py-4">
            <div className="flex items-center gap-3">
              <VehiclePhoto
                src={vehicle.images[0] ?? null}
                colourHex={vehicle.colour_hex}
                makeName={vehicle.variant?.make?.name ?? null}
                alt={`${vehicle.year ?? ""} ${vehicleLabel(vehicle)}`.trim()}
                className="w-16 h-11 rounded-lg shrink-0"
              />
              <span className="font-medium whitespace-nowrap">{vehicleLabel(vehicle)}</span>
            </div>
          </td>
          <td className="px-6 py-4 text-sm text-muted-foreground">{vehicle.year ?? "—"}</td>
          <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
            {vehicle.mileage !== null ? `${vehicle.mileage.toLocaleString()} km` : "—"}
          </td>
          <td className="px-6 py-4">
            <span className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
              {vehicle.colour_hex && (
                <span
                  className="w-3 h-3 rounded-full border border-border/80 shrink-0"
                  style={{ backgroundColor: vehicle.colour_hex }}
                  aria-hidden="true"
                />
              )}
              {vehicle.colour_name ?? "—"}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className="text-[#1fb85a]">
              {vehicle.market_value !== null ? formatZAR(vehicle.market_value) : "—"}
            </span>
            {vehicle.market_value_change_30d !== null &&
              vehicle.market_value_change_30d !== 0 && (
                <span
                  className={`block text-xs ${
                    vehicle.market_value_change_30d > 0 ? "text-[#1fb85a]" : "text-red-500"
                  }`}
                >
                  {formatZARDelta(vehicle.market_value_change_30d)} / 30d
                </span>
              )}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            {vehicle.watchers}
            {vehicle.watchers_change_30d !== 0 && (
              <span
                className={`ml-2 text-xs ${
                  vehicle.watchers_change_30d > 0 ? "text-[#1fb85a]" : "text-red-500"
                }`}
              >
                {vehicle.watchers_change_30d > 0 ? "+" : ""}
                {vehicle.watchers_change_30d}
              </span>
            )}
          </td>
          <td className="px-6 py-4">
            <select
              aria-label={`Supply intent for ${vehicleLabel(vehicle)}`}
              value={vehicle.supply_intent}
              onChange={(e) => handleIntentChange(vehicle.id, e.target.value as SupplyIntent)}
              className={intentSelectClass}
            >
              {SUPPLY_INTENT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </td>
          <td className="px-6 py-4">
            <button
              onClick={() => setShareVehicle(vehicle)}
              className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                vehicle.listed
                  ? "bg-primary text-primary-foreground font-medium hover:bg-primary/90"
                  : "bg-muted/50 border border-transparent hover:bg-muted"
              }`}
            >
              {vehicle.listed ? "Listed ✓" : "Share…"}
            </button>
          </td>
          <td className="px-6 py-4">
            <button
              onClick={() => handleRemove(vehicle)}
              className="text-muted-foreground/70 hover:text-red-500 transition-colors"
              title="Remove vehicle"
              aria-label={`Remove ${vehicleLabel(vehicle)}`}
            >
              <Trash2 size={18} />
            </button>
          </td>
        </TableRow>
      ))}
    </TableShell>
  );

  const stockContent = stock.error ? (
    <ErrorPanel message={stock.error} />
  ) : stock.loading ? (
    <LoadingPanel rows={4} />
  ) : filtered.length === 0 ? (
    emptyState
  ) : viewMode === "grid" ? (
    cardView
  ) : (
    tableView
  );

  return (
    <div className="space-y-6">
      {/* Header with value trend */}
      <div className="flex items-center justify-between gap-6 flex-wrap">
        <div className="flex-shrink-0">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">My Garage</h1>
          <p className="text-muted-foreground">
            {ov
              ? `${ov.vehicle_count} vehicles • Total value: ${formatZARCompact(ov.total_value)}`
              : "Your stock and mandated vehicles"}
          </p>
        </div>

        {ov && ov.history.length > 0 && (
          <div className="flex-1 bg-background border border-border/80 rounded-2xl p-4 min-w-[250px] max-w-[500px] transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Garage Value Trend</span>
              <div
                className={`flex items-center gap-1 text-sm ${
                  ov.total_value_change_30d >= 0 ? "text-[#1fb85a]" : "text-red-500"
                }`}
              >
                {ov.total_value_change_30d >= 0 ? (
                  <TrendingUp size={16} />
                ) : (
                  <TrendingDown size={16} />
                )}
                <span>{formatZARDelta(ov.total_value_change_30d)} / 30d</span>
              </div>
            </div>
            <div style={{ width: "100%", height: "80px" }}>
              <ResponsiveContainer>
                <LineChart
                  data={ov.history.map((point) => ({
                    month: monthLabel(point.date),
                    value: Number((point.value / 1000000).toFixed(2)),
                  }))}
                >
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#1fb85a"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(240 10% 3.9%)",
                      border: "1px solid hsl(220 16.67% 12.06%)",
                      borderRadius: "12px",
                      color: "hsl(0 0% 98%)",
                    }}
                    formatter={(value: number) => [`R ${value}m`, "Value"]}
                    labelStyle={{ color: "hsl(220 10.67% 50.06%)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <button
          onClick={() => setAddOpen(true)}
          className="flex-shrink-0 bg-primary text-primary-foreground font-medium px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-colors"
        >
          <Plus size={20} />
          Add Vehicle
        </button>
      </div>

      {/* KPI tiles */}
      {ov && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatTile
            label="Total value"
            value={formatZARCompact(ov.total_value)}
            delta={{
              text: `${formatZARDelta(ov.total_value_change_30d)} / 30d`,
              positive: ov.total_value_change_30d >= 0,
            }}
          />
          <StatTile
            label="Vehicles"
            value={`${ov.vehicle_count}`}
            sub={`${ov.listed_count} listed`}
          />
          <StatTile
            label="Network watchers"
            value={`${ov.total_watchers}`}
            sub="across your stock"
          />
          <StatTile
            label="Listed to marketplace"
            value={`${ov.listed_count} / ${ov.vehicle_count}`}
            sub="community can see these"
          />
        </div>
      )}

      {/* Search, intent filter, view toggle */}
      <div className="flex gap-4 flex-wrap items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70"
            size={20}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by make, model, colour, or year..."
            className="w-full bg-muted/30 border border-border/80 rounded-xl pl-10 pr-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring/60 transition-colors"
          />
        </div>
        <select
          aria-label="Filter by supply intent"
          value={intentFilter}
          onChange={(e) => setIntentFilter(e.target.value as SupplyIntent | "all")}
          className="bg-muted/30 border border-border/80 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-ring/60 transition-colors"
        >
          <option value="all">All intents</option>
          {SUPPLY_INTENT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ViewToggle />
      </div>

      {/* Stock + movement */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">{stockContent}</div>
          <div className="lg:col-span-1">{movementPanel}</div>
        </div>
      ) : (
        <div className="space-y-6">
          {stockContent}
          {movementPanel}
        </div>
      )}

      <VehicleDialog open={addOpen} onOpenChange={setAddOpen} source="stock" onSaved={refreshAll} />
      <ShareDialog
        vehicle={shareVehicle}
        onOpenChange={(open) => {
          if (!open) setShareVehicle(null);
        }}
        onSaved={refreshAll}
      />
    </div>
  );
}
