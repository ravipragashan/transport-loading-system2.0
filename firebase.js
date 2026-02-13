// firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAcpkRglFpdgXPUyfOKDkP9tWTYY0d2tCc",
  authDomain: "transport-loading-system.firebaseapp.com",
  projectId: "transport-loading-system",
  storageBucket: "transport-loading-system.appspot.com",
  messagingSenderId: "169064388512",
  appId: "1:169064388512:web:e5e985ec7910d4476a76c5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
