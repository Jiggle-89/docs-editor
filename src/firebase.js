// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import {getAuth, setPersistence, browserLocalPersistence} from 'firebase/auth'
import { initializeFirestore, persistentLocalCache } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA2hUPCfRLupQ6mWKaxWO5aoDMclQAqCdQ",
  authDomain: "docs-editor-dbae7.firebaseapp.com",
  projectId: "docs-editor-dbae7",
  storageBucket: "docs-editor-dbae7.appspot.com",
  messagingSenderId: "370416394457",
  appId: "1:370416394457:web:6fe18cf80556029490dec8",
  measurementId: "G-GKWXPY7C1D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth()
auth.languageCode = 'he'
const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  'login_hint': 'user@example.com'
});
// set auth persistence to local
setPersistence(auth, browserLocalPersistence)
initializeFirestore(app, {localCache: persistentLocalCache(/*settings*/{})});
const analytics = getAnalytics(app);


export {auth, provider}
export default app;