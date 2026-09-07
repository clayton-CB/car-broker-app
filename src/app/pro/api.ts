/**
 * THE OC PRO DATA SEAM — React port of the Vue portal's `composables/useProApi.ts`.
 *
 * Every read and write in the broker portal goes through this file. No page or component
 * touches the dummy dataset directly, so wiring OC Pro to the live backend means editing
 * this file and nothing else.
 *
 * Each function returns `ApiResponse<T>` — the `{ data, error }` contract Supabase queries
 * produce — so the call sites already handle the shapes real queries return.
 *
 * TODO(engineering): apply the migrations drafted in owners-circle-web `docs/oc-pro-schema.sql`,
 * then replace each function body with the query named in its own TODO comment and delete
 * `dummy-data.ts`.
 */

import type {
  ApiResponse,
  ProBrokerWatchlistEntry,
  ProClient,
  ProClientEntry,
  ProGarageOverview,
  ProMarketplaceListing,
  ProShareSettings,
  ProVehicle,
  ProWatchlistDemand,
  SupplyIntent,
} from "./types";
import {
  DUMMY_BROKER_ID,
  DUMMY_DEMAND,
  photoUrl,
  photosFor,
  DUMMY_GARAGE_HISTORY,
  DUMMY_GARAGE_SIGNALS,
  DUMMY_MARKETPLACE,
} from "./dummy-data";
import { proStore } from "./store";

/** Simulated round-trip so loading states are exercised the same way they will be in production. */
const LATENCY_MS = 260;

const settle = <T,>(data: T): Promise<ApiResponse<T>> =>
  new Promise((resolve) => {
    setTimeout(() => resolve({ data, error: undefined }), LATENCY_MS);
  });

const fail = <T,>(message: string): ApiResponse<T> => ({
  data: undefined,
  error: { message },
});

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

const allVehicles = (): ProVehicle[] => {
  const { stock, blackBook } = proStore.getState();
  return [...stock, ...blackBook];
};

const findVehicle = (vehicleId: string): ProVehicle | undefined =>
  allVehicles().find((vehicle) => vehicle.id === vehicleId);

/* ------------------------------------------------------------------ */
/* My Garage                                                          */
/* ------------------------------------------------------------------ */

/**
 * The broker's own stock.
 *
 * TODO(engineering):
 *   supabase.from("broker_vehicles")
 *     .select("*, variant:car_model_variant(*, make:car_make(*), model:car_model(*))")
 *     .eq("broker_id", brokerId).eq("source", "stock").eq("active", true)
 */
export const fetchStock = (): Promise<ApiResponse<ProVehicle[]>> =>
  settle(proStore.getState().stock);

/**
 * Headline numbers, the value timeline, and the movement notes shown above the garage.
 *
 * `total_value` and `total_watchers` are derived from the live vehicle list rather than
 * hardcoded, so they stay correct as the broker edits stock during a demo.
 *
 * TODO(engineering): serve from a `broker-garage-overview-v1` edge function. History comes
 * from a monthly rollup of `car_pricing` against the broker's holdings; signals come from
 * comparing the current rollup against the previous one. Doing this client-side would mean
 * shipping every historical pricing row to the browser.
 */
export const fetchGarageOverview = (): Promise<ApiResponse<ProGarageOverview>> => {
  const vehicles = proStore.getState().stock;
  const totalValue = vehicles.reduce((sum, vehicle) => sum + (vehicle.market_value ?? 0), 0);
  const totalChange = vehicles.reduce(
    (sum, vehicle) => sum + (vehicle.market_value_change_30d ?? 0),
    0
  );

  const history = clone(DUMMY_GARAGE_HISTORY);
  if (history.length) {
    // Keep the timeline's final point consistent with the current stock list.
    history[history.length - 1] = { ...history[history.length - 1], value: totalValue };
  }

  return settle({
    total_value: totalValue,
    total_value_change_30d: totalChange,
    vehicle_count: vehicles.length,
    listed_count: vehicles.filter((vehicle) => vehicle.listed).length,
    total_watchers: vehicles.reduce((sum, vehicle) => sum + vehicle.watchers, 0),
    history,
    signals: clone(DUMMY_GARAGE_SIGNALS),
  });
};

