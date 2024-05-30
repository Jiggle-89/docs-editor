import { useState, useEffect, useContext, useRef } from 'react'

import { observer } from 'mobx-react';
import { MobXProviderContext } from 'mobx-react'
import './index.css'
import './mdxeditor.css'
import { getFirestore, collection, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import app from './firebase'
import { Modal, Form, Input} from 'antd'
import { useParams } from 'react-router-dom'
import { LoadingOutlined } from '@ant-design/icons'

import { useNotification } from './NotificationConfig';
import htmlToJsx from './HtmlToJsx';
import editorConfig from './EditorConfig';
import { CKEditor } from '@ckeditor/ckeditor5-react'
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic'
//  path in firestore is handled like this: pages/path/to/file without .mdx extension
function useStores() {
  return useContext(MobXProviderContext);
}
const db = getFirestore(app);

const EditFile = observer(() =>{

  const {store} = useStores()

  const {TextArea} = Input
  
  let {name} = useParams()
  const [author, setAuthor] = useState(null)
  const [description, setDescription] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)

  const editorRef = useRef()


  const [form] = Form.useForm();

  const {openNotification, openError, contextHolder} = useNotification()

  async function checkDocExists() { // this function validates if there's a document with the same document name in the collections, used for Form
    const newDocRef = doc(db, "newFiles", name)
    const newDocSnap = await getDoc(newDocRef);
    if (newDocSnap.exists()) 
      return true
    else
      return false;
  }

  useEffect(() => {
    store.setHtml(null);
    contentLoader({store,name});
  }, [name])

  if (store.html === null)
    return (
      <div style={{width:'calc(100vw - 120px)', height: '100vh', display: 'flex', placeItems: 'center', justifyContent: 'center', transition: 'margin-right 0.3'}}>
        <LoadingOutlined style={{fontSize: '150px'}} />
      </div>
    )
  else
    return (
    <>
      {contextHolder}

      <div style={{width: '1150px', position: 'absolute', top: '0', display: 'flex', justifyContent: 'center'}}>
        <CKEditor ref={editorRef} config={editorConfig} editor={ClassicEditor} onReady={editor => {editorRef.current = editor;editor.setData(store.html); }}/>
      </div>

      <Modal width="440px" okButtonProps={{htmlType: 'submit'}} confirmLoading={modalLoading} centered open={store.modalVisible} onOk={postChanges} onCancel={() => store.setModalVisible(false)} >
        <Form form={form}>

          <Form.Item name="שם עורך" rules={[{ required: true, message: 'אנא הכנס שם עורך' }]} >
            <Input onChange={(e) => setAuthor(e.target.value)} maxLength="20" placeholder="שם עורך" style={{width: '350px'}} />
          </Form.Item>

          <Form.Item name="תיאור" rules={[{ required: true, message: 'אנא הכנס תיאור' }]} >
            <TextArea onChange={(e) => setDescription(e.target.value)} maxLength="120" placeholder="תיאור צורך העריכה" style={{width: '350px', resize: 'none'}} autoSize={{minRows: 3, maxRows: 6}} />
          </Form.Item>


        </Form>
      </Modal>

    </>
    )

  async function postChanges() {

    setModalLoading(true)

    try {
      await form.validateFields();
    }

    catch (error) {
      setModalLoading(false)
      return
    }

    if (await checkDocExists()) { // checking if someone's already sent a document edit suggestion
      setModalLoading(false)
      openError('שגיאה', 'הצעה לעריכה בעמוד זה כבר קיימת במערכת')
      return
    }

    const filesCollection = collection(db, 'files');
    const docRef = doc(filesCollection, name);
    const docSnap = await getDoc(docRef);

    const newFilesCollection = collection(db, 'newFiles');
    const newDocRef = doc(newFilesCollection, name);

    const data = docSnap.data();

    const htmlData = editorRef.current.getData();
    const jsxData = htmlToJsx(htmlData);

    try {
      await setDoc(newDocRef, {
        dirPath: data.path,
        HE: data.HE,
        name: data.name,
        content: jsxData,
        html: htmlData,
        status: 'editing',
        description: description,
        author: author,
        timestamp: serverTimestamp()
      })
      store.setModalVisible(false)
      console.log('done uploading to firebase')
      openNotification('התהליך הושלם!', 'הקובץ נערך בהצלחה וממתין לאישור')
    }
    catch(error) {
      console.log('error uploading content to firebase:', error)
      openError('שגיאה', 'אירעה שגיאה בעת העלאת הקובץ לשרת')
    }
    finally {
      setModalLoading(false)
    }
  }

  
}) // ! end of function

async function contentLoader({store,name}) { // this function uses fetchPath to fetch the data from the database and then sets the jsx state to the content of the file for initial load

  const data = await fetchPath({name})

  store.setHtml(data.html)
}

async function fetchPath({name}) { // this function fetches the data from firebase according to name variable (that is the :name parameter url and the page name)
  const filesCollection = collection(db, 'files');

  const docRef = doc(filesCollection, name);
  const docSnap = await getDoc(docRef);
  const data = docSnap.data();
  return data;
}

export default EditFile



// ! async function postChanges() { saving this for admin page
//   // fetch the path from the database according to the name variable that is the document name
//   const data = await fetchPath({name}) // fetches data object {name, HE, content, path}
//   const path = data.path; // extract path from the object

//   fetch('https://git-api-push.vercel.app/update', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ jsx, path }),
//   })
//   .then(response => response.json())
//   .then(data => console.log(data))
//   .catch((error) => {
//     console.error('Error:', error);
//   });
// }