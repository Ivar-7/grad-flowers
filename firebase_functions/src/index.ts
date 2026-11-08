import * as admin from 'firebase-admin'

admin.initializeApp()

// ── PayHero payment integration (independent) ──────────────────────────────────
export { startPayheroPayment } from './payhero/startPayheroPayment.js'
export {
  payheroCallback,
  checkPaymentStatus,
} from './payhero/confirmPayheroPayment.js'

// ── Generic post-payment bridge, shared by every provider above ───────────────
// See onPaymentConfirmed.ts for the metadata.onConfirm contract.
export {
  onPaymentConfirmed,
  reconcilePendingPayments,
} from './app/onPaymentConfirmed.js'
