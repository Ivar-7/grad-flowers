# Cart Feature

## Overview

The Cart feature provides shopping basket management, promo code calculation, free delivery thresholds, custom graduation ribbon tracking, and slide-over drawer orchestration.

## Architecture

- `types/`:
  - `cart.types.ts`: `CartItem`, `CartItemAddOn`, `PromoCode`, `CartSummary`.
  - `cart.schema.ts`: Zod schema for validating cart item modifications.
- `state/`:
  - `cart.context.ts`: Fast Refresh compliant context.
  - `CartProvider.tsx`: Local storage persistence and price engine.
  - `useCart.ts`: Hook for cart operations.
- `components/`:
  - `CartItemRow.tsx`: Item presentation with custom ribbon text and quantity controls.
  - `CartDrawer.tsx`: Global slide-over drawer accessible from any page.
- `pages/`:
  - `CartPage.tsx`: Full cart page route composition.
