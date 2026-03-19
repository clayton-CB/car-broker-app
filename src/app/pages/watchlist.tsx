import { Heart, Trash2, Bell, Users, User, ChevronDown, ChevronUp } from "lucide-react";
import { mockVehicles, watchlistData } from "../data/mock-data";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useState } from "react";

const vehicleImages: Record<string, string> = {
  "luxury sports car red": "https://images.unsplash.com/photo-1751336620135-21dd3a074b63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  "luxury sports car black": "https://images.unsplash.com/photo-1710823367826-02e38b3c9f67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  "luxury sports car silver": "https://images.unsplash.com/photo-1559930449-bd6838cfefb9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  "luxury sports car orange": "https://images.unsplash.com/photo-1583669133761-f381444b03b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  "luxury sports car blue": "https://images.unsplash.com/photo-1716341930202-af49146d9a1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  "luxury sports car green": "https://images.unsplash.com/photo-1769632793201-d6ba433de10e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
};

function formatCurrency(value: number) {
  return `R ${(value / 1000000).toFixed(2)}m`;
}

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

interface InterestStats {
  activelyLooking: number;
  addToCollection: number;
  mightBeInterested: number;
  justLooking: number;
  total: number;
}

function calculateInterestStats(watchers: any[]): InterestStats {
  const stats = {
    activelyLooking: 0,
    addToCollection: 0,
    mightBeInterested: 0,
    justLooking: 0,
    total: watchers.length,
  };

  watchers.forEach((watcher) => {
    switch (watcher.interestLevel) {
      case "actively-looking":
        stats.activelyLooking++;
        break;
      case "add-to-collection":
        stats.addToCollection++;
        break;
      case "might-be-interested":
        stats.mightBeInterested++;
        break;
      case "just-looking":
        stats.justLooking++;
        break;
    }
  });

  return stats;
}

function VerticalInterestBarChart({ stats }: { stats: InterestStats }) {
  if (stats.total === 0) return null;

  const maxCount = Math.max(
    stats.activelyLooking,
    stats.addToCollection,
    stats.mightBeInterested,
    stats.justLooking
  );

  // Scale to a max height of 60px
  const maxHeight = 60;
  
  const activelyLookingHeight = maxCount > 0 ? (stats.activelyLooking / maxCount) * maxHeight : 0;
  const addToCollectionHeight = maxCount > 0 ? (stats.addToCollection / maxCount) * maxHeight : 0;
  const mightBeInterestedHeight = maxCount > 0 ? (stats.mightBeInterested / maxCount) * maxHeight : 0;
  const justLookingHeight = maxCount > 0 ? (stats.justLooking / maxCount) * maxHeight : 0;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-end gap-1.5 h-[60px]">
        {/* Actively Looking - Green */}
        <div className="flex flex-col items-center gap-1">
          <div
            className="w-8 bg-[#4ade80] rounded-t"
            style={{ height: `${activelyLookingHeight}px` }}
          />
          <span className="text-xs text-gray-900 font-medium">{stats.activelyLooking}</span>
        </div>

        {/* Add to Collection - Blue */}
        <div className="flex flex-col items-center gap-1">
          <div
            className="w-8 bg-blue-500 rounded-t"
            style={{ height: `${addToCollectionHeight}px` }}
          />
          <span className="text-xs text-gray-900 font-medium">{stats.addToCollection}</span>
        </div>

        {/* Might Be Interested - Yellow */}
        <div className="flex flex-col items-center gap-1">
          <div
            className="w-8 bg-yellow-500 rounded-t"
            style={{ height: `${mightBeInterestedHeight}px` }}
          />
          <span className="text-xs text-gray-900 font-medium">{stats.mightBeInterested}</span>
        </div>

        {/* Just Looking - Gray */}
        <div className="flex flex-col items-center gap-1">
          <div
            className="w-8 bg-gray-400 rounded-t"
            style={{ height: `${justLookingHeight}px` }}
          />
          <span className="text-xs text-gray-900 font-medium">{stats.justLooking}</span>
        </div>
      </div>
      <div className="text-xs text-gray-500">
        {stats.total} total
      </div>
    </div>
  );
}

