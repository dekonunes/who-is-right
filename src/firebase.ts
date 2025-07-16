// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAG4sjPHMwUOck1ApODGCqhU2YgeRZWKD0",
  authDomain: "who-is-right-f795b.firebaseapp.com",
  projectId: "who-is-right-f795b",
  storageBucket: "who-is-right-f795b.firebasestorage.app",
  messagingSenderId: "562129519794",
  appId: "1:562129519794:web:3bfcb22b714a65edbd35ab",
  measurementId: "G-07YBCCS3BN",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
