# NoYouPick Production Deployment Guide

**Created:** 2025-12-10
**Status:** Ready for Deployment
**Branch:** `feat/web-production-transformation`

---

## 📋 Deployment Overview

This guide walks through deploying the NoYouPick application to Firebase Hosting with secure Cloud Functions backend.

### What Was Built

✅ **Security Transformation Complete:**
- Gemini API key moved from browser to Cloud Functions (P0 vulnerability fixed)
- Cloud Functions proxy with rate limiting (10 req/min per IP)
- Production build verified: ZERO API key exposure
- Firebase infrastructure created for staging and production

✅ **Projects Created:**
- `noupick-staging` - Staging environment
- `noupick-prod` - Production environment

✅ **Architecture:**
```
Browser → Firebase Hosting (React SPA)
          ↓
Cloud Functions (Gemini API Proxy)
          ↓
Vertex AI Gemini 2.5 Flash API
          +
Google Maps Grounding
```

---

## 🚀 Deployment Steps

### Step 1: Obtain Gemini API Key

1. Visit https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key" → "Create API key in new project" (or select existing project)
4. Copy the API key (format: `AIza...`)
5. **IMPORTANT:** Keep this key secure - never commit it to git

### Step 2: Configure Secret Manager (Staging)

```bash
# Switch to staging project
firebase use staging

# Enable Secret Manager API
gcloud services enable secretmanager.googleapis.com --project=noupick-staging

# Create the secret
echo -n "YOUR_ACTUAL_API_KEY_HERE" | gcloud secrets create GEMINI_API_KEY \
  --data-file=- \
  --project=noupick-staging \
  --replication-policy="automatic"

# Grant Cloud Functions access to the secret
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:noupick-staging@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=noupick-staging

# Verify secret exists
gcloud secrets describe GEMINI_API_KEY --project=noupick-staging
```

### Step 3: Deploy Cloud Functions (Staging)

```bash
# Build TypeScript functions
cd functions
npm run build

# Deploy to staging
cd ..
firebase deploy --only functions --project=noupick-staging

# Expected output:
# ✔ functions[us-central1-api] Deployed
# ✔ functions[us-central1-health] Deployed
```

**Function Endpoints:**
- Health Check: `https://us-central1-noupick-staging.cloudfunctions.net/health`
- Restaurant API: `https://us-central1-noupick-staging.cloudfunctions.net/api/restaurants`

### Step 4: Deploy Frontend (Staging)

```bash
# Build production frontend
npm run build

# Verify build output
ls -lh dist/

# Deploy to Firebase Hosting
firebase deploy --only hosting --project=noupick-staging

# Expected output:
# ✔ Deploy complete!
# Hosting URL: https://noupick-staging.web.app
```

### Step 5: Verify Staging Deployment

```bash
# 1. Test health endpoint
curl https://us-central1-noupick-staging.cloudfunctions.net/health

# Expected:
# {"status":"healthy","timestamp":"...","version":"1.0.0"}

# 2. Test restaurant API
curl -X POST https://us-central1-noupick-staging.cloudfunctions.net/api/restaurants \
  -H "Content-Type: application/json" \
  -d '{
    "locationQuery": "San Francisco, CA",
    "cuisine": "Any",
    "radius": "15"
  }'

# Expected: JSON with restaurants array

# 3. Open frontend in browser
open https://noupick-staging.web.app
```

**Manual Testing Checklist:**
- [ ] Homepage loads correctly
- [ ] Can enter location
- [ ] Can select cuisine type
- [ ] "Find Me Food!" button works
- [ ] Restaurant recommendations appear
- [ ] "I don't like these" regenerates results
- [ ] Google Maps links work
- [ ] No console errors
- [ ] No API key visible in browser DevTools → Network tab

### Step 6: Production Deployment (After Staging Validation)

```bash
# Switch to production project
firebase use production

# Repeat Steps 2-5 for production:

# 1. Configure Secret Manager for production
gcloud services enable secretmanager.googleapis.com --project=noupick-prod

echo -n "YOUR_ACTUAL_API_KEY_HERE" | gcloud secrets create GEMINI_API_KEY \
  --data-file=- \
  --project=noupick-prod \
  --replication-policy="automatic"

gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:noupick-prod@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=noupick-prod

# 2. Deploy Cloud Functions
firebase deploy --only functions --project=noupick-prod

# 3. Deploy Frontend
npm run build
firebase deploy --only hosting --project=noupick-prod

# Production URLs:
# - Frontend: https://noupick-prod.web.app
# - Health: https://us-central1-noupick-prod.cloudfunctions.net/health
# - API: https://us-central1-noupick-prod.cloudfunctions.net/api/restaurants
```

