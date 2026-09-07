/**
 * OC PRO (BROKER PORTAL) DOMAIN TYPES — React port.
 *
 * Migrated from the Vue portal's `types/pro.ts`. Field names match the proposed backing
 * tables in `docs/oc-pro-schema.sql` (owners-circle-web) one-for-one, so wiring this app to
 * the live Supabase backend means re-deriving these interfaces from generated database
 * types — the shapes will not change.
 *
 * The Vue file derived `CarMake` / `CarModel` / `CarModelVariant` from generated Supabase
 * types. This repo has no generated types yet, so the same shapes are declared standalone
 * below with the identical field lists.
 */

/* -------------------------------------------------------------------------- */
/* Vehicle hierarchy (mirrors car_make / car_model / car_model_variant)       */
/* -------------------------------------------------------------------------- */

export interface CarMake {
  id: string;
  name: string | null;
  slug: string;
}

export interface CarModel {
  create_at: string | null;
  id: string;
  make: string | null;
  name: string | null;
  slug: string;
}

export interface CarModelVariant {
  acceleration_0_100_kph: number | null;
  battery_size_kwh: number | null;
  body_style: string | null;
  created_at: string | null;
  description: string | null;
  doors: number | null;
  drive_type: string | null;
  engine_displacement: string | null;
  engine_power_hp: number | null;
  engine_power_kw: number | null;
  engine_size_l: string | null;
  engine_torque_nm: number | null;
  engine_type: string | null;
  freetext_search: string | null;
  fuel_type: string | null;
  history: string | null;
  id: string;
  kw_per_kg: number | null;
  /** Hydrated make, as the nested select in the consumer app returns it. */
  make: CarMake | null;
  /** Hydrated model. */
  model: CarModel | null;
  name: string | null;
  pricing_urls: string[] | null;
  production_years: number[] | null;
  seats: number | null;
  slug: string;
  top_speed_kph: number | null;
  transmission: string[] | null;
  weight_kg: number | null;
}

/* -------------------------------------------------------------------------- */
/* API contract                                                               */
/* -------------------------------------------------------------------------- */

/** Matches PostgrestError closely enough that live Supabase errors slot straight in. */
export interface ProApiError {
  message: string;
}

/** The `{ data, error }` contract every seam function returns. */
export interface ApiResponse<T, E extends ProApiError = ProApiError> {
  data: T | undefined;
  error: E | undefined;
}

/* -------------------------------------------------------------------------- */
/* Supply intent — how ready a broker is to part with a vehicle               */
/* -------------------------------------------------------------------------- */

export type SupplyIntent = "actively_selling" | "ready_to_sell" | "holding";

export interface SupplyIntentOption {
  value: SupplyIntent;
  label: string;
  description: string;
  /** Tailwind text colour used for the dot and label. */
  tone: string;
}

export const SUPPLY_INTENT_OPTIONS: SupplyIntentOption[] = [
  {
    value: "actively_selling",
    label: "Actively selling",
    description: "On the market now and being shopped to buyers.",
    tone: "text-green-500",
  },
  {
    value: "ready_to_sell",
    label: "Ready to sell",
    description: "Not advertised, but the right offer moves it.",
    tone: "text-amber-500",
  },
  {
    value: "holding",
    label: "Holding",
    description: "Held for appreciation or a client mandate.",
    tone: "text-muted-foreground",
  },
];

/* -------------------------------------------------------------------------- */
/* Purchase intent — how ready an end user is to buy                          */
/* -------------------------------------------------------------------------- */

export type PurchaseIntent = "buy_now" | "next_6_months" | "browsing";

export interface PurchaseIntentOption {
  value: PurchaseIntent;
  label: string;
  description: string;
  tone: string;
}

export const PURCHASE_INTENT_OPTIONS: PurchaseIntentOption[] = [
  {
    value: "buy_now",
    label: "Ready to purchase",
    description: "Looking to buy right now.",
    tone: "text-green-500",
  },
  {
    value: "next_6_months",
    label: "Next 6 months",
    description: "Buying within the next six months.",
    tone: "text-amber-500",
  },
  {
    value: "browsing",
    label: "Just browsing",
    description: "Following the model, no timeline.",
    tone: "text-muted-foreground",
  },
];

/* -------------------------------------------------------------------------- */
/* Vehicles                                                                   */
/* -------------------------------------------------------------------------- */

/** Where a vehicle in the broker's book physically sits. */
export type ProVehicleSource = "stock" | "black_book";

/**
 * Fields a broker can choose to expose when listing to the OC Community Marketplace.
 * Make and model are always shared — a listing without them is not a listing.
 */
export type ProShareableField =
  | "year"
  | "mileage"
  | "colour"
  | "extras"
  | "target_price"
  | "images";

export interface ProShareableFieldOption {
  value: ProShareableField;
  label: string;
  description: string;
}

export const PRO_SHAREABLE_FIELDS: ProShareableFieldOption[] = [
  { value: "images", label: "Photos", description: "Gallery images of the vehicle." },
  { value: "year", label: "Year", description: "Model year." },
  { value: "mileage", label: "Mileage", description: "Odometer reading." },
  { value: "colour", label: "Colour", description: "Exterior colour name." },
  { value: "extras", label: "Extras & options", description: "Specification and optional extras." },
  { value: "target_price", label: "Target price", description: "The price you are asking." },
];

