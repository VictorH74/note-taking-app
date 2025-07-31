// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDsNQv15Kf9h2BvDG03C8vqkGDB9203Iag",
  authDomain: "note-taking-c6e41.firebaseapp.com",
  projectId: "note-taking-c6e41",
  storageBucket: "note-taking-c6e41.firebasestorage.app",
  messagingSenderId: "888812499654",
  appId: "1:888812499654:web:b8c68c0c176dae1d349dc7",
  measurementId: "G-L5MLFN4XGP",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
