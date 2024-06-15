import app from './firebase';
import {notification} from 'antd';
import { collection, doc, setDoc, getFirestore, deleteDoc } from "firebase/firestore";

const db = getFirestore(app);
const postToGit =  async(jsxData, htmlData, newFilePath, name, heText, author, description,createFolder, setModalLoading, store, isNew) => {

  try { // post changes to firebase
    await setDoc(doc(collection(db, "files"), name), {
      content: jsxData,
      html: htmlData,
      path: newFilePath,
      HE: heText,
      name: name,
    })
  }
  catch (error) {
    console.log('Error uploading new file to firebase:', error);
    // short circuit any error to not upload to git if error is in authentication
    if (error.code === 'permission-denied') {
      notification.error({ // can't use hooks so using manually
        message: 'הפעולה נכשלה',
        description: 'אין לך הרשאה מספקת לבצע פעולה זו',
        placement: 'bottomRight',
      });
      setModalLoading(false);
      return;
    }
  }

  try { // post changes to git
    const response = await fetch('https://git-api-push.vercel.app/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jsxData, newFilePath, name, heText, author, description, createFolder, isNew }),
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(`error: ${JSON.stringify(errorResponse)}`);
    }

    const data = await response.json();
    console.log(data);

    notification.success({ // can't use hooks so using manually
      message: 'התהליך הושלם!',
      description: isNew ? 'הקובץ נוצר בהצלחה!' : 'הקובץ נערך והועלה בהצלחה!',
      placement: 'bottomRight',
    });
    store.setModalVisible(false);
  }
  catch (error) {
    console.error('Error:', error);
    if (isNew) await deleteDoc(doc(collection(db, "files"), name)); // delete the file from firebase if error in git
    notification.error({ // can't use hooks so using manually
      message: 'שגיאה בהעלאת הקובץ',
      description: 'אנא נסה שוב מאוחר יותר',
      placement: 'bottomRight',
    });
  } 
  finally {
    setModalLoading(false);
  }

}

export default postToGit;