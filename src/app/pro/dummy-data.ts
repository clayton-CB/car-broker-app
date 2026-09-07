/**
 * OC PRO — DUMMY DATASET
 *
 * The only data source behind the broker portal until the tables in `docs/oc-pro-schema.sql`
 * exist. Nothing outside `composables/useProApi.ts` imports this file, so going live means
 * replacing the function bodies in the seam and deleting this file outright.
 *
 * React port of the Vue portal dataset — data identical, imports adjusted.
 * Field names match the proposed columns one-for-one. Values are a plausible Johannesburg
 * high-end broker's book: prices in ZAR, mileage in km, dates trailing the current campaign
 * year, so charts and "last 30 days" copy read sensibly without any date arithmetic.
 *
 * TODO(engineering): delete this file. See `docs/oc-pro-handover.md`.
 */

import type {
  CarMake,
  CarModel,
  CarModelVariant,
  ProBrokerWatchlistEntry,
  ProClient,
  ProGaragePoint,
  ProGarageSignal,
  ProMarketplaceListing,
  ProVehicle,
  ProWatchlistDemand,
} from "./types";

export const DUMMY_BROKER_ID = "brk-0f2a91c4";

/* -------------------------------------------------------------------------- */
/* Vehicle hierarchy                                                          */
/* -------------------------------------------------------------------------- */

const make = (slug: string, name: string): CarMake => ({
  id: `mk-${slug}`,
  name,
  slug,
});

const model = (slug: string, name: string, makeSlug: string): CarModel => ({
  create_at: null,
  id: `md-${slug}`,
  make: makeSlug,
  name,
  slug,
});

const MAKES = {
  porsche: make("porsche", "Porsche"),
  bmw: make("bmw", "BMW"),
  ferrari: make("ferrari", "Ferrari"),
  mercedes: make("mercedes-benz", "Mercedes-Benz"),
  lamborghini: make("lamborghini", "Lamborghini"),
  audi: make("audi", "Audi"),
  astonMartin: make("aston-martin", "Aston Martin"),
};

const MODELS = {
  nineEleven: model("911", "911", "porsche"),
  cayman: model("718-cayman", "718 Cayman", "porsche"),
  m3: model("m3", "M3", "bmw"),
  m4: model("m4", "M4", "bmw"),
  fEightTributo: model("f8-tributo", "F8 Tributo", "ferrari"),
  fourEightyEight: model("488", "488", "ferrari"),
  amgGt: model("amg-gt", "AMG GT", "mercedes-benz"),
  huracan: model("huracan", "Huracán", "lamborghini"),
  rs6: model("rs6", "RS6", "audi"),
  vantage: model("vantage", "Vantage", "aston-martin"),
};

/**
 * Builds a `CarModelVariant` in the shape the nested select in `useCarsApi` returns, so pages
 * that read `vehicle.variant.make.name` behave identically against dummy and live data.
 */
const variant = (
  slug: string,
  name: string,
  makeRef: CarMake,
  modelRef: CarModel,
  spec: Partial<CarModelVariant> = {}
): CarModelVariant => ({
  acceleration_0_100_kph: null,
  battery_size_kwh: null,
  body_style: "Coupe",
  created_at: "2026-01-12T08:00:00.000Z",
  description: null,
  doors: 2,
  drive_type: "RWD",
  engine_displacement: null,
  engine_power_hp: null,
  engine_power_kw: null,
  engine_size_l: null,
  engine_torque_nm: null,
  engine_type: "Petrol",
  freetext_search: null,
  fuel_type: "Petrol",
  history: null,
  id: `var-${slug}`,
  kw_per_kg: null,
  pricing_urls: null,
  production_years: null,
  seats: 2,
  top_speed_kph: null,
  transmission: ["PDK"],
  weight_kg: null,
  ...spec,
  name,
  slug,
  make: makeRef,
  model: modelRef,
});

