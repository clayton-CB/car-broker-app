import { TrendingUp, Heart, Clock } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { mockVehicles, garageVehicles, watchlistData } from "../data/mock-data";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useState, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

// Mock data for charts
const inventoryTrendData = [
  { month: "Aug", value: 18.5 },
  { month: "Sep", value: 21.2 },
  { month: "Oct", value: 19.8 },
  { month: "Nov", value: 23.1 },
  { month: "Dec", value: 20.5 },
  { month: "Jan", value: 24.2 },
  { month: "Feb", value: 25.8 },
];

const watchlistTrendData = [
  { month: "Jul", value: 8.2 },
  { month: "Aug", value: 9.1 },
  { month: "Sep", value: 10.5 },
  { month: "Oct", value: 11.2 },
  { month: "Nov", value: 12.8 },
  { month: "Dec", value: 14.5 },
];

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

interface Deal {
  id: string;
  clientName: string;
  vehicle: string;
  value: number;
  stage: "lead" | "qualified" | "negotiation" | "signed" | "deposit-received" | "vehicle-transit" | "vehicle-storage" | "vehicle-detailing" | "vehicle-ready" | "payment-received" | "delivered";
}

const mockDeals: Deal[] = [
  {
    id: "1",
    clientName: "John Smith",
    vehicle: "2023 Porsche 911 GT3",
    value: 3700000,
    stage: "deposit-received",
  },
  {
    id: "2",
    clientName: "Sarah Johnson",
    vehicle: "2024 Porsche 911 GT3 RS",
    value: 5200000,
    stage: "qualified",
  },
  {
    id: "3",
    clientName: "Mike Davis",
    vehicle: "2024 BMW M4 Competition",
    value: 1950000,
    stage: "vehicle-transit",
  },
  {
    id: "4",
    clientName: "Emma Wilson",
    vehicle: "2023 Porsche 911 Carrera",
    value: 4040000,
    stage: "lead",
  },
  {
    id: "5",
    clientName: "David Brown",
    vehicle: "2023 Mercedes-AMG GT R",
    value: 3200000,
    stage: "deposit-received",
  },
  {
    id: "6",
    clientName: "Lisa Anderson",
    vehicle: "2024 Porsche 911 Carrera",
    value: 4040000,
    stage: "delivered",
  },
  {
    id: "7",
    clientName: "Robert Taylor",
    vehicle: "2023 Audi RS6 Avant",
    value: 2500000,
    stage: "deposit-received",
  },
  {
    id: "8",
    clientName: "Jessica Martinez",
    vehicle: "2024 BMW M5 CS",
    value: 3100000,
    stage: "vehicle-storage",
  },
  {
    id: "9",
    clientName: "Chris Lee",
    vehicle: "2023 Mercedes-AMG C63",
    value: 1800000,
    stage: "vehicle-detailing",
  },
  {
    id: "10",
    clientName: "Amanda White",
    vehicle: "2024 Porsche Taycan Turbo S",
    value: 2900000,
    stage: "vehicle-ready",
  },
  {
    id: "11",
    clientName: "Tom Harris",
    vehicle: "2023 BMW M8 Competition",
    value: 2700000,
    stage: "payment-received",
  },
];

const DRAG_TYPE = "DEAL_CARD";

interface DraggableDealCardProps {
  deal: Deal;
  onClick: () => void;
}

function DraggableDealCard({ deal, onClick }: DraggableDealCardProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [{ isDragging }, drag] = useDrag({
    type: DRAG_TYPE,
    item: { id: deal.id },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });
  drag(ref);

  return (
    <button
      ref={ref}
      onClick={onClick}
      style={{ opacity: isDragging ? 0.4 : 1 }}
      className="w-full bg-white rounded-lg p-4 border border-gray-200 hover:border-[#4ade80] transition-colors text-left cursor-grab active:cursor-grabbing"
    >
      <p className="mb-1">{deal.clientName}</p>
      <p className="text-sm text-gray-500 mb-2">{deal.vehicle}</p>
      <p className="text-[#4ade80]">{formatCurrency(deal.value)}</p>
    </button>
  );
}

interface DroppableColumnProps {
  stage: Deal["stage"];
  label: string;
  deals: Deal[];
  onDrop: (dealId: string, newStage: Deal["stage"]) => void;
  onCardClick: (deal: Deal) => void;
  badgeClass?: string;
}

