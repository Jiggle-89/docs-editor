import { collection, query, where, getDocs, doc, getDoc, getFirestore } from "firebase/firestore";
import app from "./firebase";

const db = getFirestore(app);

async function checkHeExists(value) { // this function validates if there's a document with the same HE name in the collections, used for Form
  if (value && value != '') {
    const filesRef = collection(db, "files");
    const newFilesRef = collection(db, "newFiles");
    const q = query(filesRef, where("HE", "==", value));
    const newQ = query(newFilesRef, where("HE", "==", value));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return Promise.reject(new Error('שם קובץ כבר קיים במערכת'));
    }
    const newQuerySnapshot = await getDocs(newQ);
    if (!newQuerySnapshot.empty) {
      return Promise.reject(new Error('קובץ עם שם זה הועלה וממתין לאישור'));
    }
    return Promise.resolve();
  }
}

async function checkDocExists(value) { // this function validates if there's a document with the same document name in the collections, used for Form
  if (value && value != '') {
    const docRef = doc(db, "files", value);
    const newDocRef = doc(db, "newFiles", value)
    const docSnap = await getDoc(docRef);
    const newDocSnap = await getDoc(newDocRef);
    if (docSnap.exists()) {
      return Promise.reject(new Error('קובץ עם שם זה קיים במערכת'))
    }
    else if (newDocSnap.exists()) {
      return Promise.reject(new Error('הקובץ כבר נוצר וממתין לאישור'))
    }
    else {
      return Promise.resolve();
    }
  }
}

export {checkHeExists, checkDocExists}