/* ------------------------------------------------------------------ */
/* My Clients                                                         */
/* ------------------------------------------------------------------ */

/**
 * Every client joined to the vehicles of theirs the broker manages.
 *
 * TODO(engineering):
 *   supabase.from("broker_clients")
 *     .select("*, preferences:broker_client_preferences(*), vehicles:broker_vehicles(*)")
 *     .eq("broker_id", brokerId)
 */
export const fetchClients = (): Promise<ApiResponse<ProClientEntry[]>> => {
  const { clients, blackBook } = proStore.getState();
  const entries = clients.map((client) => ({
    client,
    vehicles: blackBook.filter((vehicle) => vehicle.client_id === client.id),
  }));
  return settle(entries);
};

/**
 * Creates or updates a client record.
 *
 * TODO(engineering): upsert `broker_clients` plus `broker_client_preferences`. Client PII
 * belongs to the broker who captured it — RLS must scope `broker_clients` to the owning
 * broker with no cross-broker read.
 */
export const saveClient = (
  input: Omit<ProClient, "id" | "broker_id" | "created_at"> & { id?: string }
): Promise<ApiResponse<ProClient>> => {
  const { clients } = proStore.getState();
  const existing = input.id ? clients.find((client) => client.id === input.id) : undefined;

  const client: ProClient = {
    id: existing?.id ?? `cli-${Math.random().toString(36).slice(2, 10)}`,
    broker_id: DUMMY_BROKER_ID,
    first_name: input.first_name,
    last_name: input.last_name,
    cell_number: input.cell_number ?? null,
    email: input.email ?? null,
    preferences: input.preferences ?? [],
    notes: input.notes ?? null,
    created_at: existing?.created_at ?? new Date().toISOString(),
  };

  proStore.setState({
    clients: existing
      ? clients.map((entry) => (entry.id === client.id ? client : entry))
      : [client, ...clients],
  });

  return settle(client);
};

/* ------------------------------------------------------------------ */
/* My Watchlist — the broker's own tracked vehicles                   */
/* ------------------------------------------------------------------ */

/** TODO(engineering): supabase.from("broker_watchlist").select(...).eq("broker_id", brokerId) */
export const fetchMyWatchlist = (): Promise<ApiResponse<ProBrokerWatchlistEntry[]>> =>
  settle(proStore.getState().myWatchlist);

/** TODO(engineering): supabase.from("broker_watchlist").insert({ ...entry, broker_id }) */
export const addToMyWatchlist = (
  input: Omit<ProBrokerWatchlistEntry, "id" | "broker_id" | "created_at" | "image_url">
): Promise<ApiResponse<ProBrokerWatchlistEntry>> => {
  const entry: ProBrokerWatchlistEntry = {
    id: `bwl-${Math.random().toString(36).slice(2, 10)}`,
    broker_id: DUMMY_BROKER_ID,
    model: input.model,
    variant: input.variant,
    image_url: photoUrl(input.model),
    year_from: input.year_from,
    year_to: input.year_to,
    max_price: input.max_price,
    notes: input.notes,
    created_at: new Date().toISOString(),
  };

  proStore.setState({ myWatchlist: [entry, ...proStore.getState().myWatchlist] });
  return settle(entry);
};

/** TODO(engineering): supabase.from("broker_watchlist").delete().eq("id", entryId) */
export const removeFromMyWatchlist = (entryId: string): Promise<ApiResponse<boolean>> => {
  proStore.setState({
    myWatchlist: proStore.getState().myWatchlist.filter((entry) => entry.id !== entryId),
  });
  return settle(true);
};

