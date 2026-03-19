// Auto-generated types from Supabase schema.
// Run `npx supabase gen types typescript --linked` to regenerate after schema changes.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type VehicleStatus = 'available' | 'pending' | 'sold' | 'acquired'
export type DealStage =
  | 'prospect'
  | 'negotiation'
  | 'inspection'
  | 'financing'
  | 'closing'
  | 'completed'
  | 'cancelled'
export type DealType = 'buy' | 'sell'

export interface Database {
  public: {
    Tables: {
      vehicles: {
        Row: Vehicle
        Insert: VehicleInsert
        Update: Partial<VehicleInsert>
      }
      deals: {
        Row: Deal
        Insert: DealInsert
        Update: Partial<DealInsert>
      }
      contacts: {
        Row: Contact
        Insert: ContactInsert
        Update: Partial<ContactInsert>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      vehicle_status: VehicleStatus
      deal_stage: DealStage
      deal_type: DealType
    }
  }
}

// ─── Vehicles ────────────────────────────────────────────────────────────────

export interface Vehicle {
  id: string
  created_at: string
  updated_at: string
  make: string
  model: string
  year: number
  trim: string | null
  vin: string | null
  color: string | null
  mileage: number | null
  status: VehicleStatus
  asking_price: number | null
  purchase_price: number | null
  notes: string | null
  image_urls: string[]
}

export type VehicleInsert = Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>

// ─── Deals ───────────────────────────────────────────────────────────────────

export interface Deal {
  id: string
  created_at: string
  updated_at: string
  vehicle_id: string
  contact_id: string | null
  type: DealType
  stage: DealStage
  offer_price: number | null
  final_price: number | null
  expected_close_date: string | null
  closed_at: string | null
  notes: string | null
}

export type DealInsert = Omit<Deal, 'id' | 'created_at' | 'updated_at'>

// ─── Contacts ────────────────────────────────────────────────────────────────

export interface Contact {
  id: string
  created_at: string
  updated_at: string
  name: string
  email: string | null
  phone: string | null
  notes: string | null
}

export type ContactInsert = Omit<Contact, 'id' | 'created_at' | 'updated_at'>
