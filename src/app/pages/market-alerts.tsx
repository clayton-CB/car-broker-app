import { Bell, TrendingUp, TrendingDown, AlertCircle, Plus, Settings } from "lucide-react";

interface Alert {
  id: string;
  type: "price_drop" | "new_listing" | "price_increase" | "inventory_change";
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  severity: "info" | "warning" | "success";
}

const mockAlerts: Alert[] = [
  {
    id: "1",
    type: "price_drop",
    title: "Price Drop Alert: Porsche 911 GT3",
    description: "2023 Porsche 911 GT3 dropped from R 3.85m to R 3.70m (-3.9%)",
    timestamp: "2024-02-24T08:00:00Z",
    isRead: false,
    severity: "success",
  },
  {
    id: "2",
    type: "new_listing",
    title: "New Listing Matching Criteria",
    description: "2024 Porsche 911 GT3 RS now available on autotrader.co.za",
    timestamp: "2024-02-24T07:30:00Z",
    isRead: false,
    severity: "info",
  },
  {
    id: "3",
    type: "price_increase",
    title: "Market Price Increase",
    description: "Average Porsche GT3 market price increased by 5.2% this month",
    timestamp: "2024-02-23T18:00:00Z",
    isRead: false,
    severity: "warning",
  },
  {
    id: "4",
    type: "inventory_change",
    title: "Low Inventory Alert",
    description: "Only 2 Porsche GT3 Touring models available on the market",
    timestamp: "2024-02-23T16:00:00Z",
    isRead: true,
    severity: "warning",
  },
  {
    id: "5",
    type: "new_listing",
    title: "New Listing: BMW M4 Competition",
    description: "2024 BMW M4 Competition listed at R 1.95m on autotrader.co.za",
    timestamp: "2024-02-23T14:00:00Z",
    isRead: true,
    severity: "info",
  },
  {
    id: "6",
    type: "price_drop",
    title: "Price Drop: Mercedes-AMG GT R",
    description: "2023 Mercedes-AMG GT R reduced by R 250k",
    timestamp: "2024-02-22T11:00:00Z",
    isRead: true,
    severity: "success",
  },
];

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

export function MarketAlerts() {
  const alertIcons = {
    price_drop: TrendingDown,
    new_listing: Bell,
    price_increase: TrendingUp,
    inventory_change: AlertCircle,
  };

  const severityColors = {
    info: "bg-blue-500/10 border-blue-500/50 text-blue-400",
    warning: "bg-yellow-500/10 border-yellow-500/50 text-yellow-400",
    success: "bg-[#4ade80]/10 border-[#4ade80]/50 text-[#4ade80]",
  };

  const unreadCount = mockAlerts.filter((a) => !a.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl mb-2">Market Alerts</h1>
          <p className="text-gray-500">
            {unreadCount} unread alert{unreadCount !== 1 ? "s" : ""} • {mockAlerts.length} total
          </p>
        </div>
        <div className="flex gap-3">
          <button className="bg-gray-100 border border-gray-200 px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition-colors">
            <Settings size={20} />
            Settings
          </button>
          <button className="bg-[#4ade80] text-black px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#3bc970] transition-colors">
            <Plus size={20} />
            New Alert
          </button>
        </div>
      </div>

      {/* Alert Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <TrendingDown className="text-[#4ade80]" size={24} />
            <p className="text-gray-500">Price Drops</p>
          </div>
          <p className="text-3xl">
            {mockAlerts.filter((a) => a.type === "price_drop").length}
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="text-blue-400" size={24} />
            <p className="text-gray-500">New Listings</p>
          </div>
          <p className="text-3xl">
            {mockAlerts.filter((a) => a.type === "new_listing").length}
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-yellow-400" size={24} />
            <p className="text-gray-500">Price Increases</p>
          </div>
          <p className="text-3xl">
            {mockAlerts.filter((a) => a.type === "price_increase").length}
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="text-orange-400" size={24} />
            <p className="text-gray-500">Inventory Changes</p>
          </div>
          <p className="text-3xl">
            {mockAlerts.filter((a) => a.type === "inventory_change").length}
          </p>
        </div>
      </div>

      {/* Alert Filters */}
      <div className="flex gap-3 flex-wrap">
        <button className="bg-[#4ade80] text-black px-4 py-2 rounded-lg hover:bg-[#3bc970] transition-colors">
          All Alerts
        </button>
        <button className="bg-gray-100 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
          Unread Only
        </button>
        <button className="bg-gray-100 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
          Price Drops
        </button>
        <button className="bg-gray-100 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
          New Listings
        </button>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {mockAlerts.map((alert) => {
          const Icon = alertIcons[alert.type];
          return (
            <div
              key={alert.id}
              className={`rounded-xl border-2 p-6 transition-all ${
                alert.isRead
                  ? "bg-gray-50 border-gray-200"
                  : "bg-gray-100 border-gray-300"
              } hover:border-gray-400`}
            >
              <div className="flex gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border-2 ${severityColors[alert.severity]}`}>
                  <Icon size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg">{alert.title}</h3>
                        {!alert.isRead && (
                          <span className="bg-[#4ade80] text-black text-xs px-2 py-1 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500">{alert.description}</p>
                    </div>
                    <span className="text-sm text-gray-400">{formatDate(alert.timestamp)}</span>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button className="bg-[#4ade80] text-black px-4 py-2 rounded-lg hover:bg-[#3bc970] transition-colors text-sm">
                      View Details
                    </button>
                    {!alert.isRead && (
                      <button className="bg-gray-200 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm">
                        Mark as Read
                      </button>
                    )}
                    <button className="text-gray-500 hover:text-gray-900 transition-colors text-sm">
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Configure Alerts Section */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 transition-colors">
        <h2 className="text-2xl mb-4">Configure Alert Preferences</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-100 rounded-lg p-4 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <TrendingDown className="text-[#4ade80]" size={20} />
                <span>Price Drop Alerts</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4ade80]"></div>
              </label>
            </div>
            <p className="text-sm text-gray-500">Get notified when vehicle prices drop</p>
          </div>

          <div className="bg-gray-100 rounded-lg p-4 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Bell className="text-blue-400" size={20} />
                <span>New Listing Alerts</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4ade80]"></div>
              </label>
            </div>
            <p className="text-sm text-gray-500">Get notified about new vehicle listings</p>
          </div>

          <div className="bg-gray-100 rounded-lg p-4 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <TrendingUp className="text-yellow-400" size={20} />
                <span>Price Increase Alerts</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4ade80]"></div>
              </label>
            </div>
            <p className="text-sm text-gray-500">Get notified when market prices increase</p>
          </div>

          <div className="bg-gray-100 rounded-lg p-4 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-orange-400" size={20} />
                <span>Inventory Alerts</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4ade80]"></div>
              </label>
            </div>
            <p className="text-sm text-gray-500">Get notified about inventory changes</p>
          </div>
        </div>
      </div>
    </div>
  );
}