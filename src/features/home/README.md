# Home Feature

## Overview

The storefront landing page for GradFlowers Kenya. Its one job is to get a
visitor from "what is this?" to the 60-second M-Pesa order modal.

Section order: hero → menu → how it works → graduation calendar → ribbon
colours → joke of the day → FAQ → other services → closing call to action.

## Data

- `pages/HomePage.tsx` loads the catalogue once (`useFlowers`) and the upcoming
  ceremonies once (`useUpcomingGraduations`), then passes both down. Sections
  never fetch on their own.
- Prices, product names and station details always come from the catalogue and
  `KENYAN_PICKUP_STATIONS`. Do not hard-code them in section copy.
- Photos are stock placeholders. Replace them with photos of the real bouquets.

## Components

- `HeroSection.tsx`: headline, primary order button, hero photo.
- `PriceList.tsx`: the six products as a tap-to-order price card.
- `GraduationTicket.tsx`: live countdown to the next ceremony we serve.
- `MenuSection.tsx`: product cards with loading, empty and error states.
- `HowItWorksSection.tsx`: the three ordering steps, QR card and candy upgrade.
- `GraduationCalendar.tsx`: upcoming ceremonies, soonest first, with pre-order.
- `RibbonSection.tsx`: ribbon colour picker. Colour names must match the order
  form, because the choice is passed straight into the order modal.
- `JokeSection.tsx`: tap-through campus joke card.
- `FaqSection.tsx`: accordion of ordering questions.
- `MoreServices.tsx`: links to weekly supply, stockist and photo enquiries.
- `OrderCta.tsx`: closing call to action.

## State

- `state/useNow.ts`: current time on an interval.
- `state/useUpcomingGraduations.ts`: stations whose ceremony is still ahead,
  with Nairobi-time date parts. A station drops off once its day is over; when
  none are left the hero ticket hides and the calendar shows an empty state.