function InterestBarChart({ stats, platformWatchCount, totalWatchCount }: { stats: InterestStats; platformWatchCount: InterestStats; totalWatchCount: number }) {
  // Merge client and platform stats
  const combinedStats = {
    activelyLooking: stats.activelyLooking + platformWatchCount.activelyLooking,
    addToCollection: stats.addToCollection + platformWatchCount.addToCollection,
    mightBeInterested: stats.mightBeInterested + platformWatchCount.mightBeInterested,
    justLooking: stats.justLooking + platformWatchCount.justLooking,
    total: stats.total + platformWatchCount.total,
  };

  if (combinedStats.total === 0) return null;

  const activelyLookingPercent = (combinedStats.activelyLooking / combinedStats.total) * 100;
  const addToCollectionPercent = (combinedStats.addToCollection / combinedStats.total) * 100;
  const mightBeInterestedPercent = (combinedStats.mightBeInterested / combinedStats.total) * 100;
  const justLookingPercent = (combinedStats.justLooking / combinedStats.total) * 100;

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500 mb-1">Interest levels:</p>
      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
        <Users size={14} />
        <span>
          <span className="text-gray-900">{totalWatchCount}</span> users added this vehicle to their Watchlist
        </span>
      </div>
      <div className="space-y-2">
        {/* Actively Looking */}
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-[#4ade80] h-full rounded-full"
              style={{ width: `${activelyLookingPercent}%` }}
            />
          </div>
          <span className="text-sm text-gray-900 font-medium w-6 text-right">{combinedStats.activelyLooking}</span>
          <span className="text-sm text-gray-600 w-36">Actively looking</span>
        </div>
        
        {/* Add to Collection */}
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full"
              style={{ width: `${addToCollectionPercent}%` }}
            />
          </div>
          <span className="text-sm text-gray-900 font-medium w-6 text-right">{combinedStats.addToCollection}</span>
          <span className="text-sm text-gray-600 w-36">Add to collection</span>
        </div>
        
        {/* Might Be Interested */}
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-yellow-500 h-full rounded-full"
              style={{ width: `${mightBeInterestedPercent}%` }}
            />
          </div>
          <span className="text-sm text-gray-900 font-medium w-6 text-right">{combinedStats.mightBeInterested}</span>
          <span className="text-sm text-gray-600 w-36">Might be interested</span>
        </div>
        
        {/* Just Looking */}
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gray-400 h-full rounded-full"
              style={{ width: `${justLookingPercent}%` }}
            />
          </div>
          <span className="text-sm text-gray-900 font-medium w-6 text-right">{combinedStats.justLooking}</span>
          <span className="text-sm text-gray-600 w-36">Just looking</span>
        </div>
      </div>
    </div>
  );
}

