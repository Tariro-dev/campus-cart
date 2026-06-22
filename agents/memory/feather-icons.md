---
name: Feather icon missing names
description: The @expo/vector-icons Feather set is missing some common icon names; known missing ones and their replacements
---

The Feather icon set in `@expo/vector-icons` does not include all icons you might expect.

**Known missing icons:**
- `"store"` — use `"shopping-bag"` instead
- `"storefront"` — use `"shopping-bag"` instead

**Why:** The Feather icon set version bundled with expo-vector-icons is slightly older and doesn't include newer icons from the feathericons.com set.

**How to apply:** When adding a new icon that looks blank or throws "X is not a valid icon name for family feather", check the feather glyph map. For vendor/store concepts, use `"shopping-bag"`.
