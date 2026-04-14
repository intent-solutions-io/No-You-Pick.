# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Fixed
- Update production fallback URL from Cloud Functions to Cloud Run in geminiService.ts
- Update firebase.json API rewrite from Firebase Function to Cloud Run
- Fix README radius range to match code (1mi-30mi, not 5mi-25mi)
- Update GitHub org links from pabs-ai to intent-solutions-io
- Fix app.json githubUrl to point to correct repository
- Clarify CLAUDE.md Supabase role and services/ description
- Standardize Gemini model version references across docs

## [1.0.0] - 2025-12-10

### Added
- React Native mobile app for iOS/Android via Expo SDK 54 (`pablo-mobile/`)
- Cloud Run backend with Vertex AI Gemini 2.0 Flash integration
- Firebase Hosting deployment for web app
- Rate limiting (10 req/min per IP) and CORS protection
- Walk (1mi), Drive (5mi), Far (15mi), Trip (30mi) radius options
- Supabase integration for analytics
- Sharing functionality
- Foxie mascot app icons

### Changed
- Migrated from direct Gemini API to Vertex AI via Cloud Run (security: no client-side API keys)
- Migrated from Cloud Functions to Cloud Run for backend hosting

### Security
- Removed Gemini SDK from frontend — all AI calls proxied through Cloud Run
- Application Default Credentials (ADC) authentication, no exposed API keys

## [0.1.0] - 2025-12-05

### Added
- Initial project with Vite and React
- Gemini-powered restaurant recommendations (3 random picks)
- Location input with 16 cuisine types
- Google Maps link integration
- DevOps documentation and CLI learning guide for Pablo