export const VARIANTS = {
  gt3: variant("porsche-911-gt3-992", "911 GT3 (992)", MAKES.porsche, MODELS.nineEleven, {
    acceleration_0_100_kph: 3.4,
    engine_power_hp: 503,
    engine_power_kw: 375,
    engine_size_l: "4.0",
    top_speed_kph: 318,
    weight_kg: 1418,
  }),
  turboS: variant("porsche-911-turbo-s-992", "911 Turbo S (992)", MAKES.porsche, MODELS.nineEleven, {
    acceleration_0_100_kph: 2.7,
    drive_type: "AWD",
    engine_power_hp: 641,
    engine_power_kw: 478,
    engine_size_l: "3.8",
    top_speed_kph: 330,
    weight_kg: 1640,
  }),
  gt4rs: variant("porsche-718-cayman-gt4-rs", "718 Cayman GT4 RS", MAKES.porsche, MODELS.cayman, {
    acceleration_0_100_kph: 3.4,
    engine_power_hp: 493,
    engine_power_kw: 368,
    engine_size_l: "4.0",
    top_speed_kph: 315,
    weight_kg: 1415,
  }),
  m3cs: variant("bmw-m3-cs-g80", "M3 CS (G80)", MAKES.bmw, MODELS.m3, {
    acceleration_0_100_kph: 3.4,
    body_style: "Sedan",
    doors: 4,
    drive_type: "AWD",
    engine_power_hp: 543,
    engine_power_kw: 405,
    engine_size_l: "3.0",
    seats: 5,
    top_speed_kph: 302,
    transmission: ["Automatic"],
  }),
  m4comp: variant("bmw-m4-competition-g82", "M4 Competition (G82)", MAKES.bmw, MODELS.m4, {
    acceleration_0_100_kph: 3.9,
    engine_power_hp: 503,
    engine_power_kw: 375,
    engine_size_l: "3.0",
    top_speed_kph: 290,
    transmission: ["Automatic"],
  }),
  f8: variant("ferrari-f8-tributo", "F8 Tributo", MAKES.ferrari, MODELS.fEightTributo, {
    acceleration_0_100_kph: 2.9,
    engine_power_hp: 710,
    engine_power_kw: 530,
    engine_size_l: "3.9",
    top_speed_kph: 340,
    transmission: ["DCT"],
  }),
  fourEightyEightPista: variant(
    "ferrari-488-pista",
    "488 Pista",
    MAKES.ferrari,
    MODELS.fourEightyEight,
    {
      acceleration_0_100_kph: 2.85,
      engine_power_hp: 710,
      engine_power_kw: 530,
      engine_size_l: "3.9",
      top_speed_kph: 340,
      transmission: ["DCT"],
    }
  ),
  amgGtBs: variant("mercedes-amg-gt-black-series", "AMG GT Black Series", MAKES.mercedes, MODELS.amgGt, {
    acceleration_0_100_kph: 3.2,
    engine_power_hp: 720,
    engine_power_kw: 537,
    engine_size_l: "4.0",
    top_speed_kph: 325,
    transmission: ["DCT"],
  }),
  huracanSto: variant("lamborghini-huracan-sto", "Huracán STO", MAKES.lamborghini, MODELS.huracan, {
    acceleration_0_100_kph: 3.0,
    engine_power_hp: 631,
    engine_power_kw: 470,
    engine_size_l: "5.2",
    top_speed_kph: 310,
    transmission: ["DCT"],
  }),
  rs6: variant("audi-rs6-avant-c8", "RS6 Avant (C8)", MAKES.audi, MODELS.rs6, {
    acceleration_0_100_kph: 3.6,
    body_style: "Estate",
    doors: 5,
    drive_type: "AWD",
    engine_power_hp: 592,
    engine_power_kw: 441,
    engine_size_l: "4.0",
    seats: 5,
    top_speed_kph: 305,
    transmission: ["Automatic"],
  }),
  vantage: variant("aston-martin-vantage-v8", "Vantage V8", MAKES.astonMartin, MODELS.vantage, {
    acceleration_0_100_kph: 3.6,
    engine_power_hp: 503,
    engine_power_kw: 375,
    engine_size_l: "4.0",
    top_speed_kph: 314,
    transmission: ["Automatic"],
  }),
};


/* -------------------------------------------------------------------------- */
/* Vehicle photography                                                        */
/* -------------------------------------------------------------------------- */

/**
 * One reference photo per variant, mapped by `car_model_variant.slug`.
 *
 * These are real photographs of the actual models, sourced from Wikimedia Commons and all
 * licensed CC BY-SA 4.0 — attribution is recorded per entry below so it can be surfaced or
 * cleared before this ever faces a client.
 *
 * TODO(engineering): these die with this file. On go-live, per-vehicle photography comes from
 * the `cars` storage bucket (broker uploads) with `car_model_variant_images` as the fallback,
 * exactly as the consumer garage resolves its imagery today.
 */
