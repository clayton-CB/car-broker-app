import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: string
  trendUp?: boolean
}

export default function StatCard({ label, value, icon: Icon, trend, trendUp }: StatCardProps) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <div className="rounded-lg bg-brand-50 p-2">
          <Icon className="h-5 w-5 text-brand-600" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold text-gray-900">{value}</p>
      {trend && (
        <p className={`mt-1 text-xs font-medium ${trendUp ? 'text-green-600' : 'text-red-500'}`}>
          {trend}
        </p>
      )}
    </div>
  )
}
