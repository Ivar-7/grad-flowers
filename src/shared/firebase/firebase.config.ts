import { z } from 'zod'

const FirebaseConfigSchema = z.object({
  apiKey: z.string().min(1, 'Firebase API key is required'),
  authDomain: z.string().min(1, 'Firebase auth domain is required'),
  projectId: z.string().min(1, 'Firebase project ID is required'),
  storageBucket: z.string().min(1, 'Firebase storage bucket is required'),
  messagingSenderId: z
    .string()
    .min(1, 'Firebase messaging sender ID is required'),
  appId: z.string().min(1, 'Firebase app ID is required'),
  measurementId: z.string().optional(),
})

export type FirebaseConfig = z.infer<typeof FirebaseConfigSchema>

// Default fallback matching the provided project configuration
const fallbackConfig: FirebaseConfig = {
  apiKey: 'AIzaSyD6-wdmqQOgkCVMjZHByUuABQrbkyZUmTA',
  authDomain: 'grad-flowers.firebaseapp.com',
  projectId: 'grad-flowers',
  storageBucket: 'grad-flowers.firebasestorage.app',
  messagingSenderId: '278480944863',
  appId: '1:278480944863:web:c1a5efd997a6face00b36a',
  measurementId: 'G-EXLBLEPLQY',
}

const rawConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || fallbackConfig.apiKey,
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || fallbackConfig.authDomain,
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID || fallbackConfig.projectId,
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    fallbackConfig.storageBucket,
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    fallbackConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || fallbackConfig.appId,
  measurementId:
    import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ||
    fallbackConfig.measurementId,
}

export const firebaseConfig: FirebaseConfig =
  FirebaseConfigSchema.parse(rawConfig)
