/**
 * OC Pro shell — React port of the Vue portal's `layouts/pro.vue`.
 *
 * Sticky top header: OC logo + "Pro" pill on the left, horizontal section nav in the
 * middle (desktop), exit-to-consumer-app on the right. On mobile the nav drops to a
 * scrollable strip under the header. Deliberately lighter than the consumer shell —
 * brokers work in one book at a time.
 */

import { Outlet, Link, useLocation } from "react-router";
import { ArrowLeft } from "lucide-react";

const proNav = [
  { name: "My Garage", href: "/garage" },
  { name: "My Watchlist", href: "/my-watchlist" },
  { name: "Marketplace", href: "/marketplace" },
  { name: "Community Watchlist", href: "/community-watchlist" },
  { name: "My Clients", href: "/clients" },
];

/**
 * The real Owners Circle mark, served from `public/oc-logo.svg` — the same asset the consumer
 * app uses, sized exactly as `layouts/pro.vue` sizes it. The artwork is white-filled, which is
 * safe here because the portal is dark-only.
 */
const Logo = () => (
  <img src="/oc-logo.svg" alt="Owners Circle" className="h-9 lg:h-10 w-auto" />
);

function ProNav() {
  const location = useLocation();
  return (
    <nav className="flex items-center gap-1 overflow-x-auto" aria-label="OC Pro sections">
      {proNav.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              isActive
                ? "bg-muted/60 text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
            }`}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}

export function RootLayout() {
  return (
    <div className="min-h-screen relative flex flex-col bg-background text-foreground font-body">
      {/* Sticky header — logo + Pro pill, nav, exit */}
      <header className="p-4 sm:px-8 sm:py-5 mx-auto flex flex-wrap gap-4 justify-between items-center w-full border-b border-border/40 sticky top-0 bg-background z-30">
        <Link to="/garage" className="flex items-center gap-3">
          <Logo />
          <span className="rounded-full border border-border/80 bg-muted/40 px-2.5 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Pro
          </span>
        </Link>

        <div className="hidden lg:block flex-1 px-8">
          <ProNav />
        </div>

        <a
          href="https://ownerscircle.world"
          className="flex items-center gap-2 rounded-xl bg-muted/50 px-4 py-2 text-sm text-foreground border border-transparent hover:bg-muted transition-colors duration-300"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Consumer app</span>
          <span className="sm:hidden">Exit</span>
        </a>
      </header>

      {/* Mobile nav strip */}
      <div className="lg:hidden px-4 py-2.5 sticky top-[73px] z-20 bg-background border-b border-border/40">
        <ProNav />
      </div>

      {/* Content */}
      <div className="p-4 sm:p-8 sm:py-6 mx-auto grow w-full flex flex-col relative max-w-screen-2xl">
        <Outlet />
      </div>
    </div>
  );
}
