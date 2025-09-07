import { useState, useEffect, useContext, useRef } from 'react'

import { observer } from 'mobx-react';
import { MobXProviderContext } from 'mobx-react'
import './index.css'
import './mdxeditor.css'
// Firebase imports removed - using local API instead
import postToGit from './PostToGit'
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
// Firebase database reference removed - using local API instead

const EditFile = observer(() =>{

  const {store} = useStores()

  const {TextArea} = Input
  
  let {name} = useParams()
  const [author, setAuthor] = useState(null)
  const [description, setDescription] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [pageData, setPageData] = useState(null)

  const editorRef = useRef()


  const [form] = Form.useForm();

  const {openNotification, openError, contextHolder} = useNotification()

  // checkDocExists function removed - was unused Firebase code

  useEffect(() => {
    store.setHtml(null);
    contentLoader({store,name, setPageData});
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
    setModalLoading(true);
    try {
        await form.validateFields();

        if (!pageData) {
            throw new Error("Page data is not loaded yet.");
        }

        const htmlData = editorRef.current.getData();
        const jsxData = htmlToJsx(htmlData);
        
        await postToGit(
            jsxData,
            htmlData,
            pageData.path,
            pageData.name,
            pageData.HE,
            author,
            description,
            false,
            setModalLoading,
            store,
            false
        );

    } catch (error) {
        console.error("Error during postChanges:", error);
        openError('שגיאה', error.message || 'אירעה שגיאה בלתי צפויה.');
        setModalLoading(false);
    }
}
  
}) // ! end of function

async function contentLoader({store, name, setPageData}) {
  try {
    console.log(`Renderer: מבקש תוכן עבור הדף '${name}'...`);
    const pageData = await window.api.getPageContent(name);

    if (pageData && pageData.error) {
      throw new Error(pageData.error);
    }

    if (pageData) {
      store.setHtml(pageData.html || ''); // Fallback to empty string if html is null/undefined
      setPageData(pageData)
      console.log("Renderer: התוכן נטען והוצג באדיטור.");
    } else {
      throw new Error("לא התקבל מידע עבור הדף המבוקש.");
    }
  } catch (error) {
    console.error("Renderer: שגיאה בטעינת תוכן הדף:", error);
    // כאן אפשר להוסיף לוגיקת טיפול בשגיאות, למשל הצגת הודעה למשתמש
    store.setHtml('<p>שגיאה בטעינת המידע.</p>');
  }
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
