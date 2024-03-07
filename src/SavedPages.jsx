import { onSnapshot, collection, doc, getFirestore } from "firebase/firestore";
import { auth } from "./firebase";
import app from "./firebase";

// ...
const db = getFirestore(app);

async function savedPages(setCachedPages) {
  const usersCollection = collection(db, 'users')
  const userDoc = doc(usersCollection, auth.currentUser.uid)
  const pages = collection(userDoc, 'pages')

  // Set up the real-time listener
  const unsubscribe = onSnapshot(pages, (snapshot) => {
    if (snapshot.empty) {
      setCachedPages([]);
    } else {
      const documents = snapshot.docs.map(doc => doc.data())
      setCachedPages(documents);
    }
  });

  // Return the unsubscribe function to clean up the listener
  return unsubscribe;
}

export default savedPages;
