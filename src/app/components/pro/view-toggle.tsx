/**
 * Card / list segmented control.
 *
 * Sets one shared preference across every OC Pro section — see `pro/view-mode.ts`.
 */

import { LayoutGrid, Rows3 } from "lucide-react";
import type { ProViewMode } from "../../pro/view-mode";
import { useProViewMode } from "../../pro/view-mode";

const OPTIONS: { value: ProViewMode; label: string; Icon: typeof LayoutGrid }[] = [
  { value: "grid", label: "Cards", Icon: LayoutGrid },
  { value: "table", label: "List", Icon: Rows3 },
];

export function ViewToggle() {
  const { viewMode, setViewMode } = useProViewMode();

  return (
    <div
      className="inline-flex items-center gap-1 rounded-xl border border-border/80 bg-muted/30 p-1"
      role="group"
      aria-label="Switch between card and list view"
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const isActive = viewMode === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setViewMode(value)}
            aria-pressed={isActive}
            title={`${label} view`}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              isActive
                ? "bg-muted/70 text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon size={16} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
