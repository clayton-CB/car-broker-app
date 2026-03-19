import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/root-layout";
import { Dashboard } from "./pages/dashboard";
import { Inventory } from "./pages/inventory";
import { Clients } from "./pages/clients";
import { Watchlist } from "./pages/watchlist";
import { MarketAlerts } from "./pages/market-alerts";
import { MarketFeed } from "./pages/market-feed";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "market-feed", Component: MarketFeed },
      { path: "inventory", Component: Inventory },
      { path: "clients", Component: Clients },
      { path: "watchlist", Component: Watchlist },
      { path: "market-alerts", Component: MarketAlerts },
    ],
  },
]);