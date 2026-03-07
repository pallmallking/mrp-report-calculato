# Copilot Instructions for MRP Report Calculator

## Project Overview

This is a **Material Requirements Planning (MRP) Calculator** — a web application for manufacturing teams to compute production schedules, inventory requirements, and purchase orders based on product demand and bill of materials.

The app is built using the **GitHub Spark** platform (a framework for building lightweight, persistent web apps hosted on GitHub).

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build tool**: Vite with `@vitejs/plugin-react-swc`
- **Styling**: Tailwind CSS v4 (with `@tailwindcss/vite` plugin)
- **UI components**: Radix UI primitives wrapped in custom shadcn/ui-style components (located in `src/components/ui/`)
- **Icons**: Phosphor Icons (`@phosphor-icons/react`)
- **Notifications**: Sonner (`sonner`)
- **Persistence**: `useKV` hook from `@github/spark/hooks` — a key-value store backed by Spark's KV database
- **Platform**: GitHub Spark (`@github/spark`)

## Project Structure

```
src/
  App.tsx                    # Root component; manages global state, tab navigation, MRP calc trigger
  components/
    BOMManager.tsx           # Bill of Materials management (products and their components)
    InventoryManager.tsx     # Inventory tracking (on-hand quantities + scheduled receipts)
    DemandManager.tsx        # Demand schedule management (products, quantities, due dates)
    MRPReport.tsx            # MRP results display with time-phased tables + CSV export
    ui/                      # Reusable UI primitives (button, card, dialog, table, badge, etc.)
  lib/
    types.ts                 # TypeScript interfaces for all data models
    mrp-calculator.ts        # Core MRP calculation engine (pure function)
    utils.ts                 # Utility helpers (cn() for Tailwind class merging)
  index.css                  # Global CSS variables and Tailwind base styles
  main.tsx                   # App entry point
.github/
  dependabot.yml             # Automated dependency updates
  copilot-instructions.md    # This file
PRD.md                       # Product requirements document
```

## Data Models

All types are defined in `src/lib/types.ts`:

- **`Product`** — A finished good with a bill of materials. Has `id`, `name`, and `components: BOMComponent[]`.
- **`BOMComponent`** — A raw material or sub-assembly in a product's BOM. Has `componentId` (references an `InventoryItem.id`), `quantityPerUnit`, and `leadTime` (in days).
- **`InventoryItem`** — A material with `onHand` (camelCase, on-hand stock quantity) and `scheduledReceipts: ScheduledReceipt[]`.
- **`ScheduledReceipt`** — An incoming inventory delivery with `quantity` and `dueDate` (ISO date string).
- **`Demand`** — A customer order or forecast for a `productId` with `quantity` and `dueDate`.
- **`MRPRow`** — One row in the MRP report, covering all time periods for a single item.
- **`PeriodData`** — MRP calculations for a single time bucket: `grossRequirements`, `scheduledReceipts`, `projectedOnHand`, `netRequirements`, `plannedOrderReceipt`, `plannedOrderRelease`.

## MRP Calculation Logic

The calculation engine is in `src/lib/mrp-calculator.ts` (`calculateMRP` function):

1. **Time buckets**: Weekly periods (0–11), starting from today.
2. **Gross requirements**: Derived from `Demand` entries. Due dates are mapped to week periods.
3. **BOM explosion**: For each demand, component requirements are derived from `quantityPerUnit` and offset earlier by lead time.
4. **Net requirements**: `max(0, grossRequirements - projectedOnHand)`.
5. **Planned order receipt**: Equal to net requirements (lot-for-lot policy).
6. **Planned order release**: Currently equal to planned order receipt with no additional offset. Note: BOM explosion already accounts for component lead times by shifting requirements earlier (step 3); the planned order release at the finished-goods level does not apply an additional offset.
7. **Projected on-hand**: Updated each period: `previous + scheduledReceipts - grossRequirements + plannedOrderReceipt`.

## State Management

Global state lives in `App.tsx` using `useKV` from `@github/spark/hooks`:

```typescript
const [products, setProducts] = useKV<Product[]>('mrp-products', [])
const [inventory, setInventory] = useKV<InventoryItem[]>('mrp-inventory', [])
const [demands, setDemands] = useKV<Demand[]>('mrp-demands', [])
```

`useKV` behaves like `useState` but persists data in Spark's KV store. MRP results (`mrpResults`) are local state since they are derived from the persisted data.

## Commands

```bash
# Install dependencies
npm install

# Start development server (runs on port 5000)
npm run dev

# Build for production
npm run build

# Lint (ESLint)
npm run lint

# Preview production build
npm run preview
```

## Coding Conventions

- **TypeScript**: Strict mode. All props and state should be typed. Prefer interfaces over types for object shapes.
- **Component style**: Functional components with hooks. Export named exports (not default) for all components except `App`.
- **Imports**: Use the `@/` path alias for imports from `src/` (e.g., `import { cn } from '@/lib/utils'`).
- **Styling**: Use Tailwind CSS utility classes. Use the `cn()` helper from `@/lib/utils` for conditional class merging.
- **UI components**: Use components from `src/components/ui/` for all UI elements. Do not use raw HTML elements where a component exists.
- **Icons**: Use `@phosphor-icons/react`. Import only the specific icons needed.
- **Notifications**: Use `toast` from `sonner` for user feedback (success/error messages).
- **Dialogs**: Use the `Dialog` component from `src/components/ui/dialog` for modals.
- **No test files**: This project does not currently have a test suite.

## Key Design Principles

- **Industrial color scheme**: Deep blues and grays. Primary color is Deep Industrial Blue (`oklch(0.45 0.12 250)`). Accent is Bright Cyan (`oklch(0.70 0.15 210)`).
- **Typography**: IBM Plex Sans for UI text, IBM Plex Mono for numerical data (use `font-mono` Tailwind class).
- **Negative inventory**: Highlighted in red (`status-negative` CSS class). Positive in green (`status-positive`).
- **Mobile-responsive**: Tables switch to card layouts on small screens. Tabs scroll horizontally.

## Edge Cases to Handle

- **Missing BOM data**: Show warning before running calculations.
- **Negative projected on-hand**: Display in red to indicate shortage.
- **Zero lead time**: Default to a minimum of 1 week (7 days = 1 weekly period) if not specified, to prevent calculation errors where components appear in the same period as demand.
- **Circular BOM references**: Detect and prevent with validation.
- **Empty demand schedule**: Show placeholder state with call-to-action.
- **Large data sets**: Implement pagination for tables with 50+ items.

## Sample Data

Each manager component (`InventoryManager`, `BOMManager`, `DemandManager`) has a "Load Sample Data" button that populates the store with representative manufacturing data (industrial robot arm, conveyor system, control panel). The data must be loaded in order: Inventory first, then BOM (products), then Demand.
