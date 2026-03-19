import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Car, Gauge, Hash, Palette, FileText } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { useVehicle } from '@/hooks/useVehicles'
import type { VehicleStatus } from '@/types'

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

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: vehicle, isLoading, error } = useVehicle(id!)

  if (isLoading) return <div className="animate-pulse text-gray-400">Loading…</div>
  if (error || !vehicle) return <div className="text-red-500">Vehicle not found.</div>

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        to="/inventory"
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Inventory
      </Link>

      {/* Hero */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="flex h-56 items-center justify-center rounded-t-xl bg-gray-100">
          {vehicle.image_urls.length > 0 ? (
            <img
              src={vehicle.image_urls[0]}
              alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
              className="h-full w-full rounded-t-xl object-cover"
            />
          ) : (
            <Car className="h-20 w-20 text-gray-300" />
          )}
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-gray-400">{vehicle.make}</p>
              <h1 className="text-2xl font-bold text-gray-900">
                {vehicle.year} {vehicle.model}
                {vehicle.trim && <span className="ml-1 font-normal text-gray-500">{vehicle.trim}</span>}
              </h1>
            </div>
            <Badge variant={statusVariant[vehicle.status]}>
              {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
            </Badge>
          </div>

          {/* Specs grid */}
          <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {vehicle.mileage != null && (
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-gray-400" />
                <div>
                  <dt className="text-xs text-gray-400">Mileage</dt>
                  <dd className="text-sm font-medium">{vehicle.mileage.toLocaleString()} mi</dd>
                </div>
              </div>
            )}
            {vehicle.vin && (
              <div className="flex items-center gap-2 col-span-2">
                <Hash className="h-4 w-4 text-gray-400" />
                <div>
                  <dt className="text-xs text-gray-400">VIN</dt>
                  <dd className="text-sm font-mono font-medium">{vehicle.vin}</dd>
                </div>
              </div>
            )}
            {vehicle.color && (
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-gray-400" />
                <div>
                  <dt className="text-xs text-gray-400">Color</dt>
                  <dd className="text-sm font-medium">{vehicle.color}</dd>
                </div>
              </div>
            )}
          </dl>

          {/* Pricing */}
          <div className="mt-5 grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
            <div>
              <p className="text-xs text-gray-500">Asking Price</p>
              <p className="text-xl font-bold text-gray-900">{fmt(vehicle.asking_price)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Purchase Cost</p>
              <p className="text-xl font-bold text-gray-900">{fmt(vehicle.purchase_price)}</p>
            </div>
          </div>

          {/* Notes */}
          {vehicle.notes && (
            <div className="mt-5 flex gap-3 rounded-lg border bg-gray-50 p-4">
              <FileText className="h-4 w-4 mt-0.5 shrink-0 text-gray-400" />
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{vehicle.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
