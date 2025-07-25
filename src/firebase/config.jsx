import {initializeApp} from 'firebase/app'
import { getAuth } from "firebase/auth";
import {getFirestore} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyA02ns6WTFf5rFTeJnITMASsXdeuR98hAY",
  authDomain: "freelanceinweb-bab82.firebaseapp.com",
  projectId: "freelanceinweb-bab82",
  storageBucket: "freelanceinweb-bab82.firebasestorage.app",
  messagingSenderId: "199724064108",
  appId: "1:199724064108:web:9766d1712ef5ba5867a749",
  measurementId: "G-0SLRTWKQ8H"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };