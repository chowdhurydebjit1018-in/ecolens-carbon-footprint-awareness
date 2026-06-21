# EcoLens Backend

This is the Node.js + Express + TypeScript backend for EcoLens.

## Development
To run the backend locally:
```bash
npm install
npm run dev
```

## Environment Variables
Create a `.env` file based on `.env.example`:
```
NODE_ENV=development
PORT=8080
CLIENT_ORIGIN=http://localhost:3000
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key
GEMINI_API_KEY=your_gemini_key
GOOGLE_MAPS_API_KEY=your_maps_key
```

## Build
```bash
npm run build
```
The output will be generated in `dist/`.

## Deployment
Can be deployed to Google Cloud Run or any container platform. Use the provided `Dockerfile`.
