import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBRMG02hMV4ZXXRe7xk9ygUaYLItStCh1A",
  authDomain: "nexly-26feb.firebaseapp.com",
  databaseURL: "https://nexly-26feb-default-rtdb.firebaseio.com",
  projectId: "nexly-26feb",
  storageBucket: "nexly-26feb.firebasestorage.app",
  messagingSenderId: "760954353581",
  appId: "1:760954353581:web:bacce10d1c76f3be8e5324",
  measurementId: "G-HPZR107L8P"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);
