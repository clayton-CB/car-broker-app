import { createBrowserRouter, Navigate } from "react-router";
import { RootLayout } from "./components/root-layout";
import { Dashboard } from "./pages/dashboard";
import { Inventory } from "./pages/inventory";
import { Clients } from "./pages/clients";
import { Watchlist } from "./pages/watchlist";
import { MarketAlerts } from "./pages/market-alerts";
import { MarketFeed } from "./pages/market-feed";
import { Garage } from "./pages/garage";
import { MyWatchlist } from "./pages/my-watchlist";
import { Marketplace } from "./pages/marketplace";
import { CommunityWatchlist } from "./pages/community-watchlist";

/** OC Pro v1 lands on My Garage, mirroring the Vue portal's /pro index redirect. */
const IndexRedirect = () => <Navigate to="/garage" replace />;

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: IndexRedirect },
      // OC Pro v1 sections
      { path: "garage", Component: Garage },
      { path: "my-watchlist", Component: MyWatchlist },
      { path: "marketplace", Component: Marketplace },
      { path: "community-watchlist", Component: CommunityWatchlist },
      { path: "clients", Component: Clients },
      // Earlier mock pages — kept reachable by URL, no longer in the nav
      { path: "dashboard", Component: Dashboard },
      { path: "market-feed", Component: MarketFeed },
      { path: "inventory", Component: Inventory },
      { path: "watchlist", Component: Watchlist },
      { path: "market-alerts", Component: MarketAlerts },
    ],
  },
]);
