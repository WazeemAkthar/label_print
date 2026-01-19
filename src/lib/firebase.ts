// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBMY5n3b5t2yIyohEwEvCNwm0OZtE-86I4",
  authDomain: "labelflow-bdf86.firebaseapp.com",
  projectId: "labelflow-bdf86",
  storageBucket: "labelflow-bdf86.firebasestorage.app",
  messagingSenderId: "603206847816",
  appId: "1:603206847816:web:d5c502c13183c40cc8b77d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
