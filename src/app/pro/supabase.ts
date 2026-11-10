/**
 * Supabase client for OC Pro.
 *
 * Only `api.ts` — the data seam — should import this. Pages and components stay unaware of
 * where their data comes from, which is what makes the switch from dummy data to live queries
 * a one-file change.
 *
 * Configuration comes from the environment, never from source, because this repository is
 * public:
 *
 *   VITE_SUPABASE_URL              https://<project-ref>.supabase.co
 *   VITE_SUPABASE_PUBLISHABLE_KEY  sb_publishable_... (safe in a browser bundle; the
 *                                  database is protected by RLS, not by hiding this key)
 *
 * Set both in `.env.local` for local work and in the Vercel project for deployments.
 *
 * When either is absent the client is null and the seam keeps serving its built-in sample
 * data, so the deployed demo never breaks because an environment variable is missing.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

/** True once both environment variables are present. */
export const isSupabaseConfigured = Boolean(url && publishableKey);

/**
 * The client, or null when OC Pro has no backend configured.
 *
 * Deliberately nullable rather than throwing at import time: a missing variable should
 * degrade the app to sample data, not white-screen it.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, publishableKey as string, {
      auth: {
        // The portal has no sign-in yet. Once broker auth lands, remove this block so
        // sessions persist and tokens refresh.
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

/**
 * The client, or an explanatory error. Use this inside seam functions that genuinely require
 * a backend, so the failure surfaces as a readable message in the UI rather than a crash.
 */
export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY."
    );
  }
  return supabase;
}
