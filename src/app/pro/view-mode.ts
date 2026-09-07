/**
 * Grid or table, shared across every OC Pro section.
 *
 * React port of the Vue portal's `composables/useProViewMode.ts`. The original design
 * decision is preserved: a broker who prefers dense tables prefers them everywhere, so this
 * is ONE preference rather than one per page.
 *
 * Held in a module-level store (same pattern as `store.ts`) so every mounted page re-renders
 * together, and mirrored to localStorage so it survives a reload. Reads and writes are
 * wrapped because a browser set to block site data throws on access.
 */

import { useSyncExternalStore } from "react";

export type ProViewMode = "grid" | "table";

const STORAGE_KEY = "oc-pro-view-mode";

const readStored = (): ProViewMode => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "table" || stored === "grid" ? stored : "grid";
  } catch {
    return "grid";
  }
};

let viewMode: ProViewMode = readStored();

const listeners = new Set<() => void>();

const getSnapshot = (): ProViewMode => viewMode;

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const setViewMode = (mode: ProViewMode): void => {
  if (mode === viewMode) return;
  viewMode = mode;
  try {
    window.localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Preference is still applied for this session; persistence is best-effort.
  }
  listeners.forEach((listener) => listener());
};

export function useProViewMode(): {
  viewMode: ProViewMode;
  setViewMode: (mode: ProViewMode) => void;
} {
  const mode = useSyncExternalStore(subscribe, getSnapshot, () => "grid" as ProViewMode);
  return { viewMode: mode, setViewMode };
}
