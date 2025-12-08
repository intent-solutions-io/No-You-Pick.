# Product Requirements Document: Pablo Mobile

**Project**: Pablo Mobile - AI-Powered Restaurant Discovery App
**Platform**: iOS (App Store) + Android (Google Play Store)
**Tech Stack**: React Native + Expo, Firebase + Google Cloud
**Owner**: Pablo (pabs-ai)
**Author**: Jeremy Longshore (implementing with Claude Code to help Pablo learn)
**Status**: Draft - Awaiting Pablo's Approval
**Date**: 2025-12-06

---

## 1. Introduction

**Pablo Mobile** is a cross-platform mobile application that eliminates the "Where should we eat?" debate by using Google Gemini AI to suggest 3 random restaurants based on location, cuisine preferences, search radius, and custom cravings. The app integrates Google Maps data to provide real-time information including ratings, hours, and directions.

### Background
The existing web version (React SPA at https://ai.studio/apps/drive/1U-6Awd8rVfwlawZKjPQZxN1HI54b3Rgg) has proven the concept with successful Gemini 2.5 Flash integration and positive user feedback. This PRD defines the mobile-first evolution to reach users on iOS and Android devices.

### Problem Statement
Users need quick restaurant decisions on-the-go, but the current web-only version requires browser access and lacks native mobile features like push notifications, offline favorites, and seamless geolocation. The exposed API key in the browser also presents a security risk for production use.

### Working Name Rationale
"Pablo Mobile" is a development codename. Recommended production names:
- **No, You Pick!** (maintains brand continuity with web version)
- **Foxie Picks** (emphasizes the mascot)
- **PickFox** (short, memorable, app-store friendly)

---

## 2. Goals

### Primary Goals
1. **Deliver native mobile experience** - The system must provide iOS and Android apps with native performance, animations, and UI patterns that feel at home on each platform.

2. **Secure API architecture** - The system must move Gemini API calls to a secure backend (Cloud Functions or Cloud Run) to prevent API key exposure and enable usage monitoring.

3. **Offline-first favorites** - The system must allow users to save favorite restaurants that persist across devices and remain accessible without internet connectivity.

4. **Production readiness** - The system must include crash reporting (Firebase Crashlytics), analytics (Firebase Analytics), and monitoring to ensure 95%+ uptime.

### Secondary Goals
1. **Cross-platform code reuse** - The system should maximize shared code between iOS and Android using React Native to reduce maintenance burden.

2. **App store compliance** - The system must meet Apple App Store and Google Play Store submission requirements including privacy policies, data handling disclosures, and content guidelines.

3. **Cost efficiency** - The system should stay within Firebase Spark Plan limits ($0/month) for MVP launch, scaling to Blaze Plan only when necessary.

---

## 3. User Stories

### Core User Flows

**As a hungry user,** I want to open the app and tap "Near Me" so that I can instantly get 3 restaurant suggestions without typing my location.

**As an indecisive group,** I want to share my 3 restaurant picks with friends via text/social so that we can vote on the final choice.

**As a frequent user,** I want my favorite restaurants saved across my phone and tablet so that I can quickly revisit places I loved.

**As a traveler,** I want to search restaurants in a different city (e.g., "Austin, TX") so that I can plan meals before arriving.

**As a dietary-restricted user,** I want to filter by cuisine type (Vegan, Vegetarian, Gluten-Free) so that I only see restaurants that match my needs.

**As a user in a food desert,** I want to expand my search radius to 15 miles so that I can find options beyond immediate walking distance.

**As a power user,** I want to "spin again" to get 3 new picks (excluding previous results) so that I can explore more options without repetition.

**As a privacy-conscious user,** I want to deny location permissions and manually enter my address so that the app still works without GPS access.

### Admin/Developer Flows

**As Pablo (project owner),** I want to view real-time error logs in Firebase Console so that I can debug production issues quickly.

**As an operator,** I want to monitor API quota usage in Google Cloud Console so that I can prevent unexpected billing from Gemini API overages.

**As a future contributor,** I want clear setup instructions in README.md so that I can run the app locally within 10 minutes.

---

## 4. Functional Requirements

### 4.1 Restaurant Search
- **REQ-SEARCH-001**: The system must accept location input via manual text entry OR one-tap geolocation.
- **REQ-SEARCH-002**: The system must support 17 cuisine types: Pizza, Mexican, Sushi, Burgers, Asian, Italian, Steak, Veggie, Vegan, Healthy, Coffee, Dessert, Chicken, Indian, Thai, BBQ, Any.
- **REQ-SEARCH-003**: The system must allow custom craving input (e.g., "Tacos with outdoor seating").
- **REQ-SEARCH-004**: The system must offer 3 radius options: Walk (1 mile), Drive (5 miles), Far (15 miles).
- **REQ-SEARCH-005**: The system must return exactly 3 random restaurants per search.
- **REQ-SEARCH-006**: The system must display: restaurant name, address, Google Maps rating, open/closed status, and 1-sentence recommendation.
- **REQ-SEARCH-007**: The system must complete searches within 10 seconds for 95% of requests.

### 4.2 Backend API
- **REQ-API-001**: The system must use Firebase Cloud Functions OR Cloud Run to proxy Gemini API calls (API key never exposed to client).
- **REQ-API-002**: The system must implement rate limiting (10 requests/minute per user) to prevent abuse.
- **REQ-API-003**: The system must log all API requests to Firestore for monitoring and debugging.
- **REQ-API-004**: The system must retry failed Gemini API calls once with 500ms delay before returning error to user.
- **REQ-API-005**: The system must return structured JSON responses with error codes (e.g., `QUOTA_EXCEEDED`, `INVALID_LOCATION`, `NO_RESULTS`).

### 4.3 Favorites System
- **REQ-FAV-001**: The system must allow users to save unlimited favorite restaurants.
- **REQ-FAV-002**: The system must persist favorites in Firestore (synced across devices) AND locally (offline access).
- **REQ-FAV-003**: The system must display saved favorites in a dedicated tab/screen.
- **REQ-FAV-004**: The system must allow users to remove favorites with swipe-to-delete gesture (iOS) or long-press menu (Android).
- **REQ-FAV-005**: The system must show "Already favorited" indicator on restaurant cards.

### 4.4 User Authentication
- **REQ-AUTH-001**: The system must support Firebase Anonymous Authentication for initial MVP (no signup required).
- **REQ-AUTH-002**: The system should support Google Sign-In and Apple Sign-In for future cross-device sync.
- **REQ-AUTH-003**: The system must migrate anonymous accounts to authenticated accounts on first sign-in.

### 4.5 Mobile-Specific Features
- **REQ-MOBILE-001**: The system must open restaurant addresses in native Google Maps app (iOS/Android).
- **REQ-MOBILE-002**: The system must request location permissions with clear explanation ("Find restaurants near you").
- **REQ-MOBILE-003**: The system must work in portrait and landscape orientations.
- **REQ-MOBILE-004**: The system must support iOS 14+ and Android 8+ (API level 26+).
- **REQ-MOBILE-005**: The system must include app icon, splash screen, and proper metadata for app stores.

### 4.6 Monitoring & Analytics
- **REQ-MON-001**: The system must use Firebase Crashlytics to capture and report crashes.
- **REQ-MON-002**: The system must log key events to Firebase Analytics: `search_restaurant`, `save_favorite`, `spin_again`, `open_maps`.
- **REQ-MON-003**: The system must track API quota usage and alert when approaching 80% of monthly limit.

---

## 5. Non-Goals

### Explicitly Out of Scope
1. **User accounts with passwords** - MVP uses anonymous auth. Email/password login is not planned for initial release.

2. **Social features** - No user profiles, reviews, ratings, or friend networks in v1.0.

3. **Restaurant reservations** - App only discovers restaurants, does not integrate with OpenTable, Resy, or booking systems.

4. **Food delivery integration** - No DoorDash, Uber Eats, or delivery ordering functionality.

5. **Non-Google backends** - No AWS, Supabase, or third-party services outside Google Cloud ecosystem.

6. **Web version updates** - Mobile and web are separate codebases. Web version remains as-is for now.

7. **Multi-language support** - English-only for MVP. Internationalization is future consideration.

8. **Accessibility compliance** - WCAG 2.1 AA compliance is aspirational, not required for MVP launch.

---

## 6. Design Considerations

### UI/UX Principles
- **Foxie branding** - The mascot character must appear prominently on home screen and during loading states.
- **One-tap primary action** - "Let's Eat!" button should be the largest, most prominent CTA.
- **Gestural navigation** - Support swipe gestures for favorites management and result browsing.
- **Native feel** - Follow iOS Human Interface Guidelines and Material Design 3 for platform-specific patterns.

### Visual Design
- **Color palette** - Use existing web version colors (primary: orange/fox theme, backgrounds: white/light gray).
- **Typography** - San Francisco (iOS) and Roboto (Android) system fonts for native feel.
- **Animations** - Slot machine spin animation during search, smooth transitions between screens.

### Accessibility
- **Minimum touch targets** - 44x44pt (iOS) / 48x48dp (Android) for all interactive elements.
- **High contrast** - Ensure 4.5:1 contrast ratio for text.
- **Screen reader support** - Label all UI elements with descriptive accessibility labels (best effort).

### Responsive Design
- **Screen sizes** - Support iPhone SE (4.7") to iPhone 15 Pro Max (6.7"), Android 5" to 7" phones.
- **Tablet support** - Not required for MVP, but React Native allows future iPad/tablet expansion.

---

## 7. Technical Considerations

### Frontend Stack
- **Framework**: React Native 0.73+ (Expo managed workflow)
- **Language**: TypeScript 5.8+
- **State Management**: React Context API + AsyncStorage (offline persistence)
- **Navigation**: React Navigation 6.x (stack + bottom tabs)
- **UI Components**: React Native Paper OR custom components matching web design

### Backend Stack
- **Compute**: Firebase Cloud Functions (Node.js 20) OR Cloud Run (containerized)
- **Database**: Firestore (favorites, user data, API logs)
- **Storage**: Cloud Storage for Firebase (future: user profile images)
- **Auth**: Firebase Authentication (Anonymous + Google/Apple)
- **AI**: Vertex AI Gemini 2.5 Flash with Google Maps grounding

### Third-Party Services
- **Maps**: Google Maps SDK for iOS/Android (map display, directions)
- **Analytics**: Firebase Analytics (event tracking, user metrics)
- **Crash Reporting**: Firebase Crashlytics (error monitoring)
- **Push Notifications**: Firebase Cloud Messaging (future feature)

### Security & Compliance
- **API key protection** - Gemini API key stored as Cloud Function environment variable, never in client code.
- **Data privacy** - Privacy Policy required for App Store submission (template: Firebase Privacy Policy Generator).
- **HTTPS only** - All API calls over TLS 1.2+.
- **Rate limiting** - 10 requests/minute per user IP + device ID combo.

### App Store Requirements
- **iOS**: Apple Developer Program ($99/year), TestFlight beta testing, App Store Connect submission.
- **Android**: Google Play Console ($25 one-time), Internal testing track, production release.
- **Content rating**: E for Everyone (restaurant discovery, no user-generated content).
- **Permissions requested**: Location (optional), Internet (required).

### Performance Targets
- **Cold start**: < 3 seconds on mid-range devices (iPhone 12, Samsung Galaxy A52).
- **Search latency**: < 5 seconds from tap to results (90th percentile).
- **Crash-free rate**: > 99.5% (Firebase Crashlytics metric).
- **App size**: < 50 MB download size (both iOS and Android).

---

## 8. Success Metrics

### Launch Criteria (MVP v1.0)
- [ ] Apps published to App Store and Google Play Store
- [ ] 95%+ crash-free rate in production for 7 consecutive days
- [ ] API key confirmed not exposed in client builds (security audit)
- [ ] Firebase Analytics tracking 5+ key events correctly
- [ ] Test flight with 10+ beta users, 80%+ positive feedback

### Post-Launch Metrics (30 days)
- **Engagement**: 100+ total installs (App Store + Google Play combined)
- **Retention**: 30% Day 7 retention (users who return after 1 week)
- **Performance**: < 5% error rate on restaurant searches
- **Cost**: Stay within $0/month Firebase Spark Plan limits

### Growth Metrics (90 days)
- **User base**: 500+ monthly active users
- **Favorites**: Average 3+ saved restaurants per active user
- **Search volume**: 1,000+ restaurant searches per month
- **Rating**: 4.0+ stars on App Store and Google Play

### Technical Health Metrics (Ongoing)
- **API quota**: < 80% of monthly Gemini API quota used
- **Latency**: p95 search latency < 5 seconds
- **Uptime**: 99%+ backend availability (Cloud Functions/Run)

---

## 9. Open Questions

### Decision Required Before Development
1. **Backend choice**: Should we use Firebase Cloud Functions (serverless, auto-scaling) OR Cloud Run (containerized, more control)? *Recommendation: Cloud Functions for simplicity, evaluate Cloud Run if cold start latency becomes issue.*

2. **Organization**: Should Pablo create his own Google Cloud project ($300 free credits) OR use Jeremy's Intent Solutions organization? *Blocker tracked in GitHub Issue #3.*

3. **App naming**: Finalize production app name before app store submissions (current options: "No, You Pick!", "Foxie Picks", "PickFox"). *Pablo's decision.*

4. **Timeline**: What is Pablo's target launch date? Realistic estimate: 4-6 weeks for MVP (Jeremy implements with Claude Code, Pablo reviews with Gemini Code Assist).

### Technical Clarifications Needed
1. **Google Maps API quota**: Does Pablo have an existing Google Maps API key, or do we need to provision one with billing enabled?

2. **Push notifications**: Are push notifications required for MVP (e.g., "New restaurants added near you"), or defer to v2.0?

3. **Sharing feature**: Should users be able to share restaurant picks via SMS/WhatsApp/social in MVP, or post-launch?

4. **Dark mode**: Should the app support iOS/Android dark mode, or light mode only for MVP?

### Business Questions
1. **Monetization**: Is this a portfolio/learning project (free forever), or future monetization planned (ads, premium features)?

2. **Support**: Who will handle user support emails from app store users (Pablo, Jeremy, shared)?

3. **Maintenance**: What is the long-term maintenance commitment? (e.g., update annually for new iOS/Android versions)

---

## Appendix: Reference Links

- **Web Version**: https://ai.studio/apps/drive/1U-6Awd8rVfwlawZKjPQZxN1HI54b3Rgg
- **GitHub Repo**: https://github.com/pabs-ai/No-You-Pick.
- **AppAudit Playbook**: `000-docs/002-AA-AUDT-appaudit-devops-playbook.md`
- **Filing System**: `000-docs/001-DR-STND-document-filing-system-standard-v3.md`
- **CLI Learning Guide**: `000-docs/003-DR-GUID-getting-started-with-cli-and-claude-code.md`

---

**Document Status**: Draft awaiting Pablo's review and approval.
**Next Step**: Review open questions, make architectural decision (Cloud Functions vs Run), create Firebase project.

---

*🤖 Generated with [Claude Code](https://claude.com/claude-code)*
*Co-Authored-By: Claude <noreply@anthropic.com>*
