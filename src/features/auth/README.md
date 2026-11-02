# Auth Feature

## Overview

The Auth feature handles user registration, authentication, and session state via Firebase Authentication.

## Architecture

- `types/`:
  - `auth.types.ts`: `AuthUser`, `AuthMode`, `AuthState`.
  - `auth.schema.ts`: Zod schema validating email, password, and registration input.
- `api/`:
  - `auth.api.ts`: Firebase Auth integration (`signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `signOut`, `onAuthStateChanged`).
- `state/`:
  - `AuthProvider.tsx`: React Context for Firebase session persistence.
  - `useAuth.ts`: Custom hook to consume authentication actions and state.
- `components/`:
  - `AuthForm.tsx`: Sign In and Sign Up form with input validation and normalized error presentation.
- `pages/`:
  - `AuthPage.tsx`: Route page for authentication.
