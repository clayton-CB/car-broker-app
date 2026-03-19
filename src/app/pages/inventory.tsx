import { Search, Filter, Plus, ExternalLink, Heart, TrendingUp } from "lucide-react";
import { mockVehicles } from "../data/mock-data";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useState } from "react";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";

const vehicleImages: Record<string, string> = {
  "luxury sports car red": "https://images.unsplash.com/photo-1751336620135-21dd3a074b63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  "luxury sports car black": "https://images.unsplash.com/photo-1710823367826-02e38b3c9f67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  "luxury sports car silver": "https://images.unsplash.com/photo-1559930449-bd6838cfefb9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  "luxury sports car orange": "https://images.unsplash.com/photo-1583669133761-f381444b03b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  "luxury sports car blue": "https://images.unsplash.com/photo-1716341930202-af49146d9a1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  "luxury sports car green": "https://images.unsplash.com/photo-1769632793201-d6ba433de10e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
};

// Mock data for inventory value over time
const inventoryTrendData = [
  { month: "Aug", value: 18.5 },
  { month: "Sep", value: 21.2 },
  { month: "Oct", value: 19.8 },
  { month: "Nov", value: 23.1 },
  { month: "Dec", value: 20.5 },
  { month: "Jan", value: 24.2 },
  { month: "Feb", value: 25.8 },
];

function formatCurrency(value: number) {
  return `R ${(value / 1000000).toFixed(2)}m`;
}

export function Inventory() {
  const [selectedVehicle, setSelectedVehicle] = useState(mockVehicles[0]);

  const totalValue = mockVehicles.reduce((sum, v) => sum + v.price, 0);
  
  // Calculate growth percentage
  const firstValue = inventoryTrendData[0].value;
  const lastValue = inventoryTrendData[inventoryTrendData.length - 1].value;
  const growthPercentage = (((lastValue - firstValue) / firstValue) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header with Graph */}
      <div className="flex items-center justify-between gap-6">
        <div className="flex-shrink-0">
          <h1 className="text-3xl mb-2">Inventory Management</h1>
          <p className="text-gray-500">
            {mockVehicles.length} vehicles • Total value: {formatCurrency(totalValue)}
          </p>
        </div>
        
        {/* Inventory Trend Graph */}
        <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-4 min-w-[250px] max-w-[500px] transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Inventory Value Trend</span>
            <div className="flex items-center gap-1 text-[#4ade80] text-sm">
              <TrendingUp size={16} />
              <span>+{growthPercentage}%</span>
            </div>
          </div>
          <div style={{ width: '100%', height: '80px' }}>
            <ResponsiveContainer>
              <LineChart data={inventoryTrendData}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#4ade80" 
                  strokeWidth={2}
                  dot={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#111827'
                  }}
                  formatter={(value: number) => [`R ${value}m`, 'Value']}
                  labelStyle={{ color: '#888888' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <button className="flex-shrink-0 bg-[#4ade80] text-black px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#3bc970] transition-colors">
          <Plus size={20} />
          Add Vehicle
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by make, model, or year..."
            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-[#4ade80] transition-colors"
          />
        </div>
        <button className="bg-gray-100 border border-gray-200 px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition-colors">
          <Filter size={20} />
          Filters
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vehicle List */}
        <div className="lg:col-span-2 space-y-4">
          {mockVehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              onClick={() => setSelectedVehicle(vehicle)}
              className={`bg-gray-50 rounded-xl overflow-hidden border cursor-pointer transition-all ${
                selectedVehicle.id === vehicle.id
                  ? "border-[#4ade80]"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex gap-4 p-4">
                <ImageWithFallback
                  src={vehicleImages[vehicle.image]}
                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                  className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>
                    <button className="text-gray-400 hover:text-red-500 transition-colors">
                      <Heart size={20} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                    <span>{vehicle.year}</span>
                    <span>•</span>
                    <span>{vehicle.mileage.toLocaleString()} km</span>
                    <span>•</span>
                    <span>{vehicle.color}</span>
                  </div>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="text-2xl text-[#4ade80]">{formatCurrency(vehicle.price)}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="bg-gray-100 px-3 py-1 rounded-full transition-colors">{vehicle.source}</span>
                      <a
                        href="#"
                        className="flex items-center gap-1 hover:text-[#4ade80] transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={16} />
                        View
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Vehicle Details Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 sticky top-4 transition-colors">
            <h2 className="text-xl mb-4">Vehicle Details</h2>
            <ImageWithFallback
              src={vehicleImages[selectedVehicle.image]}
              alt={`${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="text-2xl mb-2">
              {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
            </h3>
            <p className="text-3xl text-[#4ade80] mb-6">{formatCurrency(selectedVehicle.price)}</p>

            {selectedVehicle.specs && (
              <div className="space-y-4">
                <h4 className="text-lg mb-3">Specifications</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {selectedVehicle.specs.engine && (
                    <div>
                      <p className="text-gray-500 mb-1">ENGINE</p>
                      <p>{selectedVehicle.specs.engine}</p>
                    </div>
                  )}
                  {selectedVehicle.specs.fuel && (
                    <div>
                      <p className="text-gray-500 mb-1">FUEL</p>
                      <p>{selectedVehicle.specs.fuel}</p>
                    </div>
                  )}
                  {selectedVehicle.specs.power && (
                    <div>
                      <p className="text-gray-500 mb-1">POWER</p>
                      <p>{selectedVehicle.specs.power}</p>
                    </div>
                  )}
                  {selectedVehicle.specs.torque && (
                    <div>
                      <p className="text-gray-500 mb-1">TORQUE</p>
                      <p>{selectedVehicle.specs.torque}</p>
                    </div>
                  )}
                  {selectedVehicle.specs.topSpeed && (
                    <div>
                      <p className="text-gray-500 mb-1">TOP SPEED</p>
                      <p>{selectedVehicle.specs.topSpeed}</p>
                    </div>
                  )}
                  {selectedVehicle.specs.acceleration && (
                    <div>
                      <p className="text-gray-500 mb-1">0-100</p>
                      <p>{selectedVehicle.specs.acceleration}</p>
                    </div>
                  )}
                  {selectedVehicle.specs.drivetrain && (
                    <div>
                      <p className="text-gray-500 mb-1">DRIVETRAIN</p>
                      <p>{selectedVehicle.specs.drivetrain}</p>
                    </div>
                  )}
                  {selectedVehicle.specs.transmission && (
                    <div>
                      <p className="text-gray-500 mb-1">TRANSMISSION</p>
                      <p>{selectedVehicle.specs.transmission}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
              <button className="w-full bg-[#4ade80] text-black px-4 py-3 rounded-lg hover:bg-[#3bc970] transition-colors">
                Edit Details
              </button>
              <button className="w-full bg-gray-100 border border-gray-200 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors">
                Mark as Sold
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}