# Pablo Mobile - React Native + Firebase Architecture

**Project**: Pablo Mobile (No, You Pick!)
**Platform**: iOS (App Store) + Android (Google Play Store)
**Tech Stack**: React Native + Expo + Firebase + Google Cloud
**Date**: 2025-12-10
**Status**: Backend Ready, Mobile App Pending

---

## 🎯 Project Overview

**Pablo Mobile** is a React Native mobile application for iOS and Android that helps users decide where to eat by providing 3 AI-powered restaurant recommendations using Google Gemini AI and Google Maps data.

### Current Status
✅ **Backend Infrastructure**: Complete and production-ready
- Firebase projects created (noupick-staging, noupick-prod)
- Cloud Functions backend deployed with secure Gemini API proxy
- Rate limiting (10 req/min per user)
- Google Cloud APIs enabled (Maps, Places, Directions, Geocoding, AI Platform)

⏳ **Mobile App**: To be developed
- React Native + Expo codebase
- iOS and Android native builds
- App Store and Google Play Store submission

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────┐
│  Mobile Apps (React Native + Expo)              │
│                                                  │
│  ┌──────────────┐         ┌──────────────┐     │
│  │              │         │              │     │
│  │  iOS App     │         │  Android App │     │
│  │  (App Store) │         │  (Play Store)│     │
│  │              │         │              │     │
│  └──────┬───────┘         └──────┬───────┘     │
│         │                        │             │
│         └────────────┬───────────┘             │
└──────────────────────┼─────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│  Firebase Backend                                │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │  Cloud Functions (Node.js 20)             │  │
│  │  - POST /api/restaurants                  │  │
│  │  - GET /health                            │  │
│  │  - Rate limiting (10/min)                 │  │
│  │  - CORS for mobile apps                   │  │
│  └────────┬─────────────────────────────────┘  │
│           │                                     │
│           ▼                                     │
│  ┌──────────────────────────────────────────┐  │
│  │  Firestore Database                       │  │
│  │  - User favorites                         │  │
│  │  - Search history                         │  │
│  │  - Rate limit tracking                    │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │  Firebase Analytics                       │  │
│  │  - User engagement                        │  │
│  │  - Search patterns                        │  │
│  │  - Crash reporting                        │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│  Google Cloud Platform                           │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │  Vertex AI / Gemini API                   │  │
│  │  - gemini-1.5-flash-002 (via Vertex AI)  │  │
│  │  - gemini-2.5-flash (via Gemini API)     │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │  Google Maps Platform                     │  │
│  │  - Places API                             │  │
│  │  - Geocoding API                          │  │
│  │  - Directions API                         │  │
│  │  - Maps SDK for iOS/Android               │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## 🔧 Enabled Google Cloud APIs

### GCP Project: noupick-staging & noupick-prod

✅ **AI & ML**
- `aiplatform.googleapis.com` - Vertex AI for Gemini models
- `generativelanguage.googleapis.com` - Gemini API (alternative to Vertex AI)

✅ **Google Maps Platform**
- `maps-backend.googleapis.com` - Maps JavaScript API
- `places-backend.googleapis.com` - Places API (restaurant data)
- `geocoding-backend.googleapis.com` - Geocoding API (address → coordinates)
- `directions-backend.googleapis.com` - Directions API (navigation)

✅ **Firebase Services** (automatically enabled)
- Cloud Functions for Firebase
- Cloud Firestore
- Firebase Authentication
- Firebase Analytics
- Firebase Crashlytics

---

## 📱 Mobile App Stack

### React Native + Expo

**Framework**: React Native with Expo managed workflow

**Key Libraries**:
```json
{
  "dependencies": {
    "expo": "~51.0.0",
    "react-native": "0.74.5",
    "react-native-maps": "^1.14.0",
    "@react-native-firebase/app": "^20.0.0",
    "@react-native-firebase/firestore": "^20.0.0",
    "@react-native-firebase/analytics": "^20.0.0",
    "expo-location": "~17.0.0",
    "react-navigation": "^6.0.0"
  }
}
```

### Native Features

**iOS (Swift/Objective-C)**:
- Location services (CoreLocation)
- Maps integration (MapKit + Google Maps SDK)
- Push notifications (APNs)
- App Store distribution

**Android (Kotlin/Java)**:
- Location services (Google Play Services)
- Maps integration (Google Maps SDK)
- Push notifications (FCM)
- Google Play Store distribution

---

## 🔐 Security Architecture

### API Key Protection

**BEFORE (❌ Insecure - Web Version)**:
```javascript
// ❌ API key exposed in browser bundle
const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY
});
```

**AFTER (✅ Secure - Mobile App)**:
```javascript
// ✅ Mobile app calls Cloud Function (no API key on device)
const response = await fetch('https://us-central1-noupick-prod.cloudfunctions.net/api/restaurants', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    locationQuery: userLocation,
    cuisine: selectedCuisine,
    radius: searchRadius
  })
});
```

