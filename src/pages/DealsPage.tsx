import { useState } from 'react'
import { Plus, ArrowLeftRight } from 'lucide-react'
import DealKanban from '@/components/deals/DealKanban'
import EmptyState from '@/components/ui/EmptyState'
import { useDeals, type DealFilters } from '@/hooks/useDeals'
import type { DealType } from '@/types'

export default function DealsPage() {
  const [filters, setFilters] = useState<DealFilters>({})
  const { data: deals, isLoading, error } = useDeals(filters)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deal Pipeline</h1>
          <p className="text-sm text-gray-500">
            {deals ? `${deals.length} deal${deals.length !== 1 ? 's' : ''}` : '…'}
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          <Plus className="h-4 w-4" />
          New Deal
        </button>
      </div>

      {/* Type filter */}
      <div className="flex gap-2">
        {(['', 'buy', 'sell'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilters((f) => ({ ...f, type: (t as DealType) || undefined }))}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              (filters.type ?? '') === t
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t === '' ? 'All' : t === 'buy' ? 'Buys' : 'Sells'}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-56 shrink-0 space-y-2">
              <div className="h-4 animate-pulse rounded bg-gray-200" />
              {Array.from({ length: 2 }).map((_, j) => (
                <div key={j} className="h-20 animate-pulse rounded-lg bg-gray-200" />
              ))}
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          Failed to load deals. Check your Supabase credentials in <code>.env.local</code>.
        </div>
      )}

      {!isLoading && !error && deals?.length === 0 && (
        <EmptyState
          icon={ArrowLeftRight}
          title="No deals yet"
          description="Create your first deal to start tracking the pipeline."
        />
      )}

      {!isLoading && deals && deals.length > 0 && <DealKanban deals={deals} />}
    </div>
  )
}
