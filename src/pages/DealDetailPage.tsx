import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Car, Calendar, FileText } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { useDeal } from '@/hooks/useDeals'
import type { DealStage, DealType } from '@/types'

const STAGE_ORDER: DealStage[] = [
  'prospect', 'negotiation', 'inspection', 'financing', 'closing', 'completed',
]

const stageLabel: Record<DealStage, string> = {
  prospect:    'Prospect',
  negotiation: 'Negotiation',
  inspection:  'Inspection',
  financing:   'Financing',
  closing:     'Closing',
  completed:   'Completed',
  cancelled:   'Cancelled',
}

const typeVariant: Record<DealType, 'info' | 'success'> = {
  buy:  'info',
  sell: 'success',
}

function fmt(n: number | null) {
  if (n == null) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

export default function DealDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: deal, isLoading, error } = useDeal(id!)

  if (isLoading) return <div className="animate-pulse text-gray-400">Loading…</div>
  if (error || !deal) return <div className="text-red-500">Deal not found.</div>

  const currentStageIdx = STAGE_ORDER.indexOf(deal.stage as DealStage)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link to="/deals" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800">
        <ArrowLeft className="h-4 w-4" />
        Back to Pipeline
      </Link>

      <div className="rounded-xl border bg-white shadow-sm p-6 space-y-5">
        {/* Title row */}
        <div className="flex items-start justify-between">
          <div>
            {deal.vehicles ? (
              <>
                <p className="text-xs text-gray-400 uppercase tracking-wide">{deal.vehicles.make}</p>
                <h1 className="text-xl font-bold text-gray-900">
                  {deal.vehicles.year} {deal.vehicles.make} {deal.vehicles.model}
                </h1>
              </>
            ) : (
              <h1 className="text-xl font-bold text-gray-900">Deal #{deal.id.slice(0, 8)}</h1>
            )}
          </div>
          <Badge variant={typeVariant[deal.type]}>
            {deal.type === 'buy' ? 'Buy' : 'Sell'}
          </Badge>
        </div>

        {/* Stage progress */}
        <div>
          <p className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Stage</p>
          <div className="flex items-center gap-1">
            {STAGE_ORDER.map((s, i) => (
              <div key={s} className="flex items-center gap-1 flex-1 min-w-0">
                <div
                  className={`h-2 flex-1 rounded-full ${
                    i <= currentStageIdx ? 'bg-brand-500' : 'bg-gray-200'
                  }`}
                />
              </div>
            ))}
          </div>
          <p className="mt-1 text-sm font-medium text-gray-700 capitalize">{stageLabel[deal.stage as DealStage]}</p>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
          <div>
            <p className="text-xs text-gray-500">Offer Price</p>
            <p className="text-xl font-bold text-gray-900">{fmt(deal.offer_price)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Final Price</p>
            <p className="text-xl font-bold text-gray-900">{fmt(deal.final_price)}</p>
          </div>
        </div>

        {/* Dates */}
        <div className="flex flex-col gap-2">
          {deal.expected_close_date && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4 text-gray-400" />
              Expected close: {new Date(deal.expected_close_date).toLocaleDateString()}
            </div>
          )}
          {deal.closed_at && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4 text-green-500" />
              Closed: {new Date(deal.closed_at).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* Vehicle link */}
        {deal.vehicles && (
          <Link
            to={`/inventory/${deal.vehicles.id}`}
            className="flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Car className="h-4 w-4 text-gray-400" />
            View vehicle in inventory
          </Link>
        )}

        {/* Notes */}
        {deal.notes && (
          <div className="flex gap-3 rounded-lg border bg-gray-50 p-4">
            <FileText className="h-4 w-4 mt-0.5 shrink-0 text-gray-400" />
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{deal.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
