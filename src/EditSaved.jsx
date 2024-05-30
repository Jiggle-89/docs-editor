import { useState, useEffect, useContext, useRef } from 'react'
import { auth } from './firebase';


import {useNavigate} from 'react-router-dom'
import { observer } from 'mobx-react';
import { MobXProviderContext } from 'mobx-react'
import './index.css'
import './mdxeditor.css'
import { getFirestore, collection, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore'
import app from './firebase'
import { Form, Input, TreeSelect, Modal, Checkbox, Spin, FloatButton} from 'antd'
import { useParams } from 'react-router-dom'
import { LoadingOutlined, DeleteOutlined } from '@ant-design/icons'
import { checkHeExists, checkDocExists } from './Checks'
import postToGit from './PostToGit'

import { useNotification } from './NotificationConfig';
import editorConfig from './EditorConfig';
import htmlToJsx from './HtmlToJsx';
import { CKEditor } from '@ckeditor/ckeditor5-react'
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic'
//  path in firestore is handled like this: pages/path/to/file without .mdx extension

function useStores() {
  return useContext(MobXProviderContext);
}
const db = getFirestore(app);

const EditSaved = observer(() =>{

  const navigate = useNavigate()

  const {store} = useStores()

  const {TextArea} = Input
  
  let {name} = useParams()
  const [enText, setEnText] = useState('') // this is used for the name of the page [enText] and the author [author
  const [heText, setHeText] = useState('');
  const [modalLoading, setModalLoading] = useState(false)
  const [fileName, setFileName] = useState('')
  const [dirPath, setDirPath] = useState(undefined)
  const [createFolder, setCreateFolder] = useState(false)
  const [author, setAuthor] = useState('')
  const [description, setDescription] = useState('')
  const editorRef = useRef()

  const [form] = Form.useForm();

  const {openNotification,openError, contextHolder} = useNotification()

  useEffect(() => {
    store.setHtml(null);
    contentLoader({store,name});
  }, [name])

  useEffect(() => {
    const save = async() => {
      if (store.saveModal == true)
        await saveChanges()
    }
    save()
  }, [store.saveModal])

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
        {store.treeLoad ? <Spin indicator={<LoadingOutlined style={{fontSize: '100px'}} spin />} fullscreen></Spin> : null}

        <div style={{width: '1150px', position: 'absolute', top: '0', display: 'flex', justifyContent: 'center'}}>
          <CKEditor ref={editorRef} config={editorConfig} editor={ClassicEditor} onReady={editor => {editorRef.current = editor;editor.setData(store.html); }}/>
        </div>

        { modalLoading && <Spin indicator={<LoadingOutlined style={{fontSize: '100px'}} spin />} fullscreen></Spin> }

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
              <Input onChange={(e) => setFileName(e.target.value)} maxLength={15} count={{maxLength: '15', show: 'true'}} placeholder="שם באנגלית (לצורך קישור)" style={{width: '350px'}} ></Input>
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

        <FloatButton onClick={deletePage} style={{marginLeft: '20px', bottom: '125px'}} icon={<DeleteOutlined style={{fontSize: '24px'}} />} />

      </>
    )
  
  async function saveChanges() {

    setModalLoading(true);


    const usersCollection = collection(db, "users");
    const userDoc = doc(usersCollection, auth.currentUser.uid);
    const pages = collection(userDoc, "pages");
    // create a new document in the pages collection

    // get data from enText doc and save doc fields to heText and enText vars
    let he;
    let en;
    await getDoc(doc(pages, name)).then((doc) => {
      he = doc.data().he
      en = doc.data().name
    })
    .catch((error) => {
      console.log('error', error)
      openError('שגיאה', 'שגיאה בשמירת העמוד')
    })

    const html = editorRef.current.getData()
    const jsxData = htmlToJsx(html)


    try {
      await setDoc(doc(pages, name), {
        he: he,
        name: en,
        status: 'saved in user',
        content: jsxData,
        html: html,
      })
      openNotification('התהליך הושלם', '!העמוד נשמר בהצלחה')
    }

    catch (error) {
      console.log('error', error)
      openError('שגיאה', 'שגיאה בשמירת העמוד')
    }

    finally {
      setModalLoading(false);
      store.setSaveModal(false)
    }

  }

  async function postChanges() {
    setModalLoading(true);

    const htmlData = editorRef.current.getData();
    const jsxData = htmlToJsx(htmlData);
    const newFilePath = dirPath + '/' + fileName;

    try { // validate form
      await form.validateFields();
    }
    catch (error) {
      setModalLoading(false);
      return;
    }
    await postToGit(jsxData, htmlData, newFilePath, fileName, heText, author, description, createFolder, setModalLoading, store)

  }

  async function deletePage() {
    const usersCollection = collection(db, "users");
    const userDoc = doc(usersCollection, auth.currentUser.uid);
    const pages = collection(userDoc, "pages");
    
    try {
      await deleteDoc(doc(pages, name))
      navigate('/')
    }
    catch (error) {
      openError('שגיאה', 'שגיאה במחיקת העמוד')
    }

  }

}) // ! end of function

async function contentLoader({store,name}) { // this function uses fetchPath to fetch the data from the database and then sets the jsx state to the content of the file for initial load

  const data = await fetchPath({name})

  store.setHtml(data.html)
}

async function fetchPath({name}) { // this function fetches the data from firebase according to name variable (that is the :name parameter url and the page name)
  const usersCollection = collection(db, 'users');

  // wait for the user to be authenticated
  while (auth.currentUser === null) {
    await new Promise(r => setTimeout(r, 1000))
  }
  const userDoc = doc(usersCollection, auth.currentUser.uid);
  const pages = collection(userDoc, 'pages');
  const pageDoc = doc(pages, name);

  const docSnap = await getDoc(pageDoc);
  const data = docSnap.data();

  return data;
}

export default EditSaved