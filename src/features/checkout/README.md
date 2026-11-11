# Checkout Feature

## Overview

The Checkout feature provides both a **60-Second Quick Order Modal** (`QuickOrderModal.tsx`) and a multi-step checkout flow (`CheckoutPage.tsx`) with Kenyan campus station pickup and PayHero M-Pesa STK Push. No account is required.

## Security & Flow

1. Buyers pick a bouquet, select a Kenyan campus pickup station (`UoN`, `KU`, `JKUAT`, `Strathmore`, `USIU-Africa`, `MKU`, `Daystar`, `TUK/KCA`), and enter their M-Pesa phone number (`07xxxxxxxx` / `01xxxxxxxx`).
2. `createOrder` creates a `pending-payment` order in `orders/{orderId}` (and `users/{userId}/orders/{orderId}` when signed in), crediting any `?ref=name` seller referral code.
3. `startPayheroPayment` initiates the PayHero M-Pesa STK Push for `orderId`.
4. When payment succeeds, `onPaymentConfirmed` updates **only** that order's own documents (`orders/{orderId}` and `users/{userId}/orders/{orderId}`) — never arbitrary paths sent by the browser.
