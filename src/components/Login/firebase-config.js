import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore"
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDcz2QdhebqYgezGH8RloKfrjFHbzClnm4",
    authDomain: "fyp-68f10.firebaseapp.com",
    projectId: "fyp-68f10",
    storageBucket: "fyp-68f10.appspot.com",
    messagingSenderId: "982824616783",
    appId: "1:982824616783:web:a72ce4bc6fba921cd0bb3a",
    measurementId: "G-71PVTZ0NYZ"
  };
  

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;