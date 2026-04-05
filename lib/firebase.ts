import { initializeApp } from "firebase/app"
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  getAuth,
  setPersistence,
  signInWithPopup,
} from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
)

const app = hasFirebaseConfig ? initializeApp(firebaseConfig as Record<string, string>) : null

const auth = app ? getAuth(app) : null

if (auth) {
  setPersistence(auth, browserLocalPersistence).catch(() => {})
}

const googleProvider = new GoogleAuthProvider()

async function signInWithGoogle() {
  if (!auth) {
    throw new Error("Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_* variables.")
  }
  return signInWithPopup(auth, googleProvider)
}

export { app, auth, signInWithGoogle, hasFirebaseConfig }