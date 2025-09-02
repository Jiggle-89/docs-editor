// ייבואים של Firebase כבר לא נחוצים כאן
// import app from './firebase';
// import { collection, doc, setDoc, getFirestore, deleteDoc } from "firebase/firestore";
import {notification} from 'antd';

// const db = getFirestore(app); // כבר לא נחוץ

const postToGit =  async(jsxData, htmlData, newFilePath, name, heText, author, description, createFolder, setModalLoading, store, isNew) => {

  // שלב 1: הסרנו את כל הבלוק של עדכון Firebase.
  // אין יותר צורך לכתוב ל-Firestore מכאן.



  try {
    console.log("Renderer: שולח בקשת פרסום לתהליך הראשי...");
    console.log("Renderer: Checking if window.api exists:", !!window.api);
    console.log("Renderer: Checking if window.api.publishChanges exists:", !!window.api?.publishChanges);
    
    // Test IPC communication first
    console.log("Renderer: Testing IPC communication...");
    try {
      const testResult = await window.api.testIpc();
      console.log("Renderer: IPC test result:", testResult);
    } catch (testError) {
      console.error("Renderer: IPC test failed:", testError);
    }

    // 2. בניית אובייקט ה-payload עם כל הנתונים הנדרשים לתהליך הראשי
    const payload = {
      jsxData,
      htmlData,
      newFilePath,
      name,
      heText,
      author,
      description,
      createFolder,
      isNew,
    };

    console.log("Renderer: Payload prepared:", payload);

    // 3. קריאה ישירה לפונקציה מהתהליך הראשי במקום fetch
    console.log("Renderer: Calling window.api.publishChanges...");
    const result = await window.api.publishChanges(payload);

    // 4. בדיקת התוצאה שהתקבלה מהתהליך הראשי
    if (!result || !result.success) {
      // אם התהליך הראשי החזיר שגיאה, נזרוק אותה כדי להגיע לבלוק ה-catch
      throw new Error(result.error || 'An unknown error occurred during publishing.');
    }

    // אם הגענו לכאן, הפעולה הצליחה
    console.log("Renderer: הפרסום הסתיים בהצלחה!", result.message);

    notification.success({
      message: 'התהליך הושלם!',
      description: isNew ? 'הקובץ נוצר ופורסם בהצלחה!' : 'הקובץ נערך ופורסם בהצלחה!',
      placement: 'bottomRight',
    });
    store.setModalVisible(false);

  } catch (error) {
    // בלוק זה יתפוס שגיאות תקשורת עם התהליך הראשי או שגיאות שהתהליך הראשי החזיר
    console.error('Error during local publish process:', error);
    notification.error({
      message: 'שגיאה בפרסום הקובץ',
      description: 'אנא בדוק את הלוגים או נסה שוב מאוחר יותר',
      placement: 'bottomRight',
    });
  }
  finally {
    // בכל מקרה, הצלחה או כישלון, נסיים את מצב הטעינה
    setModalLoading(false);
  }
}

export default postToGit;
