# CarBroker Pro — Project Guide

## Stack

| Layer       | Technology                                   |
|-------------|----------------------------------------------|
| Frontend    | React 18 + TypeScript (via Vite)             |
| Routing     | React Router v6                              |
| Data/cache  | TanStack Query v5                            |
| Styling     | Tailwind CSS v3                              |
| Icons       | Lucide React                                 |
| Backend     | Supabase (Postgres + Auth + Storage)         |
| DB client   | @supabase/supabase-js v2                     |

## Project Structure

```
car-broker-app/
├── supabase/
│   └── migrations/
│       └── 0001_initial_schema.sql   # Full DB schema — run this first
├── src/
│   ├── lib/
│   │   └── supabase.ts               # Supabase client (reads env vars)
│   ├── types/
│   │   ├── database.ts               # All DB types: Vehicle, Deal, Contact
│   │   └── index.ts                  # Re-exports
│   ├── hooks/
│   │   ├── useVehicles.ts            # CRUD + filter hooks for vehicles
│   │   ├── useDeals.ts               # CRUD + filter hooks for deals
│   │   └── useDashboardStats.ts      # Aggregated KPI query
│   ├── components/
│   │   ├── Layout.tsx                # Sidebar + nav shell
│   │   ├── ui/
│   │   │   ├── Badge.tsx             # Status/type pill
│   │   │   ├── StatCard.tsx          # KPI card
│   │   │   └── EmptyState.tsx        # Empty list placeholder
│   │   ├── vehicles/
│   │   │   ├── VehicleCard.tsx       # Grid card for a vehicle
│   │   │   └── VehicleFilters.tsx    # Search + filter bar
│   │   └── deals/
│   │       └── DealKanban.tsx        # Stage-column kanban board
│   ├── pages/
│   │   ├── DashboardPage.tsx         # KPIs + recent activity
│   │   ├── InventoryPage.tsx         # Vehicle grid with filters
│   │   ├── VehicleDetailPage.tsx     # Single vehicle view
│   │   ├── DealsPage.tsx             # Kanban pipeline
│   │   └── DealDetailPage.tsx        # Single deal view
│   ├── App.tsx                       # Route definitions
│   ├── main.tsx                      # React entry point
│   └── index.css                     # Tailwind base + .input-field utility
├── .env.example                      # Credential template
├── .env.local                        # Placeholder credentials (gitignored)
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Supabase
1. Create a project at https://supabase.com
2. Open the SQL editor and run `supabase/migrations/0001_initial_schema.sql`
3. Copy `.env.example` to `.env.local` and fill in your project URL + anon key:
   ```
   VITE_SUPABASE_URL=https://<your-project>.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-anon-key>
   ```

### 3. Run the dev server
```bash
npm run dev
```

## Key Conventions

- **Path alias**: `@/` maps to `src/` (configured in `vite.config.ts` + `tsconfig.json`)
- **Data fetching**: All Supabase calls live in `src/hooks/`. Pages never call `supabase` directly.
- **Types**: All DB types are in `src/types/database.ts`. Import from `@/types`.
- **Env vars**: All Vite env vars must be prefixed `VITE_` to be accessible in the browser.

## Database Tables

| Table      | Purpose                                  |
|------------|------------------------------------------|
| `vehicles` | Inventory — cars the broker owns/tracks  |
| `deals`    | Buy/sell pipeline deals, linked to vehicles |
| `contacts` | Buyers, sellers, and other parties       |

## Deal Stages (in order)
`prospect` → `negotiation` → `inspection` → `financing` → `closing` → `completed`
(or `cancelled` at any point)

## Vehicle Statuses
- `available` — listed for sale
- `pending`   — under offer / in process
- `acquired`  — bought, not yet listed
- `sold`      — transaction complete

## Next Steps / Roadmap
- [ ] Add vehicle create/edit form
- [ ] Add deal create/edit form with vehicle selector
- [ ] Add contact management page
- [ ] Wire up Supabase Auth (email/password or OAuth)
- [ ] Replace open RLS dev policies with user-scoped policies
- [ ] Add image upload via Supabase Storage
- [ ] Add deal profit margin calculation
