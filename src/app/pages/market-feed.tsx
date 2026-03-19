import { useState } from "react";
import { Heart, Eye, Bell, Filter, X, Star, ChevronRight, ChevronLeft } from "lucide-react";
import { mockVehicles } from "../data/mock-data";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

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

export function MarketFeed() {
  const [sortBy, setSortBy] = useState<string>("recent");
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);
  const [alertIds, setAlertIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const totalPages = 5;
  
  // Filter states
  const [filters, setFilters] = useState({
    brand: "",
    minYear: "",
    maxYear: "",
    minPrice: "",
    maxPrice: "",
    minMileage: "",
    maxMileage: "",
    color: "",
  });

  // Sort vehicles
  const sortedVehicles = [...mockVehicles].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime();
      case "brand":
        return a.make.localeCompare(b.make);
      case "year":
        return b.year - a.year;
      case "mileage":
        return a.mileage - b.mileage;
      case "value":
        return b.price - a.price;
      default:
        return 0;
    }
  });

  // Filter vehicles
  const filteredVehicles = sortedVehicles.filter((vehicle) => {
    if (filters.brand && !vehicle.make.toLowerCase().includes(filters.brand.toLowerCase())) {
      return false;
    }
    if (filters.minYear && vehicle.year < parseInt(filters.minYear)) {
      return false;
    }
    if (filters.maxYear && vehicle.year > parseInt(filters.maxYear)) {
      return false;
    }
    if (filters.minPrice && vehicle.price < parseFloat(filters.minPrice) * 1000000) {
      return false;
    }
    if (filters.maxPrice && vehicle.price > parseFloat(filters.maxPrice) * 1000000) {
      return false;
    }
    if (filters.minMileage && vehicle.mileage < parseInt(filters.minMileage)) {
      return false;
    }
    if (filters.maxMileage && vehicle.mileage > parseInt(filters.maxMileage)) {
      return false;
    }
    if (filters.color && !vehicle.color.toLowerCase().includes(filters.color.toLowerCase())) {
      return false;
    }
    return true;
  });

  const selectedVehicle = filteredVehicles.find((v) => v.id === selectedVehicleId);

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const toggleWatchlist = (id: string) => {
    setWatchlistIds((prev) =>
      prev.includes(id) ? prev.filter((wid) => wid !== id) : [...prev, id]
    );
  };

  const toggleAlert = (id: string) => {
    setAlertIds((prev) =>
      prev.includes(id) ? prev.filter((aid) => aid !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    setFilters({
      brand: "",
      minYear: "",
      maxYear: "",
      minPrice: "",
      maxPrice: "",
      minMileage: "",
      maxMileage: "",
      color: "",
    });
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== "");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl mb-2">Market Feed</h1>
        <p className="text-gray-500">
          Browse vehicles from various marketplaces
        </p>
      </div>

      {/* Controls Bar */}
      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 transition-colors">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1 w-full">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-sm text-gray-500 whitespace-nowrap">
                Sort by:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 sm:flex-initial px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-900 text-sm transition-colors cursor-pointer hover:border-[#4ade80] focus:outline-none focus:border-[#4ade80]"
              >
                <option value="recent">Most Recent</option>
                <option value="brand">Brand</option>
                <option value="year">Year</option>
                <option value="mileage">Mileage</option>
                <option value="value">Value</option>
              </select>
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showFilters || hasActiveFilters
                  ? "bg-[#4ade80] text-black"
                  : "bg-white border border-gray-200 hover:border-[#4ade80]"
              }`}
            >
              <Filter size={18} />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {Object.values(filters).filter((v) => v !== "").length}
                </span>
              )}
            </button>
          </div>

          {/* Vehicle Count */}
          <p className="text-sm text-gray-500">
            {filteredVehicles.length} of {mockVehicles.length} vehicles
          </p>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">
                  Brand
                </label>
                <input
                  type="text"
                  placeholder="e.g., Porsche"
                  value={filters.brand}
                  onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-900 text-sm transition-colors focus:outline-none focus:border-[#4ade80]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-500 mb-1">
                  Color
                </label>
                <input
                  type="text"
                  placeholder="e.g., Red"
                  value={filters.color}
                  onChange={(e) => setFilters({ ...filters, color: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-900 text-sm transition-colors focus:outline-none focus:border-[#4ade80]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-500 mb-1">
                  Min Year
                </label>
                <input
                  type="number"
                  placeholder="2020"
                  value={filters.minYear}
                  onChange={(e) => setFilters({ ...filters, minYear: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-900 text-sm transition-colors focus:outline-none focus:border-[#4ade80]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-500 mb-1">
                  Max Year
                </label>
                <input
                  type="number"
                  placeholder="2024"
                  value={filters.maxYear}
                  onChange={(e) => setFilters({ ...filters, maxYear: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-900 text-sm transition-colors focus:outline-none focus:border-[#4ade80]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-500 mb-1">
                  Min Price (R m)
                </label>
                <input
                  type="number"
                  placeholder="1.5"
                  step="0.1"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-900 text-sm transition-colors focus:outline-none focus:border-[#4ade80]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-500 mb-1">
                  Max Price (R m)
                </label>
                <input
                  type="number"
                  placeholder="5.0"
                  step="0.1"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-900 text-sm transition-colors focus:outline-none focus:border-[#4ade80]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-500 mb-1">
                  Min Mileage (km)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.minMileage}
                  onChange={(e) => setFilters({ ...filters, minMileage: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-900 text-sm transition-colors focus:outline-none focus:border-[#4ade80]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-500 mb-1">
                  Max Mileage (km)
                </label>
                <input
                  type="number"
                  placeholder="50000"
                  value={filters.maxMileage}
                  onChange={(e) => setFilters({ ...filters, maxMileage: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-900 text-sm transition-colors focus:outline-none focus:border-[#4ade80]"
                />
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
                >
                  <X size={16} />
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Master-Detail Layout */}
      <div className="flex gap-6">
        {/* Vehicle List - Left Side */}
        <div className={`${selectedVehicle ? 'flex-1' : 'w-full'} space-y-2`}>
          {filteredVehicles.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-200">
              <p className="text-gray-500 text-lg mb-4">
                No vehicles match your filters
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 rounded-lg bg-[#4ade80] hover:bg-[#3cbd6b] text-black transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            filteredVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                onClick={() => setSelectedVehicleId(vehicle.id)}
                className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all border ${
                  selectedVehicleId === vehicle.id
                    ? 'bg-[#4ade80]/10 border-[#4ade80]'
                    : 'bg-gray-50 border-gray-200 hover:border-[#4ade80]'
                }`}
              >
                {/* Thumbnail */}
                <ImageWithFallback
                  src={vehicleImages[vehicle.image]}
                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                />

                {/* Vehicle Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <span>{vehicle.mileage.toLocaleString()} km</span>
                    <span>•</span>
                    <span>{vehicle.color}</span>
                  </div>
                </div>

                {/* Price and Icons */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-lg text-[#4ade80] font-medium">{formatCurrency(vehicle.price)}</p>
                    <p className="text-xs text-gray-400">{formatDate(vehicle.addedDate)}</p>
                  </div>

                  {/* Quick Action Icons */}
                  <div className="flex items-center gap-1">
                    {favoriteIds.includes(vehicle.id) && (
                      <Star size={16} className="text-yellow-400 fill-yellow-400" />
                    )}
                    {watchlistIds.includes(vehicle.id) && (
                      <Eye size={16} className="text-[#4ade80]" />
                    )}
                    {alertIds.includes(vehicle.id) && (
                      <Bell size={16} className="text-orange-500" />
                    )}
                  </div>

                  <ChevronRight size={20} className="text-gray-400" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail Panel - Right Side */}
        {selectedVehicle && (
          <div className="hidden lg:block w-96 space-y-4">
            <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden sticky top-4">
              {/* Large Image */}
              <ImageWithFallback
                src={vehicleImages[selectedVehicle.image]}
                alt={`${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`}
                className="w-full h-64 object-cover"
              />

              <div className="p-6 space-y-4">
                {/* Title */}
                <div>
                  <h2 className="text-2xl mb-2">
                    {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                  </h2>
                  <p className="text-3xl text-[#4ade80]">{formatCurrency(selectedVehicle.price)}</p>
                </div>

                {/* Details */}
                <div className="space-y-3 py-4 border-t border-b border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Year</span>
                    <span>{selectedVehicle.year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Mileage</span>
                    <span>{selectedVehicle.mileage.toLocaleString()} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Color</span>
                    <span>{selectedVehicle.color}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Source</span>
                    <span className="text-sm">{selectedVehicle.source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Added</span>
                    <span className="text-sm">{formatDate(selectedVehicle.addedDate)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(selectedVehicle.id);
                    }}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                      favoriteIds.includes(selectedVehicle.id)
                        ? "bg-yellow-400 hover:bg-yellow-500 text-black"
                        : "bg-white border border-gray-200 hover:border-yellow-400"
                    }`}
                  >
                    <Star
                      size={18}
                      className={favoriteIds.includes(selectedVehicle.id) ? "fill-black" : ""}
                    />
                    <span>
                      {favoriteIds.includes(selectedVehicle.id) ? "Remove Favorite" : "Add to Favorites"}
                    </span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWatchlist(selectedVehicle.id);
                    }}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                      watchlistIds.includes(selectedVehicle.id)
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-[#4ade80] hover:bg-[#3cbd6b] text-black"
                    }`}
                  >
                    <Eye size={18} />
                    <span>
                      {watchlistIds.includes(selectedVehicle.id) ? "Remove from Watchlist" : "Add to Watchlist"}
                    </span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAlert(selectedVehicle.id);
                    }}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                      alertIds.includes(selectedVehicle.id)
                        ? "bg-orange-500 hover:bg-orange-600 text-white"
                        : "bg-white border border-gray-200 hover:border-orange-500"
                    }`}
                  >
                    <Bell size={18} />
                    <span>
                      {alertIds.includes(selectedVehicle.id) ? "Remove Alert" : "Create Alert"}
                    </span>
                  </button>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedVehicleId(null)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors text-sm"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredVehicles.length > 0 && (
        <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-4 border border-gray-200">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              currentPage === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white hover:bg-[#4ade80] hover:text-black border border-gray-200"
            }`}
          >
            <ChevronLeft size={18} />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <div className="flex items-center gap-2">
            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg transition-colors ${
                    currentPage === page
                      ? "bg-[#4ade80] text-black"
                      : "bg-white hover:bg-gray-200 border border-gray-200"
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              currentPage === totalPages
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white hover:bg-[#4ade80] hover:text-black border border-gray-200"
            }`}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}