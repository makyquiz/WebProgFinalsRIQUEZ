import {initializeApp} from 'firebase/app'
import {getFirestore} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCLr-P8VzOBz4g88rKwUR7Iz68Js8ioYGo",
  authDomain: "watertop-9d9e4.firebaseapp.com",
  projectId: "watertop-9d9e4",
  storageBucket: "watertop-9d9e4.firebasestorage.app",
  messagingSenderId: "112441106926",
  appId: "1:112441106926:web:99f283d2ba28699fa22eff",
  measurementId: "G-F324Y1VW26"
};

  initializeApp(firebaseConfig);

  const db = getFirestore();

  export {db}