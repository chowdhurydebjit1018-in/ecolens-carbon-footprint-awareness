# EcoLens Frontend

This is the React + TypeScript + Vite frontend for EcoLens.

## Development
To run the frontend locally:
```bash
npm install
npm run dev
```

## Environment Variables
Create a `.env` file based on `.env.example`:
```
VITE_API_BASE_URL=http://localhost:8080
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_GOOGLE_MAPS_BROWSER_KEY=your_maps_key
```

## Build
```bash
npm run build
```
The output will be generated in `dist/`.

## Deployment
Can be deployed to Firebase Hosting, Vercel, Netlify, or any static hosting provider. Set the build command to `npm run build` and publish directory to `dist/`.
