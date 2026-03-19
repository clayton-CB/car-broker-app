import { Link } from 'react-router-dom'
import Badge from '@/components/ui/Badge'
import type { DealWithVehicle } from '@/hooks/useDeals'
import type { DealStage, DealType } from '@/types'

const STAGES: { key: DealStage; label: string }[] = [
  { key: 'prospect',    label: 'Prospect' },
  { key: 'negotiation', label: 'Negotiation' },
  { key: 'inspection',  label: 'Inspection' },
  { key: 'financing',   label: 'Financing' },
  { key: 'closing',     label: 'Closing' },
  { key: 'completed',   label: 'Completed' },
]

const typeVariant: Record<DealType, 'info' | 'success'> = {
  buy:  'info',
  sell: 'success',
}

function fmt(n: number | null) {
  if (n == null) return null
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

interface DealKanbanProps {
  deals: DealWithVehicle[]
}

export default function DealKanban({ deals }: DealKanbanProps) {
  const byStage = (stage: DealStage) => deals.filter((d) => d.stage === stage)

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STAGES.map(({ key, label }) => {
        const column = byStage(key)
        return (
          <div key={key} className="w-56 shrink-0">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {label}
              </h3>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                {column.length}
              </span>
            </div>

            <div className="space-y-2">
              {column.map((deal) => (
                <Link
                  key={deal.id}
                  to={`/deals/${deal.id}`}
                  className="block rounded-lg border bg-white p-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <Badge variant={typeVariant[deal.type]}>
                      {deal.type === 'buy' ? 'Buy' : 'Sell'}
                    </Badge>
                    {deal.offer_price && (
                      <span className="text-xs font-semibold text-gray-800">
                        {fmt(deal.offer_price)}
                      </span>
                    )}
                  </div>
                  {deal.vehicles ? (
                    <p className="text-sm font-medium text-gray-900 leading-tight">
                      {deal.vehicles.year} {deal.vehicles.make} {deal.vehicles.model}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">Vehicle removed</p>
                  )}
                  {deal.expected_close_date && (
                    <p className="mt-1 text-xs text-gray-400">
                      Close {new Date(deal.expected_close_date).toLocaleDateString()}
                    </p>
                  )}
                </Link>
              ))}

              {column.length === 0 && (
                <div className="rounded-lg border-2 border-dashed border-gray-200 py-6 text-center">
                  <p className="text-xs text-gray-400">No deals</p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
