
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD7j_vzw8B5NUrwDSPG-V1eINKdWFywmao",
  authDomain: "moroccanrecipes-367f6.firebaseapp.com",
  projectId: "moroccanrecipes-367f6",
  storageBucket: "moroccanrecipes-367f6.firebasestorage.app",
  messagingSenderId: "275442670118",
  appId: "1:275442670118:web:6d497bd7452b26e33d64e7",
  measurementId: "G-NCMG74L7R2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
// const analytics = getAnalytics(app);

export { auth, db, googleProvider };
export default app;
