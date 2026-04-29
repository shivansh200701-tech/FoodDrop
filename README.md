# FoodDrop1

Never let food go to waste. **FoodDrop** connects people who have extra food — homes, hotels, and restaurants — with nearby people in real time. Users can discover food spots on a map, check freshness, and pick up before it expires.

## Architecture Diagram

```mermaid
flowchart LR
    A[React Native App (Expo)] --> B[Firebase Auth]
    A --> C[Firestore]
    A --> D[Firebase Storage]
    A --> E[Google Maps SDK]
    A --> F[GeoFirestore Queries]
    A --> G[FCM Push Notifications]

    A --> H[Cloudinary Upload API]
    H --> I[Cloudinary CDN URL]
    I --> C

    C --> J[Cloud Functions]
    J --> C
    J --> G

    subgraph Client Features
      K[Giver: Post/Edit/Delete Listing]
      L[Receiver: Map + Nearby Feed]
      M[Freshness Badge + Filters]
    end

    A --> K
    A --> L
    A --> M
```

## Tech Stack

- **Mobile:** React Native (Expo) for Android
- **Backend:** Firebase Auth, Firestore, Storage, Cloud Functions
- **Geo Queries:** GeoFirestore (radius + distance sorting)
- **Media:** Cloudinary (image compression + CDN)
- **Notifications:** Firebase Cloud Messaging (FCM)
- **Maps:** Google Maps SDK

## Firestore Listing Schema

Each listing document includes:

- `listingId`
- `userId`
- `userType` (`home` | `hotel`)
- `foodName`
- `foodType` (`veg` | `non-veg` | `cooked` | `raw`)
- `prepTime` (timestamp)
- `quantity`
- `imageUrl` (Cloudinary URL)
- `status` (`available` | `empty` | `expired`)
- `location` object:
  - `lat`
  - `lng`
  - `geohash`
- `expiresAt` (auto-set by Cloud Function)
- `pickupWindow` (`startAt`, `endAt`)

## Giver Features

- Post food with name, photo, quantity, type, and prep time
- Mark listing as **Out of Stock** (real-time status update)
- Choose provider type: **home** or **hotel/restaurant**
- Set pickup time window
- Edit or delete listing at any time

## Receiver Features

- Map view with color-coded pins:
  - 🟢 Green = available
  - 🔴 Red = empty
- Feed sorted by distance (GeoFirestore radius query)
- Filter by food type and veg/non-veg preference
- Push notification for nearby newly posted food
- Freshness indicator (example: *“cooked 2 hrs ago”*)

## Nearby Discovery Algorithm

1. Store location as geohash + lat/lng in Firestore via GeoFirestore.
2. Query with `within(center, radius, field)`.
3. Use default radius of **5 km** (user can expand).
4. Sort by:
   - `distance ASC`
   - then `prepTime DESC`

## Auto-Expiry System

- Scheduled Cloud Function runs every **30 minutes**
- Marks stale listings as `expired` once age exceeds configured threshold
- Expired listings are hidden from map and feed automatically

## Security Model

- Firebase Auth required to **post** (view can remain public)
- Firestore Rules: only the owner can edit/delete their listings
- Image upload size limits enforced in-app and in Storage Rules

## UX Details

- Hotel/restaurant accounts show a **Restaurant** badge on map pin/card
- Freshness color scale:
  - Green = fresh
  - Yellow = a few hours old
  - Red = near expiry
- Listing card shows:
  - Photo
  - Distance
  - Food name
  - Time posted
  - Giver type
