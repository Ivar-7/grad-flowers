# Checkout Feature

## Overview

The Checkout feature handles commencement venue delivery scheduling, encrypted payment processing, and ceremony order confirmation.

## Architecture

- `types/`:
  - `checkout.types.ts`: `DeliveryDetails`, `PaymentDetails`, `Order`, `OrderStatus`.
  - `checkout.schema.ts`: Zod validation schemas for ceremony handoff details and credit card inputs.
- `api/`:
  - `orders.api.ts`: Firestore persistence to `/orders/{id}` and `/users/{uid}/orders/{id}` with local fallback cache.
- `components/`:
  - `DeliveryStep.tsx`: University venue, delivery date, ceremony time slot, and recipient handoff form.
  - `PaymentStep.tsx`: Credit/Debit, Apple/Google Pay, and Campus Kiosk payment selection.
  - `ReviewStep.tsx`: Final review and order placement.
- `pages/`:
  - `CheckoutPage.tsx`: Step progress container.
  - `OrderSuccessPage.tsx`: Celebration screen with ceremony day timeline tracking.
