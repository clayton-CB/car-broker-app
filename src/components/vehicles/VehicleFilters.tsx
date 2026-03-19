import { useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import type { VehicleFilters } from '@/hooks/useVehicles'

interface VehicleFiltersProps {
  filters: VehicleFilters
  onChange: (filters: VehicleFilters) => void
}

const STATUS_OPTIONS = ['available', 'pending', 'sold', 'acquired']

export default function VehicleFiltersBar({ filters, onChange }: VehicleFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  function update(patch: Partial<VehicleFilters>) {
    onChange({ ...filters, ...patch })
  }

  function clearAll() {
    onChange({})
  }

  const hasFilters = Object.values(filters).some((v) => v !== undefined && v !== '')

  return (
    <div className="space-y-3">
      {/* Search + toggle row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search make, model, VIN…"
            value={filters.search ?? ''}
            onChange={(e) => update({ search: e.target.value || undefined })}
            className="w-full rounded-lg border bg-white py-2 pl-9 pr-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <button
          onClick={() => setShowAdvanced((v) => !v)}
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium shadow-sm transition-colors ${
            showAdvanced ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-700'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 rounded-lg border bg-white px-3 py-2 text-sm text-gray-500 shadow-sm hover:text-red-500"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="grid grid-cols-2 gap-3 rounded-xl border bg-white p-4 shadow-sm sm:grid-cols-3 lg:grid-cols-6">
          <input
            placeholder="Make"
            value={filters.make ?? ''}
            onChange={(e) => update({ make: e.target.value || undefined })}
            className="input-field"
          />
          <input
            placeholder="Model"
            value={filters.model ?? ''}
            onChange={(e) => update({ model: e.target.value || undefined })}
            className="input-field"
          />
          <input
            type="number"
            placeholder="Year from"
            value={filters.yearMin ?? ''}
            onChange={(e) => update({ yearMin: e.target.value ? +e.target.value : undefined })}
            className="input-field"
          />
          <input
            type="number"
            placeholder="Year to"
            value={filters.yearMax ?? ''}
            onChange={(e) => update({ yearMax: e.target.value ? +e.target.value : undefined })}
            className="input-field"
          />
          <input
            type="number"
            placeholder="Max price"
            value={filters.priceMax ?? ''}
            onChange={(e) => update({ priceMax: e.target.value ? +e.target.value : undefined })}
            className="input-field"
          />
          <select
            value={filters.status ?? ''}
            onChange={(e) => update({ status: e.target.value || undefined })}
            className="input-field"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
