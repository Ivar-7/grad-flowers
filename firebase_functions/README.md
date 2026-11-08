# Firebase Cloud Functions — M-Pesa Payment Integrations

Reusable Firebase Cloud Functions (TypeScript, Firebase Functions v2) for
taking M-Pesa payments and bridging a confirmed payment back into your own
data. A drop-in provider is included:

- **PayHero** (`src/payhero/`) — STK push via the [PayHero](https://payhero.co.ke) aggregator API.

The provider has its own credentials, PayHero calls, and webhook. It writes to
the generic `payments` collection, which is picked up by a shared,
provider-agnostic trigger in `src/app/`. None of this has any knowledge of a
particular app's domain model — drop it into any Firebase project as-is.

---

## Functions Overview

| Function              | Type                | Trigger                | Description                                                                                                                   |
| --------------------- | ------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `startPayheroPayment` | `onCall`            | Your app               | Initiates an M-Pesa STK push via PayHero, with caller-supplied `metadata`                                                     |
| `payheroCallback`     | `onRequest`         | PayHero webhook        | Verifies the shared-secret query param, then updates `payments/{paymentId}.status`                                            |
| `checkPaymentStatus`  | `onCall`            | Your app               | Polls PayHero directly for a payment's status (fallback to the webhook)                                                       |
| `onPaymentConfirmed`  | `onDocumentUpdated` | `payments/{paymentId}` | Generic post-payment bridge, shared across providers — merges fields into whatever document(s) `metadata.onConfirm` points at |

---

## Payment Flow

```
Your app
  └─► startPayheroPayment({ amount, phoneNumber, description, metadata })
        ├─ Validates auth, amount, and phone number
        ├─ Creates a pending doc in payments/{paymentId}
        ├─ Calls the provider's API → triggers an M-Pesa STK push to the user
        └─ Returns { paymentId }
              └─► The provider POSTs the result to its callback (secret-verified)
                    └─ payments/{paymentId}.status → "paid" / "failed" / "cancelled"
                          └─► onPaymentConfirmed fires on the "paid" transition
                                └─ merges fields into metadata.onConfirm's target doc(s)
```

If a webhook is ever missed (retry failure, tunnel down during local dev,
etc.), your app can call `checkPaymentStatus`
with `{ paymentId }` to poll the provider directly and reconcile the same way.

### Wiring up `onPaymentConfirmed` for your app

`startPayheroPayment` accepts an arbitrary
`metadata` object that is stored on the payment doc untouched.
`onPaymentConfirmed` reads `metadata.onConfirm` once the payment reaches
`"paid"` and merges fields into the document(s) it names — that's the entire
contract, so the same deployment works for bookings, orders, subscriptions,
or anything else without code changes, regardless of which provider was used:

```ts
await startPayheroPayment({
  amount: 500,
  phoneNumber: '0712345678',
  description: 'Booking #abc123',
  metadata: {
    onConfirm: { path: 'bookings/abc123', fields: { status: 'paid' } },
    // or an array of targets if one payment should update multiple docs:
    // onConfirm: [{path: "bookings/abc123", fields: {...}}, {path: "stats/bookings", fields: {...}}],
  },
})
```

`onPaymentConfirmed` always merges `paymentId` and a server-timestamped
`paidAt` into the target doc(s) in addition to any `fields` you supply.

---

## Webhook Authentication

`payheroCallback` requires a `secret` query
string param, checked with a constant-time comparison. Requests without a
valid secret are rejected with `401` before the payload is even read —
without this, anyone who learned a `paymentId`/`CheckoutRequestID` could
forge a `"paid"` status with a plain `curl`.

The secret is not a separate value to configure — it is an HMAC-SHA256 of
your existing PayHero API secret (`PAYHERO_API_SECRET`), computed by
`getCallbackSecret()` in `payhero/config.ts`. `getCallbackUrl()` automatically
appends `?secret=...` to `PAYHERO_CALLBACK_URL` when building the URL handed to
PayHero, so there's nothing extra to configure or rotate separately
from credentials you already have.

---

## Firestore Collections

| Collection      | Written by                                          | Purpose                                                  |
| --------------- | --------------------------------------------------- | -------------------------------------------------------- |
| `payments`      | `start*Payment`, `*Callback`, `check*PaymentStatus` | Payment records (`status`, `provider`, `metadata`, etc.) |
| _(your choice)_ | `onPaymentConfirmed`                                | Whatever `metadata.onConfirm.path` points the trigger at |

---

## Environment Variables

Functions read secrets at runtime via `process.env`. There are two separate
setups — one for **local development** and one for **production**. You only
need to configure the variables for the provider(s) you actually use.

### Local Development (Emulator)

Copy `.env.example` to `.env` (already git-ignored) and fill in real values:

```bash
cp .env.example .env
```

```env
# PayHero
PAYHERO_API_KEY=your_api_key
PAYHERO_API_SECRET=your_api_secret
PAYHERO_CHANNEL_ID=1111
PAYHERO_CALLBACK_URL=https://your-tunnel-url/payheroCallback

```

The Firebase emulator picks this up automatically — no extra steps.

### Production (Deployed Functions)

Secrets are stored securely in **Google Cloud Secret Manager**. Set each one
using the Firebase CLI:

```bash
firebase functions:secrets:set PAYHERO_API_KEY
firebase functions:secrets:set PAYHERO_API_SECRET
firebase functions:secrets:set PAYHERO_CHANNEL_ID
firebase functions:secrets:set PAYHERO_CALLBACK_URL

```

Each command will prompt you to paste the value securely.

| Variable               | Description                                                                                        |
| ---------------------- | -------------------------------------------------------------------------------------------------- |
| `PAYHERO_API_KEY`      | PayHero API key                                                                                    |
| `PAYHERO_API_SECRET`   | PayHero API secret — also used to derive the webhook's callback secret                             |
| `PAYHERO_CHANNEL_ID`   | PayHero channel ID. Required; deployment/runtime should fail fast if unset.                        |
| `PAYHERO_CALLBACK_URL` | Publicly accessible base URL for `payheroCallback` (the callback secret is appended automatically) |

> **Note:** `PAYHERO_CALLBACK_URL` must be the full
> deployed URL of the corresponding callback function, e.g.
> `https://<region>-<project-id>.cloudfunctions.net/payheroCallback`

---

## Project Structure

```
firebase_functions/
├── src/
│   ├── index.ts                                # Exports all functions
│   ├── app/
│   │   └── onPaymentConfirmed.ts               # Generic post-payment Firestore bridge, shared across providers
│   ├── payhero/
│   │   ├── config.ts                           # PayHero base URL, env helpers, secret verification
│   │   ├── startPayheroPayment.ts              # onCall — initiates an STK push via PayHero
│   │   └── confirmPayheroPayment.ts            # payheroCallback (webhook) + checkPaymentStatus (polling)
├── lib/                                # Compiled JS output (git-ignored)
├── .env                                # Local env vars (git-ignored)
├── .env.example                        # Template for .env
├── package.json
├── tsconfig.json
└── README.md
```

---

## Setup & Development

### Prerequisites

- Node.js 24
- Firebase CLI: `npm install -g firebase-tools`
- Logged in: `firebase login`

### Install Dependencies

```bash
npm install
```

### Run Locally (Emulator)

Make sure `.env` exists with valid values, then:

```bash
firebase emulators:start --only functions
```

Or build and watch:

```bash
npm run build:watch
```

---

## Deployment

```bash
npm run deploy
```

or, from your project root:

```bash
firebase deploy --only functions
```

### View Live Logs

```bash
firebase functions:log
```

---

## Phone Number Normalisation

**PayHero** expects local-format numbers; numbers are normalised before
being sent:

| Input format   | Normalised to            |
| -------------- | ------------------------ |
| `2547xxxxxxxx` | `07xxxxxxxx`             |
| `7xxxxxxxx`    | `07xxxxxxxx`             |
| `1xxxxxxxx`    | `01xxxxxxxx`             |
| `07xxxxxxxx`   | `07xxxxxxxx` (unchanged) |

Valid formats after normalisation must match `07xxxxxxxx` or `01xxxxxxxx`.
