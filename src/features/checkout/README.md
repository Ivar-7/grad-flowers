# Checkout Feature

## Overview

The Checkout feature handles commencement venue delivery scheduling, M-Pesa payment through PayHero, and ceremony order confirmation. All prices are in Kenyan shillings (KSh).

## Flow

1. `DeliveryStep` collects venue and recipient details.
2. `PaymentStep` collects the M-Pesa phone number (normalised to `07xxxxxxxx`).
3. `ReviewStep` creates a `pending-payment` order, calls the `startPayheroPayment` Cloud Function, and watches `payments/{paymentId}` until it is `paid`, `failed`, or `cancelled`.
4. On `paid`, the `onPaymentConfirmed` Cloud Function sets the order status to `confirmed` through `metadata.onConfirm`, and the user lands on the success page.

## Architecture

- `types/`:
  - `checkout.types.ts`: `DeliveryDetails`, `PaymentDetails`, `Order`, `OrderStatus`.
  - `checkout.schema.ts`: Zod schemas for delivery details, M-Pesa phone number, payment status, and the callable response.
- `api/`:
  - `orders.api.ts`: Firestore persistence to `/orders/{id}` and `/users/{uid}/orders/{id}` with a local read cache.
  - `payments.api.ts`: `startPayheroPayment` callable wrapper and `watchPayment` Firestore listener.
- `state/`:
  - `usePayheroCheckout.ts`: Payment phase state machine (`idle`, `initiating`, `awaiting`, `paid`, `failed`).
- `components/`: `DeliveryStep.tsx`, `PaymentStep.tsx`, `ReviewStep.tsx`.
- `pages/`:
  - `CheckoutPage.tsx`: Step progress container.
  - `OrderSuccessPage.tsx`: Celebration screen with ceremony day timeline tracking.

Payment requires a signed-in user because the Cloud Function is authenticated.