---

## 🔒 Security Verification

### Pre-Deployment Checks
✅ No API keys in `dist/` folder (verified)
✅ No `@google/genai` in frontend bundle (verified)
✅ Frontend uses Cloud Functions proxy only (verified)
✅ Rate limiting enabled (10 req/min per IP)

### Post-Deployment Checks
Run these checks after deploying:

```bash
# 1. Verify no API key in production bundle
curl -s https://noupick-staging.web.app | grep -i "gemini"
# Should return: nothing or only references in CSS/comments

curl -s https://noupick-staging.web.app | grep -i "AIza"
# Should return: nothing

# 2. Test rate limiting
for i in {1..12}; do
  curl -X POST https://us-central1-noupick-staging.cloudfunctions.net/api/restaurants \
    -H "Content-Type: application/json" \
    -d '{"locationQuery":"SF"}' \
    -w "\nStatus: %{http_code}\n"
  sleep 1
done
# Should see HTTP 429 after 10 requests

# 3. Check CORS headers
curl -I -X OPTIONS https://us-central1-noupick-staging.cloudfunctions.net/api/restaurants \
  -H "Origin: https://noupick-staging.web.app"
# Should include: Access-Control-Allow-Origin header
```

---

## 📊 Monitoring & Operations

### View Cloud Function Logs

```bash
# Streaming logs
firebase functions:log --project=noupick-staging

# Last 100 lines
firebase functions:log --limit=100 --project=noupick-staging

# Filter for errors
firebase functions:log --project=noupick-staging | grep ERROR
```

### Firebase Console URLs

**Staging:**
- Overview: https://console.firebase.google.com/project/noupick-staging/overview
- Hosting: https://console.firebase.google.com/project/noupick-staging/hosting
- Functions: https://console.firebase.google.com/project/noupick-staging/functions
- Logs: https://console.firebase.google.com/project/noupick-staging/functions/logs

**Production:**
- Overview: https://console.firebase.google.com/project/noupick-prod/overview
- Hosting: https://console.firebase.google.com/project/noupick-prod/hosting
- Functions: https://console.firebase.google.com/project/noupick-prod/functions
- Logs: https://console.firebase.google.com/project/noupick-prod/functions/logs

### GCP Console (Secret Manager)

**Staging:**
https://console.cloud.google.com/security/secret-manager?project=noupick-staging

**Production:**
https://console.cloud.google.com/security/secret-manager?project=noupick-prod

---

## 🛠️ Common Operations

### Update Gemini API Key

```bash
# Staging
echo -n "NEW_API_KEY_HERE" | gcloud secrets versions add GEMINI_API_KEY \
  --data-file=- \
  --project=noupick-staging

# Production
echo -n "NEW_API_KEY_HERE" | gcloud secrets versions add GEMINI_API_KEY \
  --data-file=- \
  --project=noupick-prod
```

### Deploy Only Functions

```bash
firebase deploy --only functions --project=noupick-staging
```

### Deploy Only Hosting

```bash
npm run build
firebase deploy --only hosting --project=noupick-staging
```

### Rollback Deployment

```bash
# List previous hosting releases
firebase hosting:channel:list --project=noupick-staging

# Roll back to previous version
firebase hosting:clone SOURCE_SITE_ID:SOURCE_CHANNEL_ID DESTINATION_SITE_ID:live \
  --project=noupick-staging
```

### View Deployment History

```bash
firebase hosting:releases:list --project=noupick-staging
```

---

## 📈 Performance Metrics

### Expected Performance

**Frontend (Firebase Hosting):**
- Initial load: < 2s
- Page size: 4.78 kB (gzipped: 1.51 kB)
- CDN: Global edge caching

**Cloud Functions:**
- Cold start: < 5s
- Warm response: < 1s
- Gemini API call: 5-30s
- Timeout: 60s
- Memory: 512 MiB

**Rate Limits:**
- 10 requests per minute per IP
- Automatic retry with exponential backoff

### Firebase Quotas

**Spark Plan (Free):**
- Cloud Functions: 2M invocations/month
- Hosting: 10 GB storage, 360 MB/day bandwidth
- **NOTE:** Will need to upgrade to Blaze (pay-as-you-go) for production

**Blaze Plan:**
- Cloud Functions: First 2M free, then $0.40/M
- Hosting: 10 GB storage free, $0.026/GB bandwidth
- Secret Manager: First 6 operations free

