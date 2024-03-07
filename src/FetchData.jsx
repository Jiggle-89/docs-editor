import {doc, getDoc, getFirestore} from "firebase/firestore";
import app from './firebase'



const db = getFirestore(app);

async function FetchData({store}) { // fetches tree directory from nodejs (used for treeselect in modal)
  try {
    store.setTreeLoad(true);
    const response = await fetch('https://git-api-push.vercel.app/page-structure');
    let data = await response.json();
    await nameInFirebase(data);
    store.setTree(data);
  } 
  catch (error) {
    console.error('Error pulling structural data:', error);
  }
  finally {
    store.setTreeLoad(false);
  }
}

async function nameInFirebase(tree) {

  for (const item of tree) {
    // look for document with name item.title, if it exists take the variable HE from it and replace it with item.title
    // if item.title ends with .mdx extension, remove it
    if (item.title.endsWith('.mdx')) {
      item.title = item.title.slice(0, -4);
    }
    const docRef = await doc(db, "files", item.title);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = await docSnap.data();
      item.title = data.HE;
    }

    // If the item has children, recursively call this function on the children
    if (item.children) {
      await nameInFirebase(item.children);
    }
  }
}

export default FetchData;