export const VARIANT_PHOTOS: Record<string, { url: string; credit: string }> = {
  "porsche-911-gt3-992": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/85/Porsche_992_GT3_with_touring_package_1X7A6511.jpg/960px-Porsche_992_GT3_with_touring_package_1X7A6511.jpg",
    credit: "Porsche 992 GT3 with touring package 1X7A6511.jpg — Alexander Migl / CC BY-SA 4.0",
  },
  "porsche-911-turbo-s-992": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ee/Porsche_992_Turbo_S_1X7A0413.jpg/960px-Porsche_992_Turbo_S_1X7A0413.jpg",
    credit: "Porsche 992 Turbo S 1X7A0413.jpg — Alexander Migl / CC BY-SA 4.0",
  },
  "porsche-718-cayman-gt4-rs": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b5/Manthey_Porsche_GT4_RS%2C_EMS_23%2C_Essen_%28P1160647-RR%29.jpg/960px-Manthey_Porsche_GT4_RS%2C_EMS_23%2C_Essen_%28P1160647-RR%29.jpg",
    credit: "Manthey Porsche GT4 RS, EMS 23, Essen (P1160647-RR).jpg — Matti Blume / CC BY-SA 4.0",
  },
  "bmw-m3-cs-g80": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/69/BMW_M3_CS_gfos25.jpg/960px-BMW_M3_CS_gfos25.jpg",
    credit: "BMW M3 CS gfos25.jpg — Calreyn88 / CC BY-SA 4.0",
  },
  "bmw-m4-competition-g82": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/13/BMW_M4_%28G82%29_Competition_1X7A6103.jpg/960px-BMW_M4_%28G82%29_Competition_1X7A6103.jpg",
    credit: "BMW M4 (G82) Competition 1X7A6103.jpg — Alexander Migl / CC BY-SA 4.0",
  },
  "ferrari-f8-tributo": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d6/Ferrari_F8_Tributo_DSC_7013.jpg/960px-Ferrari_F8_Tributo_DSC_7013.jpg",
    credit: "Ferrari F8 Tributo DSC 7013.jpg — Alexander Migl / CC BY-SA 4.0",
  },
  "ferrari-488-pista": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/80/Ferrari_488_Pista_Genf_2018.jpg/960px-Ferrari_488_Pista_Genf_2018.jpg",
    credit: "Ferrari 488 Pista Genf 2018.jpg — Alexander Migl / CC BY-SA 4.0",
  },
  "mercedes-amg-gt-black-series": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5a/Mercedes-AMG_GT_Black_Series_IMG_0324.jpg/960px-Mercedes-AMG_GT_Black_Series_IMG_0324.jpg",
    credit: "Mercedes-AMG GT Black Series IMG 0324.jpg — Alexander-93 / CC BY-SA 4.0",
  },
  "lamborghini-huracan-sto": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/68/Lamborghini_Huracan_STO_1X7A0297.jpg/960px-Lamborghini_Huracan_STO_1X7A0297.jpg",
    credit: "Lamborghini Huracan STO 1X7A0297.jpg — Alexander Migl / CC BY-SA 4.0",
  },
  "audi-rs6-avant-c8": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/00/Audi_RS6_Avant_C8_1X7A0305.jpg/960px-Audi_RS6_Avant_C8_1X7A0305.jpg",
    credit: "Audi RS6 Avant C8 1X7A0305.jpg — Alexander Migl / CC BY-SA 4.0",
  },
  "aston-martin-vantage-v8": {
    url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b7/2019_Aston_Martin_Vantage_V8_Automatic_4.0_%281%29.jpg/960px-2019_Aston_Martin_Vantage_V8_Automatic_4.0_%281%29.jpg",
    credit: "2019 Aston Martin Vantage V8 Automatic 4.0 (1).jpg — Vauxford / CC BY-SA 4.0",
  },
};

/** Photos for a variant slug, in the `images[]` shape the schema uses. */
export const photosFor = (slug: string): string[] => {
  const photo = VARIANT_PHOTOS[slug];
  return photo ? [photo.url] : [];
};

/** Single reference photo for a variant, or null. Used by the variant-level surfaces. */
export const photoUrl = (slug: string): string | null => VARIANT_PHOTOS[slug]?.url ?? null;

/* -------------------------------------------------------------------------- */
/* My Garage — the broker's own stock                                         */
/* -------------------------------------------------------------------------- */

/** Keeps the vehicle literals below to the fields that actually differ between cars. */
const vehicle = (input: Partial<ProVehicle> & Pick<ProVehicle, "id" | "model" | "variant">): ProVehicle => ({
  broker_id: DUMMY_BROKER_ID,
  source: "stock",
  year: null,
  mileage: null,
  colour_name: null,
  colour_hex: null,
  transmission: null,
  vin: null,
  extras: [],
  images: photosFor(input.model),
  acquisition_price: null,
  acquired_at: null,
  target_price: null,
  market_value: null,
  market_value_change_30d: 0,
  supply_intent: "holding",
  listed: false,
  share_settings: {},
  watchers: 0,
  watchers_change_30d: 0,
  client_id: null,
  notes: null,
  created_at: "2026-06-01T09:00:00.000Z",
  ...input,
});

export const DUMMY_STOCK: ProVehicle[] = [
  vehicle({
    id: "veh-gt3-shark",
    model: VARIANTS.gt3.slug,
    variant: VARIANTS.gt3,
    year: 2023,
    mileage: 8400,
    colour_name: "Shark Blue",
    colour_hex: "#0d6fb8",
    transmission: "PDK",
    vin: "WP0ZZZ99ZPS170221",
    extras: ["Clubsport package", "Front axle lift", "Carbon bucket seats", "PCCB"],
    acquisition_price: 3450000,
    acquired_at: "2026-02-18",
    target_price: 3895000,
    market_value: 3820000,
    market_value_change_30d: 120000,
    supply_intent: "actively_selling",
    listed: true,
    share_settings: { images: true, year: true, mileage: true, colour: true, extras: true },
    watchers: 34,
    watchers_change_30d: 6,
    notes: "Full Porsche Centre Johannesburg history. Two owners.",
    created_at: "2026-02-18T10:15:00.000Z",
  }),
  vehicle({
    id: "veh-turbos-white",
    model: VARIANTS.turboS.slug,
    variant: VARIANTS.turboS,
    year: 2022,
    mileage: 21500,
    colour_name: "Carrara White",
    colour_hex: "#eceff1",
    transmission: "PDK",
    vin: "WP0ZZZ99ZNS230884",
    extras: ["Sport Chrono", "Burmester", "Ceramic brakes"],
    acquisition_price: 3980000,
    acquired_at: "2026-04-02",
    target_price: 4250000,
    market_value: 4180000,
    market_value_change_30d: -65000,
    supply_intent: "actively_selling",
    listed: true,
    share_settings: { images: true, year: true, mileage: true, target_price: true },
    watchers: 22,
    watchers_change_30d: -3,
    notes: "Approved warranty to March 2027.",
    created_at: "2026-04-02T14:40:00.000Z",
  }),
  vehicle({
    id: "veh-gt4rs-arctic",
    model: VARIANTS.gt4rs.slug,
    variant: VARIANTS.gt4rs,
    year: 2024,
    mileage: 2100,
    colour_name: "Arctic Grey",
    colour_hex: "#8b9198",
    transmission: "PDK",
    vin: "WP0ZZZ98ZRS260145",
    extras: ["Weissach package", "Magnesium wheels", "Carbon roof"],
    acquisition_price: 3150000,
    acquired_at: "2026-05-11",
    target_price: 3600000,
    market_value: 3540000,
    market_value_change_30d: 145000,
    supply_intent: "ready_to_sell",
    listed: true,
    share_settings: { images: true, year: true, colour: true, extras: true },
    watchers: 41,
    watchers_change_30d: 11,
    notes: "Weissach cars are thin on the ground locally. Holding for the right number.",
    created_at: "2026-05-11T11:05:00.000Z",
  }),
  vehicle({
    id: "veh-f8-rosso",
    model: VARIANTS.f8.slug,
    variant: VARIANTS.f8,
    year: 2021,
    mileage: 14200,
    colour_name: "Rosso Corsa",
    colour_hex: "#b91320",
    transmission: "DCT",
    vin: "ZFF92LLA000260118",
    extras: ["Carbon racing seats", "Suspension lifter", "Scuderia shields"],
    acquisition_price: 5600000,
    acquired_at: "2026-01-24",
    target_price: 6150000,
    market_value: 6020000,
    market_value_change_30d: 210000,
    supply_intent: "actively_selling",
    listed: true,
    share_settings: { images: true, year: true, mileage: true, colour: true, target_price: true },
    watchers: 58,
    watchers_change_30d: 14,
    notes: "Ferrari Approved. Service plan to 2028.",
    created_at: "2026-01-24T08:30:00.000Z",
  }),
  vehicle({
    id: "veh-m3cs-frozen",
    model: VARIANTS.m3cs.slug,
    variant: VARIANTS.m3cs,
    year: 2024,
    mileage: 6900,
    colour_name: "Frozen Solid White",
    colour_hex: "#dfe3e6",
    transmission: "Automatic",
    vin: "WBS23AY090FR12874",
    extras: ["Carbon ceramic brakes", "M Drive Professional", "Laserlight"],
    acquisition_price: 2280000,
    acquired_at: "2026-06-08",
    target_price: 2495000,
    market_value: 2440000,
    market_value_change_30d: 35000,
    supply_intent: "ready_to_sell",
    watchers: 27,
    watchers_change_30d: 4,
    notes: "One of 40 into South Africa.",
    created_at: "2026-06-08T16:20:00.000Z",
  }),
  vehicle({
    id: "veh-huracan-verde",
    model: VARIANTS.huracanSto.slug,
    variant: VARIANTS.huracanSto,
    year: 2022,
    mileage: 9800,
    colour_name: "Verde Selvans",
    colour_hex: "#1f5c3a",
    transmission: "DCT",
    vin: "ZHWUF5ZF7NLA18902",
    extras: ["Titanium roll cage", "Carbon skin package", "Telemetry"],
    acquisition_price: 6250000,
    acquired_at: "2026-03-15",
    target_price: 6900000,
    market_value: 6740000,
    market_value_change_30d: -90000,
    supply_intent: "holding",
    watchers: 19,
    watchers_change_30d: 2,
    notes: "Client mandate — not to be advertised before September.",
    created_at: "2026-03-15T13:00:00.000Z",
  }),
];