/* ------------------------------------------------------------------ */
/* Demand side                                                        */
/* ------------------------------------------------------------------ */

/**
 * Anonymised network demand, aggregated per variant and purchase intent.
 *
 * TODO(engineering): this MUST be served by a `broker-watchlist-demand-v1` edge function
 * guarded by a `requireBroker` check. RLS on `car_users_watchlist` scopes rows to their
 * owner, so a direct client query returns nothing — and loosening that policy would expose
 * buyer identities, which this portal must never receive. The function should return counts
 * only, and should suppress groups below a minimum cohort size so a single watcher on a
 * rare variant cannot be inferred.
 *
 * `matched_supply` is computed here against the broker's own book, which is correct to do
 * client-side: it is the broker's data, not the network's.
 */
export const fetchWatchlistDemand = (): Promise<ApiResponse<ProWatchlistDemand[]>> => {
  const supplyByModel = allVehicles().reduce<Record<string, number>>((counts, vehicle) => {
    counts[vehicle.model] = (counts[vehicle.model] ?? 0) + 1;
    return counts;
  }, {});

  const rows = clone(DUMMY_DEMAND).map((row) => ({
    ...row,
    matched_supply: supplyByModel[row.model] ?? 0,
  }));

  return settle(rows);
};

/**
 * Every listing on the OC Community Marketplace — other brokers, OC members, and the
 * broker's own listed vehicles reduced to the fields they chose to share.
 *
 * TODO(engineering): read from the `car_marketplace_public` view drafted in section 7 of
 * `docs/oc-pro-schema.sql`. Field redaction belongs in that view, NOT here — a client-side
 * filter still ships the hidden values to the browser. `applyShareSettings` below documents
 * the intended output shape and must be deleted on go-live.
 */
export const fetchMarketplace = (): Promise<ApiResponse<ProMarketplaceListing[]>> => {
  const own = allVehicles()
    .filter((vehicle) => vehicle.listed)
    .map((vehicle) => applyShareSettings(vehicle));

  const listings = [...own, ...clone(DUMMY_MARKETPLACE)].sort(
    (a, b) => new Date(b.listed_at).getTime() - new Date(a.listed_at).getTime()
  );

  return settle(listings);
};

/**
 * Reduces a broker vehicle to the public listing shape, dropping every field the broker
 * did not opt into sharing. Make, model and supply intent are always public — a listing
 * without them is not a listing.
 */
const applyShareSettings = (vehicle: ProVehicle): ProMarketplaceListing => {
  const shared = vehicle.share_settings;

  return {
    id: vehicle.id,
    model: vehicle.model,
    variant: vehicle.variant,
    seller_type: "broker",
    seller_name: "Your listing",
    supply_intent: vehicle.supply_intent,
    year: shared.year ? vehicle.year : null,
    mileage: shared.mileage ? vehicle.mileage : null,
    colour_name: shared.colour ? vehicle.colour_name : null,
    colour_hex: shared.colour ? vehicle.colour_hex : null,
    extras: shared.extras ? vehicle.extras : [],
    target_price: shared.target_price ? vehicle.target_price : null,
    images: shared.images ? vehicle.images : [],
    watchers: vehicle.watchers,
    listed_at: vehicle.created_at,
  };
};

/* ------------------------------------------------------------------ */
/* Vehicle writes                                                     */
/* ------------------------------------------------------------------ */

const replaceVehicle = (vehicleId: string, patch: Partial<ProVehicle>): boolean => {
  const { stock, blackBook } = proStore.getState();

  const stockIndex = stock.findIndex((vehicle) => vehicle.id === vehicleId);
  if (stockIndex !== -1) {
    proStore.setState({
      stock: stock.map((vehicle, i) => (i === stockIndex ? { ...vehicle, ...patch } : vehicle)),
    });
    return true;
  }

  const bookIndex = blackBook.findIndex((vehicle) => vehicle.id === vehicleId);
  if (bookIndex !== -1) {
    proStore.setState({
      blackBook: blackBook.map((vehicle, i) =>
        i === bookIndex ? { ...vehicle, ...patch } : vehicle
      ),
    });
    return true;
  }

  return false;
};

