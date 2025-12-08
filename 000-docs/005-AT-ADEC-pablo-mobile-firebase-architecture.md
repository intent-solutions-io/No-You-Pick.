# Architecture Decision Record: Pablo Mobile Backend Architecture

**Status**: Proposed
**Date**: 2025-12-06
**Author**: Jeremy Longshore (implementing with Claude Code)
**Owner & Reviewer**: Pablo (pabs-ai, reviews with Gemini Code Assist)
**Context**: Pablo Mobile app requires secure backend for Gemini API calls
**Decision**: Use Firebase Cloud Functions (Node.js 20) over Cloud Run for MVP backend

---

## Title

**Use Firebase Cloud Functions for Pablo Mobile Backend (MVP)**

---

## Status

**PROPOSED** - Awaiting approval from Pablo

Alternatives considered:
1. ✅ **Firebase Cloud Functions** (RECOMMENDED)
2. ❌ Cloud Run (rejected for MVP, reevaluate at scale)
3. ❌ Non-Firebase backends (AWS Lambda, Supabase Edge Functions) - rejected per project requirements

---

## Context

### Problem Statement
The current No-You-Pick web application exposes the Gemini API key in the browser (visible in DevTools as `process.env.API_KEY`). This creates three critical issues:

1. **Security Risk**: Any user can extract the API key and abuse it, leading to quota exhaustion and unexpected billing.
2. **No Rate Limiting**: Client-side calls cannot be rate-limited, allowing malicious users to spam requests.
3. **No Monitoring**: Impossible to track API usage per user, debug failures, or analyze search patterns.

### Requirements
The mobile backend must:
- Secure the Gemini API key (never exposed to client)
- Proxy all Gemini 2.5 Flash API calls with Google Maps grounding
- Implement rate limiting (10 requests/minute per user)
- Log API requests to Firestore for monitoring
- Support both iOS and Android clients
- Stay within Firebase Spark Plan ($0/month) for MVP
- Scale automatically as user base grows
- Deploy in < 5 minutes with minimal configuration

### Constraints
- **Google Cloud Native**: Must use Firebase + GCP services only (no AWS, Supabase, etc.)
- **Developer Experience**: Jeremy implements features using Claude Code, Pablo reviews PRs with Gemini Code Assist, solution must be beginner-friendly with clear documentation
- **Cost**: Minimize costs for MVP launch (target $0-20/month for first 1,000 users)
- **Time to Market**: Simple deployment process, no Kubernetes/complex orchestration

---

## Decision

**We will use Firebase Cloud Functions (2nd generation) with Node.js 20 runtime** to implement the Pablo Mobile backend API.

### Architecture Overview

```
┌─────────────────┐
│  iOS/Android    │
│  React Native   │
│  App            │
└────────┬────────┘
         │ HTTPS
         │ POST /api/searchRestaurants
         ▼
┌─────────────────────────────────┐
│  Firebase Cloud Functions       │
│  ┌──────────────────────────┐  │
│  │ searchRestaurants()      │  │
│  │ - Validate input         │  │
│  │ - Check rate limit       │  │
│  │ - Call Gemini API        │  │
│  │ - Parse response         │  │
│  │ - Log to Firestore       │  │
│  └──────────────────────────┘  │
└────────┬────────────────────────┘
         │
         ├─────► Firestore (logs, rate limits)
         │
         └─────► Vertex AI Gemini 2.5 Flash
                 (with Google Maps grounding)
```

### Core Function: `searchRestaurants`

**Endpoint**: `https://us-central1-{project-id}.cloudfunctions.net/searchRestaurants`

**Request**:
```json
{
  "location": "New York, NY",
  "cuisine": "Pizza",
  "radius": "5",
  "customCraving": "outdoor seating",
  "excludeNames": ["Restaurant A", "Restaurant B"],
  "coords": { "latitude": 40.7128, "longitude": -74.0060 }
}
```

**Response**:
```json
{
  "success": true,
  "restaurants": [
    {
      "name": "Joe's Pizza",
      "address": "7 Carmine St, New York, NY 10014",
      "rating": 4.5,
      "isOpen": true,
      "why": "Classic NYC coal-fired oven pizza with outdoor tables"
    },
    // ... 2 more
  ],
  "requestId": "req_abc123"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Try again in 60 seconds.",
  "retryAfter": 60
}
```

### Implementation Details