/* -------------------------------------------------------------------------- */
/* Black Book — client-owned cars                                             */
/* -------------------------------------------------------------------------- */

export const DUMMY_BLACK_BOOK: ProVehicle[] = [
  vehicle({
    id: "veh-amggt-bs",
    source: "black_book",
    client_id: "cli-vandermerwe",
    model: VARIANTS.amgGtBs.slug,
    variant: VARIANTS.amgGtBs,
    year: 2021,
    mileage: 11300,
    colour_name: "Magmabeam",
    colour_hex: "#e2761b",
    transmission: "DCT",
    vin: "WDD1903791A028441",
    extras: ["Track package", "Carbon aero", "AMG ceramic brakes"],
    target_price: 7450000,
    market_value: 7280000,
    market_value_change_30d: 180000,
    supply_intent: "ready_to_sell",
    watchers: 31,
    watchers_change_30d: 7,
    notes: "Owner will trade against a 296 GTB if one surfaces.",
    created_at: "2026-04-19T09:45:00.000Z",
  }),
  vehicle({
    id: "veh-488-pista",
    source: "black_book",
    client_id: "cli-naidoo",
    model: VARIANTS.fourEightyEightPista.slug,
    variant: VARIANTS.fourEightyEightPista,
    year: 2019,
    mileage: 17600,
    colour_name: "Giallo Modena",
    colour_hex: "#f2c200",
    transmission: "DCT",
    vin: "ZFF90HLA000238771",
    extras: ["Carbon wheels", "Racing livery", "Lift system"],
    target_price: 8900000,
    market_value: 8650000,
    market_value_change_30d: 320000,
    supply_intent: "holding",
    watchers: 47,
    watchers_change_30d: 9,
    notes: "Long-term hold. Owner reviews annually in November.",
    created_at: "2026-02-03T15:10:00.000Z",
  }),
  vehicle({
    id: "veh-rs6-nardo",
    source: "black_book",
    client_id: "cli-botha",
    model: VARIANTS.rs6.slug,
    variant: VARIANTS.rs6,
    year: 2023,
    mileage: 32400,
    colour_name: "Nardo Grey",
    colour_hex: "#9a9d9f",
    transmission: "Automatic",
    vin: "WUAZZZF23PN901337",
    extras: ["RS dynamic package plus", "Carbon optics", "B&O 3D"],
    target_price: 1950000,
    market_value: 1890000,
    market_value_change_30d: -45000,
    supply_intent: "actively_selling",
    listed: true,
    share_settings: { images: true, year: true, mileage: true, colour: true },
    watchers: 16,
    watchers_change_30d: 1,
    notes: "Daily driver. Owner upgrading to an RS6 GT.",
    created_at: "2026-05-28T12:25:00.000Z",
  }),
  vehicle({
    id: "veh-vantage-onyx",
    source: "black_book",
    client_id: null,
    model: VARIANTS.vantage.slug,
    variant: VARIANTS.vantage,
    year: 2020,
    mileage: 24900,
    colour_name: "Onyx Black",
    colour_hex: "#15171a",
    transmission: "Automatic",
    vin: "SCFSMGAW3LGL02216",
    extras: ["Sports plus seats", "Carbon exterior pack"],
    target_price: 2350000,
    market_value: 2280000,
    market_value_change_30d: -30000,
    supply_intent: "ready_to_sell",
    watchers: 12,
    watchers_change_30d: 0,
    notes: "Owner details still to be captured.",
    created_at: "2026-07-14T10:00:00.000Z",
  }),
];

/* -------------------------------------------------------------------------- */
/* Black Book clients                                                         */
/* -------------------------------------------------------------------------- */