/**
 * TODO(engineering):
 *   supabase.from("broker_vehicles").update({ supply_intent }).eq("id", vehicleId)
 */
export const updateSupplyIntent = (
  vehicleId: string,
  supplyIntent: SupplyIntent
): Promise<ApiResponse<ProVehicle>> => {
  replaceVehicle(vehicleId, { supply_intent: supplyIntent });
  const updated = findVehicle(vehicleId);

  if (!updated) {
    return Promise.resolve(fail("Vehicle not found"));
  }

  return settle(updated);
};

/**
 * Publishes or unpublishes a vehicle on the OC Community Marketplace.
 *
 * TODO(engineering): upsert `car_marketplace` from the broker vehicle and set
 * `broker_vehicles.listed`. Keep both in one RPC so a listing can never outlive its vehicle.
 */
export const updateListing = (
  vehicleId: string,
  listed: boolean,
  shareSettings: ProShareSettings
): Promise<ApiResponse<ProVehicle>> => {
  replaceVehicle(vehicleId, { listed, share_settings: { ...shareSettings } });
  const updated = findVehicle(vehicleId);

  if (!updated) {
    return Promise.resolve(fail("Vehicle not found"));
  }

  return settle(updated);
};

/**
 * TODO(engineering): supabase.from("broker_vehicles").insert({ ...vehicle, broker_id })
 * after resolving make/model/variant through the shared vehicle hierarchy so OC Pro writes
 * into the same tables as the consumer app.
 */
export const createVehicle = (
  input: Partial<ProVehicle> & { model: string; source: ProVehicle["source"] }
): Promise<ApiResponse<ProVehicle>> => {
  const vehicle: ProVehicle = {
    id: `veh-${Math.random().toString(36).slice(2, 10)}`,
    broker_id: DUMMY_BROKER_ID,
    source: input.source,
    model: input.model,
    variant: input.variant ?? null,
    year: input.year ?? null,
    mileage: input.mileage ?? null,
    colour_name: input.colour_name ?? null,
    colour_hex: input.colour_hex ?? null,
    transmission: input.transmission ?? null,
    vin: input.vin ?? null,
    extras: input.extras ?? [],
    images: input.images ?? photosFor(input.model),
    acquisition_price: input.acquisition_price ?? null,
    acquired_at: input.acquired_at ?? null,
    target_price: input.target_price ?? null,
    market_value: input.market_value ?? null,
    market_value_change_30d: 0,
    supply_intent: input.supply_intent ?? "holding",
    listed: false,
    share_settings: {},
    watchers: 0,
    watchers_change_30d: 0,
    client_id: input.client_id ?? null,
    notes: input.notes ?? null,
    created_at: new Date().toISOString(),
  };

  if (vehicle.source === "stock") {
    proStore.setState({ stock: [vehicle, ...proStore.getState().stock] });
  } else {
    proStore.setState({ blackBook: [vehicle, ...proStore.getState().blackBook] });
  }

  return settle(vehicle);
};

/** TODO(engineering): supabase.from("broker_vehicles").update({ active: false }).eq("id", id) */
export const removeVehicle = (vehicleId: string): Promise<ApiResponse<boolean>> => {
  const { stock, blackBook } = proStore.getState();
  proStore.setState({
    stock: stock.filter((vehicle) => vehicle.id !== vehicleId),
    blackBook: blackBook.filter((vehicle) => vehicle.id !== vehicleId),
  });
  return settle(true);
};

/** Links a Black Book vehicle to its owning client. */
export const linkVehicleToClient = (
  vehicleId: string,
  clientId: string | null
): Promise<ApiResponse<boolean>> => {
  replaceVehicle(vehicleId, { client_id: clientId });
  return settle(true);
};
