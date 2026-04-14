# RE-APP — House Hunting Tracker

A local-first mobile app for tracking properties you've toured, with photo management, notes, pros/cons, ratings, and side-by-side comparison.

## Stack

- **Expo** (SDK 55, React Native, TypeScript)
- **React Navigation** — Tab + Stack navigation
- **Expo SQLite** — Local-first persistent storage
- **Zustand** — Global state
- **NativeWind** — Tailwind-style UI
- **Expo Image Picker + FileSystem** — Photo capture and permanent storage

## Quick Start

```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go** (iOS or Android).

## Features

- Add properties with address, price, status, rating, notes, pros/cons
- Auto-fill from Zillow/Redfin/Trulia by pasting listing URL
- Attach photos from camera or gallery
- Full-screen photo gallery per property
- Sort list by date, rating, or price
- Filter by status
- Compare up to 3 properties side-by-side
- All data stored locally (SQLite + local file system)

## Navigation

```
Tab: Properties
  └── PropertyList (home)
       └── AddProperty (modal)
       └── PropertyDetail
            └── EditProperty
            └── PhotoGallery (full-screen modal)

Tab: Compare
  └── Compare (select up to 3, side-by-side table)
```

## Data Persistence

- Property metadata stored in SQLite (`reapp.db`)
- Photos copied to `FileSystem.documentDirectory/photos/` on add
- All data survives app restarts and updates
- Long-press a property card to delete

## URL Auto-fill

1. Open a Zillow, Redfin, or Realtor.com listing
2. Copy the URL
3. Paste into "Listing URL" field in Add Property
4. Tap **Fill** — address, price, beds, baths, sqft auto-populate from Open Graph metadata
5. Confirm/edit and save

## Verification Checklist

- [ ] Add a property with all fields filled
- [ ] Attach 2–3 photos (camera + library)
- [ ] Change status and rating
- [ ] Close and reopen app — data persists
- [ ] Add 3 properties, open Compare, verify table shows correct data
- [ ] Paste a Zillow URL, verify auto-fill
