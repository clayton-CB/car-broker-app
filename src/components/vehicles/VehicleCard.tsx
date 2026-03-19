import { Link } from 'react-router-dom'
import { Car, Gauge } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import type { Vehicle, VehicleStatus } from '@/types'

const statusVariant: Record<VehicleStatus, 'success' | 'warning' | 'neutral' | 'danger'> = {
  available: 'success',
  pending:   'warning',
  acquired:  'neutral',
  sold:      'danger',
}

function fmt(n: number | null) {
  if (n == null) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

interface VehicleCardProps {
  vehicle: Vehicle
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <Link
      to={`/inventory/${vehicle.id}`}
      className="group flex flex-col rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Image placeholder */}
      <div className="flex h-40 items-center justify-center rounded-t-xl bg-gray-100">
        {vehicle.image_urls.length > 0 ? (
          <img
            src={vehicle.image_urls[0]}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            className="h-full w-full rounded-t-xl object-cover"
          />
        ) : (
          <Car className="h-16 w-16 text-gray-300" />
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{vehicle.make}</p>
            <h3 className="font-semibold text-gray-900 leading-tight">
              {vehicle.year} {vehicle.model}
              {vehicle.trim && <span className="font-normal text-gray-500"> {vehicle.trim}</span>}
            </h3>
          </div>
          <Badge variant={statusVariant[vehicle.status]}>
            {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
          </Badge>
        </div>

        {vehicle.mileage != null && (
          <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
            <Gauge className="h-3.5 w-3.5" />
            {vehicle.mileage.toLocaleString()} mi
          </div>
        )}

        <div className="mt-auto pt-3 border-t border-gray-100">
          <p className="text-lg font-bold text-gray-900">{fmt(vehicle.asking_price)}</p>
          {vehicle.purchase_price != null && (
            <p className="text-xs text-gray-400">Cost: {fmt(vehicle.purchase_price)}</p>
          )}
        </div>
      </div>
    </Link>
  )
}
