# Auth Feature

## Overview

The Auth feature provides end-to-end authentication and graduate profile management via Firebase Authentication and Cloud Firestore.

## Capabilities

- **Email & Password Authentication**: Validated login with password visibility toggle.
- **Account Registration**: Graduate onboarding with display name, email, password strength verification, and confirmation match.
- **Forgot Password**: Password reset request with email verification link via `sendPasswordResetEmail`.
- **Google OAuth**: Fast single-click authentication via `GoogleAuthProvider` popup.
- **Profile Synchronization**: Automatic sync of graduate user records to `/users/{uid}` in Firestore.
- **Session State**: Live observable session persistence through `onAuthStateChanged`.
- **User Profile Dashboard**: Monogram/photo avatar, verification badge, and sign-out controls.

## Architecture

- `types/`:
  - `auth.types.ts`: `AuthUser`, `UserProfileDoc`, `AuthMode`, `AuthState`.
  - `auth.schema.ts`: Zod validation schemas for login, registration, and password recovery.
- `api/`:
  - `auth.api.ts`: Firebase Auth operations with normalized error handling.
- `state/`:
  - `auth.context.ts`: Fast Refresh compliant React context container.
  - `AuthProvider.tsx`: Root context provider managing session lifecycle.
  - `useAuth.ts`: Custom hook to consume authentication state and actions.
- `components/`:
  - `LoginForm.tsx`: Email/password and Google login with forgot password link.
  - `SignUpForm.tsx`: Account creation with confirmation validation.
  - `ForgotPasswordForm.tsx`: Password recovery form with dispatch feedback.
  - `UserProfileCard.tsx`: Active graduate profile view with logout action.
  - `AuthForm.tsx`: State orchestrator with smooth Motion transitions between modes.
- `pages/`:
  - `AuthPage.tsx`: Route page handling query parameter deep links (`?mode=signin|signup|forgot-password`).
