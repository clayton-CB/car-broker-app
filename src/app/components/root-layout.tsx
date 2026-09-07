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

const Logo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 725.253 420"
    className="h-9 lg:h-10 w-auto text-foreground"
    aria-label="Owners Circle"
  >
    <path d="M619.919,278.731a88.808,88.808,0,1,1,4.7-92.117L725.253,85.976a232.7,232.7,0,0,0-16.972-18.955A228.825,228.825,0,0,0,384.673,390.629a228.824,228.824,0,0,0,323.608,0q5.919-5.919,11.346-12.19l-99.708-99.708Z" fill="currentColor"/>
    <path d="M327.385,306.474a262.336,262.336,0,0,0,59.08,85.792c.417.395.847.794,1.268,1.191.969-.937,1.941-1.871,2.9-2.827A228.826,228.826,0,0,0,67.021,67.021a228.826,228.826,0,0,0,161.8,390.63,227.1,227.1,0,0,0,147.116-53.557C353.431,375.172,336.5,341.674,327.385,306.474Zm-98.56,11.177a88.825,88.825,0,1,1,88.826-88.826,88.926,88.926,0,0,1-88.826,88.826Z" fill="currentColor"/>
  </svg>
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
