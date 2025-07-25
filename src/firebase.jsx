// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCLr-P8VzOBz4g88rKwUR7Iz68Js8ioYGo",
  authDomain: "watertop-9d9e4.firebaseapp.com",
  projectId: "watertop-9d9e4",
  storageBucket: "watertop-9d9e4.firebasestorage.app",
  messagingSenderId: "112441106926",
  appId: "1:112441106926:web:99f283d2ba28699fa22eff",
  measurementId: "G-F324Y1VW26"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);