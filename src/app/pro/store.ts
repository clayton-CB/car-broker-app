/**
 * OC PRO SESSION STORE.
 *
 * The Vue portal kept session-scoped mutable copies of the dummy dataset in Nuxt's
 * `useState`, so edits survived route changes. The React equivalent is this small external
 * store read through `useSyncExternalStore` — no global state library needed for four lists.
 *
 * Once the seam reads from Supabase these become plain refetches and this store shrinks to
 * a cache (or disappears behind a server-state library if one is ever justified).
 */

import { useSyncExternalStore } from "react";
import type { ProBrokerWatchlistEntry, ProClient, ProVehicle } from "./types";
import {
  DUMMY_BLACK_BOOK,
  DUMMY_CLIENTS,
  DUMMY_MY_WATCHLIST,
  DUMMY_STOCK,
} from "./dummy-data";

export interface ProState {
  stock: ProVehicle[];
  blackBook: ProVehicle[];
  clients: ProClient[];
  myWatchlist: ProBrokerWatchlistEntry[];
}

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

let state: ProState = {
  stock: clone(DUMMY_STOCK),
  blackBook: clone(DUMMY_BLACK_BOOK),
  clients: clone(DUMMY_CLIENTS),
  myWatchlist: clone(DUMMY_MY_WATCHLIST),
};

const listeners = new Set<() => void>();

export const proStore = {
  getState: (): ProState => state,
  setState(partial: Partial<ProState>) {
    state = { ...state, ...partial };
    listeners.forEach((listener) => listener());
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

/** Re-renders the component whenever any slice of the pro state changes. */
export function useProState(): ProState {
  return useSyncExternalStore(proStore.subscribe, proStore.getState);
}