export const DUMMY_CLIENTS: ProClient[] = [
  {
    id: "cli-vandermerwe",
    broker_id: DUMMY_BROKER_ID,
    first_name: "Pieter",
    last_name: "van der Merwe",
    cell_number: "+27 82 445 1190",
    email: "pieter.vdm@example.co.za",
    preferences: [
      { make: "ferrari", make_name: "Ferrari", model: null, model_name: null },
      { make: "porsche", make_name: "Porsche", model: "911", model_name: "911" },
    ],
    notes: "Prefers low mileage, full service history. Cash buyer.",
    created_at: "2026-04-19T09:40:00.000Z",
  },
  {
    id: "cli-naidoo",
    broker_id: DUMMY_BROKER_ID,
    first_name: "Ravi",
    last_name: "Naidoo",
    cell_number: "+27 83 771 4408",
    email: "ravi.naidoo@example.co.za",
    preferences: [
      { make: "ferrari", make_name: "Ferrari", model: "488", model_name: "488" },
      { make: "lamborghini", make_name: "Lamborghini", model: null, model_name: null },
    ],
    notes: "Collector. Only interested in limited-run cars.",
    created_at: "2026-02-03T15:05:00.000Z",
  },
  {
    id: "cli-botha",
    broker_id: DUMMY_BROKER_ID,
    first_name: "Elmarie",
    last_name: "Botha",
    cell_number: "+27 79 220 6631",
    email: "elmarie.botha@example.co.za",
    preferences: [{ make: "audi", make_name: "Audi", model: "rs6", model_name: "RS6" }],
    notes: "Wants an RS6 GT allocation. Will trade in the C8.",
    created_at: "2026-05-28T12:20:00.000Z",
  },
  {
    id: "cli-khumalo",
    broker_id: DUMMY_BROKER_ID,
    first_name: "Sipho",
    last_name: "Khumalo",
    cell_number: "+27 84 903 2277",
    email: "sipho.khumalo@example.co.za",
    preferences: [
      { make: "porsche", make_name: "Porsche", model: "718-cayman", model_name: "718 Cayman" },
      { make: "bmw", make_name: "BMW", model: "m4", model_name: "M4" },
    ],
    notes: "First-time buyer in this segment. Budget around R2.5m.",
    created_at: "2026-06-30T08:15:00.000Z",
  },
];

/* -------------------------------------------------------------------------- */
/* Garage overview — 13 months of value, plus movement notes                  */
/* -------------------------------------------------------------------------- */

/**
 * Thirteen points so the chart shows a full year plus the current month. The seam overwrites
 * the final point with the live total, so the last value here only matters before first render.
 */
export const DUMMY_GARAGE_HISTORY: ProGaragePoint[] = [
  { date: "2025-07-01", value: 21850000 },
  { date: "2025-08-01", value: 22140000 },
  { date: "2025-09-01", value: 22020000 },
  { date: "2025-10-01", value: 22630000 },
  { date: "2025-11-01", value: 23180000 },
  { date: "2025-12-01", value: 23640000 },
  { date: "2026-01-01", value: 23410000 },
  { date: "2026-02-01", value: 24080000 },
  { date: "2026-03-01", value: 24720000 },
  { date: "2026-04-01", value: 25190000 },
  { date: "2026-05-01", value: 25640000 },
  { date: "2026-06-01", value: 26380000 },
  { date: "2026-07-01", value: 26740000 },
];

export const DUMMY_GARAGE_SIGNALS: ProGarageSignal[] = [
  {
    id: "sig-f8-value",
    kind: "value_up",
    vehicle_id: "veh-f8-rosso",
    vehicle_label: "Ferrari F8 Tributo",
    summary: "Up R 210 000 in the last 30 days",
    delta: 210000,
    created_at: "2026-07-22T06:00:00.000Z",
  },
  {
    id: "sig-gt4rs-demand",
    kind: "demand_up",
    vehicle_id: "veh-gt4rs-arctic",
    vehicle_label: "Porsche 718 Cayman GT4 RS",
    summary: "11 new watchers in the last 30 days",
    delta: 11,
    created_at: "2026-07-21T06:00:00.000Z",
  },
  {
    id: "sig-huracan-value",
    kind: "value_down",
    vehicle_id: "veh-huracan-verde",
    vehicle_label: "Lamborghini Huracán STO",
    summary: "Down R 90 000 in the last 30 days",
    delta: -90000,
    created_at: "2026-07-19T06:00:00.000Z",
  },
  {
    id: "sig-turbos-demand",
    kind: "demand_down",
    vehicle_id: "veh-turbos-white",
    vehicle_label: "Porsche 911 Turbo S",
    summary: "3 watchers dropped off in the last 30 days",
    delta: -3,
    created_at: "2026-07-17T06:00:00.000Z",
  },
];

/* -------------------------------------------------------------------------- */
/* Watchlist demand — anonymised, counts only                                 */
/* -------------------------------------------------------------------------- */

/**
 * One row per variant per intent tier. `matched_supply` is recomputed by the seam against the
 * broker's own book, so the zeroes here are placeholders. No row carries a user identifier —
 * that is the whole point of this surface.
 */