export function Watchlist() {
  // State for managing broker's watchlist with add dates
  const [brokerWatchlistIds, setBrokerWatchlistIds] = useState<string[]>(["2", "4", "5"]);
  const [brokerWatchlistDates, setBrokerWatchlistDates] = useState<Record<string, string>>({
    "2": "2024-02-21T10:00:00Z",
    "4": "2024-02-22T14:00:00Z", 
    "5": "2024-02-23T18:00:00Z",
  });
  
  // State for tracking source of added vehicles (from market feed)
  const [brokerWatchlistSources, setBrokerWatchlistSources] = useState<Record<string, string>>({});
  
  // State for managing dropdown visibility for each vehicle
  const [expandedVehicles, setExpandedVehicles] = useState<Record<string, boolean>>({});
  
  // State for sort option
  const [sortBy, setSortBy] = useState<string>("total");
  
  const brokerWatchlist = mockVehicles.filter((v) => brokerWatchlistIds.includes(v.id));
  const totalBrokerWatchlistValue = brokerWatchlist.reduce((sum, v) => sum + v.price, 0);

  // Function to toggle dropdown for a specific vehicle
  const toggleDropdown = (vehicleId: string) => {
    setExpandedVehicles((prev) => ({
      ...prev,
      [vehicleId]: !prev[vehicleId],
    }));
  };

  // Function to add/remove vehicle from broker's watchlist
  const toggleBrokerWatchlist = (vehicleId: string) => {
    setBrokerWatchlistIds((prev) => {
      if (prev.includes(vehicleId)) {
        // Remove from watchlist
        setBrokerWatchlistDates((dates) => {
          const newDates = { ...dates };
          delete newDates[vehicleId];
          return newDates;
        });
        setBrokerWatchlistSources((sources) => {
          const newSources = { ...sources };
          delete newSources[vehicleId];
          return newSources;
        });
        return prev.filter((id) => id !== vehicleId);
      } else {
        // Add to watchlist with current date
        setBrokerWatchlistDates((dates) => ({
          ...dates,
          [vehicleId]: new Date().toISOString(),
        }));
        setBrokerWatchlistSources((sources) => ({
          ...sources,
          [vehicleId]: "market-feed",
        }));
        return [...prev, vehicleId];
      }
    });
  };

  // Group watchlist by vehicle (client watchlists)
  const watchlistByVehicle = watchlistData.reduce((acc, item) => {
    if (!acc[item.vehicleId]) {
      acc[item.vehicleId] = [];
    }
    acc[item.vehicleId].push(item);
    return acc;
  }, {} as Record<string, typeof watchlistData>);

  // Mock platform user counts (non-clients) for each vehicle with interest level distributions
  const platformWatchCounts: Record<string, InterestStats> = {
    "1": {
      activelyLooking: 8,
      addToCollection: 6,
      mightBeInterested: 5,
      justLooking: 4,
      total: 23,
    },
    "2": {
      activelyLooking: 15,
      addToCollection: 12,
      mightBeInterested: 10,
      justLooking: 8,
      total: 45,
    },
    "3": {
      activelyLooking: 4,
      addToCollection: 3,
      mightBeInterested: 3,
      justLooking: 2,
      total: 12,
    },
    "4": {
      activelyLooking: 11,
      addToCollection: 8,
      mightBeInterested: 7,
      justLooking: 5,
      total: 31,
    },
    "5": {
      activelyLooking: 6,
      addToCollection: 5,
      mightBeInterested: 4,
      justLooking: 3,
      total: 18,
    },
    "6": {
      activelyLooking: 9,
      addToCollection: 7,
      mightBeInterested: 6,
      justLooking: 5,
      total: 27,
    },
  };

  // Get unique vehicles with watch count (client watchlists)
  const watchedVehicles = mockVehicles
    .filter((v) => watchlistByVehicle[v.id])
    .map((v) => {
      const watchers = watchlistByVehicle[v.id];
      const clientStats = calculateInterestStats(watchers);
      const platformStats = platformWatchCounts[v.id] || { activelyLooking: 0, addToCollection: 0, mightBeInterested: 0, justLooking: 0, total: 0 };
      
      // Calculate combined stats for sorting
      const combinedStats = {
        activelyLooking: clientStats.activelyLooking + platformStats.activelyLooking,
        addToCollection: clientStats.addToCollection + platformStats.addToCollection,
        mightBeInterested: clientStats.mightBeInterested + platformStats.mightBeInterested,
        justLooking: clientStats.justLooking + platformStats.justLooking,
        total: clientStats.total + platformStats.total,
      };
      
      return {
        ...v,
        watchers,
        watchCount: watchers.length,
        platformWatchCount: platformStats,
        stats: clientStats,
        combinedStats,
      };
    })
    .sort((a, b) => {
      if (sortBy === "total") {
        return b.combinedStats.total - a.combinedStats.total;
      } else if (sortBy === "actively-looking") {
        return b.combinedStats.activelyLooking - a.combinedStats.activelyLooking;
      } else if (sortBy === "add-to-collection") {
        return b.combinedStats.addToCollection - a.combinedStats.addToCollection;
      } else if (sortBy === "might-be-interested") {
        return b.combinedStats.mightBeInterested - a.combinedStats.mightBeInterested;
      } else if (sortBy === "just-looking") {
        return b.combinedStats.justLooking - a.combinedStats.justLooking;
      }
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl mb-2">Watchlist</h1>
        <p className="text-gray-500">
          Track your personal interests and monitor client watchlists
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT SIDE: Broker's Personal Watchlist */}
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <User className="text-[#4ade80]" size={24} />
              <div>
                <h2 className="text-2xl">My Watchlist</h2>
                <p className="text-sm text-gray-500">
                  {brokerWatchlist.length} vehicles • {formatCurrency(totalBrokerWatchlistValue)} total value
                </p>
              </div>
            </div>
          </div>

          {/* Broker's Watched Vehicles */}
          <div className="space-y-3">
            {brokerWatchlist.map((vehicle) => (
              <div
                key={vehicle.id}
                className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden hover:border-[#4ade80] transition-colors"
              >
                <div className="flex gap-4 p-4">
                  <ImageWithFallback
                    src={vehicleImages[vehicle.image]}
                    alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                    className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg mb-1">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
                          <span>{vehicle.mileage.toLocaleString()} km</span>
                          <span>•</span>
                          <span>{vehicle.color}</span>
                          {brokerWatchlistSources[vehicle.id] && (
                            <>
                              <span>•</span>
                              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded">
                                {brokerWatchlistSources[vehicle.id] === "market-feed" ? "AutoTrader" : vehicle.source}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0" onClick={() => toggleBrokerWatchlist(vehicle.id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <p className="text-xl text-[#4ade80]">{formatCurrency(vehicle.price)}</p>
                  </div>
                </div>
              </div>
            ))}

            {brokerWatchlist.length === 0 && (
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 text-center transition-colors">
                <Heart className="mx-auto mb-3 text-gray-400" size={40} />
                <h3 className="text-lg mb-1">No vehicles in your watchlist</h3>
                <p className="text-sm text-gray-500">
                  Add vehicles to track them for yourself
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: Client Watchlists */}
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 transition-colors">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-3">
                <Users className="text-[#4ade80]" size={24} />
                <div>
                  <h2 className="text-2xl">OC Community Demand</h2>
                  <p className="text-sm text-gray-500">
                    {watchedVehicles.length} vehicles watched by {watchlistData.length} clients
                  </p>
                </div>
              </div>
              
              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-500">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-900 text-sm transition-colors cursor-pointer hover:border-[#4ade80] focus:outline-none focus:border-[#4ade80]"
                >
                  <option value="total">Total Watchers</option>
                  <option value="actively-looking">Actively Looking</option>
                  <option value="add-to-collection">Add to Collection</option>
                  <option value="might-be-interested">Might Be Interested</option>
                  <option value="just-looking">Just Looking</option>
                </select>
              </div>
            </div>
          </div>

          {/* Client Watched Vehicles */}
          <div className="space-y-4">
            {watchedVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden transition-colors"
              >
                <div className="flex gap-4 p-4">
                  <ImageWithFallback
                    src={vehicleImages[vehicle.image]}
                    alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                    className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                      <div>
                        <h3 className="text-xl mb-1">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span>{vehicle.color}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => toggleBrokerWatchlist(vehicle.id)}
                        className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                          brokerWatchlistIds.includes(vehicle.id)
                            ? "bg-red-500 hover:bg-red-600 text-white"
                            : "bg-[#4ade80] hover:bg-[#3cbd6b] text-black"
                        }`}
                      >
                        {brokerWatchlistIds.includes(vehicle.id) ? "Remove from Watchlist" : "Add to My Watchlist"}
                      </button>
                    </div>
                    <p className="text-2xl text-[#4ade80] mb-4">{formatCurrency(vehicle.price)}</p>

                    {/* Interest Bar Chart - Moved Above */}
                    <div className="bg-gray-100 rounded-lg p-4 mb-4 transition-colors">
                      <InterestBarChart 
                        stats={calculateInterestStats(vehicle.watchers)} 
                        platformWatchCount={vehicle.platformWatchCount} 
                        totalWatchCount={vehicle.watchCount + vehicle.platformWatchCount.total} 
                      />
                    </div>

                    {/* Watchers List */}
                    <div className="bg-gray-100 rounded-lg transition-colors">
                      <button
                        onClick={() => toggleDropdown(vehicle.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-200 transition-colors rounded-lg"
                      >
                        <h4 className="text-sm text-gray-500">
                          Blackbook Watchlist ({Math.min(3, vehicle.watchCount)})
                        </h4>
                        {expandedVehicles[vehicle.id] ? (
                          <ChevronUp size={18} className="text-gray-500" />
                        ) : (
                          <ChevronDown size={18} className="text-gray-500" />
                        )}
                      </button>
                      
                      {expandedVehicles[vehicle.id] && (
                        <div className="px-4 pb-4 space-y-2">
                          {vehicle.watchers.slice(0, 3).map((watcher, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <span className="text-gray-700">{watcher.addedBy}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                watcher.interestLevel === "actively-looking"
                                  ? "bg-[#4ade80] text-black"
                                  : watcher.interestLevel === "add-to-collection"
                                  ? "bg-blue-500 text-white"
                                  : watcher.interestLevel === "might-be-interested"
                                  ? "bg-yellow-500 text-black"
                                  : "bg-gray-400 text-white"
                              }`}>
                                {watcher.interestLevel === "actively-looking"
                                  ? "Actively looking"
                                  : watcher.interestLevel === "add-to-collection"
                                  ? "Add to collection"
                                  : watcher.interestLevel === "might-be-interested"
                                  ? "Might be interested"
                                  : "Just looking"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {watchedVehicles.length === 0 && (
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-12 text-center transition-colors">
                <Heart className="mx-auto mb-4 text-gray-400" size={48} />
                <h3 className="text-xl mb-2">No vehicles in client watchlists</h3>
                <p className="text-gray-500">
                  Vehicles added to client watchlists will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}