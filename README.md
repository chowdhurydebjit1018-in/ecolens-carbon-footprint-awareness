# EcoLens - Carbon Footprint Awareness App

A separated full-stack application with a React frontend and an Express backend.

## Project Structure
This repository contains two main applications:

- **frontend/**: React + Vite + TypeScript application. Handles all UI, authentication, and Google Maps rendering.
- **backend/**: Node.js + Express + TypeScript application. Handles secure API logic, Gemini integrations, and Firebase Admin.

## Setup Instructions

### 1. Root Level
Install dependencies for both projects:
```bash
npm run install:all
```

### 2. Environment Variables
You must configure environment variables for both applications separately.
- `frontend/.env`: Requires `VITE_` prefixed variables (Firebase client config, Google Maps browser key, Backend API URL).
- `backend/.env`: Requires backend secrets (Firebase Admin, Gemini API Key, Server Port).
Copy `.env.example` in both folders and fill in your keys.

### 3. Local Development
Run both frontend and backend concurrently from the root directory:
```bash
npm run dev
```
- Frontend will start at `http://localhost:3000`
- Backend will start at `http://localhost:8080`

## Deployment Strategy

### Frontend
Deploy the `/frontend` directory to static hosting services like Firebase Hosting, Netlify, or Vercel. 
- Build command: `npm run build`
- Output directory: `dist/`

### Backend
Deploy the `/backend` directory to Google Cloud Run or any containerized platform. 
- A `Dockerfile` is provided in the `backend/` directory.

## Security Notes
- **Never expose the backend secrets** (Gemini API key, Firebase Admin credentials) to the frontend.
- Keep the frontend and backend `.env` files out of version control (they are added to `.gitignore`).
