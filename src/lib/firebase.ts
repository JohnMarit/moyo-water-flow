import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  User,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB05rAVZsQST68eY3jDpuCJVIoI4zRL0Uw",
  authDomain: "moyo-349c5.firebaseapp.com",
  projectId: "moyo-349c5",
  storageBucket: "moyo-349c5.firebasestorage.app",
  messagingSenderId: "148633307310",
  appId: "1:148633307310:web:c65b7271de0472caf0853f",
  measurementId: "G-0RXR504F8X",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

const provider = new GoogleAuthProvider();

/** Redirects to Google sign-in (avoids COOP/popup issues). Call getRedirectResultOnLoad() when app loads to complete sign-in. */
export async function signInWithGoogle(): Promise<void> {
  await signInWithRedirect(auth, provider);
}

/** Call once on app load to complete sign-in after redirect. Returns the result object if they just signed in via redirect. */
export async function getRedirectResultOnLoad() {
  try {
    const result = await getRedirectResult(auth);
    return result;
  } catch (error) {
    console.error('Error getting redirect result:', error);
    return null;
  }
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

