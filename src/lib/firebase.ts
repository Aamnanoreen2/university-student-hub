import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  updateProfile,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot 
} from "firebase/firestore";
import rawFirebaseConfig from "../../firebase-applet-config.json";

// Read Firebase client configuration from environment variables with fallback
const activeFirebaseConfig = {
  ...rawFirebaseConfig,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || rawFirebaseConfig.apiKey,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || rawFirebaseConfig.projectId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || rawFirebaseConfig.appId,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || rawFirebaseConfig.authDomain,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || rawFirebaseConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || rawFirebaseConfig.messagingSenderId,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(activeFirebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("https://www.googleapis.com/auth/gmail.send");
googleProvider.addScope("https://mail.google.com/");

let cachedGoogleAccessToken: string | null = null;

export const setGoogleAccessToken = (token: string | null) => {
  cachedGoogleAccessToken = token;
};

export const getGoogleAccessToken = (): string | null => {
  return cachedGoogleAccessToken;
};

export const signInWithGoogleWithGmail = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      setGoogleAccessToken(credential.accessToken);
    }
    return { user: result.user, accessToken: credential?.accessToken || null };
  } catch (err) {
    console.error("Google sign-in error:", err);
    throw err;
  }
};

// Initialize Firestore with custom database ID if provided
const customDbId = (activeFirebaseConfig as Record<string, any>).firestoreDatabaseId;
export const db = customDbId && customDbId !== "(default)"
  ? getFirestore(app, customDbId)
  : getFirestore(app);

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  firebaseSignOut,
  updateProfile,
  onAuthStateChanged,
  doc,
  setDoc,
  getDoc,
  onSnapshot
};
export type { User };
