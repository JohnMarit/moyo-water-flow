import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
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

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

