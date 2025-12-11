# No, YOU Pick!: Operator-Grade System Analysis & Operations Guide
*For: DevOps Engineer (Pablo)*
*Generated: 2025-12-11*
*System Version: 1e6c827 (main)*

---

## Table of Contents
1. Executive Summary
2. System Architecture Overview
3. Directory Deep-Dive
4. Operational Reference
5. Security & Access
6. Cost & Performance
7. Development Workflow
8. Mobile App Deployment
9. Current State Assessment
10. Quick Reference
11. Recommendations Roadmap

---

## 1. Executive Summary

### Business Purpose

**No, YOU Pick!** is an AI-powered restaurant recommendation application that solves the universal problem of deciding where to eat. Users enter their location, select cuisine preferences, and receive 3 AI-generated restaurant recommendations with ratings, addresses, and Google Maps integration.

The system is production-ready with:
- **Web App**: Live at https://noupick-prod.web.app (Firebase Hosting)
- **API Backend**: Cloud Run at https://noupick-api-246498703732.us-central1.run.app
- **Mobile App**: React Native/Expo ready for App Store & Play Store deployment
- **AI Engine**: Vertex AI Gemini 2.0 Flash (no client-side API keys)

The architecture follows security best practices with all AI calls routed through a backend proxy, rate limiting, and CORS protection. The system is cost-effective at ~$2-5/month operational cost.

### Operational Status Matrix

| Environment | Status | URL | Release Cadence |
|-------------|--------|-----|-----------------|
| Production | **LIVE** | https://noupick-prod.web.app | On-demand |
| API (Cloud Run) | **HEALTHY** | https://noupick-api-246498703732.us-central1.run.app | On-demand |
| Staging | Configured | noupick-staging (Firebase) | N/A |
| Mobile | Ready to Build | pablo-mobile/ | Pending app store accounts |

### Technology Stack Summary

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| Frontend | React + TypeScript | 19.2 | Web application UI |
| Build Tool | Vite | 6.2 | Fast dev server & bundler |
| Mobile | React Native + Expo | SDK 54 | iOS/Android app |
| Backend | Express + Node.js | 20 | API server |
| AI | Vertex AI Gemini | 2.0 Flash | Restaurant recommendations |
| Hosting | Firebase Hosting | - | Web app CDN |
| Compute | Cloud Run | - | Serverless API |
| Container Registry | Artifact Registry | - | Docker images |

---

