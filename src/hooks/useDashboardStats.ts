import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface DashboardStats {
  totalVehicles: number
  availableVehicles: number
  activeDeals: number
  completedDealsThisMonth: number
  totalRevenue: number
  avgDaysToClose: number
}

interface VehicleRow { status: string }
interface DealRow { stage: string }
interface CompletedDealRow { final_price: number | null; closed_at: string | null; created_at: string }

async function fetchDashboardStats(): Promise<DashboardStats> {
  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const [vehiclesRes, activeDealsRes, completedDealsRes] = await Promise.all([
    db.from('vehicles').select('status'),
    db.from('deals').select('stage').not('stage', 'in', '("completed","cancelled")'),
    db
      .from('deals')
      .select('final_price, closed_at, created_at')
      .eq('stage', 'completed')
      .gte('closed_at', firstOfMonth),
  ])

  if (vehiclesRes.error) throw vehiclesRes.error
  if (activeDealsRes.error) throw activeDealsRes.error
  if (completedDealsRes.error) throw completedDealsRes.error

  const vehicles: VehicleRow[] = vehiclesRes.data ?? []
  const activeDeals: DealRow[] = activeDealsRes.data ?? []
  const completed: CompletedDealRow[] = completedDealsRes.data ?? []

  const totalRevenue = completed.reduce((sum, d) => sum + (d.final_price ?? 0), 0)

  const avgDaysToClose =
    completed.length > 0
      ? completed.reduce((sum, d) => {
          if (!d.closed_at) return sum
          const days =
            (new Date(d.closed_at).getTime() - new Date(d.created_at).getTime()) /
            (1000 * 60 * 60 * 24)
          return sum + days
        }, 0) / completed.length
      : 0

  return {
    totalVehicles: vehicles.length,
    availableVehicles: vehicles.filter((v) => v.status === 'available').length,
    activeDeals: activeDeals.length,
    completedDealsThisMonth: completed.length,
    totalRevenue,
    avgDaysToClose: Math.round(avgDaysToClose),
  }
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  })
}
