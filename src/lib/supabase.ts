import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
  console.warn(
    '[Supabase] Using placeholder credentials. Copy .env.example → .env.local and add real values.',
  )
}

// Using untyped client here; types are applied in individual hooks.
// When you have a generated schema, pass it as: createClient<Database>(url, key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