---

## ⚠️ Troubleshooting

### Issue: Functions Fail with "Permission Denied"

**Cause:** Service account doesn't have Secret Manager access

**Fix:**
```bash
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:noupick-staging@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=noupick-staging
```

### Issue: CORS Errors in Browser

**Cause:** Frontend deployed to unexpected domain

**Fix:** Update `ALLOWED_ORIGINS` in `functions/src/index.ts`:
```typescript
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5000",
  "http://localhost:5173",
  /\.web\.app$/,
  /\.firebaseapp\.com$/,
  /noupick.*\.web\.app$/  // Add your custom domain here
];
```

### Issue: Rate Limit Too Restrictive

**Cause:** Current limit is 10 req/min per IP

**Fix:** Update in `functions/src/index.ts`:
```typescript
const RATE_LIMIT_MAX = 20; // Increase this
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // Or increase window
```

Then redeploy:
```bash
firebase deploy --only functions
```

### Issue: Gemini API Returns "NO_MATCHES_FOUND"

**Cause:** Search criteria too specific (e.g., "Vegan Ethiopian" in rural area)

**Solution:** User should try:
1. Broader cuisine type ("Any")
2. Larger search radius
3. Different location

---

## 🎯 Next Steps

### Phase 2: Custom Domain

```bash
# Add custom domain in Firebase Console
# Then update DNS:
firebase hosting:channel:deploy production --project=noupick-prod
```

### Phase 3: CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Firebase

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: noupick-prod
```

### Phase 4: Analytics & Monitoring

- Enable Firebase Analytics
- Set up Google Analytics 4
- Configure Cloud Monitoring alerts
- Set up error tracking (Sentry/Cloud Error Reporting)

### Phase 5: Supabase Integration (Post-MVP)

The current Supabase integration for community picks tracking is still present but not critical for MVP:

```typescript
// In services/geminiService.ts - Supabase still configured
import { createClient } from '@supabase/supabase-js';
```

To activate:
1. Set `VITE_SUPABASE_URL` in Firebase Hosting env vars
2. Set `VITE_SUPABASE_ANON_KEY` in Firebase Hosting env vars
3. Test community pick tracking flow

---

## 📝 Deployment Checklist

### Pre-Deployment
- [ ] Gemini API key obtained from https://aistudio.google.com/app/apikey
- [ ] Firebase CLI installed and authenticated (`firebase login`)
- [ ] GCloud CLI installed and authenticated (`gcloud auth login`)
- [ ] All code committed to git
- [ ] Branch `feat/web-production-transformation` ready

### Staging Deployment
- [ ] Secret Manager enabled in noupick-staging
- [ ] GEMINI_API_KEY secret created
- [ ] IAM binding granted to Cloud Functions service account
- [ ] Cloud Functions deployed successfully
- [ ] Frontend built and deployed to Hosting
- [ ] Health check returns 200 OK
- [ ] Restaurant API returns valid JSON
- [ ] Manual testing completed (see Step 5 checklist)
- [ ] Security verification passed (no API keys exposed)
- [ ] Rate limiting tested (429 after 10 requests)

### Production Deployment
- [ ] Staging fully validated and working
- [ ] Secret Manager enabled in noupick-prod
- [ ] GEMINI_API_KEY secret created in production
- [ ] IAM binding granted in production
- [ ] Cloud Functions deployed to production
- [ ] Frontend deployed to production
- [ ] Smoke tests passed
- [ ] Performance monitoring configured
- [ ] Error logging verified

---

## 🎉 Success Criteria

Deployment is considered successful when:

✅ **Staging:**
- https://noupick-staging.web.app loads and works correctly
- Restaurant search returns valid results
- No API keys visible in browser
- Rate limiting works (429 after 10 requests)
- No console errors in browser DevTools

✅ **Production:**
- https://noupick-prod.web.app is live and functional
- All staging success criteria met
- Monitoring and logging active
- Custom domain configured (if applicable)

---

## 📞 Support Resources

- **Firebase Documentation:** https://firebase.google.com/docs
- **Cloud Functions Docs:** https://firebase.google.com/docs/functions
- **Secret Manager Docs:** https://cloud.google.com/secret-manager/docs
- **Gemini API Docs:** https://ai.google.dev/docs

---

**End of Deployment Guide**

*Generated: 2025-12-10*
*Branch: feat/web-production-transformation*
*Commits: 4 (Package lock, Firebase structure, Security cleanup, Final fixes)*
