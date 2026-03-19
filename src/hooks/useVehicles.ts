import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Vehicle, VehicleInsert } from '@/types'

export interface VehicleFilters {
  make?: string
  model?: string
  yearMin?: number
  yearMax?: number
  priceMin?: number
  priceMax?: number
  status?: string
  search?: string
}

async function fetchVehicles(filters: VehicleFilters): Promise<Vehicle[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from('vehicles') as any).select('*').order('created_at', { ascending: false })

  if (filters.make)     query = query.ilike('make', `%${filters.make}%`)
  if (filters.model)    query = query.ilike('model', `%${filters.model}%`)
  if (filters.yearMin)  query = query.gte('year', filters.yearMin)
  if (filters.yearMax)  query = query.lte('year', filters.yearMax)
  if (filters.priceMin) query = query.gte('asking_price', filters.priceMin)
  if (filters.priceMax) query = query.lte('asking_price', filters.priceMax)
  if (filters.status)   query = query.eq('status', filters.status)
  if (filters.search) {
    query = query.or(
      `make.ilike.%${filters.search}%,model.ilike.%${filters.search}%,vin.ilike.%${filters.search}%`,
    )
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as Vehicle[]
}

async function fetchVehicle(id: string): Promise<Vehicle> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('vehicles') as any).select('*').eq('id', id).single()
  if (error) throw error
  return data as Vehicle
}

export function useVehicles(filters: VehicleFilters = {}) {
  return useQuery({
    queryKey: ['vehicles', filters],
    queryFn: () => fetchVehicles(filters),
  })
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: ['vehicles', id],
    queryFn: () => fetchVehicle(id),
    enabled: !!id,
  })
}

export function useCreateVehicle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (vehicle: VehicleInsert) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from('vehicles') as any).insert(vehicle).select().single()
      if (error) throw error
      return data as Vehicle
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  })
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<VehicleInsert> }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from('vehicles') as any)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Vehicle
    },
    onSuccess: (_data: Vehicle, { id }: { id: string; updates: Partial<VehicleInsert> }) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      queryClient.invalidateQueries({ queryKey: ['vehicles', id] })
    },
  })
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('vehicles') as any).delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  })
}