export const DUMMY_DEMAND: ProWatchlistDemand[] = [
  {
    id: "dmd-gt3-buy-now",
    model: VARIANTS.gt3.slug,
    variant: VARIANTS.gt3,
    image_url: photoUrl(VARIANTS.gt3.slug),
    purchase_intent: "buy_now",
    watchers: 14,
    watchers_change_30d: 5,
    year_from: 2022,
    year_to: 2025,
    average_value: 3760000,
    matched_supply: 0,
    last_added_at: "2026-07-23T18:12:00.000Z",
  },
  {
    id: "dmd-gt3-six-months",
    model: VARIANTS.gt3.slug,
    variant: VARIANTS.gt3,
    image_url: photoUrl(VARIANTS.gt3.slug),
    purchase_intent: "next_6_months",
    watchers: 26,
    watchers_change_30d: 4,
    year_from: 2021,
    year_to: 2025,
    average_value: 3690000,
    matched_supply: 0,
    last_added_at: "2026-07-20T09:41:00.000Z",
  },
  {
    id: "dmd-f8-buy-now",
    model: VARIANTS.f8.slug,
    variant: VARIANTS.f8,
    image_url: photoUrl(VARIANTS.f8.slug),
    purchase_intent: "buy_now",
    watchers: 9,
    watchers_change_30d: 3,
    year_from: 2020,
    year_to: 2023,
    average_value: 5980000,
    matched_supply: 0,
    last_added_at: "2026-07-24T11:05:00.000Z",
  },
  {
    id: "dmd-gt4rs-six-months",
    model: VARIANTS.gt4rs.slug,
    variant: VARIANTS.gt4rs,
    image_url: photoUrl(VARIANTS.gt4rs.slug),
    purchase_intent: "next_6_months",
    watchers: 18,
    watchers_change_30d: 7,
    year_from: 2023,
    year_to: 2025,
    average_value: 3480000,
    matched_supply: 0,
    last_added_at: "2026-07-22T14:33:00.000Z",
  },
  {
    id: "dmd-m4-buy-now",
    model: VARIANTS.m4comp.slug,
    variant: VARIANTS.m4comp,
    image_url: photoUrl(VARIANTS.m4comp.slug),
    purchase_intent: "buy_now",
    watchers: 11,
    watchers_change_30d: 2,
    year_from: 2022,
    year_to: 2025,
    average_value: 1840000,
    matched_supply: 0,
    last_added_at: "2026-07-21T07:58:00.000Z",
  },
  {
    id: "dmd-huracan-browsing",
    model: VARIANTS.huracanSto.slug,
    variant: VARIANTS.huracanSto,
    image_url: photoUrl(VARIANTS.huracanSto.slug),
    purchase_intent: "browsing",
    watchers: 38,
    watchers_change_30d: 6,
    year_from: 2021,
    year_to: 2024,
    average_value: 6620000,
    matched_supply: 0,
    last_added_at: "2026-07-18T20:14:00.000Z",
  },
  {
    id: "dmd-amggt-six-months",
    model: VARIANTS.amgGtBs.slug,
    variant: VARIANTS.amgGtBs,
    image_url: photoUrl(VARIANTS.amgGtBs.slug),
    purchase_intent: "next_6_months",
    watchers: 7,
    watchers_change_30d: 1,
    year_from: 2020,
    year_to: 2022,
    average_value: 7190000,
    matched_supply: 0,
    last_added_at: "2026-07-16T16:47:00.000Z",
  },
  {
    id: "dmd-rs6-browsing",
    model: VARIANTS.rs6.slug,
    variant: VARIANTS.rs6,
    image_url: photoUrl(VARIANTS.rs6.slug),
    purchase_intent: "browsing",
    watchers: 44,
    watchers_change_30d: -2,
    year_from: 2021,
    year_to: 2025,
    average_value: 1920000,
    matched_supply: 0,
    last_added_at: "2026-07-15T12:29:00.000Z",
  },
  {
    id: "dmd-vantage-browsing",
    model: VARIANTS.vantage.slug,
    variant: VARIANTS.vantage,
    image_url: photoUrl(VARIANTS.vantage.slug),
    purchase_intent: "browsing",
    watchers: 21,
    watchers_change_30d: 3,
    year_from: 2019,
    year_to: 2023,
    average_value: 2310000,
    matched_supply: 0,
    last_added_at: "2026-07-13T10:02:00.000Z",
  },
];

/* -------------------------------------------------------------------------- */
/* Community Marketplace — other brokers and OC members                       */
/* -------------------------------------------------------------------------- */

/**
 * The broker's own listings are prepended by the seam from their live book, so these are
 * third-party rows only. Each is already reduced to the fields that seller chose to share —
 * a `null` here means "not shared", not "unknown".
 */
