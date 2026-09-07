/**
 * COMMUNITY MARKETPLACE — every shared listing across the OC network.
 *
 * Seller identity is redacted by design: OC members appear as "OC member", never by name;
 * brokers appear under their business name; the broker's own vehicles as "Your listing".
 * Every view shows ONLY the fields that seller opted into sharing — a missing value means
 * "not shared", not "unknown". Migrated from the Vue portal's `/pro/marketplace`.
 */

import { useMemo, useState } from "react";
import { Eye, Search, Store, User } from "lucide-react";
import type { ProMarketplaceListing, SupplyIntent } from "../pro/types";
import { SUPPLY_INTENT_OPTIONS } from "../pro/types";
import { fetchMarketplace } from "../pro/api";
import { useAsyncData } from "../pro/use-async-data";
import { useProViewMode } from "../pro/view-mode";
import { formatZAR, formatRelativeDate } from "../pro/format";
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

type SellerFilter = "all" | "broker" | "member";

const isOwnListing = (listing: ProMarketplaceListing) => listing.seller_name === "Your listing";

const listingLabel = (listing: ProMarketplaceListing) =>
  `${listing.variant?.make?.name ?? ""} ${listing.variant?.name ?? listing.model}`.trim();

/** Seller chip — the only place identity is rendered, and it is always a role, never a person. */
function SellerChip({ listing }: { listing: ProMarketplaceListing }) {
  const own = isOwnListing(listing);
  return (
    <span
      className={`flex items-center gap-1.5 text-xs rounded-full px-2.5 py-1 whitespace-nowrap ${
        own
          ? "bg-primary text-primary-foreground font-medium"
          : listing.seller_type === "broker"
            ? "bg-muted/60 text-foreground border border-border/80"
            : "bg-muted/40 text-muted-foreground"
      }`}
    >
      {listing.seller_type === "broker" ? <Store size={12} /> : <User size={12} />}
      {listing.seller_name}
    </span>
  );
}

