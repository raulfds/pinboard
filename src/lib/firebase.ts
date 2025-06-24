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

// Validação para garantir que as variáveis de ambiente foram configuradas
if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX") {
    // Inicializa o Firebase
    try {
        app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        auth = getAuth(app);
    } catch (error) {
        console.error("Erro ao inicializar o Firebase. Verifique suas credenciais:", error);
        app = null;
        auth = null;
    }
} else {
    console.error("Configuração do Firebase está incompleta. Verifique seu arquivo .env.local. A autenticação estará desabilitada.");
}

export { app, auth };