export const DUMMY_MARKETPLACE: ProMarketplaceListing[] = [
  {
    id: "mkt-gt3-touring",
    model: VARIANTS.gt3.slug,
    variant: VARIANTS.gt3,
    seller_type: "broker",
    seller_name: "Cape Collective Motors",
    supply_intent: "actively_selling",
    year: 2022,
    mileage: 12400,
    colour_name: "Gentian Blue",
    colour_hex: "#22406e",
    extras: ["Touring package", "Front axle lift"],
    target_price: 3690000,
    images: photosFor(VARIANTS.gt3.slug),
    watchers: 29,
    listed_at: "2026-07-24T08:00:00.000Z",
  },
  {
    id: "mkt-m4-sao",
    model: VARIANTS.m4comp.slug,
    variant: VARIANTS.m4comp,
    seller_type: "member",
    seller_name: "OC member",
    supply_intent: "ready_to_sell",
    year: 2023,
    mileage: 18700,
    colour_name: "São Paulo Yellow",
    colour_hex: "#e8c31c",
    extras: [],
    target_price: null,
    images: photosFor(VARIANTS.m4comp.slug),
    watchers: 13,
    listed_at: "2026-07-23T15:30:00.000Z",
  },
  {
    id: "mkt-488-pista-jhb",
    model: VARIANTS.fourEightyEightPista.slug,
    variant: VARIANTS.fourEightyEightPista,
    seller_type: "broker",
    seller_name: "Sandton Prestige",
    supply_intent: "actively_selling",
    year: 2020,
    mileage: null,
    colour_name: "Blu Corsa",
    colour_hex: "#1b3f8b",
    extras: ["Carbon wheels", "Lift system"],
    target_price: 9250000,
    images: photosFor(VARIANTS.fourEightyEightPista.slug),
    watchers: 52,
    listed_at: "2026-07-22T11:15:00.000Z",
  },
  {
    id: "mkt-amggt-durban",
    model: VARIANTS.amgGtBs.slug,
    variant: VARIANTS.amgGtBs,
    seller_type: "broker",
    seller_name: "Umhlanga Sportscars",
    supply_intent: "ready_to_sell",
    year: null,
    mileage: 9100,
    colour_name: null,
    colour_hex: null,
    extras: [],
    target_price: null,
    images: photosFor(VARIANTS.amgGtBs.slug),
    watchers: 24,
    listed_at: "2026-07-20T09:00:00.000Z",
  },
  {
    id: "mkt-vantage-member",
    model: VARIANTS.vantage.slug,
    variant: VARIANTS.vantage,
    seller_type: "member",
    seller_name: "OC member",
    supply_intent: "holding",
    year: 2021,
    mileage: 15800,
    colour_name: "Lunar White",
    colour_hex: "#f0f0ec",
    extras: ["Sports plus seats"],
    target_price: 2480000,
    images: photosFor(VARIANTS.vantage.slug),
    watchers: 8,
    listed_at: "2026-07-18T13:45:00.000Z",
  },
  {
    id: "mkt-turbos-pta",
    model: VARIANTS.turboS.slug,
    variant: VARIANTS.turboS,
    seller_type: "broker",
    seller_name: "Waterkloof Motor Co.",
    supply_intent: "actively_selling",
    year: 2021,
    mileage: 28300,
    colour_name: "Jet Black Metallic",
    colour_hex: "#0b0d10",
    extras: ["Sport Chrono", "Ceramic brakes"],
    target_price: 4050000,
    images: photosFor(VARIANTS.turboS.slug),
    watchers: 17,
    listed_at: "2026-07-16T17:20:00.000Z",
  },
];

/* -------------------------------------------------------------------------- */
/* My Watchlist — vehicles the broker is tracking for their own book          */
/* -------------------------------------------------------------------------- */

export const DUMMY_MY_WATCHLIST: ProBrokerWatchlistEntry[] = [
  {
    id: "bwl-gt3-touring",
    broker_id: DUMMY_BROKER_ID,
    model: VARIANTS.gt3.slug,
    variant: VARIANTS.gt3,
    image_url: photoUrl(VARIANTS.gt3.slug),
    year_from: 2022,
    year_to: 2025,
    max_price: 3600000,
    notes: "Two clients want one. Touring package preferred.",
    created_at: "2026-07-02T09:00:00.000Z",
  },
  {
    id: "bwl-m4-comp",
    broker_id: DUMMY_BROKER_ID,
    model: VARIANTS.m4comp.slug,
    variant: VARIANTS.m4comp,
    image_url: photoUrl(VARIANTS.m4comp.slug),
    year_from: 2023,
    year_to: null,
    max_price: 1700000,
    notes: "Sipho Khumalo's budget fits a clean one.",
    created_at: "2026-07-09T14:30:00.000Z",
  },
  {
    id: "bwl-488-pista",
    broker_id: DUMMY_BROKER_ID,
    model: VARIANTS.fourEightyEightPista.slug,
    variant: VARIANTS.fourEightyEightPista,
    image_url: photoUrl(VARIANTS.fourEightyEightPista.slug),
    year_from: 2019,
    year_to: 2020,
    max_price: 8500000,
    notes: "Ravi Naidoo will pay for carbon wheels.",
    created_at: "2026-06-21T11:15:00.000Z",
  },
  {
    id: "bwl-rs6",
    broker_id: DUMMY_BROKER_ID,
    model: VARIANTS.rs6.slug,
    variant: VARIANTS.rs6,
    image_url: photoUrl(VARIANTS.rs6.slug),
    year_from: null,
    year_to: null,
    max_price: null,
    notes: null,
    created_at: "2026-08-01T08:45:00.000Z",
  },
];