/** Per-listing field visibility. Absent key is treated as not shared. */
export type ProShareSettings = Partial<Record<ProShareableField, boolean>>;

export interface ProVehicle {
  id: string;
  /** Owning broker. Maps to `profiles.id`. */
  broker_id: string;
  source: ProVehicleSource;
  /** `car_model_variant.slug` — the same vehicle hierarchy the consumer app uses. */
  model: string;
  /** Hydrated variant. */
  variant: CarModelVariant | null;
  year: number | null;
  mileage: number | null;
  colour_name: string | null;
  colour_hex: string | null;
  transmission: string | null;
  vin: string | null;
  extras: string[];
  images: string[];
  /** What the broker paid, in ZAR. Never exposed on the marketplace. */
  acquisition_price: number | null;
  acquired_at: string | null;
  /** What the broker is asking, in ZAR. */
  target_price: number | null;
  /** Latest OC valuation for the variant, in ZAR. */
  market_value: number | null;
  /** Movement in market value over the trailing 30 days, in ZAR. */
  market_value_change_30d: number | null;
  supply_intent: SupplyIntent;
  /** Whether this vehicle is published to the OC Community Marketplace. */
  listed: boolean;
  share_settings: ProShareSettings;
  /** Watchlist entries across the network matching this vehicle's variant. */
  watchers: number;
  /** Change in watcher count over the trailing 30 days. */
  watchers_change_30d: number;
  /** Black Book vehicles only — the client who owns the car. */
  client_id: string | null;
  notes: string | null;
  created_at: string;
}

/* -------------------------------------------------------------------------- */
/* Clients                                                                    */
/* -------------------------------------------------------------------------- */

export interface ProClientPreference {
  /** `car_make.slug` */
  make: string;
  make_name: string;
  /** `car_model.slug`, or null for "any model from this make". */
  model: string | null;
  model_name: string | null;
}

export interface ProClient {
  id: string;
  broker_id: string;
  first_name: string;
  last_name: string;
  cell_number: string | null;
  email: string | null;
  preferences: ProClientPreference[];
  notes: string | null;
  created_at: string;
}

/** A client joined to the vehicles of theirs the broker manages. */
export interface ProClientEntry {
  client: ProClient;
  vehicles: ProVehicle[];
}

/* -------------------------------------------------------------------------- */
/* Broker watchlist — vehicles the broker is tracking for their own book      */
/* -------------------------------------------------------------------------- */

export interface ProBrokerWatchlistEntry {
  id: string;
  broker_id: string;
  /** `car_model_variant.slug` */
  model: string;
  variant: CarModelVariant | null;
  year_from: number | null;
  year_to: number | null;
  /** Reference photo for the variant. From `car_model_variant_images` on go-live. */
  image_url: string | null;
  /** Ceiling the broker will pay, in ZAR. */
  max_price: number | null;
  notes: string | null;
  created_at: string;
}

/* -------------------------------------------------------------------------- */
/* Garage overview                                                            */
/* -------------------------------------------------------------------------- */

export interface ProGaragePoint {
  /** ISO date, first of the month. */
  date: string;
  /** Total market value of the broker's stock at that point, in ZAR. */
  value: number;
}

export type ProSignalKind = "value_up" | "value_down" | "demand_up" | "demand_down";

export interface ProGarageSignal {
  id: string;
  kind: ProSignalKind;
  vehicle_id: string;
  vehicle_label: string;
  /** Human summary, e.g. "Up R 120 000 in the last 30 days". */
  summary: string;
  /** Signed magnitude — ZAR for value signals, watcher count for demand signals. */
  delta: number;
  created_at: string;
}

export interface ProGarageOverview {
  total_value: number;
  total_value_change_30d: number;
  vehicle_count: number;
  listed_count: number;
  total_watchers: number;
  history: ProGaragePoint[];
  signals: ProGarageSignal[];
}

/* -------------------------------------------------------------------------- */
/* Demand side                                                                */
/* -------------------------------------------------------------------------- */

/**
 * One row of anonymised network demand, aggregated per variant + purchase intent.
 *
 * Deliberately carries no user identifier of any kind. Brokers see counts, never people.
 */
export interface ProWatchlistDemand {
  id: string;
  model: string;
  variant: CarModelVariant | null;
  purchase_intent: PurchaseIntent;
  /** Reference photo for the variant. From `car_model_variant_images` on go-live. */
  image_url: string | null;
  /** Number of end users watching this variant at this intent level. */
  watchers: number;
  watchers_change_30d: number;
  /** Narrowest and widest year interest across the watching cohort. */
  year_from: number | null;
  year_to: number | null;
  /** Average OC valuation for the variant, in ZAR. */
  average_value: number | null;
  /** Whether the broker holds matching supply in stock or the Black Book. */
  matched_supply: number;
  last_added_at: string;
}

/** A listing on the OC Community Marketplace, already reduced to shared fields only. */
export interface ProMarketplaceListing {
  id: string;
  model: string;
  variant: CarModelVariant | null;
  /** "broker" listings come from OC Pro; "member" listings come from a consumer garage. */
  seller_type: "broker" | "member";
  seller_name: string;
  supply_intent: SupplyIntent;
  year: number | null;
  mileage: number | null;
  colour_name: string | null;
  /** Shared alongside `colour_name`; drives the placeholder artwork on the listing card. */
  colour_hex: string | null;
  extras: string[];
  target_price: number | null;
  images: string[];
  watchers: number;
  listed_at: string;
}