**Function Configuration**:
```javascript
// functions/src/index.ts
import { onRequest } from 'firebase-functions/v2/https';
import { GoogleGenAI } from '@google/genai';
import { Firestore } from '@google-cloud/firestore';

const firestore = new Firestore();

export const searchRestaurants = onRequest(
  {
    region: 'us-central1',
    memory: '512MB',
    timeoutSeconds: 60,
    maxInstances: 10,
    cors: true, // Enable CORS for mobile apps
  },
  async (req, res) => {
    // 1. Validate input
    const { location, cuisine, radius } = req.body;
    if (!location) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_INPUT',
        message: 'Location is required'
      });
    }

    // 2. Rate limiting (check Firestore)
    const userId = req.headers['x-user-id'] || 'anonymous';
    const isRateLimited = await checkRateLimit(userId);
    if (isRateLimited) {
      return res.status(429).json({
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Try again in 60 seconds.',
        retryAfter: 60
      });
    }

    // 3. Call Gemini API (API key from environment variable)
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ text: buildPrompt(location, cuisine, radius) }],
      tools: [{ googleMapsSearch: {} }] // Enable Maps grounding
    });

    // 4. Parse response and return
    const restaurants = parseGeminiResponse(result);

    // 5. Log to Firestore
    await firestore.collection('apiLogs').add({
      userId,
      timestamp: new Date(),
      location,
      cuisine,
      resultCount: restaurants.length
    });

    return res.json({ success: true, restaurants });
  }
);
```

**Deployment**:
```bash
# 1. Initialize Firebase Functions
firebase init functions

# 2. Set API key as environment variable (NOT in code)
firebase functions:secrets:set GEMINI_API_KEY

# 3. Deploy
firebase deploy --only functions
```

---

## Alternatives Considered

### Alternative 1: Cloud Run (Containerized Backend)

**Description**: Deploy a containerized Express.js API on Cloud Run with the same functionality as Cloud Functions.

**Pros**:
- Full control over runtime environment (can use any Node.js version, system dependencies)
- Potentially lower cold start latency (200-500ms vs 1-2s for Cloud Functions)
- Can run locally with Docker for exact prod environment testing
- Better for complex applications with many routes/middleware

**Cons**:
- ❌ **More complex deployment**: Requires Dockerfile, container registry setup, Cloud Run service configuration
- ❌ **Manual scaling config**: Must set min/max instances, concurrency limits (Cloud Functions auto-configures)
- ❌ **Higher learning curve**: Must learn Docker, container concepts vs simple `firebase deploy` (less compatible with AI-assisted workflow)
- ❌ **Overkill for MVP**: Single endpoint doesn't justify containerization overhead
- ❌ **Not Firebase-integrated**: Harder to use Firebase Admin SDK, Firestore triggers

**Decision**: **REJECTED for MVP**. Reevaluate if cold start latency becomes user-facing issue (> 3 seconds) or if we need advanced routing/middleware.

---

### Alternative 2: Non-Firebase Backends (AWS Lambda, Supabase Edge Functions)

**Description**: Use AWS Lambda + API Gateway OR Supabase Edge Functions (Deno runtime) for backend.

**Pros**:
- AWS Lambda has mature ecosystem, extensive documentation
- Supabase Edge Functions are fast (Deno V8 runtime, < 100ms cold starts)

**Cons**:
- ❌ **Violates project constraint**: "No non-Google backends" (per PRD Section 5: Non-Goals)
- ❌ **Ecosystem fragmentation**: Must manage AWS + Google Cloud OR Supabase + Firebase separately
- ❌ **Higher cost**: AWS Lambda + API Gateway more expensive than Firebase Functions for low traffic
- ❌ **No Firebase integration**: Cannot use Firestore natively, requires HTTP clients + auth setup

**Decision**: **REJECTED per project requirements**. Google Cloud native stack is hard requirement.

---

## Consequences

### Positive Consequences
1. ✅ **Security**: Gemini API key never exposed to client (stored as Firebase secret, injected at runtime)
2. ✅ **Simple deployment**: Single command (`firebase deploy --only functions`) deploys entire backend
3. ✅ **Automatic scaling**: Scales from 0 to 10,000 requests/second without configuration
4. ✅ **Firestore integration**: Native Admin SDK access for rate limiting, logging, user data
5. ✅ **Cost efficiency**: Firebase Spark Plan includes 2M function invocations/month FREE (sufficient for MVP)
6. ✅ **AI-assisted development friendly**: Simple deployment commands and clear error messages work well with Claude Code and Gemini Code Assist

