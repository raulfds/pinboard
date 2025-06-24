import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

// IMPORTANTE: Suas credenciais do Firebase agora são carregadas a partir de variáveis de ambiente.
// Crie um arquivo .env.local na raiz do projeto e adicione suas credenciais lá.
// Veja o arquivo .env.local.example como referência.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

// Validate that all required Firebase config values are present before initializing
if (
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId
) {
  try {
    // Check if Firebase app is already initialized to prevent errors
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    auth = getAuth(app);
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    // Ensure app and auth are null if initialization fails
    app = null;
    auth = null;
  }
} else {
  // This warning is helpful for developers to know why Firebase is not working.
  console.warn(
    "Firebase configuration is incomplete. Please check your .env.local file. Authentication features will be disabled."
  );
}

export { app, auth };
