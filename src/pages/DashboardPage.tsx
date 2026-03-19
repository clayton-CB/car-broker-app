import { Car, ArrowLeftRight, TrendingUp, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import StatCard from '@/components/ui/StatCard'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { useDeals } from '@/hooks/useDeals'
import { useVehicles } from '@/hooks/useVehicles'
import Badge from '@/components/ui/Badge'
import type { DealType } from '@/types'

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

const typeVariant: Record<DealType, 'info' | 'success'> = {
  buy:  'info',
  sell: 'success',
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: recentDeals } = useDeals()
  const { data: recentVehicles } = useVehicles({ status: 'available' })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Overview of your brokerage activity</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Inventory"
          value={statsLoading ? '…' : (stats?.totalVehicles ?? 0)}
          icon={Car}
        />
        <StatCard
          label="Available"
          value={statsLoading ? '…' : (stats?.availableVehicles ?? 0)}
          icon={Car}
        />
        <StatCard
          label="Active Deals"
          value={statsLoading ? '…' : (stats?.activeDeals ?? 0)}
          icon={ArrowLeftRight}
        />
        <StatCard
          label="Revenue (MTD)"
          value={statsLoading ? '…' : fmt(stats?.totalRevenue ?? 0)}
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent deals */}
        <section className="rounded-xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="font-semibold text-gray-800">Recent Deals</h2>
            <Link to="/deals" className="text-xs font-medium text-brand-600 hover:underline">
              View all
            </Link>
          </div>
          <ul className="divide-y">
            {(recentDeals ?? []).slice(0, 5).map((deal) => (
              <li key={deal.id}>
                <Link
                  to={`/deals/${deal.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {deal.vehicles
                        ? `${deal.vehicles.year} ${deal.vehicles.make} ${deal.vehicles.model}`
                        : 'Unknown vehicle'}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">{deal.stage}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={typeVariant[deal.type]}>
                      {deal.type === 'buy' ? 'Buy' : 'Sell'}
                    </Badge>
                    {deal.offer_price && (
                      <span className="text-sm font-semibold text-gray-700">
                        {fmt(deal.offer_price)}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
            {!recentDeals?.length && (
              <li className="px-5 py-8 text-center text-sm text-gray-400">No deals yet</li>
            )}
          </ul>
        </section>

        {/* Available vehicles */}
        <section className="rounded-xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="font-semibold text-gray-800">Available Vehicles</h2>
            <Link to="/inventory" className="text-xs font-medium text-brand-600 hover:underline">
              View all
            </Link>
          </div>
          <ul className="divide-y">
            {(recentVehicles ?? []).slice(0, 5).map((v) => (
              <li key={v.id}>
                <Link
                  to={`/inventory/${v.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {v.year} {v.make} {v.model}
                    </p>
                    {v.mileage != null && (
                      <p className="text-xs text-gray-400">{v.mileage.toLocaleString()} mi</p>
                    )}
                  </div>
                  {v.asking_price != null && (
                    <span className="text-sm font-semibold text-gray-700">
                      {fmt(v.asking_price)}
                    </span>
                  )}
                </Link>
              </li>
            ))}
            {!recentVehicles?.length && (
              <li className="px-5 py-8 text-center text-sm text-gray-400">No available vehicles</li>
            )}
          </ul>
        </section>
      </div>

      {/* Avg days to close */}
      {stats && stats.avgDaysToClose > 0 && (
        <div className="flex items-center gap-3 rounded-xl border bg-white px-5 py-4 shadow-sm">
          <Clock className="h-5 w-5 text-brand-500" />
          <p className="text-sm text-gray-700">
            Average time to close a deal this month:{' '}
            <span className="font-semibold">{stats.avgDaysToClose} days</span>
          </p>
        </div>
      )}
    </div>
  )
}
