# No-You-Pick!: Operator-Grade System Analysis & Operations Guide

*For: DevOps Engineer*
*Generated: 2025-12-10*
*System Version: f144f98 (Add PRD and ADR for Pablo Mobile architecture)*
*Repository: pabs-ai/No-You-Pick. (Private)*
*Previous Audit: 002-AA-AUDT-appaudit-devops-playbook.md (2025-12-05)*

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Operator & Customer Journey](#2-operator--customer-journey)
3. [System Architecture Overview](#3-system-architecture-overview)
4. [Directory Deep-Dive](#4-directory-deep-dive)
5. [Automation & Agent Surfaces](#5-automation--agent-surfaces)
6. [Operational Reference](#6-operational-reference)
7. [Security, Compliance & Access](#7-security-compliance--access)
8. [Cost & Performance](#8-cost--performance)
9. [Development Workflow](#9-development-workflow)
10. [Dependencies & Supply Chain](#10-dependencies--supply-chain)
11. [Integration with Existing Documentation](#11-integration-with-existing-documentation)
12. [Current State Assessment](#12-current-state-assessment)
13. [Quick Reference](#13-quick-reference)
14. [Recommendations Roadmap](#14-recommendations-roadmap)

---

## 1. Executive Summary

### Business Purpose

**No-You-Pick!** is a consumer-facing AI-powered restaurant decision assistant that eliminates the "where should we eat?" debate. Using Google Gemini 2.5 Flash with real-time Google Maps grounding, the application suggests 3 random restaurants based on user preferences (location, cuisine type, search radius, and custom cravings).

**Current Status**: **Active Development** - The web application is functional with community features (Supabase integration for pick tracking), sharing capabilities, and a planned mobile evolution (React Native "Pablo Mobile"). No production deployment infrastructure exists yet, but the codebase has matured significantly since initial scaffolding.

**Technology Foundation**: Modern React 19.2 + TypeScript stack using Vite for development. Key integrations:
- **AI Engine**: Google Gemini 2.5 Flash with Maps grounding tool
- **Database**: Supabase (PostgreSQL) for community pick counts
- **Frontend**: React 19.2 with custom component library
- **Sharing**: html2canvas for social ticket generation
- **State**: React hooks + localStorage for favorites persistence

**Strategic Context**: This project serves as:
1. A functional prototype demonstrating Gemini AI + Maps integration
2. A learning platform for Pablo (pabs-ai) to develop CLI/DevOps skills
3. Foundation for a planned mobile app (Pablo Mobile - React Native + Expo)

### What Changed Since Last Audit (2025-12-05)

| Area | Previous State | Current State |
|------|---------------|---------------|
| **Database** | None (localStorage only) | Supabase PostgreSQL for pick counts |
| **Sharing** | Not implemented | ShareTicket component + html2canvas |
| **Documentation** | Basic README + audit | PRD, ADR, CLI learning guide added |
| **Roadmap** | Web only | Mobile app (Pablo Mobile) planned |
| **Commits** | 1 (initial) | 15 commits with bug fixes |
| **API Key Handling** | Exposed | Still exposed (critical gap remains) |

### Operational Status Matrix

| Environment | Status | Uptime Target | Current Uptime | Release Cadence | Active Users |
|-------------|--------|---------------|----------------|-----------------|--------------|
| Production  | **Does Not Exist** | N/A | N/A | N/A | 0 |
| Staging     | **Does Not Exist** | N/A | N/A | N/A | 0 |
| Development | **Local Only** | N/A | Developer dependent | On-demand | 1-2 developers |

**Critical Gap**: No deployment infrastructure, hosting, or operational environments configured.

### Technology Stack Summary

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Language** | TypeScript | 5.8.2 | Type-safe React development |
| **Framework** | React | 19.2.0 | UI framework |
| **Build Tool** | Vite | 6.2.0 | Dev server & production bundler |
| **AI/ML** | Google Gemini AI | @google/genai 1.30.0 | Restaurant recommendations via Gemini 2.5 Flash |
| **Maps** | Google Maps API | (via Gemini grounding) | Location search & restaurant data |
| **Database** | Supabase | @supabase/supabase-js 2 | Community pick counts |
| **Image Export** | html2canvas | latest | Social sharing tickets |
| **Hosting** | **Not Configured** | - | No deployment target |
| **CI/CD** | **Not Configured** | - | No automation |
| **Monitoring** | **Not Configured** | - | No observability |

---

## 2. Operator & Customer Journey

### Primary Personas

- **End Users (Consumer)**: People struggling to decide where to eat with friends/family
  - Pain point: Decision paralysis, endless scrolling through restaurant apps
  - Value proposition: Fast, opinionated recommendations (3 choices max) to end arguments
  - Expected interaction: < 30 seconds from load to restaurant decision

- **Community Contributors**: Users who "pick" restaurants and contribute to community stats
  - Interaction: Click "I Pick This One!" → Increments pick count in Supabase
  - Value: Social proof for restaurant quality

- **Developers (Current)**: Pablo (pabs-ai) and Jeremy (mentoring)
  - Learning CLI/DevOps workflows via this project
  - Using Claude Code for AI-assisted development

- **Future Mobile Users**: iOS/Android users (Pablo Mobile roadmap)
  - Will need: Native app experience, offline favorites, push notifications

### End-to-End Journey Map

```
User Flow:
1. LANDING: Hero section with "Foxie" mascot, search form
2. INPUT: Select cuisine (17 options) OR custom craving text
3. LOCATION: Enter address/zip OR click "Near Me" for geolocation
4. RADIUS: Choose Walk (1mi), Drive (5mi), Far (15mi), or Trip (30mi)
5. SEARCH: Click "Let's Eat!" → Slot machine animation
6. RESULTS: 3 restaurant cards with ratings, status, addresses
7. ACTION: "I Pick This One!" → Opens Maps + increments community count
8. SHARE: Generate shareable ticket image
9. SAVE: Heart icon to save favorites (localStorage)
10. REPEAT: "Spin Again" for new picks (excludes previous)
```

### SLA Commitments (Proposed)

| Metric | Target | Current | Owner |
|--------|--------|---------|-------|
| **Uptime** | 99.9% (production goal) | N/A (no prod) | Unassigned |
| **Search Latency (P95)** | < 3s (search to results) | Unknown | Unassigned |
| **Gemini API Latency** | < 2s | Unknown | Google |
| **Supabase Query Latency** | < 100ms | Unknown | Supabase |
| **Resolution Time (P1)** | < 4 hours | N/A | Unassigned |

---

## 3. System Architecture Overview

### Technology Stack (Detailed)

| Layer | Technology | Version | Source of Truth | Purpose | Owner |
|-------|------------|---------|-----------------|---------|-------|
| **Frontend/UI** | React + TypeScript | 19.2.0 + 5.8.2 | App.tsx (659 lines) | SPA with state management | Developer |
| **Component Library** | Custom components | N/A | components/*.tsx | Button, Card, SlotMachine, Mascot, ShareTicket | Developer |
| **Build System** | Vite | 6.2.0 | vite.config.ts | Dev server, HMR, production builds | Developer |
| **AI/ML** | Google Gemini AI | @google/genai 1.30.0 | services/geminiService.ts | Restaurant recommendations | Google |
| **Maps Integration** | Google Maps (grounding) | N/A | Gemini toolConfig | Location search, POI data | Google |
| **Database** | Supabase (PostgreSQL) | @supabase/supabase-js 2 | services/supabaseClient.ts | Community pick counts | Supabase |
| **Image Export** | html2canvas | latest | App.tsx:145-188 | Share ticket generation | Developer |
| **State Management** | React useState + localStorage | N/A | App.tsx | Favorites, preferences, search state | Developer |
| **Styling** | Tailwind CSS (CDN) + inline | N/A | index.html, components/ | Utility-first CSS | Developer |
| **Geolocation** | Browser Geolocation API | N/A | App.tsx:243-265 | "Near Me" functionality | Browser |

### Cloud & Platform Services

| Service | Purpose | Environment(s) | Key Config | Cost/Limits | Owner | Vendor Risk |
|---------|---------|----------------|------------|-------------|-------|-------------|
| **Google Gemini API** | AI recommendations | All (via user key) | VITE_GEMINI_API_KEY | Pay-per-use | Google | **HIGH** - single vendor lock-in |
| **Google Maps** | Location grounding | All (via Gemini) | Gemini toolConfig | Included in Gemini | Google | **HIGH** - single vendor lock-in |
| **Supabase** | Community pick DB | All | Hardcoded URL/Key | Free tier (500MB) | Supabase | **MEDIUM** - could self-host Postgres |
| **AI Studio** | API key management | Optional | window.aistudio | Free tier | Google | **LOW** - optional feature |

### Architecture Diagram

```
+------------------------------------------------------------------+
|                         USER BROWSER                              |
|  +--------------------------------------------------------------+|
|  |  React 19.2 SPA (Vite)                                       ||
|  |  +------------------+  +------------------+  +--------------+ ||
|  |  |    App.tsx       |  |   components/    |  |  services/   | ||
|  |  |   (659 lines)    |  | - Button.tsx     |  | - gemini     | ||
|  |  |                  |  | - Card.tsx       |  |   Service    | ||
|  |  | State:           |  | - SlotMachine    |  | - supabase   | ||
|  |  | - useState x15   |  | - Mascot.tsx     |  |   Client     | ||
|  |  | - localStorage   |  | - ShareTicket    |  | - restaurant | ||
|  |  | - useRef x4      |  | - Loading        |  |   Service    | ||
|  |  +------------------+  +------------------+  +--------------+ ||
|  |         |                                           |         ||
|  |         +-----------------------+-------------------+         ||
|  |                                 |                             ||
|  |                                 v                             ||
|  |                  +---------------------------+                ||
|  |                  | Browser APIs              |                ||
|  |                  | - localStorage (favorites)|                ||
|  |                  | - Geolocation (Near Me)   |                ||
|  |                  | - navigator.share (mobile)|                ||
|  |                  +---------------------------+                ||
|  +-------------------------------+-------------------------------+|
+----------------------------------+--------------------------------+
                                   | HTTPS (API calls)
               +-------------------+-------------------+
               |                                       |
               v                                       v
+-----------------------------+        +-----------------------------+
|   GOOGLE CLOUD SERVICES     |        |      SUPABASE CLOUD         |
|  +------------------------+ |        |  +------------------------+ |
|  | Gemini 2.5 Flash API   | |        |  | PostgreSQL Database    | |
|  | - Restaurant search    | |        |  | Table: restaurants     | |
|  | - NLP processing       | |        |  | - name (text, PK)      | |
|  | - Maps grounding tool  | |        |  | - pick_count (int)     | |
|  +------------------------+ |        |  +------------------------+ |
|             |               |        |             |               |
|             v               |        |             v               |
|  +------------------------+ |        |  +------------------------+ |
|  | Google Maps Data       | |        |  | Supabase Auth          | |
|  | - POI/restaurant info  | |        |  | - Anonymous (anon key) | |
|  | - Ratings, hours       | |        |  | - RLS disabled         | |
|  | - Addresses, coords    | |        |  +------------------------+ |
|  +------------------------+ |        +-----------------------------+
+-----------------------------+

DATA FLOWS:
1. User searches → App.tsx → geminiService.ts → Gemini API
2. Gemini calls Maps grounding → Returns restaurant data
3. User picks restaurant → restaurantService.ts → Supabase
4. Supabase increments pick_count → Returns new count
5. User saves favorite → localStorage (browser only)
6. User shares → html2canvas → PNG image

FAILURE DOMAINS:
- Single Point of Failure: Gemini API (no fallback)
- Supabase down: Falls back to pseudo-random counts
- Client-side only: No server for rate limiting, caching
- No authentication: Anonymous usage only
```

---

## 4. Directory Deep-Dive

### Project Structure Analysis

**Actual Repository Layout:**

```
/home/jeremy/000-projects/noupick/
├── 000-docs/                               # Documentation
│   ├── 001-DR-STND-document-filing-system-standard-v3.md
│   ├── 002-AA-AUDT-appaudit-devops-playbook.md (previous audit)
│   ├── 003-DR-GUID-getting-started-with-cli-and-claude-code.md
│   ├── 004-PP-PROD-pablo-mobile-firebase-app.md (PRD)
│   ├── 005-AT-ADEC-pablo-mobile-firebase-architecture.md (ADR)
│   └── 006-AA-AUDT-appaudit-devops-playbook.md (THIS FILE)
├── .git/                                   # Git repository
├── .gitignore                              # Git ignore rules
├── App.tsx                                 # Main application (659 lines)
├── README.md                               # Setup instructions
├── components/                             # React components
│   ├── Button.tsx                          # Reusable button variants
│   ├── Card.tsx                            # Restaurant card (215 lines)
│   ├── LoadingScreen.tsx                   # Loading UI (unused)
│   ├── Mascot.tsx                          # "Foxie" mascot SVG
│   ├── ShareTicket.tsx                     # Shareable ticket (69 lines)
│   └── SlotMachine.tsx                     # Spinning animation
├── index.html                              # HTML entry point
├── index.tsx                               # React mount point
├── metadata.json                           # AI Studio metadata
├── package.json                            # NPM dependencies
├── services/                               # Business logic
│   ├── geminiService.ts                    # Gemini AI integration (219 lines)
│   ├── restaurantService.ts                # Supabase pick tracking (74 lines)
│   └── supabaseClient.ts                   # Supabase client config (9 lines)
├── tsconfig.json                           # TypeScript config
├── types.ts                                # TypeScript interfaces
└── vite.config.ts                          # Vite bundler config

MISSING CRITICAL DIRECTORIES:
├── .github/workflows/               # CI/CD pipelines
├── terraform/ or infrastructure/    # IaC for deployment
├── tests/ or __tests__/             # Unit/integration tests
├── .env.example                     # Environment variable template
├── docker/                          # Container definitions
├── scripts/                         # Deployment/maintenance scripts
└── monitoring/                      # Dashboards, alert configs
```

### Detailed File Analysis

#### App.tsx (659 lines) - CORE APPLICATION

**Purpose**: Main React component containing all application logic

**State Management** (15 useState hooks):
```typescript
// Core UI State
const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
const [isSpinning, setIsSpinning] = useState(false);
const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
const [savedRestaurants, setSavedRestaurants] = useState<Restaurant[]>([]);

// Search State
const [locationInput, setLocationInput] = useState('');
const [selectedCuisine, setSelectedCuisine] = useState('Any');
const [customCuisine, setCustomCuisine] = useState('');
const [radius, setRadius] = useState('15');

// Sharing State
const [sharingRestaurant, setSharingRestaurant] = useState<...>(null);
const [isGeneratingShare, setIsGeneratingShare] = useState(false);

// UI State
const [isHeaderHidden, setIsHeaderHidden] = useState(false);
const [hasScrolled, setHasScrolled] = useState(false);
```

**Key Functions**:
- `performSearch()` (lines 190-223): Core search logic, calls Gemini API
- `handleSearch()` (lines 225-236): User-initiated search handler
- `handleGeolocation()` (lines 243-265): Browser geolocation for "Near Me"
- `handleReroll()` (lines 267-275): Re-roll with exclusion list
- `confirmShare()` (lines 145-188): Generate and share ticket image
- `toggleFavorite()` (lines 127-139): Save/remove favorites

**Code Quality**:
- **Needs Refactoring**: 659-line monolith should be split into:
  - `SearchForm` component
  - `ResultsList` component
  - `FavoritesList` component
  - Custom hooks: `useSearch`, `useFavorites`, `useGeolocation`

#### services/geminiService.ts (219 lines)

**Purpose**: Google Gemini AI integration for restaurant recommendations

**Key Functions**:
1. `generateMascotImage()` (lines 8-60): **UNUSED** - Gemini 3 Pro image generation
2. `getRandomRestaurants()` (lines 70-178): Main recommendation engine
3. `parseResponse()` (lines 180-218): Response parsing with separators

**Prompt Engineering** (lines 107-139):
```typescript
const prompt = `
  Session ID: ${randomSeed}
  Act as a restaurant picker engine.
  Search within ${radius} miles of "${locationQuery}".

  CRITICAL INSTRUCTION: High randomness required.
  - Do NOT just pick the top rated result every time.
  - Do NOT just pick the closest result every time.
  - You MUST pick 3 different places.

  ${cuisineInstruction}
  ${excludeInstruction}

  Output format per restaurant (Use "---SEPARATOR---" between items):
  Name: [Exact Name]
  Cuisine: [Short Type]
  Address: [Short Address]
  Rating: [Number]
  Status: [Open/Closed]
  Reason: [Max 10 words punchy reason]
`;
```

**Configuration**:
- Model: `gemini-2.5-flash` (line 83)
- Temperature: `1.2` (high randomness, line 145)
- Tools: `{ googleMaps: {} }` (line 146)
- Retry: 1 retry with 500ms delay (lines 150-156)

#### services/restaurantService.ts (74 lines) - NEW

**Purpose**: Supabase integration for community pick tracking

**Functions**:
1. `getRestaurantPickCount(name)`: Fetch pick count from DB
2. `incrementRestaurantPick(name)`: Upsert and increment count
3. `generatePseudoCount(name)`: Fallback hash-based count if DB fails

**Database Schema** (inferred):
```sql
-- Supabase table: restaurants
CREATE TABLE restaurants (
  name TEXT PRIMARY KEY,
  pick_count INTEGER DEFAULT 0
);
```

**Fallback Logic**: If Supabase fails, generates pseudo-random count (3000-12000) based on name hash.

#### services/supabaseClient.ts (9 lines) - SECURITY CRITICAL

**Purpose**: Supabase client initialization

**CRITICAL SECURITY ISSUE**:
```typescript
// HARDCODED CREDENTIALS IN SOURCE CODE
const SUPABASE_URL = 'https://cgypvbhohtbepvzhxbsn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

**Risk**: Anon key exposed in client-side code. While Supabase anon keys are designed for client-side use with RLS, this still exposes:
- Supabase project URL (fingerprinting)
- Ability to query any public data
- Potential for abuse if RLS not properly configured

**Recommendation**: Move to environment variables, implement Row Level Security (RLS).

#### components/Card.tsx (215 lines)

**Purpose**: Restaurant card display with community features

**New Features** (vs previous audit):
- Community pick count from Supabase (lines 33-54)
- "I Pick This One!" button with optimistic UI (lines 56-82)
- Share button integration (lines 98-105)
- LocalStorage pick tracking to prevent double-picks

#### components/ShareTicket.tsx (69 lines) - NEW

**Purpose**: Generates shareable ticket image for social media

**Design**: Ticket-style card with:
- Mascot header
- Restaurant name, cuisine, rating
- Community pick count
- "THE ARGUMENT ENDER" branding

---

## 5. Automation & Agent Surfaces

### Current State: NO AUTOMATION

- **n8n Workflows**: None
- **MCP Integrations**: None (Waygate proxy policy exists per CLAUDE.md but not applied)
- **AI Agents**: Only Gemini API for search
- **Slash Commands**: None
- **CI/CD**: None
- **Scheduled Jobs**: None

### Automation Opportunities

| Automation | Purpose | Trigger | Priority |
|------------|---------|---------|----------|
| **GitHub Actions CI** | Build, lint, test on PR | Pull request | **HIGH** |
| **Supabase Edge Functions** | Move Gemini calls to backend | HTTP request | **HIGH** |
| **Pick Count Analytics** | Daily aggregation of popular picks | Cron (daily) | **MEDIUM** |
| **Dependabot** | Automated security updates | Weekly | **MEDIUM** |
| **Firebase Deploy** | Auto-deploy on merge to main | Git push | **HIGH** |

---

## 6. Operational Reference

### Deployment Workflows

#### Local Development (CURRENT PROCESS)

**Prerequisites**:
- Node.js 20+ (`node --version`)
- npm 10+ (`npm --version`)
- Git
- Google Gemini API key (from https://aistudio.google.com/app/apikey)

**Environment Setup**:
```bash
# 1. Clone repository
git clone https://github.com/pabs-ai/No-You-Pick..git noupick
cd noupick

# 2. Install dependencies
npm install

# 3. Create .env.local (REQUIRED)
echo "VITE_GEMINI_API_KEY=your_key_here" > .env.local

# 4. Start dev server
npm run dev
# Opens: http://localhost:3000
```

**Verification Checklist**:
- [ ] Dev server starts without errors
- [ ] App loads at localhost:3000
- [ ] Search form renders with "Foxie" mascot
- [ ] Can enter location and submit search
- [ ] Gemini API returns 3 restaurants
- [ ] Can save favorites to localStorage
- [ ] "Near Me" button requests geolocation permission
- [ ] "I Pick This One!" shows pick count (from Supabase or fallback)

#### Production Deployment (NOT CONFIGURED)

**Recommended Platform**: Firebase Hosting + Cloud Functions

**Proposed Workflow**:
```bash
# 1. Build production bundle
npm run build

# 2. Deploy to Firebase Hosting
firebase deploy --only hosting

# 3. Verify
curl -I https://noupick.app
```

---

## 7. Security, Compliance & Access

### Critical Security Issues

| Issue | Severity | Impact | Remediation |
|-------|----------|--------|-------------|
| **Gemini API Key in Client** | **P0 CRITICAL** | Anyone can extract key, unlimited abuse | Move to backend (Cloud Functions) |
| **Supabase Credentials Hardcoded** | **P1 HIGH** | Exposed project URL and anon key | Move to environment variables |
| **No Rate Limiting** | **P1 HIGH** | Single user can spam API | Implement per-IP throttling |
| **No MFA on Cloud Accounts** | **P2 MEDIUM** | Account takeover risk | Enable 2FA |
| **No HTTPS in Local Dev** | **P3 LOW** | Geolocation may be blocked | Use HTTPS for testing |

### Secrets Inventory

| Secret | Location | Exposure Risk | Recommendation |
|--------|----------|---------------|----------------|
| `VITE_GEMINI_API_KEY` | .env.local → client bundle | **CRITICAL** | Move to backend |
| `SUPABASE_URL` | supabaseClient.ts (hardcoded) | **HIGH** | Move to env vars |
| `SUPABASE_ANON_KEY` | supabaseClient.ts (hardcoded) | **HIGH** | Move to env vars, enable RLS |

### Compliance Status

| Requirement | Status | Notes |
|-------------|--------|-------|
| Privacy Policy | **Missing** | Required for app store submission |
| Terms of Service | **Missing** | Required for app store submission |
| GDPR Compliance | **Not Applicable** | No user accounts, minimal data |
| WCAG 2.1 (Accessibility) | **Not Audited** | Recommend audit |
| App Store Guidelines | **Not Reviewed** | Required for Pablo Mobile |

---

## 8. Cost & Performance

### Current Costs

**Monthly Cloud Spend**: **~$0** (no production deployment)

**Active Services**:
- **Supabase**: Free tier (500MB database, 1GB bandwidth)
- **Gemini API**: Pay-per-use (developer testing only)

### Projected Costs (1000 DAU)

| Service | Usage Estimate | Cost |
|---------|----------------|------|
| **Firebase Hosting** | 10GB storage, 360MB/day bandwidth | $0 (free tier) |
| **Gemini API** | 3000 calls/day × 30 days | ~$45/month |
| **Supabase** | 100K rows, 10GB bandwidth | $0 (free tier) |
| **Cloud Functions** | 2M invocations/month | $0 (free tier) |
| **TOTAL** | | **~$45/month** |

### Performance Baseline (Not Measured)

**Target Metrics**:
| Metric | Target | Current |
|--------|--------|---------|
| First Contentful Paint | < 1.5s | Unknown |
| Time to Interactive | < 3.5s | Unknown |
| Search Latency (P95) | < 3s | Unknown |
| Supabase Query (P95) | < 100ms | Unknown |

---

## 9. Development Workflow

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Create production build in `dist/` |
| `npm run preview` | Preview production build locally |
| `npx tsc --noEmit` | Type-check without building |

### Git Workflow

**Branches**:
- `main`: Production-ready code
- `docs/*`: Documentation updates
- `feat/*`: New features
- `fix/*`: Bug fixes

**Recent Commits** (15 total):
```
f144f98 Add PRD and ADR for Pablo Mobile architecture
e7a5508 Merge pull request #1 from pabs-ai/docs/initial-devops-setup
738d31f Update CLI learning guide
f64419e fix: Correct VITE_GEMINI_API_KEY in README examples
ba9766a feat: Add sharing and Supabase integration
01467f5 feat: Add 30mi radius option and improve location persistence
```

### Missing Development Infrastructure

- [ ] ESLint configuration
- [ ] Prettier configuration
- [ ] Pre-commit hooks (husky)
- [ ] Unit tests (Jest/Vitest)
- [ ] E2E tests (Playwright/Cypress)
- [ ] PR template
- [ ] Branch protection rules

---

## 10. Dependencies & Supply Chain

### Production Dependencies

| Package | Version | Purpose | Risk |
|---------|---------|---------|------|
| **react** | 19.2.0 | UI framework | Low |
| **react-dom** | 19.2.0 | React renderer | Low |
| **@google/genai** | 1.30.0 | Gemini AI SDK | Medium (vendor lock-in) |
| **@supabase/supabase-js** | 2 | Database client | Low |
| **html2canvas** | latest | Image export | Low |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| **vite** | 6.2.0 | Build tool |
| **@vitejs/plugin-react** | 5.0.0 | Vite React plugin |
| **typescript** | 5.8.2 | Type checking |
| **@types/node** | 22.14.0 | Node.js types |

### Supply Chain Risk

- **No package-lock.json**: Missing lockfile prevents reproducible builds
- **Pinned versions use `^`**: Could pull breaking updates
- **html2canvas at `latest`**: Unpredictable version

**Recommendation**: Run `npm i --package-lock-only` and commit lockfile.

---

## 11. Integration with Existing Documentation

### Documentation Inventory

| Document | Purpose | Last Updated |
|----------|---------|--------------|
| **001-DR-STND-document-filing-system-standard-v3.md** | Filing system rules | 2025-12-05 |
| **002-AA-AUDT-appaudit-devops-playbook.md** | Previous audit | 2025-12-05 |
| **003-DR-GUID-getting-started-with-cli-and-claude-code.md** | CLI learning guide for Pablo | 2025-12-05 |
| **004-PP-PROD-pablo-mobile-firebase-app.md** | Mobile app PRD | 2025-12-06 |
| **005-AT-ADEC-pablo-mobile-firebase-architecture.md** | Mobile app ADR | 2025-12-06 |
| **006-AA-AUDT-appaudit-devops-playbook.md** | This document | 2025-12-10 |
| **README.md** | Setup instructions | 2025-12-06 |

### Documentation Gaps

- [ ] **CONTRIBUTING.md**: Contributor guidelines
- [ ] **CHANGELOG.md**: Release history
- [ ] **Runbooks**: Incident response procedures
- [ ] **API Documentation**: Gemini prompt format, Supabase schema
- [ ] **.env.example**: Environment variable template

---

## 12. Current State Assessment

### What's Working Well

1. **Clean Modern Codebase**: React 19.2 + TypeScript with good type safety
2. **Excellent UX**: Slot machine animation, responsive design, "Foxie" mascot
3. **Solid AI Integration**: Gemini 2.5 Flash with Maps grounding, retry logic
4. **Community Features**: Supabase pick tracking, shareable tickets
5. **Learning Platform**: CLI guide, PRD/ADR for mobile evolution
6. **Recent Dependencies**: All packages from 2024-2025

### Areas Needing Attention

| Issue | Severity | Effort | Impact |
|-------|----------|--------|--------|
| **API Key Exposed in Browser** | **P0 CRITICAL** | 2-3 days | Security breach, cost overrun |
| **Supabase Credentials Hardcoded** | **P1 HIGH** | 1 day | Security exposure |
| **No Production Environment** | **P1 HIGH** | 2-3 days | Blocks go-to-market |
| **No CI/CD Pipeline** | **P2 MEDIUM** | 1 day | Manual deployment risk |
| **No Monitoring** | **P2 MEDIUM** | 1-2 days | Silent failures |
| **Zero Test Coverage** | **P2 MEDIUM** | 3-5 days | Regression risk |
| **659-Line Monolith (App.tsx)** | **P3 LOW** | 1-2 days | Maintainability |
| **Missing package-lock.json** | **P3 LOW** | 5 minutes | Reproducibility |

### System Health Score: **50/100**

| Category | Score | Notes |
|----------|-------|-------|
| **Code Quality** | 70/100 | Clean but monolithic |
| **Security** | 20/100 | API keys exposed |
| **Infrastructure** | 10/100 | No prod environment |
| **Testing** | 0/100 | Zero test coverage |
| **Documentation** | 60/100 | PRD, ADR, guides added |
| **Observability** | 0/100 | No monitoring |
| **Reliability** | 60/100 | Retry logic, fallbacks |
| **Features** | 80/100 | Sharing, community picks |

---

## 13. Quick Reference

### Operational Command Map

| Capability | Command | Notes |
|------------|---------|-------|
| Clone repo | `gh repo clone pabs-ai/No-You-Pick.` | Private repo |
| Install deps | `npm install` | Downloads ~10 packages |
| Create API key | Visit aistudio.google.com/app/apikey | Free tier available |
| Local env setup | `echo "VITE_GEMINI_API_KEY=..." > .env.local` | Required |
| Start dev server | `npm run dev` | Port 3000 |
| Build production | `npm run build` | Output to dist/ |
| Type check | `npx tsc --noEmit` | Validate TypeScript |

### Key File Locations

| Purpose | File |
|---------|------|
| Main application | `App.tsx` (659 lines) |
| Gemini integration | `services/geminiService.ts` |
| Supabase integration | `services/restaurantService.ts` |
| TypeScript types | `types.ts` |
| Vite config | `vite.config.ts` |

### First-Week Checklist for DevOps Engineer

- [ ] Clone repository and run locally
- [ ] Review this audit and previous audit (002)
- [ ] Identify security vulnerabilities (API key exposure)
- [ ] Create Firebase project for staging
- [ ] Set up environment variables properly
- [ ] Generate package-lock.json
- [ ] Enable MFA on Google Cloud account
- [ ] Document deployment process

---

## 14. Recommendations Roadmap

### Week 1 – Critical Security & Foundation

**Goals**:
1. Secure API keys (move to backend or Secret Manager)
2. Generate package-lock.json for reproducibility
3. Move Supabase credentials to environment variables
4. Enable MFA on all cloud accounts

**Tasks**:
1. **Day 1**: `npm i --package-lock-only && git add package-lock.json`
2. **Day 2-3**: Create Cloud Function to proxy Gemini API calls
3. **Day 4**: Move Supabase credentials to .env.local
4. **Day 5**: Enable 2FA on GCP/Firebase/Supabase

### Month 1 – Production Readiness

**Goals**:
1. Deploy to Firebase Hosting (staging + production)
2. Implement CI/CD pipeline (GitHub Actions)
3. Add basic monitoring (Cloud Monitoring)
4. Add ESLint + Prettier

**Tasks**:
- Set up Firebase projects
- Create GitHub Actions workflow
- Configure Firebase Hosting
- Add linting and formatting

### Quarter 1 – Scale & Mobile

**Goals**:
1. Launch Pablo Mobile (React Native)
2. Implement caching for popular searches
3. Add comprehensive test coverage (60%+)
4. Set up on-call rotation

**Tasks**:
- Follow PRD (004) and ADR (005) for mobile development
- Implement Redis/Memorystore caching
- Write unit tests for geminiService, restaurantService
- Configure PagerDuty or similar

---

## Appendices

### Appendix A. Supabase Schema

```sql
-- Inferred from restaurantService.ts
CREATE TABLE restaurants (
  name TEXT PRIMARY KEY,
  pick_count INTEGER DEFAULT 0
);

-- Index for faster queries
CREATE INDEX idx_restaurants_name ON restaurants(name);
```

### Appendix B. Environment Variables

```bash
# .env.local (required)
VITE_GEMINI_API_KEY=AIza...your_key_here

# Recommended additions (move from hardcoded)
VITE_SUPABASE_URL=https://cgypvbhohtbepvzhxbsn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

### Appendix C. Troubleshooting

**Issue**: "VITE_GEMINI_API_KEY is undefined"
**Solution**: Create `.env.local` with `VITE_GEMINI_API_KEY=your_key`

**Issue**: Search returns no results
**Solution**: Try broader cuisine ("Any"), larger radius (15mi)

**Issue**: Pick count shows fallback numbers
**Solution**: Check Supabase connectivity, verify anon key

### Appendix D. Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-05 | Initial project scaffolding | pabs-ai |
| 2025-12-05 | Add DevOps documentation | pabs-ai |
| 2025-12-06 | Add Supabase integration, sharing | pabs-ai |
| 2025-12-06 | Add PRD and ADR for Pablo Mobile | pabs-ai |
| 2025-12-10 | Updated AppAudit playbook (this file) | jeremy |

---

## Summary

### Document Created
**006-AA-AUDT-appaudit-devops-playbook.md**

### Critical Findings (Top 5)

1. **P0 CRITICAL: Gemini API Key Exposed** - Move to backend within 1 week
2. **P1 HIGH: Supabase Credentials Hardcoded** - Move to env vars
3. **P1 HIGH: No Production Environment** - Deploy to Firebase Hosting
4. **P2 MEDIUM: Zero Test Coverage** - Add basic tests
5. **P2 MEDIUM: Missing package-lock.json** - Generate immediately

### Immediate Actions

| Action | Owner | Timeline |
|--------|-------|----------|
| Generate package-lock.json | DevOps | Today |
| Move secrets to env vars | DevOps | Day 1-2 |
| Create Cloud Function backend | DevOps | Week 1 |
| Deploy staging environment | DevOps | Week 1 |
| Enable MFA on cloud accounts | DevOps | Today |

### System Health Score: **50/100**

**Assessment**: Functional prototype with solid UX and AI integration, but lacks production infrastructure and has critical security vulnerabilities. Ready for demo but NOT for public launch.

### Next Steps

1. Review this playbook
2. Secure API credentials (highest priority)
3. Deploy staging environment
4. Implement CI/CD
5. Prepare for Pablo Mobile development

---

**End of AppAudit DevOps Playbook**
**Document**: 006-AA-AUDT-appaudit-devops-playbook.md
**Generated**: 2025-12-10
**Word Count**: ~5,500 words
