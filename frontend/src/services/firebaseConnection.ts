import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCbDFG3Ars8WYl8gvLr8vHrXi7lcR6HPGc",
  authDomain: "glowstack-e5313.firebaseapp.com",
  projectId: "glowstack-e5313",
  storageBucket: "glowstack-e5313.firebasestorage.app",
  messagingSenderId: "730822683876",
  appId: "1:730822683876:web:70f4100bff67570b5fd0f1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app)

export { auth, db}