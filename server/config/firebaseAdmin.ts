import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { env } from "./env";

let firebaseApp: any;
let authApp: any;

if (getApps().length === 0) {
  try {
    const serviceAccount = {
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      // Replace escaped newlines with actual newlines
      privateKey: env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    };

    if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
      firebaseApp = initializeApp({
        credential: cert(serviceAccount),
      });
    } else if (process.env.FIRESTORE_EMULATOR_HOST) {
      firebaseApp = initializeApp({
        projectId: env.FIREBASE_PROJECT_ID,
      });
    } else {
      console.warn("No Firebase credentials provided. Firestore admin actions will be disabled.");
    }
    if (!getApps().find(app => app.name === "authApp")) {
      authApp = initializeApp({ projectId: "gen-lang-client-0621953563" }, "authApp");
    } else {
      authApp = getApp("authApp");
    }
  } catch (error) {
    console.error("Firebase Admin Initialization Error:", error);
  }
} else {
  firebaseApp = getApp();
  authApp = getApp("authApp");
}

export const adminAuth = authApp ? getAuth(authApp) : undefined;
export const adminDb = firebaseApp ? getFirestore(firebaseApp) : undefined;
