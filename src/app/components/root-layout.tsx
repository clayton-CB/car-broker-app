import { Outlet, Link, useLocation } from "react-router";
import { LayoutDashboard, Package, Users, Eye, Bell, Rss } from "lucide-react";

const sidebarNav = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Market Feed", href: "/market-feed", icon: Rss },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Watchlist", href: "/watchlist", icon: Eye },
  { name: "Market Alerts", href: "/market-alerts", icon: Bell },
];

const bottomNav = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Watchlist", href: "/watchlist", icon: Eye },
  { name: "Alerts", href: "/market-alerts", icon: Bell },
];

const Logo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 725.253 420"
    style={{ height: '28px', width: 'auto', flexShrink: 0 }}
    aria-label="Owners Circle Pro"
  >
    <path d="M619.919,278.731a88.808,88.808,0,1,1,4.7-92.117L725.253,85.976a232.7,232.7,0,0,0-16.972-18.955A228.825,228.825,0,0,0,384.673,390.629a228.824,228.824,0,0,0,323.608,0q5.919-5.919,11.346-12.19l-99.708-99.708Z" fill="currentColor"/>
    <path d="M327.385,306.474a262.336,262.336,0,0,0,59.08,85.792c.417.395.847.794,1.268,1.191.969-.937,1.941-1.871,2.9-2.827A228.826,228.826,0,0,0,67.021,67.021a228.826,228.826,0,0,0,161.8,390.63,227.1,227.1,0,0,0,147.116-53.557C353.431,375.172,336.5,341.674,327.385,306.474Zm-98.56,11.177a88.825,88.825,0,1,1,88.826-88.826,88.926,88.926,0,0,1-88.826,88.826Z" fill="currentColor"/>
  </svg>
);

export function RootLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-[#111111]">
      {/* Top header — solid black, logo centered */}
      <header className="bg-black sticky top-0 z-40 flex items-center justify-center h-14 text-white">
        <Logo />
      </header>

      {/* Body: sidebar (desktop) + content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar — dark */}
        <aside className="hidden lg:flex flex-col bg-[#111111] text-white overflow-y-auto" style={{ position: 'fixed', top: '3.5rem', left: 0, width: '224px', height: 'calc(100vh - 3.5rem)', scrollbarGutter: 'stable' }}>
          {/* Fixed-height spacer — locks the nav start position */}
          <div className="h-4 shrink-0" />
          <nav className="flex flex-col gap-1 px-3">
            {sidebarNav.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main content — light background */}
        <main className="flex-1 overflow-y-auto bg-gray-100 pb-20 lg:pb-0" style={{ marginLeft: '224px', scrollbarGutter: 'stable' }}>
          <div className="p-4 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-black border-t border-white/10 flex">
        {bottomNav.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors ${
                isActive ? "text-white" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
