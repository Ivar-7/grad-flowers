# Flowers Feature

## Overview

The Flowers feature manages the official 6-product graduation menu (`Single`, `Mini`, `Mini Candy`, `Classic`, `Classic Candy`, `Premium`), Kenyan university ribbon colours, Candy upgrade toggle, and QR message card attachments.

## Official Price List

| Product           | What's in it                                               | Price     |
| :---------------- | :--------------------------------------------------------- | :-------- |
| **Single**        | 1 rose, ribbon                                             | KSh 50    |
| **Mini**          | 3 roses, 1 chrysanthemum or gypsophila, wrap               | KSh 350   |
| **Mini Candy**    | A Mini plus a chocolate and a success card                 | KSh 500   |
| **Classic**       | 6 roses, 3 chrysanthemums or gypsophila, wrap, QR card     | KSh 600   |
| **Classic Candy** | A Classic plus Eclairs, toffees, a biscuit and a gift card | KSh 750   |
| **Premium**       | 12 roses, 5 chrysanthemums, double wrap, QR card           | KSh 1,500 |

## Architecture

- `types/`:
  - `flower.types.ts`: Domain models (`Flower`, `FlowerCategory`, `FlowerSortOption`).
  - `flower.schema.ts`: Zod schema validating external data boundaries.
- `api/`:
  - `flowers.api.ts`: Firestore integration with schema verification, admin-only product/photo management, and the 6 official products fallback.
- `state/`:
  - `useFlowers.ts`: Separates remote Firestore data from client-side search/filter/sort interactions.
- `components/`:
  - `FlowerCard.tsx`: Product card with Candy upgrade toggle (`Mini <-> Mini Candy`, `Classic <-> Classic Candy`) and 60-second order trigger.
  - `FlowerFilter.tsx`: Search input, category pills, and sort selector.
  - `FlowerGrid.tsx`: State orchestrator for loading, error, empty, and success views.
- `pages/`:
  - `FlowersPage.tsx`: Catalog route page with official price list banner.
  - `FlowerDetailPage.tsx`: Individual bouquet presentation, Candy upgrade switch, school colour ribbon selector, and optional QR voice/video message recorder.
