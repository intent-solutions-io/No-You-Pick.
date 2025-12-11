# Mobile App Store Deployment Guide
**Created:** 2025-12-10
**Status:** Ready to build React Native app
**Backend:** ✅ Production Cloud Run deployed

---

## ✅ What's Ready

**Backend API (Production)**:
- URL: https://noupick-api-246498703732.us-central1.run.app
- Health: https://noupick-api-246498703732.us-central1.run.app/health
- Vertex AI: ✅ Working with Gemini 2.0 Flash
- Rate limiting: 10 requests/minute
- Cost: ~$0.50-$2/month

**Web App (Production)**:
- URL: https://noupick-prod.web.app
- Test it now to see the UI/UX!

---

## 📱 Next Steps: Mobile App

### 1. Create React Native App (2-3 hours)

```bash
# Create new Expo app
npx create-expo-app pablo-mobile --template blank-typescript
cd pablo-mobile

# Install dependencies
npm install axios
npm install @react-native-community/geolocation
npm install react-native-maps
```

### 2. Add API Integration (1 hour)

**services/api.ts:**
```typescript
const API_URL = 'https://noupick-api-246498703732.us-central1.run.app';

export const searchRestaurants = async (
  location: string,
  cuisine: string,
  radius: string = '10'
) => {
  const response = await fetch(`${API_URL}/api/restaurants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      locationQuery: location,
      cuisine,
      radius
    })
  });

  return response.json();
};
```

### 3. Copy UI from Web App (2-3 hours)

Copy these components from the web version:
- `App.tsx` → Convert to React Native components
- `components/` → Replace HTML with React Native components
- Keep the same UX flow and design

**Key changes:**
- `<div>` → `<View>`
- `<input>` → `<TextInput>`
- `<button>` → `<TouchableOpacity>` or `<Button>`
- CSS → StyleSheet

### 4. Build for iOS (1 hour)

```bash
# Generate iOS build
eas build --platform ios --profile production

# Or use Expo Go for testing
npx expo start --ios
```

**Requirements:**
- Apple Developer Account ($99/year)
- Xcode installed (Mac only)
- App Store Connect configured

### 5. Build for Android (1 hour)

```bash
# Generate Android build
eas build --platform android --profile production

# Or use Expo Go for testing
npx expo start --android
```

**Requirements:**
- Google Play Console account ($25 one-time)
- Android Studio (optional, for testing)

### 6. App Store Submission

**iOS (App Store):**
1. Create app in App Store Connect
2. Fill in metadata (name, description, screenshots)
3. Upload build from step 4
4. Submit for review (1-3 days approval time)

**Android (Play Store):**
1. Create app in Google Play Console
2. Fill in store listing
3. Upload AAB file from step 5
4. Submit for review (faster, usually < 24 hours)

---

## 🎯 Quick Start (Test Web App Now)

**Your live web app is ready:**
```
https://noupick-prod.web.app
```

Open it and test:
1. Enter a location (e.g., "Los Angeles, CA")
2. Pick a cuisine
3. Click "No, YOU pick!"
4. See 3 AI-powered restaurant recommendations

This is the exact UI you'll replicate in the mobile app!

---

## 📋 Mobile App Checklist

- [ ] Create React Native app with Expo
- [ ] Copy UI components from web version
- [ ] Integrate Cloud Run API
- [ ] Test on iOS Simulator
- [ ] Test on Android Emulator
- [ ] Create app icons and splash screens
- [ ] Write App Store descriptions
- [ ] Take screenshots for both stores
- [ ] Build iOS with EAS Build
- [ ] Build Android with EAS Build
- [ ] Submit to App Store (iOS)
- [ ] Submit to Play Store (Android)

---

## 💰 Costs

**Development:**
- Apple Developer: $99/year (required for iOS)
- Google Play: $25 one-time (required for Android)
- Expo EAS Build: Free tier available

**Running:**
- Backend API: $0.50-$2/month (already deployed!)
- Firebase Hosting: Free (current usage)

**Total to launch:** ~$124 + time

---

## 🚀 Fastest Path to App Store

**Option 1: Full Native (Best)**
- React Native + Expo
- 8-12 hours total work
- Best performance
- Full native features

**Option 2: Web View Wrapper (Quick & Dirty)**
- Use existing web app in a WebView
- 2-3 hours total work
- Just wraps https://noupick-prod.web.app
- Still works for MVP!

**Option 3: PWA (Easiest)**
- Add PWA manifest to web app
- Users can "install" from browser
- 1 hour work
- Not in official stores, but works!

---

## 📞 Ready to Build?

Your backend is 100% production-ready. Test the web version now:
- https://noupick-prod.web.app

Then decide:
1. **Full mobile app** (8-12 hours) → Best experience
2. **WebView wrapper** (2-3 hours) → Quick to stores
3. **PWA** (1 hour) → Easiest, no stores

**All options use the same Cloud Run API that's already deployed!**

---

**End of App Store Deployment Guide**

*Backend: ✅ Ready*
*Web App: ✅ Deployed*
*Mobile App: ⏳ Your choice of approach*