function DroppableColumn({ stage, label, deals, onDrop, onCardClick, badgeClass }: DroppableColumnProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isOver }, drop] = useDrop({
    accept: DRAG_TYPE,
    drop: (item: { id: string }) => onDrop(item.id, stage),
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  });
  drop(ref);

  return (
    <div
      ref={ref}
      className={`bg-gray-100 rounded-xl p-4 w-80 flex-shrink-0 transition-colors ${
        isOver ? "ring-2 ring-[#4ade80]" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg">{label}</h3>
        <span className={`px-2 py-1 rounded text-sm transition-colors ${badgeClass ?? "bg-gray-200"}`}>
          {deals.length}
        </span>
      </div>
      <div className="space-y-3 min-h-[4rem]">
        {deals.map((deal) => (
          <DraggableDealCard key={deal.id} deal={deal} onClick={() => onCardClick(deal)} />
        ))}
      </div>
    </div>
  );
}

function DashboardContent() {
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [brokerWatchlistIds, setBrokerWatchlistIds] = useState<string[]>([]);
  const [deals, setDeals] = useState<Deal[]>(mockDeals);

  function handleDrop(dealId: string, newStage: Deal["stage"]) {
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stage: newStage } : d))
    );
  }

  const totalInventoryValue = mockVehicles.reduce((sum, v) => sum + v.price, 0);
  
  // Calculate watchlist value
  const watchlistVehicleIds = new Set(watchlistData.map(w => w.vehicleId));
  const watchlistVehicles = mockVehicles.filter(v => watchlistVehicleIds.has(v.id));
  const totalWatchlistValue = watchlistVehicles.reduce((sum, v) => sum + v.price, 0);
  
  const inventoryGrowth = 0.21;
  const watchlistGrowth = 0.34;

  // Get recent AutoTrader listings for the feed
  const recentAutoTrader = mockVehicles
    .filter((v) => v.source.includes("autotrader") || v.source.includes("cars.co.za"))
    .sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime());

  // Get recent garage additions (without user names)
  const recentGarage = garageVehicles
    .sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime())
    .slice(0, 5);

  // Group deals by stage
  const dealsByStage = {
    lead: deals.filter(d => d.stage === "lead"),
    qualified: deals.filter(d => d.stage === "qualified"),
    negotiation: deals.filter(d => d.stage === "negotiation"),
    signed: deals.filter(d => d.stage === "signed"),
    depositReceived: deals.filter(d => d.stage === "deposit-received"),
    vehicleTransit: deals.filter(d => d.stage === "vehicle-transit"),
    vehicleStorage: deals.filter(d => d.stage === "vehicle-storage"),
    vehicleDetailing: deals.filter(d => d.stage === "vehicle-detailing"),
    vehicleReady: deals.filter(d => d.stage === "vehicle-ready"),
    paymentReceived: deals.filter(d => d.stage === "payment-received"),
    delivered: deals.filter(d => d.stage === "delivered"),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl mb-2">Dashboard</h1>
        <p className="text-gray-500">Overview of your inventory and sales pipeline</p>
      </div>

      {/* Top Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Total Inventory Value */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 transition-colors">
          <p className="text-gray-500 mb-2">Total Inventory Value</p>
          <div className="flex items-end justify-between mb-1">
            <h2 className="text-4xl">{formatCurrency(totalInventoryValue)}</h2>
            <div className="flex items-center gap-1 text-[#4ade80]">
              <TrendingUp size={20} />
              <span className="text-lg">+{(inventoryGrowth * 100).toFixed(0)}%</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-4">{mockVehicles.length} vehicles</p>
          <ResponsiveContainer width="100%" height={80}>
            <LineChart data={inventoryTrendData}>
              <XAxis dataKey="month" hide />
              <YAxis hide />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}
                labelStyle={{ color: '#111827' }}
                formatter={(value: number) => formatCurrency(value * 1000000)}
              />
              <Line type="monotone" dataKey="value" stroke="#4ade80" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Watchlist Total Value */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 transition-colors">
          <p className="text-gray-500 mb-2">Watchlist Total Value</p>
          <div className="flex items-end justify-between mb-1">
            <h2 className="text-4xl">{formatCurrency(totalWatchlistValue)}</h2>
            <div className="flex items-center gap-1 text-[#4ade80]">
              <TrendingUp size={20} />
              <span className="text-lg">+{(watchlistGrowth * 100).toFixed(0)}%</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-4">{watchlistVehicles.length} vehicles</p>
          <ResponsiveContainer width="100%" height={80}>
            <LineChart data={watchlistTrendData}>
              <XAxis dataKey="month" hide />
              <YAxis hide />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}
                labelStyle={{ color: '#111827' }}
                formatter={(value: number) => formatCurrency(value * 1000000)}
              />
              <Line type="monotone" dataKey="value" stroke="#4ade80" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sales Pipeline Kanban - Horizontal Scroll */}
      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 transition-colors">
        <h2 className="text-2xl mb-6">Sales Pipeline</h2>
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            <DroppableColumn stage="lead" label="Lead" deals={dealsByStage.lead} onDrop={handleDrop} onCardClick={setSelectedDeal} />
            <DroppableColumn stage="qualified" label="Qualified" deals={dealsByStage.qualified} onDrop={handleDrop} onCardClick={setSelectedDeal} />
            <DroppableColumn stage="negotiation" label="Negotiation" deals={dealsByStage.negotiation} onDrop={handleDrop} onCardClick={setSelectedDeal} />
            <DroppableColumn stage="signed" label="Signed" deals={dealsByStage.signed} onDrop={handleDrop} onCardClick={setSelectedDeal} />
            <DroppableColumn stage="deposit-received" label="Deposit Received" deals={dealsByStage.depositReceived} onDrop={handleDrop} onCardClick={setSelectedDeal} />
            <DroppableColumn stage="vehicle-transit" label="Vehicle in Transit" deals={dealsByStage.vehicleTransit} onDrop={handleDrop} onCardClick={setSelectedDeal} />
            <DroppableColumn stage="vehicle-storage" label="Vehicle in Storage" deals={dealsByStage.vehicleStorage} onDrop={handleDrop} onCardClick={setSelectedDeal} />
            <DroppableColumn stage="vehicle-detailing" label="Vehicle in Detailing" deals={dealsByStage.vehicleDetailing} onDrop={handleDrop} onCardClick={setSelectedDeal} />
            <DroppableColumn stage="vehicle-ready" label="Ready for Delivery" deals={dealsByStage.vehicleReady} onDrop={handleDrop} onCardClick={setSelectedDeal} />
            <DroppableColumn stage="payment-received" label="Payment Received" deals={dealsByStage.paymentReceived} onDrop={handleDrop} onCardClick={setSelectedDeal} />
            <DroppableColumn stage="delivered" label="Delivered" deals={dealsByStage.delivered} onDrop={handleDrop} onCardClick={setSelectedDeal} badgeClass="bg-[#4ade80] text-black" />
          </div>
        </div>
      </div>

      {/* AutoTrader Live Feed & New Garage Vehicles */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* AutoTrader Live Feed */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 transition-colors">
          <div className="flex items-center gap-2 mb-6">
            <Clock size={20} className="text-[#4ade80]" />
            <h2 className="text-2xl">Market Live Feed</h2>
          </div>
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {recentAutoTrader.map((vehicle) => (
              <div
                key={vehicle.id}
                className="bg-gray-100 rounded-xl overflow-hidden hover:bg-gray-200 transition-colors"
              >
                <div className="flex gap-4 p-4">
                  <ImageWithFallback
                    src={vehicleImages[vehicle.image]}
                    alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                    className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="mb-1">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {vehicle.mileage.toLocaleString()} km • {vehicle.color}
                    </p>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-lg text-[#4ade80]">{formatCurrency(vehicle.price)}</p>
                      <span className="text-xs text-gray-400">{formatDate(vehicle.addedDate)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400">{vehicle.source}</p>
                      <button
                        onClick={() => {
                          if (brokerWatchlistIds.includes(vehicle.id)) {
                            setBrokerWatchlistIds(prev => prev.filter(id => id !== vehicle.id));
                          } else {
                            setBrokerWatchlistIds(prev => [...prev, vehicle.id]);
                          }
                        }}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                          brokerWatchlistIds.includes(vehicle.id)
                            ? "bg-red-500 hover:bg-red-600 text-white"
                            : "bg-[#4ade80] hover:bg-[#3cbd6b] text-black"
                        }`}
                      >
                        <Heart size={14} className={brokerWatchlistIds.includes(vehicle.id) ? "fill-white" : ""} />
                        {brokerWatchlistIds.includes(vehicle.id) ? "Remove" : "Add to Watchlist"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* New Vehicles in Garages */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl">New Vehicles Added to Garages</h2>
            <span className="bg-gray-200 px-3 py-1 rounded-full text-sm transition-colors">
              {recentGarage.length} new
            </span>
          </div>
          <div className="space-y-3">
            {recentGarage.map((vehicle) => (
              <div
                key={vehicle.id}
                className="bg-gray-100 rounded-xl p-4 flex items-center justify-between hover:bg-gray-200 transition-colors"
              >
                <div>
                  <h3 className="text-lg mb-1">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                </div>
                <p className="text-sm text-gray-500">{formatDate(vehicle.addedDate)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Deal Details Modal */}
      {selectedDeal && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedDeal(null)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-lg w-full border border-gray-200 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl mb-6">Deal Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-500 text-sm mb-1">Client Name</p>
                <p className="text-xl">{selectedDeal.clientName}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Vehicle</p>
                <p className="text-xl">{selectedDeal.vehicle}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Deal Value</p>
                <p className="text-2xl text-[#4ade80]">{formatCurrency(selectedDeal.value)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Stage</p>
                <span className="inline-block bg-gray-100 px-4 py-2 rounded-lg capitalize transition-colors">
                  {selectedDeal.stage}
                </span>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setSelectedDeal(null)}
                className="flex-1 bg-[#4ade80] text-black px-4 py-3 rounded-lg hover:bg-[#3bc970] transition-colors"
              >
                Close
              </button>
              <button className="flex-1 bg-gray-100 border border-gray-200 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors">
                Edit Deal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function Dashboard() {
  return (
    <DndProvider backend={HTML5Backend}>
      <DashboardContent />
    </DndProvider>
  );
}