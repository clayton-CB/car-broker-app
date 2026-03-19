import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Deal, DealInsert, DealStage, DealType } from '@/types'

export type { DealStage, DealType }

export interface DealFilters {
  stage?: DealStage
  type?: DealType
  vehicleId?: string
}

export interface DealWithVehicle extends Deal {
  vehicles: {
    id: string
    make: string
    model: string
    year: number
    asking_price: number | null
  } | null
}

async function fetchDeals(filters: DealFilters): Promise<DealWithVehicle[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from('deals') as any)
    .select('*, vehicles(id, make, model, year, asking_price)')
    .order('created_at', { ascending: false })

  if (filters.stage)     query = query.eq('stage', filters.stage)
  if (filters.type)      query = query.eq('type', filters.type)
  if (filters.vehicleId) query = query.eq('vehicle_id', filters.vehicleId)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as DealWithVehicle[]
}

async function fetchDeal(id: string): Promise<DealWithVehicle> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('deals') as any)
    .select('*, vehicles(id, make, model, year, asking_price)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as DealWithVehicle
}

export function useDeals(filters: DealFilters = {}) {
  return useQuery({
    queryKey: ['deals', filters],
    queryFn: () => fetchDeals(filters),
  })
}

export function useDeal(id: string) {
  return useQuery({
    queryKey: ['deals', id],
    queryFn: () => fetchDeal(id),
    enabled: !!id,
  })
}

export function useCreateDeal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (deal: DealInsert) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from('deals') as any).insert(deal).select().single()
      if (error) throw error
      return data as Deal
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deals'] }),
  })
}

export function useUpdateDeal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<DealInsert> }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from('deals') as any)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Deal
    },
    onSuccess: (_data: Deal, { id }: { id: string; updates: Partial<DealInsert> }) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] })
      queryClient.invalidateQueries({ queryKey: ['deals', id] })
    },
  })
}

export function useUpdateDealStage() {
  const { mutate, mutateAsync, ...rest } = useUpdateDeal()
  return {
    ...rest,
    mutate: (id: string, stage: DealStage) => mutate({ id, updates: { stage } }),
    mutateAsync: (id: string, stage: DealStage) => mutateAsync({ id, updates: { stage } }),
  }
}
