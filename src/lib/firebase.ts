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
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

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
const customDbId = (firebaseConfig as Record<string, any>).firestoreDatabaseId;
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
