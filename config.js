// Firebase CLIENT SDK (for React frontend)
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Your Firebase config - get this from Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
  apiKey: "AIzaSyCcgxDOm8EmA4_A9jCV0HaaLQZIasVBO6k",
  authDomain: "career-guidance-system-59e6e.firebaseapp.com",
  projectId: "career-guidance-system-59e6e",
  storageBucket: "career-guidance-system-59e6e.firebasestorage.app",
  messagingSenderId: "358377689969",
  appId: "1:358377689969:web:8bbbf3c9220866b8409cd0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;