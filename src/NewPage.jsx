import {useRef, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import React from 'react'
import './index.css'
import './mdxeditor.css'
import {getFirestore, collection, doc, setDoc} from 'firebase/firestore'
import app from './firebase'
import { auth } from './firebase'
import { LoadingOutlined } from '@ant-design/icons'
import {TreeSelect, Modal, Input, Form, Checkbox} from 'antd'
import {Spin} from 'antd'
import { checkHeExists, checkDocExists } from './Checks'

import postToGit from './PostToGit'
import SaveModal from './SaveModal'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic'
import editorConfig from './EditorConfig'

import { useNotification } from './NotificationConfig'
import htmlToJsx from './HtmlToJsx'
import {MobXProviderContext} from 'mobx-react'

import { observer } from 'mobx-react'

const db = getFirestore(app);
function useStores() {
  return React.useContext(MobXProviderContext);
}

const NewPage = observer(() =>{

  const {store} = useStores()
  const navigate = useNavigate()

  const [heText, setHeText] = useState('') // HE name of the new page
  const [enText, setEnText] = useState('') // EN name of the new page [for the title of the page and the directory path in git
  const [dirPath, setDirPath] = useState(undefined) // directory path of where the new page should exist
  const [modalLoading, setModalLoading] = useState(false) // boolean, for ok button loading in modal
  const [author, setAuthor] = useState('') // author (user) of the changes
  const [description, setDescription] = useState('') // description of what was made in the new page (for git and admin screen)
  const [name, setName] = useState('') // name of the new page in english
  const [createFolder, setCreateFolder] = useState(false) // boolean, for creating a new folder in the directory path
  const editorRef = useRef()


  const {openNotification,openError, contextHolder} = useNotification()

  const [form] = Form.useForm(); // form reference in modal for validations

  const {TextArea} = Input

  const exampleData = `
  <p>
    <span style="font-size:28px;">תהליך העריכה בעורך:</span>
  </p>
  <h1>
    כותרת גדולה
  </h1>
  <h2>
    כותרת 2
  </h2>
  <h3>
    כותרת 3
  </h3>
  <h4>
    כותרת 4
  </h4>
  <p>
    &nbsp;
  </p>
  <ul>
    <li>
        עיצובים (כמו מירקור, שינוי צבע וכדומה) על כותרות אלו יידרסו מאחר ומטרת הכותרות הוא לספר לאתר שאלו נושאים מרכזיים בדף ולכן עיצובים שנעשים עליהם כאן בעורך לא יישקפו באתר הלומדה.
        <ul>
            <li>
                &nbsp;בעמוד <a href="https://toardocs.vercel.app/tkina/tkinatoarp/toarp">הבא</a> תוכלו לראות שהכותרות נמצאות בתוכן העניינים משמאל למעלה וניתן ללחוץ עליו כדי לקפוץ לכל נושא,
            </li>
            <li>
                &nbsp;גודל הכותרת משפיע על היבלטות הכותרת בתוכן העניינים לדוג' בקישור המצורף "דגשים חשובים" הינה כותרת יותר קטנה ולכן פחות מודגשת ומוזחת (נמצאת תחת אובייקטים במערכת)
            </li>
        </ul>
    </li>
    <li>
        ניתן להשתמש בכותרות בצורות הבאות:&nbsp;
        <ol>
            <li>
                &nbsp;קיצור הסולמיות: &nbsp;כמות הסולמיות תגדיר את גודל הכותרת וחשיבותה למשל נסו לרשום כאן למטה "<u>### כותרת 3"</u>
            </li>
            <li>
                לחיצה על דרוף דאון איפה שרשום "פסקה" ולבחור את הכותרת הרצויה
            </li>
        </ol>
    </li>
    <li>
        הכותרת הכי קטנה שניתן ליצור הינה כותרת 4
    </li>
  </ul>
  <p>
    &nbsp;
  </p>
  <p>
    &nbsp;
  </p>
  <h2>
    דרכי עיצוב והצגת מידע
  </h2>
  <p>
    &nbsp;
  </p>
  <ol>
    <li>
        רשימה
    </li>
    <li>
        ממוספרת
        <ol>
            <li>
                ומסוגלת
            </li>
            <li>
                להיות
            </li>
            <li>
                מקוננת (רשימה בתוך רשימה)
            </li>
        </ol>
    </li>
  </ol>
  <ul>
    <li>
        רשימת בולטים (נקודות)
    </li>
    <li>
        להצגת מידע
        <ul>
            <li>
                שאינו צריך להיות ממוספר
            </li>
        </ul>
    </li>
  </ul>
  <p>
    &nbsp;
  </p>
  <p>
    את הרשימות ניתן ליצור באמצעות התחלתן, לדוג' אם נתחיל לרשום 1. או כוכבית (*) תיווצר לנו רשימה ממוספרת/בולטים בהתאמה או באמצעות בחירתן מהבר העליון
  </p>
  <p>
    &nbsp;
  </p>
  <h3>
    עיצוב פשוט
  </h3>
  <p>
    &nbsp;
  </p>
  <p>
    <span style="background-color:hsl(60,100%,50%);">מרקרים</span>
  </p>
  <p>
    <span style="color:hsl(120,75%,60%);">צבע טקסט</span>
  </p>
  <p>
    <span style="font-size:22px;">גודל טקסט</span>
  </p>
  <p>
    &nbsp;
  </p>
  <p>
    &nbsp;
  </p>
  <h2>
    קיצורים שימושיים
  </h2>
  <p>
    &nbsp;
  </p>
  <p>
    <strong>טקסט בולט (בולד) </strong>CTRL+B
  </p>
  <p>
    <u>טקסט עם קו תחתון</u> CTRL+U
  </p>
  <p>
    <i>טקסט נוטה (איטלקי)</i> CTRL+i
  </p>
  <p>
    <s>טקסט מחוק</s> CTRL+SHIFT+X
  </p>
  <p>
    <br>
    <a href="https://toardocs.vercel.app">היפר קישור</a> CTRL+K<br>
    <br>
    ניתן למצוא ולהחליף מילים באמצעות CTRL+F
  </p>
  <p>
    &nbsp;
  </p>
  <figure class="table">
    <table>
        <thead>
            <tr>
                <th>
                    טבלה
                </th>
                <th>
                    יפה
                </th>
                <th>
                    מאוד
                </th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <th>
                    טבלה
                </th>
                <td>
                    יפה
                </td>
                <td>
                    מאוד
                </td>
            </tr>
            <tr>
                <th>
                    טבלה
                </th>
                <td>
                    יפה
                </td>
                <td>
                    מאוד
                </td>
            </tr>
            <tr>
                <th>
                    טבלה
                </th>
                <td>
                    יפה
                </td>
                <td>
                    מאוד
                </td>
            </tr>
            <tr>
                <th>
                    טבלה
                </th>
                <td>
                    יפה
                </td>
                <td>
                    מאוד
                </td>
            </tr>
            <tr>
                <th>
                    טבלה
                </th>
                <td>
                    יפה
                </td>
                <td>
                    מאוד
                </td>
            </tr>
        </tbody>
    </table>
  </figure>
  <p>
    &nbsp;
  </p>
  <p>
    &nbsp;
  </p>
  <p>
    ניתן לצרף תמונות באמצעות היפר קישור ע"י לחיצת כפתור התמונה למעלה, או לצרף קובץ מקומי מהמחשב:
  </p>
  <p>
    &nbsp;
  </p>
  <figure class="image">
    <img style="aspect-ratio:104/142;" src="https://www.w3schools.com/images/w3schools_green.jpg" width="104" height="142">
  </figure>`


  // async function postChanges() { // todo: this function executes when modal ok button is pressed to publish changes to firebase, actual function that pushes to admin screen watching
  //   setModalLoading(true)

  //   try {
  //     const values = await form.validateFields(); // before posting changes, attempting validation
  //   }
  //   catch (error) {
  //     setModalLoading(false)
  //     return
  //   }

  //   const newFiles = collection(db, "newFiles");

  //   const htmlData = editorRef.current.getData();
  //   const jsxData = htmlToJsx(htmlData);

  //   try {
  //     await setDoc(doc(newFiles, name), {
  //       content: jsxData, // content of the page
  //       html: htmlData, // html content of the page
  //       dirPath: dirPath, // directory path in git
  //       HE: heText, // name of the page hebrew
  //       name: name, // name of the page in english (in the title)
  //       author: author, // name of the author who wrote and saved
  //       timestamp: serverTimestamp(), // timestamp of when it was committed to firebase
  //       status: 'new', // status of the page, new meaning it was just created
  //       description: description.length ? description : 'יצירת דף חדש (ללא תיאור)'
  //     });
  //     store.setModalVisible(false)
  //     openNotification('התהליך הושלם!', 'הקובץ נוצר בהצלחה וממתין לאישור')
  //     console.log('done uploading new file to firebase')
  //   }
  //   catch (error) {
  //     console.error('Error uploading new file to firebase:', error);
  //   }
  //   finally {
  //     setModalLoading(false)
  //   }
  // }

  async function saveChanges() { // this function saves the changes to the user's collection in firebase
    try {
      await form.validateFields();
    }

    catch (error) {
      console.log('error', error)
      return;
    }

    setModalLoading(true);


    const usersCollection = collection(db, "users");
    const userDoc = doc(usersCollection, auth.currentUser.uid);
    const pages = collection(userDoc, "pages");
    // create a new document in the pages collection

    const html = editorRef.current.getData()
    const jsxData = htmlToJsx(html)


    try {
      await setDoc(doc(pages, enText), {
        he: heText,
        name: enText,
        status: 'saved in user',
        content: jsxData,
        html: html,
      })
      store.setSaveModal(false);
      openNotification('התהליך הושלם!', 'הקובץ נשמר בשבילך בהצלחה')
      navigate(`/edit-saved/${enText}`)
    }

    catch (error) {
      console.log('error', error)
      openError('שגיאה בשמירת הקובץ', 'אנא נסה שוב מאוחר יותר')
    }

    finally {
      setModalLoading(false);
    }

  }


  return (
    <>
      {contextHolder} {/* this is for the notification component */}
      {store.treeLoad ? <Spin indicator={<LoadingOutlined style={{fontSize: '100px'}} spin />} fullscreen></Spin> : null}

      <div style={{display: 'flex', justifyContent: 'center'}}>
        <CKEditor data={exampleData} config={editorConfig} editor={ClassicEditor} ref={editorRef} onReady={editor => editorRef.current = editor}  />
      </div>

      <Modal width="440px" okButtonProps={{htmlType: 'submit'}} confirmLoading={modalLoading} centered open={store.modalVisible} onOk={postChanges} onCancel={() => store.setModalVisible(false)}>

        <Form form={form} labelCol={{span: 8}} wrapperCol={{span: 16}} style={{marginBottom: '20px'}}>

          <Form.Item validateFirst={true} hasFeedback validateDebounce={700} name="heName" rules={[
            {
              required: true,
              message: 'אנא הזן שם עמוד'
            },
            {
              pattern: /^[^\s].*[^\s]$/, // no spaces at the beginning/end of string
              message: 'הזן שם עמוד ללא רווחים בהתחלה ובסוף'
            },
            () => ({
              async validator(_, value) {
                return await checkHeExists(value)
              }
            })
          ]}
          ><Input maxLength="25" count={{maxLength: '25', show: 'true'}} placeholder="שם עמוד בעברית" style={{width: '350px'}} onChange={(e) => setHeText(e.target.value)}></Input></Form.Item>

          <Form.Item validateFirst={true} name="enName" hasFeedback validateDebounce={700} rules={[{pattern: /^[a-zA-Z0-9]+$/, message: 'אותיות באנגלית ומספרים ללא רווחים בלבד'}, {required: true, message: 'אנא מלא שם באנגלית'},
            () => ({
              async validator(_, value) {
                return await checkDocExists(value)
              }
            })
          ]}>
            <Input onChange={(e) => setName(e.target.value)} maxLength={15} count={{maxLength: '15', show: 'true'}} placeholder="שם באנגלית (לצורך קישור)" style={{width: '350px'}} ></Input>
          </Form.Item>
          
          <Form.Item name="תיקיית אב" rules={[{required: true, message: 'אנא הזן תיקיית אב'}]}>
            <TreeSelect
              allowClear
              value={dirPath}
              style={{width: '350px'}}
              dropdownStyle={{overflow: 'auto' }}
              treeData={store.tree}
              placeholder="בחר תיקיית אב"
              onChange={(value) => setDirPath(value)}
            ></TreeSelect>
          </Form.Item>

          <Form.Item name="שם מחבר" rules={[{required: true, message: 'אנא הזן שם מחבר'}]}>
            <Input onChange={(e) => setAuthor(e.target.value)} maxLength="20" placeholder="שם מחבר" style={{width: '350px'}}></Input>
          </Form.Item>

          <Form.Item name="תיאור כללי">
            <TextArea maxLength="120" onChange={(e) => setDescription(e.target.value)} placeholder="תיאור כללי על העמוד החדש (אופציונלי אך מומלץ)" style={{resize: 'none', minWidth: '350px'}} autoSize={{minRows: 3, maxRows: 6}}></TextArea>
          </Form.Item>

          <Form.Item>
            <Checkbox onChange={(e) => setCreateFolder(e.target.checked)}>צור כעמוד נושא</Checkbox>
          </Form.Item>


        </Form>

      </Modal>

      <SaveModal saveChanges={saveChanges} form={form} setEnText={setEnText} setHeText={setHeText} modalLoading={modalLoading} /> 

    </>
  )

  // ! this is the upload to git original function

  async function postChanges() {

    setModalLoading(true);

    const htmlData = editorRef.current.getData();
    const jsxData = htmlToJsx(htmlData);
    const newFilePath = dirPath + '/' + name;

    try { // validate form
      await form.validateFields();
    }
    catch (error) {
      setModalLoading(false);
      return;
    }

    await postToGit(jsxData, htmlData, newFilePath, name, heText, author, description, createFolder, setModalLoading, store, true)

  }
  
})

export default NewPage