/**
 * MY CLIENTS — the broker's private client book.
 *
 * Client details, the vehicles of theirs the broker manages, and brand preferences.
 * Client PII is private to this broker: nothing on this page is ever exposed to the
 * community side. Rebuilt from the mock clients page onto the OC Pro seam, preserving the
 * original table layout; the Black Book vehicles now live against each client here.
 */

import { useMemo, useState } from "react";
import { Mail, Pencil, Phone, Plus, Search } from "lucide-react";
import type { ProClient, ProClientEntry } from "../pro/types";
import { fetchClients } from "../pro/api";
import { useAsyncData } from "../pro/use-async-data";
import { useProViewMode } from "../pro/view-mode";
import { formatZAR } from "../pro/format";
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
import { ClientDialog } from "../components/pro/client-dialog";
import { VehicleDialog } from "../components/pro/vehicle-dialog";

export function Clients() {
  const clients = useAsyncData(fetchClients);
  const { viewMode } = useProViewMode();

  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ProClient | null>(null);
  const [addVehicleFor, setAddVehicleFor] = useState<ProClient | null>(null);

  const filtered = useMemo(() => {
    const entries = clients.data ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((entry) => {
      const haystack = [
        entry.client.first_name,
        entry.client.last_name,
        entry.client.email,
        ...entry.client.preferences.map((p) => `${p.make_name} ${p.model_name ?? ""}`),
        ...entry.vehicles.map((v) => `${v.variant?.make?.name ?? ""} ${v.variant?.name ?? ""}`),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [clients.data, query]);

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (client: ProClient) => {
    setEditing(client);
    setDialogOpen(true);
  };

  const entries = clients.data ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight mb-2">My Clients</h1>
          <p className="text-muted-foreground">
            {entries.length} clients • private to you, never shown to the community
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ViewToggle />
          <button
            onClick={openAdd}
            className="bg-primary text-primary-foreground font-medium px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <Plus size={20} />
            Add Client
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" size={20} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search clients by name, email, vehicles, or preferences..."
          className="w-full bg-muted/30 border border-border/80 rounded-xl pl-10 pr-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring/60 transition-colors"
        />
      </div>

      {/* Clients table */}
      {clients.error ? (
        <ErrorPanel message={clients.error} />
      ) : clients.loading ? (
        <LoadingPanel rows={4} />
      ) : filtered.length === 0 ? (
        <EmptyPanel
          title={query ? "No clients match" : "No clients yet"}
          body={
            query
              ? "Try a different search."
              : "Add your first client to start building your book."
          }
        />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map(({ client, vehicles }: ProClientEntry) => (
            <div
              key={client.id}
              className="bg-background rounded-2xl border border-border/80 hover:border-border hover:bg-muted/20 transition-all duration-300 p-5 flex flex-col gap-4"
            >
              {/* Identity */}
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 shrink-0 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                  {client.first_name[0]}
                  {client.last_name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg leading-tight">
                    {client.first_name} {client.last_name}
                  </h3>
                  {client.notes && (
                    <p className="text-xs text-muted-foreground mt-0.5">{client.notes}</p>
                  )}
                </div>
                <button
                  onClick={() => openEdit(client)}
                  className="bg-muted/50 p-2 rounded-lg hover:bg-muted transition-colors shrink-0"
                  title="Edit client"
                  aria-label={`Edit ${client.first_name} ${client.last_name}`}
                >
                  <Pencil size={16} />
                </button>
              </div>

              {/* Contact */}
              <div className="space-y-1 text-sm">
                {client.email && (
                  <a
                    href={`mailto:${client.email}`}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Mail size={14} />
                    <span className="truncate">{client.email}</span>
                  </a>
                )}
                {client.cell_number && (
                  <a
                    href={`tel:${client.cell_number.replace(/\s/g, "")}`}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Phone size={14} />
                    <span>{client.cell_number}</span>
                  </a>
                )}
              </div>

              {/* Vehicles owned */}
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5">
                  Vehicles owned
                </p>
                {vehicles.length === 0 ? (
                  <p className="text-sm text-muted-foreground/70">None captured</p>
                ) : (
                  <ul className="space-y-2">
                    {vehicles.map((vehicle) => (
                      <li key={vehicle.id} className="text-sm flex items-center gap-2.5">
                        <VehiclePhoto
                          src={vehicle.images[0] ?? null}
                          colourHex={vehicle.colour_hex}
                          makeName={vehicle.variant?.make?.name ?? null}
                          alt={`${vehicle.year ?? ""} ${vehicle.variant?.make?.name ?? ""} ${vehicle.variant?.name ?? vehicle.model}`.trim()}
                          className="w-14 h-10 rounded-md shrink-0"
                        />
                        <span className="min-w-0">
                        <span className="block">
                          {vehicle.year} {vehicle.variant?.make?.name}{" "}
                          {vehicle.variant?.name ?? vehicle.model}
                        </span>
                        <span className="flex items-center gap-2 text-xs text-muted-foreground">
                          {vehicle.market_value !== null && (
                            <span>{formatZAR(vehicle.market_value)}</span>
                          )}
                          <IntentBadge kind="supply" value={vehicle.supply_intent} />
                        </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  onClick={() => setAddVehicleFor(client)}
                  className="mt-2 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  <Plus size={12} />
                  Add vehicle
                </button>
              </div>

              {/* Preferences */}
              <div className="mt-auto">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5">
                  Brand preferences
                </p>
                {client.preferences.length === 0 ? (
                  <p className="text-sm text-muted-foreground/70">—</p>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {client.preferences.map((pref) => (
                      <span
                        key={`${pref.make}-${pref.model ?? "any"}`}
                        className="bg-muted/40 px-2 py-1 rounded-lg text-xs"
                      >
                        {pref.make_name}
                        {pref.model_name ? ` ${pref.model_name}` : ""}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <TableShell
          headers={["Client", "Contact", "Vehicles Owned", "Brand Preferences", "Actions"]}
        >
          {filtered.map(({ client, vehicles }: ProClientEntry) => (
            <TableRow key={client.id}>
              <td className="px-6 py-4 align-top">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                    {client.first_name[0]}
                    {client.last_name[0]}
                  </div>
                  <div>
                    <span className="font-medium block whitespace-nowrap">
                      {client.first_name} {client.last_name}
                    </span>
                    {client.notes && (
                      <span className="text-xs text-muted-foreground block max-w-[200px]">
                        {client.notes}
                      </span>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 align-top">
                <div className="space-y-1 text-sm">
                  {client.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail size={14} />
                      <span>{client.email}</span>
                    </div>
                  )}
                  {client.cell_number && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone size={14} />
                      <span className="whitespace-nowrap">{client.cell_number}</span>
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 align-top">
                {vehicles.length === 0 ? (
                  <span className="text-sm text-muted-foreground/70">None captured</span>
                ) : (
                  <div className="space-y-2">
                    {vehicles.map((vehicle) => (
                      <div key={vehicle.id} className="text-sm flex items-center gap-2.5">
                        <VehiclePhoto
                          src={vehicle.images[0] ?? null}
                          colourHex={vehicle.colour_hex}
                          makeName={vehicle.variant?.make?.name ?? null}
                          alt={`${vehicle.year ?? ""} ${vehicle.variant?.make?.name ?? ""} ${vehicle.variant?.name ?? vehicle.model}`.trim()}
                          className="w-14 h-10 rounded-md shrink-0"
                        />
                        <span className="min-w-0">
                        <span className="text-foreground/80 block">
                          {vehicle.year} {vehicle.variant?.make?.name}{" "}
                          {vehicle.variant?.name ?? vehicle.model}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-2">
                          {vehicle.market_value !== null && (
                            <span>{formatZAR(vehicle.market_value)}</span>
                          )}
                          <IntentBadge kind="supply" value={vehicle.supply_intent} />
                        </span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => setAddVehicleFor(client)}
                  className="mt-2 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  <Plus size={12} />
                  Add vehicle
                </button>
              </td>
              <td className="px-6 py-4 align-top">
                <div className="flex flex-wrap gap-1">
                  {client.preferences.length === 0 ? (
                    <span className="text-sm text-muted-foreground/70">—</span>
                  ) : (
                    client.preferences.map((pref) => (
                      <span
                        key={`${pref.make}-${pref.model ?? "any"}`}
                        className="bg-muted/40 px-2 py-1 rounded-lg text-xs transition-colors"
                      >
                        {pref.make_name}
                        {pref.model_name ? ` ${pref.model_name}` : ""}
                      </span>
                    ))
                  )}
                </div>
              </td>
              <td className="px-6 py-4 align-top">
                <div className="flex gap-2">
                  {client.email && (
                    <a
                      href={`mailto:${client.email}`}
                      className="bg-muted/50 p-2 rounded-lg hover:bg-muted transition-colors inline-flex"
                      title="Send email"
                      aria-label={`Email ${client.first_name}`}
                    >
                      <Mail size={16} />
                    </a>
                  )}
                  {client.cell_number && (
                    <a
                      href={`tel:${client.cell_number.replace(/\s/g, "")}`}
                      className="bg-muted/50 p-2 rounded-lg hover:bg-muted transition-colors inline-flex"
                      title="Call"
                      aria-label={`Call ${client.first_name}`}
                    >
                      <Phone size={16} />
                    </a>
                  )}
                  <button
                    onClick={() => openEdit(client)}
                    className="bg-muted/50 p-2 rounded-lg hover:bg-muted transition-colors"
                    title="Edit client"
                    aria-label={`Edit ${client.first_name}`}
                  >
                    <Pencil size={16} />
                  </button>
                </div>
              </td>
            </TableRow>
          ))}
        </TableShell>
      )}

      <ClientDialog
        open={dialogOpen}
        client={editing}
        onOpenChange={setDialogOpen}
        onSaved={() => void clients.refresh()}
      />
      <VehicleDialog
        open={addVehicleFor !== null}
        onOpenChange={(open) => {
          if (!open) setAddVehicleFor(null);
        }}
        source="black_book"
        clientId={addVehicleFor?.id}
        onSaved={() => void clients.refresh()}
      />
    </div>
  );
}
