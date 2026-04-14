# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**No, YOU Pick!** - An AI-powered restaurant picker that uses Google Vertex AI Gemini to suggest 3 random restaurants based on location, cuisine, and radius. Built as a full-stack application with web (React/Vite), mobile (React Native/Expo), and backend (Cloud Run/Node.js) components.

## Architecture

```
noupick/
├── App.tsx, index.tsx           # Web app (React 19 + Vite)
├── components/                  # Shared React components
├── services/                    # Frontend services (API client, Supabase)
├── functions/                   # Backend API (Cloud Run)
│   └── src/
│       ├── index.ts             # Firebase Functions handler
│       └── cloudrun.ts          # Express server for Cloud Run
└── pablo-mobile/                # React Native mobile app (Expo)
```

**Data flow:** Web/Mobile → Cloud Run API → Vertex AI Gemini → Response

## Development Commands

### Web App (root directory)
```bash
npm install              # Install dependencies
npm run dev              # Dev server on http://localhost:3000
npm run build            # Production build to dist/
npm run preview          # Preview production build
npx tsc --noEmit         # Type check
```

### Backend (functions/)
```bash
cd functions
npm run build            # Compile TypeScript
npm run build:watch      # Watch mode
npm run serve            # Firebase emulator
npm run logs             # View function logs
```

### Mobile App (pablo-mobile/)
```bash
cd pablo-mobile
npx expo start           # Start Expo dev server
npx expo start --ios     # iOS simulator
npx expo start --android # Android emulator
npm run test             # Run Jest tests
npm run typecheck        # Type check
```

### Local Development with Emulators
```bash
npm run emulators        # Firebase emulators (ports 4000, 5000, 5001)
# In separate terminal:
npm run dev              # Vite dev server
```

## Deployment

### Web App (Firebase Hosting)
```bash
npm run build
firebase deploy --only hosting --project noupick-prod
```

### Backend API (Cloud Run)
```bash
cd functions
npm run build
docker build -t us-central1-docker.pkg.dev/noupick-prod/noupick/noupick-api:latest .
docker push us-central1-docker.pkg.dev/noupick-prod/noupick/noupick-api:latest
gcloud run deploy noupick-api \
  --image us-central1-docker.pkg.dev/noupick-prod/noupick/noupick-api:latest \
  --region us-central1 --project noupick-prod --allow-unauthenticated
```

### Mobile App (EAS Build)
```bash
cd pablo-mobile
npx eas build --platform android --profile preview   # Test APK
npx eas build --platform ios --profile production    # App Store
npx eas submit --platform ios                        # Submit to App Store
```

## Key Architecture Decisions

1. **No client-side API keys** - All Vertex AI calls proxied through Cloud Run with ADC authentication
2. **Rate limiting** - 10 requests/minute per IP on backend
3. **CORS protection** - Whitelist of allowed origins only
4. **Dual entry points in functions/** - `index.ts` for Firebase Functions, `cloudrun.ts` for Cloud Run Express wrapper

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | /api/restaurants | Get 3 restaurant recommendations |
| GET | /health | Health check |

**Request format:**
```json
{
  "locationQuery": "Los Angeles, CA",
  "cuisine": "Mexican",
  "radius": "10",
  "excludeNames": ["Taco Bell"]
}
```

## Environment Variables

**Frontend (.env):**
- `VITE_API_BASE_URL` - Cloud Run or emulator URL
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` - Supabase config

**Backend (functions/.env):**
- `GOOGLE_CLOUD_PROJECT` - GCP project ID

## Production URLs

- **Web App:** https://noupick-prod.web.app
- **API:** https://noupick-api-246498703732.us-central1.run.app
- **Health Check:** https://noupick-api-246498703732.us-central1.run.app/health

## Testing the API

```bash
curl -X POST https://noupick-api-246498703732.us-central1.run.app/api/restaurants \
  -H "Content-Type: application/json" \
  -d '{"locationQuery": "Austin, TX", "cuisine": "BBQ", "radius": "10"}'
```

## Tech Stack Reference

| Component | Technology |
|-----------|------------|
| Web Frontend | React 19.2, Vite 6.2, TypeScript, Tailwind CSS |
| Mobile | React Native 0.81.5, Expo SDK 54 |
| Backend | Node.js 20, Express 5.2, Firebase Functions |
| AI | Vertex AI Gemini 2.0 Flash (model ID: `gemini-2.0-flash-exp` in code) |
| Database | Supabase (PostgreSQL) — community pick counting / popularity tracking; primary data flow is Vertex AI via Cloud Run |
| Hosting | Firebase Hosting (web), Cloud Run (API) |
| Container | Docker (Alpine multi-stage) |

## Gotchas

- **Pick counts return null when Supabase is unavailable** — `getRestaurantPickCount()` returns `null` (not a fake number) when Supabase env vars are missing or the connection fails. Callers should hide the count UI when null rather than display a fabricated count. Previously the code generated deterministic pseudo-counts (3000-11999) as a fallback, which was removed to avoid misleading users.
- **Dual entry points** — `functions/src/index.ts` is for Firebase Functions deployment; `functions/src/cloudrun.ts` is the Express server for Cloud Run production. The Dockerfile uses `cloudrun.ts`. Rate limiting is implemented in both.
- **Cloud Run platform rate limiting** — The `/health` endpoint may return 429 "Rate exceeded" from Cloud Run's platform-level throttling (not application code). This is transient and resolves when the instance scales up.
