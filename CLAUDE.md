# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PawAlert is a Next.js 16 application for reporting and finding lost pets. The app uses Firebase for authentication, Firestore for data storage, and Firebase Storage for images. It features interactive maps with Leaflet, PDF poster generation with QR codes, and a multi-step reporting form.

## Development Commands

```bash
# Install dependencies
npm install

# Development server (opens on http://localhost:3000)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Firebase Commands

```bash
# Login to Firebase
firebase login

# Deploy Firestore and Storage rules
firebase deploy --only firestore:rules,storage

# View current rules
firebase firestore:rules get
firebase storage:rules get
```

## Architecture

### Tech Stack
- **Framework**: Next.js 16 with App Router (TypeScript)
- **Styling**: Tailwind CSS v4 with custom theme in [app/globals.css](app/globals.css)
- **Backend**: Firebase (Auth, Firestore, Storage, Analytics)
- **Maps**: Leaflet + React Leaflet
- **PDF Generation**: jsPDF + QRCode
- **Icons**: Heroicons

### Directory Structure

```
app/
├── components/          # React components
│   ├── AuthModal.tsx   # Email/password and Google sign-in
│   ├── ImageUpload.tsx # Firebase Storage image uploads
│   ├── LocationPicker.tsx # Geolocation and address input
│   ├── MapComponent.tsx # Leaflet map wrapper
│   ├── PetCard.tsx     # Pet listing card
│   └── Navbar.tsx      # Global navigation
├── contexts/
│   └── AuthContext.tsx # Firebase Auth state management
├── lib/
│   └── firebase.ts     # Firebase initialization
├── utils/
│   ├── storage.ts      # Firestore CRUD operations
│   ├── posterGenerator.ts # PDF poster with QR code
│   └── geolocation.ts  # Location utilities
├── report/             # Multi-step pet reporting form
├── pet/[id]/           # Pet detail page with sighting modal
├── map/                # Interactive map view of all pets
└── layout.tsx          # Root layout with AuthProvider
```

### Key Architectural Patterns

**Authentication Flow**
- `AuthContext` wraps the entire app via `ClientLayout`
- Protected actions check `user` from `useAuth()` hook before execution
- AuthModal shown when unauthenticated users attempt protected actions
- Supports Email/Password and Google OAuth

**Data Model** (defined in [app/utils/storage.ts](app/utils/storage.ts))
- `Pet` type: status (lost/sighted/found), location, contact info, photo URL, sightings array
- `Sighting` type: nested within Pet, includes location, date, notes, optional photo
- All pets stored in Firestore `pets` collection
- Photos stored in Firebase Storage at `/pets/{timestamp}_{filename}`

**Client-Side Rendering Strategy**
- Most components use `'use client'` directive
- Firebase requires client-side initialization
- Server components used for static layouts only
- Dynamic imports used for map components (Leaflet SSR issues)

**Multi-Step Form** ([app/report/page.tsx](app/report/page.tsx))
- 4-step wizard: Basic Info → Details → Location → Review
- Form state managed in single `formData` object
- Authentication required before advancing past step 1
- Image upload to Storage happens during form filling, URL saved to Firestore on submit

**PDF Poster Generation** ([app/utils/posterGenerator.ts](app/utils/posterGenerator.ts))
- Generates A4 poster with pet photo, details, contact info
- QR code links to pet detail page
- Uses jsPDF for layout, QRCode library for QR generation
- All styling done programmatically (no templates)

**Map Integration**
- Uses dynamic imports: `const MapComponent = dynamic(() => import('./MapComponent'), { ssr: false })`
- Leaflet requires window object, incompatible with SSR
- Markers show all pets with status-based colors
- Click marker to open pet detail in modal

### Firebase Configuration

**Firestore Rules** ([firestore.rules](firestore.rules))
- Public read access for all pets
- Authenticated users can create pets (must include `userId` matching auth UID)
- Pet owner can update/delete all fields on their pet
- **ANY authenticated user can add sightings** to any pet (community feature)

**Storage Rules** ([storage.rules](storage.rules))
- Public read access for all images
- Authenticated users can upload images
- 5MB size limit, images only (`image/*` content type)
- Client-side validation enforces 5MB limit before upload

**Environment Variables** (`.env.local`)
- Firebase config uses environment variables (see `.env.example`)
- Copy `.env.example` to `.env.local` and fill in Firebase credentials
- Never commit `.env.local` (already in `.gitignore`)
- All vars prefixed with `NEXT_PUBLIC_` for client-side access

### TypeScript Path Aliases

- `@/*` maps to root directory (configured in [tsconfig.json](tsconfig.json))
- Example: `import { Button } from '@/app/components/Button'`

### Styling Conventions

- Custom Tailwind theme uses orange as primary (`--color-primary-*`)
- Green as secondary (`--color-secondary-*`)
- Theme defined in CSS variables in [app/globals.css](app/globals.css)
- Components use Tailwind utility classes, no CSS modules

## Important Notes

- The app is in Spanish (UI text and content)
- Image uploads happen immediately (not on form submit), with 5MB client-side validation
- Map default center is Madrid, Spain (can be changed based on geolocation)
- Geolocation errors show helpful message with manual selection fallback
- Pet detail pages are dynamically generated at `/pet/[id]`
- All required fields validated: name, breed, color, size, description, distinguishingFeatures, contactName, contactPhone, contactEmail
- Reward field is optional and uses type="number" for proper validation

## Recent Critical Fixes (Sprint 0)

✅ Moved Firebase credentials to environment variables
✅ Added missing required fields: size, distinguishingFeatures, contactEmail
✅ Fixed Firestore rules to allow community sighting reports
✅ Implemented 5MB image size validation (client-side)
✅ Improved geolocation error handling with manual fallback
✅ Changed reward field to number type
✅ Phone validation pattern added
✅ Map default location changed to Spain
