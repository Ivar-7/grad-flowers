# Flowers Feature

## Overview

The Flowers feature manages the catalog of graduation floral bouquets, ribbons, filtering, and individual product inspection.

## Architecture

- `types/`:
  - `flower.types.ts`: Domain models (`Flower`, `FlowerCategory`, `FlowerSortOption`).
  - `flower.schema.ts`: Zod schema validating external data boundaries.
- `api/`:
  - `flowers.api.ts`: Firestore integration with schema verification and seeded fallbacks.
- `state/`:
  - `useFlowers.ts`: Separates remote Firestore data from client-side search/filter/sort interactions.
- `components/`:
  - `FlowerCard.tsx`: Product card with image, price, and stem count.
  - `FlowerFilter.tsx`: Search input, category pills, and sort selector.
  - `FlowerGrid.tsx`: State orchestrator for loading, error, empty, and success views.
- `pages/`:
  - `FlowersPage.tsx`: Catalog route page.
  - `FlowerDetailPage.tsx`: Individual bouquet presentation and ribbon selection.