## 2. System Architecture Overview

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │  Web App     │    │  Mobile App  │    │  Future      │          │
│  │  (React)     │    │  (Expo)      │    │  Clients     │          │
│  │  Port 3000   │    │  iOS/Android │    │              │          │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘          │
│         │                   │                   │                   │
│         └───────────────────┼───────────────────┘                   │
│                             │                                        │
│                             ▼                                        │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS (POST /api/restaurants)
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      FIREBASE HOSTING                                │
│                    noupick-prod.web.app                              │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Static Assets (dist/)                                         │  │
│  │  - index.html (SPA entry)                                      │  │
│  │  - assets/index-*.js (React bundle)                            │  │
│  │  Rewrites: /api/** → Cloud Run                                 │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ Proxy to Cloud Run
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       CLOUD RUN (us-central1)                        │
│            noupick-api-246498703732.us-central1.run.app              │
├─────────────────────────────────────────────────────────────────────┤
│  Container: us-central1-docker.pkg.dev/noupick-prod/noupick/api     │
│  Resources: 1 vCPU, 512MB RAM                                        │
│  Concurrency: 80 requests/instance                                   │
│  Autoscaling: 0-10 instances                                         │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Express Server (lib/cloudrun.js)                              │  │
│  │  - GET /health → Health check                                  │  │
│  │  - POST /api/restaurants → AI recommendations                  │  │
│  │  - CORS whitelist (*.web.app, localhost)                       │  │
│  │  - Rate limiting: 10 req/min per IP                            │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ ADC Authentication (no API keys)
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       VERTEX AI (us-central1)                        │
├─────────────────────────────────────────────────────────────────────┤
│  Model: gemini-2.0-flash-exp                                         │
│  Authentication: Application Default Credentials                     │
│  Service Account: 246498703732-compute@developer.gserviceaccount.com │
│  Roles: roles/aiplatform.user, roles/ml.developer                    │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Prompt Engineering:                                           │  │
│  │  - Location-based restaurant search                            │  │
│  │  - Cuisine filtering                                           │  │
│  │  - Randomization for variety                                   │  │
│  │  - Structured output parsing                                   │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Environment Matrix

| Environment | Purpose | GCP Project | Firebase Project | Notes |
|-------------|---------|-------------|------------------|-------|
| local | Development | N/A | N/A | Vite dev server |
| staging | Testing | noupick-staging | noupick-staging | Not actively used |
| production | Live | noupick-prod | noupick-prod | Primary environment |

### Cloud Services Inventory

| Service | Project | Region | Purpose | Cost Tier |
|---------|---------|--------|---------|-----------|
| Cloud Run | noupick-prod | us-central1 | API backend | Pay-per-use |
| Artifact Registry | noupick-prod | us-central1 | Docker images | Storage only |
| Vertex AI | noupick-prod | us-central1 | Gemini 2.0 | Pay-per-request |
| Firebase Hosting | noupick-prod | Global CDN | Web app | Free tier |

---

## 3. Directory Deep-Dive

### Project Structure

```
noupick/
├── App.tsx                    # Main React web component (UI logic)
├── index.tsx                  # React entry point
├── index.html                 # HTML template with Vite entry
├── types.ts                   # TypeScript interfaces
├── vite.config.ts             # Vite build configuration
├── tsconfig.json              # TypeScript config
├── package.json               # Web app dependencies
├── firebase.json              # Firebase hosting config
├── .firebaserc                # Firebase project aliases
├── .env                       # Production API URL (gitignored)
├── .env.example               # Environment template
│
├── components/                # React UI components
│   ├── Button.tsx             # Styled button variants
│   ├── Card.tsx               # Restaurant card display
│   ├── Mascot.tsx             # "Foxie" the fox mascot
│   ├── SlotMachine.tsx        # Spinning animation
│   ├── LoadingScreen.tsx      # Loading states
│   └── ShareTicket.tsx        # Share functionality
│
├── services/                  # Frontend services
│   ├── geminiService.ts       # API client (calls Cloud Run)
│   ├── restaurantService.ts   # Restaurant data handling
│   └── supabaseClient.ts      # Legacy (not used in production)
│
├── functions/                 # Backend (Cloud Run)
│   ├── Dockerfile             # Multi-stage Docker build
│   ├── package.json           # Node.js 20 dependencies
│   ├── tsconfig.json          # TypeScript config
│   └── src/
│       ├── index.ts           # Firebase Functions entry (unused)
│       └── cloudrun.ts        # Express server for Cloud Run
│
├── pablo-mobile/              # React Native mobile app
│   ├── App.tsx                # Main mobile component
│   ├── app.json               # Expo/app store config
│   ├── eas.json               # EAS Build profiles
│   ├── package.json           # Mobile dependencies
│   ├── jest.config.js         # Test configuration
│   ├── tsconfig.json          # TypeScript config
│   ├── services/
│   │   └── api.ts             # API client for Cloud Run
│   ├── __tests__/
│   │   └── api.test.ts        # API service tests (10 tests)
│   └── assets/                # App icons and splash
│
├── dist/                      # Production build output
│   ├── index.html             # Built HTML with hashed assets
│   └── assets/
│       └── index-*.js         # Bundled React app
│
└── 000-docs/                  # Documentation
    ├── 001-DR-STND-...        # Filing system standard
    ├── 002-AA-AUDT-...        # Previous DevOps playbook
    ├── 003-DR-GUID-...        # CLI learning guide
    ├── 007-DEPLOY-...         # Deployment guide
    ├── 008-AAR-...            # Architecture review
    ├── 010-MOBILE-...         # Mobile architecture
    └── 012-MOBILE-...         # App store deployment
```

### Key Files Reference

| File | Purpose | Line Count |
|------|---------|------------|
| `App.tsx` (web) | Main UI component | ~550 |
| `functions/src/cloudrun.ts` | API server | 262 |
| `pablo-mobile/App.tsx` | Mobile UI | 450 |
| `pablo-mobile/services/api.ts` | Mobile API client | 56 |

---

## 4. Operational Reference

### Deployment Workflows

#### Deploy Web App

```bash
# Build and deploy to production
cd /home/jeremy/000-projects/noupick
npm run build
firebase deploy --only hosting --project noupick-prod

# Verify deployment
curl -I https://noupick-prod.web.app
```

#### Deploy API Backend

```bash
cd /home/jeremy/000-projects/noupick/functions

# Build TypeScript
npm run build

# Build Docker image
docker build -t us-central1-docker.pkg.dev/noupick-prod/noupick/api:latest .

# Push to Artifact Registry
docker push us-central1-docker.pkg.dev/noupick-prod/noupick/api:latest

# Deploy to Cloud Run
gcloud run deploy noupick-api \
  --image us-central1-docker.pkg.dev/noupick-prod/noupick/api:latest \
  --region us-central1 \
  --project noupick-prod \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_CLOUD_PROJECT=noupick-prod

# Verify deployment
curl https://noupick-api-246498703732.us-central1.run.app/health
```

#### Deploy Mobile App

```bash
cd /home/jeremy/000-projects/noupick/pablo-mobile

# Login to Expo (first time)
npx eas login

# Build for Android (APK for testing)
npx eas build --platform android --profile preview

# Build for iOS (requires Apple Developer account)
npx eas build --platform ios --profile production

# Build for both stores
npx eas build --platform all --profile production

# Submit to stores
npx eas submit --platform ios
npx eas submit --platform android
```

### Monitoring & Health Checks

#### API Health

```bash
# Quick health check
curl -s https://noupick-api-246498703732.us-central1.run.app/health | jq

# Expected response:
# {"status":"healthy","timestamp":"2025-12-11T...","version":"1.0.0"}
```

#### Cloud Run Logs

```bash
# View recent logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=noupick-api" \
  --project noupick-prod \
  --limit 50 \
  --format "table(timestamp,textPayload)"

# Stream logs
gcloud alpha run services logs read noupick-api \
  --project noupick-prod \
  --region us-central1 \
  --tail
```

#### Firebase Hosting

```bash
# Check hosting status
firebase hosting:channel:list --project noupick-prod
```

### Rollback Procedures

#### Web App Rollback

```bash
# List recent deployments
firebase hosting:releases:list --project noupick-prod

# Rollback to previous version (using release ID)
firebase hosting:clone noupick-prod:live@<version> noupick-prod:live
```

#### API Rollback

```bash
# List revisions
gcloud run revisions list --service noupick-api \
  --project noupick-prod \
  --region us-central1

# Route traffic to previous revision
gcloud run services update-traffic noupick-api \
  --to-revisions <revision-name>=100 \
  --project noupick-prod \
  --region us-central1
```

---

## 5. Security & Access

### Identity & Access Management

| Account/Role | Purpose | Permissions | MFA |
|--------------|---------|-------------|-----|
| jeremy@intentsolutions.io | Owner | Project Owner | Yes |
| 246498703732-compute@developer.gserviceaccount.com | Cloud Run SA | Vertex AI User, ML Developer | N/A |

### Secrets Management

| Secret | Location | Rotation |
|--------|----------|----------|
| GOOGLE_CLOUD_PROJECT | Cloud Run env var | N/A |
| Firebase config | .firebaserc | N/A |

**Note**: No API keys are exposed to clients. All AI calls use Application Default Credentials (ADC).

### Security Posture

| Control | Status | Notes |
|---------|--------|-------|
| HTTPS | Enforced | Firebase & Cloud Run |
| CORS | Configured | Whitelist only |
| Rate Limiting | 10 req/min | In-memory (per instance) |
| Input Validation | Basic | locationQuery required |
| Authentication | None | Public API |

### CORS Whitelist

```javascript
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:5173',
  /\.web\.app$/,
  /\.firebaseapp\.com$/,
  /noupick.*\.web\.app$/
];
```

---

## 6. Cost & Performance

### Current Costs (Estimated)

| Service | Monthly Cost | Notes |
|---------|--------------|-------|
| Cloud Run | $0.50 - $2.00 | Pay-per-request, scales to 0 |
| Vertex AI | $0.50 - $2.00 | ~$0.001 per request |
| Firebase Hosting | $0 | Free tier |
| Artifact Registry | $0.10 | Storage only |
| **Total** | **~$1-5/month** | Usage-based |

### Performance Baseline

| Metric | Target | Actual |
|--------|--------|--------|
| API Response Time | < 5s | 2-4s |
| Cold Start | < 3s | ~2s |
| Web App Load | < 2s | < 1s (CDN) |

### Optimization Opportunities

1. **Cloud Run min instances = 1**: Eliminates cold starts ($15-20/month increase)
2. **Caching**: Add Redis for frequent searches (complexity vs. cost)
3. **CDN caching**: Already optimal for static assets

---

## 7. Development Workflow

### Local Development

```bash
# Web app
cd /home/jeremy/000-projects/noupick
npm install
echo "VITE_API_BASE_URL=https://noupick-api-246498703732.us-central1.run.app" > .env
npm run dev
# Open http://localhost:3000

# Mobile app
cd pablo-mobile
npm install
npx expo start
# Scan QR with Expo Go app
```

### Testing

```bash
# Mobile app tests
cd pablo-mobile
npm run test           # Run all tests
npm run test:coverage  # With coverage
npm run typecheck      # TypeScript check

# API smoke test
curl -X POST https://noupick-api-246498703732.us-central1.run.app/api/restaurants \
  -H "Content-Type: application/json" \
  -d '{"locationQuery": "Austin, TX", "cuisine": "BBQ", "radius": "10"}'
```

### Git Workflow

```bash
# Current branch strategy: main only
git checkout main
git pull origin main

# Make changes, commit with conventional commits
git add .
git commit -m "feat: Add new feature"
git push origin main
```

---

## 8. Mobile App Deployment

### Prerequisites

| Requirement | Cost | Purpose |
|-------------|------|---------|
| Apple Developer Account | $99/year | iOS App Store |
| Google Play Console | $25 one-time | Play Store |
| Expo Account | Free | EAS Build service |

### Configuration Files

**app.json**:
- App name: "No, YOU Pick!"
- Bundle ID: `com.pabsai.noyoupick`
- Dark theme (#1a1a2e)

**eas.json**:
- Preview: APK for testing
- Production: AAB for stores

### App Store Checklist

- [ ] Apple Developer enrollment approved
- [ ] Google Play Console account created
- [ ] Custom app icons created (1024x1024)
- [ ] App Store screenshots (6 sizes)
- [ ] Privacy policy URL
- [ ] App Store description written
- [ ] EAS build successful
- [ ] Store listing submitted

---

## 9. Current State Assessment

### What's Working Well

| Area | Status | Evidence |
|------|--------|----------|
| API Backend | Healthy | `/health` returns 200 |
| Web App | Deployed | Live at noupick-prod.web.app |
| Mobile App | Ready | Tests passing, EAS configured |
| CI/CD | Manual | Scripts documented |
| Security | Good | No API keys exposed |

### Areas Needing Attention

| Priority | Issue | Impact | Recommended Action |
|----------|-------|--------|-------------------|
| High | No monitoring/alerting | Undetected outages | Add Cloud Monitoring |
| High | No automated CI/CD | Manual deployments | Add GitHub Actions |
| Medium | Rate limiting in-memory | Bypass across instances | Use Redis or Cloud Endpoints |
| Medium | No user analytics | No usage insights | Add Google Analytics |
| Low | Legacy Supabase code | Dead code | Remove unused files |

### Test Coverage

| Component | Tests | Coverage |
|-----------|-------|----------|
| Mobile API Service | 10 | 100% of api.ts |
| Web App | 0 | No tests |
| Backend | 0 | No tests |

---

## 10. Quick Reference

### Operational Command Map

| Task | Command |
|------|---------|
| Start web dev | `npm run dev` |
| Build web | `npm run build` |
| Deploy web | `firebase deploy --only hosting --project noupick-prod` |
| Deploy API | See deployment workflow above |
| Start mobile | `cd pablo-mobile && npx expo start` |
| Run mobile tests | `cd pablo-mobile && npm test` |
| View API logs | `gcloud alpha run services logs read noupick-api --project noupick-prod --region us-central1` |
| Check API health | `curl https://noupick-api-246498703732.us-central1.run.app/health` |

### Critical Endpoints

| Endpoint | URL |
|----------|-----|
| Production Web | https://noupick-prod.web.app |
| API Health | https://noupick-api-246498703732.us-central1.run.app/health |
| API Restaurants | POST https://noupick-api-246498703732.us-central1.run.app/api/restaurants |
| Firebase Console | https://console.firebase.google.com/project/noupick-prod |
| Cloud Run Console | https://console.cloud.google.com/run?project=noupick-prod |
| GitHub Repo | https://github.com/pabs-ai/No-You-Pick. |

### First-Week Checklist for Pablo

- [ ] Clone repo and run web app locally
- [ ] Run mobile app with Expo Go
- [ ] Make a test API call with curl
- [ ] Review README.md app store guide
- [ ] Create Apple Developer account
- [ ] Create Google Play Console account
- [ ] Create Expo account and login (`npx eas login`)
- [ ] Create custom app icons
- [ ] Run first EAS build (`npx eas build --platform android --profile preview`)
- [ ] Test APK on Android device

---

## 11. Recommendations Roadmap

### Week 1 - Mobile App Launch

**Goals**:
1. Complete app store account setup
2. Create custom app icons
3. Build and test on physical devices
4. Submit to app stores

**Owner**: Pablo

### Month 1 - Monitoring & CI/CD

**Goals**:
1. Add Cloud Monitoring alerts
2. Set up GitHub Actions for deployments
3. Add basic web app tests
4. Create status page

### Quarter 1 - Scale & Polish

**Goals**:
1. Add user analytics
2. Implement proper rate limiting
3. Add favorites sync (optional)
4. Marketing launch

---

## Appendix A: API Request/Response

### POST /api/restaurants

**Request**:
```json
{
  "locationQuery": "Austin, TX",
  "cuisine": "BBQ",
  "radius": "10",
  "excludeNames": ["Previous Restaurant"]
}
```

**Response**:
```json
{
  "restaurants": [
    {
      "id": "rest-0-1702300000000",
      "name": "Franklin Barbecue",
      "cuisine": "BBQ",
      "address": "900 E 11th St, Austin",
      "rating": "4.8",
      "openStatus": "Open",
      "reason": "World-famous brisket worth the wait",
      "googleMapLink": "https://maps.google.com/..."
    }
  ],
  "rawText": "..."
}
```

---

## Appendix B: Troubleshooting

### "API Error" on web app

1. Check API health: `curl https://noupick-api-246498703732.us-central1.run.app/health`
2. Check Cloud Run logs for errors
3. Verify GOOGLE_CLOUD_PROJECT env var is set

### "No restaurants found"

1. Try broader cuisine ("Any")
2. Increase radius (15 or 25 miles)
3. Use a major city as location

### Mobile app won't connect

1. Check internet connection
2. Verify API is healthy
3. Restart Expo Go app

### EAS build fails

1. Verify `npx eas whoami` shows logged in
2. Check bundle ID matches developer account
3. Review eas.json configuration

---

*Document Version: 1.0*
*Last Updated: 2025-12-11*
*Next Review: 2026-01-11*
