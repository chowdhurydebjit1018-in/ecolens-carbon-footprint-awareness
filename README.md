# EcoLens - Secure Full-Stack Application

EcoLens is an AI-powered sustainability web application that helps users understand, track, and reduce their carbon footprint.

## Architecture Highlights

This project has been upgraded to a **Secure, Modular, Submission-Ready Full-Stack Application** featuring:

1. **Backend Modularity**: Express API structured into clear `/routes`, `/controllers`, `/services`, and `/middleware`.
2. **Robust Security & Data Integrity**:
   - Centralized authentication via `firebase-admin`.
   - Activities are securely recorded and emission calculations are strictly handled server-side to prevent client spoofing.
   - Helmet headers, rate limiting, and strict CORS policies.
3. **AI Safety & Validation**:
   - Gemini AI outputs are explicitly parsed and validated using Zod.
   - Deterministic fallbacks are provided if the AI output fails schema validation.
4. **Resilient Third-Party Integrations**:
   - Google Maps API integration with an offline Haversine fallback to ensure route efficiency calculation never fully fails. 
   - Provides awareness-level carbon estimates for route planning and tracking.
5. **Testing & Quality Assurance**:
   - Unit tests setup via Vitest and Supertest.
   - Centralized error handlers and unified `apiResponse.ts` structures.

## Run Locally

**Prerequisites:**  Node.js (v18+)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables. Create a `.env` file from the provided environment references:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
   - `GEMINI_API_KEY`
   - `VITE_FIREBASE_API_KEY`, etc.
   - `GOOGLE_MAPS_API_KEY` (Optional)

3. Run the application:
   ```bash
   npm run dev
   ```

4. Run the automated tests:
   ```bash
   npm test
   ```

## Production Build

To build for production, run:
```bash
npm run build
npm start
```