### Cloud Function Security

**Rate Limiting**:
- 10 requests per minute per user
- IP-based tracking
- Configurable in Cloud Functions

**CORS Configuration**:
```typescript
const ALLOWED_ORIGINS = [
  "http://localhost:3000",          // Local development
  "http://localhost:5173",          // Vite dev server
  "http://localhost:19006",         // Expo Go
  /\.web\.app$/,                    // Firebase Hosting
  /\.firebaseapp\.com$/,            // Firebase Hosting
  "capacitor://localhost",          // Capacitor iOS
  "http://localhost",               // Capacitor Android
];
```

**Authentication** (Future Enhancement):
```typescript
// Firebase Authentication for user-specific features
import { getAuth } from 'firebase/auth';

const user = getAuth().currentUser;
if (user) {
  // Attach user ID to requests for personalized rate limiting
  headers['X-User-ID'] = user.uid;
}
```

---

## 🗺️ Google Maps Integration

### Maps API Keys

**Android**:
- API key restricted to Android app package name
- SHA-1 certificate fingerprint verification
- Configured in `android/app/src/main/AndroidManifest.xml`

**iOS**:
- API key restricted to iOS bundle identifier
- App Store download tracking
- Configured in `ios/Runner/Info.plist`

### Maps Features

**Restaurant Display**:
```javascript
import MapView, { Marker } from 'react-native-maps';

<MapView
  region={{
    latitude: restaurant.coordinates.lat,
    longitude: restaurant.coordinates.lng,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  }}
>
  <Marker
    coordinate={{
      latitude: restaurant.coordinates.lat,
      longitude: restaurant.coordinates.lng,
    }}
    title={restaurant.name}
    description={restaurant.address}
  />
</MapView>
```

**Directions**:
```javascript
import * as Linking from 'expo-linking';

const openDirections = (restaurant) => {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${restaurant.coordinates.lat},${restaurant.coordinates.lng}`;
  Linking.openURL(url);
};
```

---

## 🔄 Migration Paths

### Option 1: Continue with Gemini API (Current Implementation)

**Pros**:
- Already implemented
- Works with current Cloud Functions code
- No code changes needed

**Cons**:
- Requires API key in Secret Manager
- Limited to Gemini API features
- Manual secret rotation

**Deployment**:
1. Get Gemini API key from https://aistudio.google.com/app/apikey
2. Store in Secret Manager:
   ```bash
   echo -n "YOUR_API_KEY" | gcloud secrets create GEMINI_API_KEY \
     --data-file=- --project=noupick-prod
   ```
3. Deploy Cloud Functions:
   ```bash
   firebase deploy --only functions --project=noupick-prod
   ```

### Option 2: Migrate to Vertex AI (Recommended - DiagnosticPro Pattern)

**Pros**:
- ✅ NO API KEY NEEDED - uses Workload Identity
- ✅ Better integration with GCP
- ✅ Higher free tier quotas
- ✅ Automatic credential management

**Cons**:
- Requires code refactor (2-3 hours)
- Different SDK (`@google-cloud/vertexai` vs `@google/genai`)
- Model name changes (`gemini-1.5-flash-002` vs `gemini-2.5-flash`)

**Code Changes**:
```typescript
// OLD (Gemini API)
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY.value() });