function ListingCard({ listing }: { listing: ProMarketplaceListing }) {
  return (
    <div className="bg-background rounded-2xl overflow-hidden border border-border/80 hover:border-border hover:bg-muted/20 transition-all duration-300 flex flex-col">
      <VehiclePhoto
        src={listing.images[0] ?? null}
        colourHex={listing.colour_hex}
        makeName={listing.variant?.make?.name ?? null}
        alt={`${listing.year ?? ""} ${listingLabel(listing)}`.trim()}
        className="h-44 w-full"
      />
      <div className="p-4 flex-1 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg leading-tight">
            {listing.year ? `${listing.year} ` : ""}
            {listingLabel(listing)}
          </h3>
          <IntentBadge kind="supply" value={listing.supply_intent} />
        </div>

        <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
          {listing.mileage !== null && <span>{listing.mileage.toLocaleString()} km</span>}
          {listing.mileage !== null && listing.colour_name && <span>•</span>}
          {listing.colour_name && <span>{listing.colour_name}</span>}
        </div>

        {listing.extras.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {listing.extras.slice(0, 3).map((extra) => (
              <span
                key={extra}
                className="bg-muted/40 px-2 py-0.5 rounded-lg text-xs text-muted-foreground"
              >
                {extra}
              </span>
            ))}
            {listing.extras.length > 3 && (
              <span className="text-xs text-muted-foreground/70 self-center">
                +{listing.extras.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="mt-auto pt-2 flex items-end justify-between gap-2">
          <div>
            <p className="text-xl text-[#1fb85a]">
              {listing.target_price !== null
                ? formatZAR(listing.target_price)
                : "Price on application"}
            </p>
            <p className="text-xs text-muted-foreground/70">
              listed {formatRelativeDate(listing.listed_at)}
            </p>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Eye size={14} />
            {listing.watchers}
          </div>
        </div>

        <div className="self-start">
          <SellerChip listing={listing} />
        </div>
      </div>
    </div>
  );
}

export function Marketplace() {
  const marketplace = useAsyncData(fetchMarketplace);
  const { viewMode } = useProViewMode();

  const [query, setQuery] = useState("");
  const [intentFilter, setIntentFilter] = useState<SupplyIntent | "all">("all");
  const [sellerFilter, setSellerFilter] = useState<SellerFilter>("all");

  const filtered = useMemo(() => {
    const listings = marketplace.data ?? [];
    const q = query.trim().toLowerCase();
    return listings.filter((listing) => {
      if (intentFilter !== "all" && listing.supply_intent !== intentFilter) return false;
      if (sellerFilter !== "all" && listing.seller_type !== sellerFilter) return false;
      if (!q) return true;
      const haystack = [
        listing.variant?.make?.name,
        listing.variant?.name,
        listing.colour_name,
        listing.year?.toString(),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [marketplace.data, query, intentFilter, sellerFilter]);

  const cardView = (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {filtered.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );

  const tableView = (
    <TableShell
      headers={["Vehicle", "Year", "Mileage", "Colour", "Intent", "Price", "Watchers", "Seller", "Listed"]}
    >
      {filtered.map((listing) => (
        <TableRow key={listing.id}>
          <td className="px-6 py-4">
            <div className="flex items-center gap-3">
              <VehiclePhoto
                src={listing.images[0] ?? null}
                colourHex={listing.colour_hex}
                makeName={listing.variant?.make?.name ?? null}
                alt={`${listing.year ?? ""} ${listingLabel(listing)}`.trim()}
                className="w-16 h-11 rounded-lg shrink-0"
              />
              <span className="font-medium whitespace-nowrap">{listingLabel(listing)}</span>
            </div>
          </td>
          <td className="px-6 py-4 text-sm text-muted-foreground">{listing.year ?? "—"}</td>
          <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
            {listing.mileage !== null ? `${listing.mileage.toLocaleString()} km` : "—"}
          </td>
          <td className="px-6 py-4">
            <span className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
              {listing.colour_hex && (
                <span
                  className="w-3 h-3 rounded-full border border-border/80 shrink-0"
                  style={{ backgroundColor: listing.colour_hex }}
                  aria-hidden="true"
                />
              )}
              {listing.colour_name ?? "—"}
            </span>
          </td>
          <td className="px-6 py-4">
            <IntentBadge kind="supply" value={listing.supply_intent} />
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            {listing.target_price !== null ? (
              <span className="text-[#1fb85a]">{formatZAR(listing.target_price)}</span>
            ) : (
              <span className="text-sm text-muted-foreground">On application</span>
            )}
          </td>
          <td className="px-6 py-4">
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Eye size={14} />
              {listing.watchers}
            </span>
          </td>
          <td className="px-6 py-4">
            <SellerChip listing={listing} />
          </td>
          <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
            {formatRelativeDate(listing.listed_at)}
          </td>
        </TableRow>
      ))}
    </TableShell>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-medium tracking-tight mb-2">
          Community Marketplace
        </h1>
        <p className="text-muted-foreground">
          {marketplace.data
            ? `${marketplace.data.length} listings across the OC network`
            : "Listings from brokers and OC members"}{" "}
          • member identities are never shown
        </p>
      </div>

      {/* Filters */}
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
            placeholder="Search by make, model, or year..."
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
        <select
          aria-label="Filter by seller type"
          value={sellerFilter}
          onChange={(e) => setSellerFilter(e.target.value as SellerFilter)}
          className="bg-muted/30 border border-border/80 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-ring/60 transition-colors"
        >
          <option value="all">All sellers</option>
          <option value="broker">Brokers</option>
          <option value="member">OC members</option>
        </select>
        <ViewToggle />
      </div>

      {/* Listings */}
      {marketplace.error ? (
        <ErrorPanel message={marketplace.error} />
      ) : marketplace.loading ? (
        <LoadingPanel rows={3} />
      ) : filtered.length === 0 ? (
        <EmptyPanel
          title="No listings match"
          body="Try widening your search or clearing the filters."
        />
      ) : viewMode === "grid" ? (
        cardView
      ) : (
        tableView
      )}
    </div>
  );
}
