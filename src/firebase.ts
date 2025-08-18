import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDs04XZlB_EiF4MAXSsrUxyW_Yx0vt6aVg",
  authDomain: "tour-app-15101.firebaseapp.com",
  projectId: "tour-app-15101",
  storageBucket: "tour-app-15101.firebasestorage.app",
  messagingSenderId: "75698512901",
  appId: "1:75698512901:web:13102ef50b27f02178e86c"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;


