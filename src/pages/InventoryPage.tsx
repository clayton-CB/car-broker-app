import { useState } from 'react'
import { Plus, Car } from 'lucide-react'
import VehicleCard from '@/components/vehicles/VehicleCard'
import VehicleFiltersBar from '@/components/vehicles/VehicleFilters'
import EmptyState from '@/components/ui/EmptyState'
import { useVehicles, type VehicleFilters } from '@/hooks/useVehicles'

export default function InventoryPage() {
  const [filters, setFilters] = useState<VehicleFilters>({})
  const { data: vehicles, isLoading, error } = useVehicles(filters)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-500">
            {vehicles ? `${vehicles.length} vehicle${vehicles.length !== 1 ? 's' : ''}` : '…'}
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          <Plus className="h-4 w-4" />
          Add Vehicle
        </button>
      </div>

      {/* Filters */}
      <VehicleFiltersBar filters={filters} onChange={setFilters} />

      {/* Grid */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          Failed to load vehicles. Check your Supabase credentials in <code>.env.local</code>.
        </div>
      )}

      {!isLoading && !error && vehicles?.length === 0 && (
        <EmptyState
          icon={Car}
          title="No vehicles found"
          description="Try adjusting your filters or add a new vehicle to get started."
        />
      )}

      {!isLoading && vehicles && vehicles.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {vehicles.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      )}
    </div>
  )
}