### Negative Consequences
1. ❌ **Cold start latency**: 1-2 second delay on first request after inactivity (acceptable for non-critical searches)
2. ❌ **Vendor lock-in**: Tightly coupled to Firebase ecosystem (migration to Cloud Run requires refactor)
3. ❌ **Limited runtime control**: Cannot install system dependencies (e.g., Chrome for web scraping - not needed here)
4. ❌ **Debugging complexity**: Local emulator doesn't perfectly match production environment

### Mitigation Strategies
- **Cold starts**: Keep 1 min instance warm during peak hours (costs ~$5/month on Blaze Plan if needed)
- **Vendor lock-in**: Abstract Gemini API logic into separate `geminiService.ts` module (portable to Cloud Run)
- **Debugging**: Use Firebase emulator suite for local testing, add comprehensive logging to production functions

---

## Implementation Plan

### Phase 1: Minimum Viable Backend (Week 1)
```bash
# 1. Initialize Firebase project
firebase init functions
# Select: TypeScript, ESLint, install dependencies

# 2. Install dependencies
cd functions
npm install @google/genai @google-cloud/firestore

# 3. Create searchRestaurants function (see code above)
# 4. Set Gemini API key secret
firebase functions:secrets:set GEMINI_API_KEY

# 5. Deploy
firebase deploy --only functions

# 6. Test from mobile app
curl -X POST https://us-central1-PROJECT_ID.cloudfunctions.net/searchRestaurants \
  -H "Content-Type: application/json" \
  -d '{"location": "San Francisco", "cuisine": "Pizza", "radius": "5"}'
```

### Phase 2: Rate Limiting & Logging (Week 2)
- Implement Firestore-based rate limiting (10 requests/minute per user ID)
- Add API request logging for monitoring
- Create Cloud Functions log dashboard in Firebase Console

### Phase 3: Mobile Integration (Week 3)
- Update React Native app to call Cloud Function instead of direct Gemini API
- Add retry logic for transient failures
- Implement error handling UI (rate limit errors, no results, etc.)

### Phase 4: Monitoring (Week 4)
- Set up Firebase Alerts for error rate > 5%
- Create Firestore index for fast rate limit queries
- Add API quota monitoring (alert at 80% monthly usage)

---

## Cost Analysis

### Firebase Spark Plan (FREE - $0/month)
**Limits**:
- 2M Cloud Function invocations/month
- 125K function invocations/day
- Outbound data: 5 GB/month

**Realistic Usage** (1,000 active users):
- Average 10 searches/user/month = 10,000 invocations
- Well within free tier limits ✅

---

### Firebase Blaze Plan (Pay-as-you-go)
**If we exceed Spark Plan**:
- Cloud Functions: $0.40 per million invocations (after free tier)
- **Example**: 5M invocations/month = $0.40 × 3 = **$1.20/month**

**Total Estimated Cost** (10,000 active users):
- Cloud Functions: $2-5/month
- Firestore: $1-3/month (logging, rate limits)
- Gemini API: $0 (free tier covers ~30K requests/month, then $0.00025/request)
- **TOTAL**: **$3-10/month** for 10,000 users

---

## Review Checklist

Before approving this ADR, Pablo should confirm:

- [ ] **I understand Firebase Cloud Functions** (reviewed official docs: https://firebase.google.com/docs/functions)
- [ ] **I can deploy functions** (tested `firebase deploy --only functions` - Jeremy implements with Claude Code)
- [ ] **I'm comfortable with Node.js/TypeScript** (Jeremy handles implementation with Claude Code, I review with Gemini Code Assist)
- [ ] **I accept cold start latency** (1-2s delay on first request is acceptable for restaurant search)
- [ ] **I have a Google Cloud project** (or approve using Jeremy's Intent Solutions org)

---

## References

- **Firebase Cloud Functions Docs**: https://firebase.google.com/docs/functions
- **Vertex AI Gemini API**: https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/gemini
- **Firebase Pricing**: https://firebase.google.com/pricing
- **Cloud Run vs Functions**: https://cloud.google.com/blog/topics/developers-practitioners/cloud-run-vs-cloud-functions-whats-lowest-cost

---

## Decision Log

| Date       | Author  | Change                                      |
|------------|---------|---------------------------------------------|
| 2025-12-06 | Jeremy  | Initial draft - recommended Cloud Functions |

---

**Next Steps**:
1. Pablo reviews and approves (or requests changes)
2. Create Firebase project (Pablo's org OR Intent Solutions)
3. Initialize Cloud Functions in repo
4. Implement `searchRestaurants` function
5. Deploy and test from mobile app

---

*🤖 Generated with [Claude Code](https://claude.com/claude-code)*
*Co-Authored-By: Claude <noreply@anthropic.com>*
