---
name: API Zod index overwrite
description: orval regenerates lib/api-zod/src/index.ts with both generated/api and generated/types exports, causing TS2308 duplicate export errors
---

After running `pnpm --filter @workspace/api-spec run codegen`, orval overwrites `lib/api-zod/src/index.ts` to:

```ts
export * from "./generated/api";
export * from './generated/types';
```

This causes TS2308 duplicate identifier errors because `generated/api.ts` (Zod schemas) and `generated/types/` (TypeScript interfaces) export the same names.

**Why:** Orval is configured to emit both Zod schemas and TypeScript types, and its index barrel template always includes both. We only want the Zod schemas.

**How to apply:** After every codegen run, immediately reset the file to:

```ts
export * from "./generated/api";
```

Only one line. No types export.