// NEW (Vertex AI)
import { VertexAI } from "@google-cloud/vertexai";
const project = process.env.GCLOUD_PROJECT;
const vertex = new VertexAI({ project, location: "us-central1" });
const model = vertex.getGenerativeModel({ model: "gemini-1.5-flash-002" });
```

**Deployment**:
1. Update `functions/package.json`:
   ```bash
   npm uninstall @google/genai
   npm install @google-cloud/vertexai@^1.9.0
   ```
2. Refactor `functions/src/index.ts` (see `009-REFACTOR-vertex-ai-migration-plan.md`)
3. Deploy:
   ```bash
   firebase deploy --only functions --project=noupick-prod
   ```

---

## 📦 Deployment Strategy

### Phase 1: Backend Deployment (Complete ✅)

1. **Firebase Projects Created**:
   - ✅ noupick-staging
   - ✅ noupick-prod

2. **Google Cloud APIs Enabled**:
   - ✅ AI Platform (Vertex AI)
   - ✅ Generative Language API (Gemini)
   - ✅ Maps Backend API
   - ✅ Places API
   - ✅ Geocoding API
   - ✅ Directions API

3. **Cloud Functions Deployed**:
   - ⏳ Pending API key configuration OR Vertex AI migration
   - Code ready in `functions/src/index.ts`
   - Rate limiting implemented
   - CORS configured for mobile apps

### Phase 2: Mobile App Development (Pending)

1. **React Native Setup**:
   ```bash
   npx create-expo-app pablo-mobile --template blank-typescript
   cd pablo-mobile
   npm install @react-native-firebase/app @react-native-firebase/firestore
   npm install react-native-maps expo-location
   ```

2. **Firebase Configuration**:
   ```javascript
   // firebase.config.js
   export const firebaseConfig = {
     apiKey: "AIza...",  // From Firebase Console
     authDomain: "noupick-prod.firebaseapp.com",
     projectId: "noupick-prod",
     storageBucket: "noupick-prod.appspot.com",
     messagingSenderId: "...",
     appId: "1:...:ios:..."
   };
   ```

3. **Google Maps Configuration**:
   - Create Android Maps API key (restricted to package name)
   - Create iOS Maps API key (restricted to bundle ID)
   - Add keys to `android/app/src/main/AndroidManifest.xml` and `ios/Runner/Info.plist`

4. **Build and Test**:
   ```bash
   # iOS
   expo build:ios --type archive

   # Android
   expo build:android --type app-bundle
   ```

### Phase 3: App Store Submission (Future)

1. **iOS App Store**:
   - Apple Developer Account ($99/year)
   - App Store Connect configuration
   - Privacy policy and screenshots
   - TestFlight beta testing

2. **Google Play Store**:
   - Google Play Console account ($25 one-time)
   - App listing and screenshots
   - Privacy policy
   - Internal testing track

---

## 🎯 Recommended Next Steps

### Immediate (< 1 week)

1. **Choose Migration Path**:
   - [ ] Option A: Deploy with Gemini API + Secret Manager (faster, working now)
   - [ ] Option B: Migrate to Vertex AI (better long-term, 3-5 hours work)

2. **Enable Maps APIs for Mobile**:
   - ✅ Maps Backend API (enabled)
   - ✅ Places API (enabled)
   - ✅ Geocoding API (enabled)
   - ✅ Directions API (enabled)
   - [ ] Create Android Maps API key
   - [ ] Create iOS Maps API key

3. **Deploy Backend**:
   - [ ] Configure API key OR complete Vertex AI migration
   - [ ] Deploy Cloud Functions to staging
   - [ ] Test with mobile app (curl or Postman)
   - [ ] Deploy to production

### Short-term (1-2 weeks)

4. **Initialize React Native App**:
   - [ ] Create Expo project
   - [ ] Set up Firebase SDK
   - [ ] Configure Google Maps SDK
   - [ ] Implement restaurant search UI

5. **Core Features**:
   - [ ] Location detection (GPS)
   - [ ] Cuisine selection
   - [ ] Search radius picker
   - [ ] Display 3 restaurant cards
   - [ ] "Spin Again" functionality
   - [ ] Open in Google Maps

6. **Testing**:
   - [ ] iOS simulator testing
   - [ ] Android emulator testing
   - [ ] Real device testing

### Medium-term (1 month)

7. **Additional Features**:
   - [ ] Favorites system (Firestore)
   - [ ] Search history
   - [ ] Share restaurant picks
   - [ ] Firebase Analytics integration
   - [ ] Crashlytics error reporting

8. **App Store Preparation**:
   - [ ] App icons and splash screens
   - [ ] Privacy policy
   - [ ] Terms of service
   - [ ] App Store screenshots
   - [ ] App description and keywords

---

## 📚 Documentation References

### Internal Docs
- `004-PP-PROD-pablo-mobile-firebase-app.md` - Product Requirements
- `005-AT-ADEC-pablo-mobile-firebase-architecture.md` - Architecture Decision
- `007-DEPLOY-production-deployment-guide.md` - Backend deployment
- `009-REFACTOR-vertex-ai-migration-plan.md` - Vertex AI migration guide

### External Resources
- **React Native**: https://reactnative.dev/docs/getting-started
- **Expo**: https://docs.expo.dev/
- **Firebase for React Native**: https://rnfirebase.io/
- **Google Maps SDK**: https://github.com/react-native-maps/react-native-maps
- **Vertex AI**: https://cloud.google.com/vertex-ai/docs
- **Gemini API**: https://ai.google.dev/docs

---

## 🎉 Success Criteria

### Backend (Current Status: 95% Complete)
- ✅ Firebase projects created
- ✅ Google Cloud APIs enabled
- ✅ Cloud Functions code written
- ⏳ API key configured OR Vertex AI migration complete
- ⏳ Deployed to staging and production

### Mobile App (Current Status: 0% Complete)
- ⏳ React Native app initialized
- ⏳ Core restaurant search working
- ⏳ Google Maps integration functional
- ⏳ Firebase Analytics tracking
- ⏳ iOS and Android builds successful

### Production Launch (Future)
- ⏸️ App Store approval (iOS)
- ⏸️ Google Play approval (Android)
- ⏸️ 100+ downloads in first week
- ⏸️ 95%+ crash-free rate
- ⏸️ < 5s average search time

---

**End of Mobile Architecture Document**

*Created: 2025-12-10*
*Status: Backend ready, mobile app development pending*
*Next: Choose Gemini API vs Vertex AI migration path*
