# Campus Cart

A university e-commerce marketplace mobile app (Expo/React Native) where students browse vendors, shop for products, track orders, and get AI-powered recommendations. Includes a vendor dashboard for managing orders.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `OPENAI_API_KEY` — for AI recommendations

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 (port 8080, proxied at `/api`)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Mobile: Expo SDK 53, React Native, expo-router v6, `@tanstack/react-query`

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for the API contract)
- `lib/api-zod/src/index.ts` — Zod schemas (MUST only export from `./generated/api`, never `./generated/types`)
- `lib/api-client-react/` — generated React Query hooks for mobile
- `lib/db/src/schema/` — Drizzle ORM schemas: `vendors.ts`, `products.ts`, `orders.ts`
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/mobile/app/` — Expo Router screens
- `artifacts/mobile/constants/colors.ts` — Navy/gold design tokens
- `artifacts/mobile/context/` — CartContext, VendorContext

## Architecture decisions

- Contract-first API design: OpenAPI spec defines the contract, Orval generates typed React Query hooks and Zod validators. Never edit generated files.
- All vendors in a single DB. The `vendorId` field on orders/products ties everything together.
- Cart is client-side only (React Context). Orders are committed to DB on checkout.
- AI recommendations use GPT-4o-mini: products are fetched from DB, filtered by category/budget, and summarized for the model. Falls back to top products on OpenAI error.
- `lib/api-zod/src/index.ts` gets overwritten by Orval to export from both `./generated/api` AND `./generated/types`. This causes TS2308 duplicate export errors. After any `codegen` run, reset this file to only: `export * from "./generated/api";`

## Product

- **Explore tab**: Browse all products with category filters, search, and AI-recommended picks
- **Vendors tab**: List all campus vendors, filterable by category; tap to see vendor profile + products
- **Orders tab**: View all orders with status filter (pending/processing/completed/cancelled)
- **Dashboard tab**: Vendor management — revenue stats, order accept/complete/cancel actions, top products
- **Cart**: Add products from a single vendor, enter name/email, place order
- **Product detail**: Full product info, add to cart, link to vendor
- **Order detail**: Status, buyer info, line items with totals
- **Seed data**: 5 vendors, 14 products, 3 sample orders. POST `/api/seed` (idempotent)

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- `lib/api-zod/src/index.ts` is overwritten by orval each codegen run — always reset to `export * from "./generated/api";` only
- Feather icon set does NOT have a "store" icon — use "shopping-bag" instead
- DB must be pushed before seeding: `pnpm --filter @workspace/db run push`
- Seed is idempotent (checks for existing vendors before inserting)
- Mobile uses `EXPO_PUBLIC_DOMAIN` env var to set the API base URL

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
