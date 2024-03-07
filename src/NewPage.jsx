import {useRef, useState} from 'react'
import React from 'react'
import './index.css'
import './mdxeditor.css'
import {getFirestore, collection, doc, setDoc, serverTimestamp} from 'firebase/firestore'
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
    }

    catch (error) {
      console.log('error', error)
    }

    finally {
      setModalLoading(false);
    }

  }


  return (
    <>
      {contextHolder} {/* this is for the notification component */}
      {store.treeLoad ? <Spin indicator={<LoadingOutlined style={{fontSize: '100px'}} spin />} fullscreen></Spin> : null}

      <div style={{width: '1150px', position: 'absolute', top: '0', display: 'flex', justifyContent: 'center'}}>
        <CKEditor data={'<h1>דף חדש</h1>'} config={editorConfig} editor={ClassicEditor} ref={editorRef} onReady={editor => editorRef.current = editor}  />
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

    await postToGit(jsxData, htmlData, newFilePath, name, heText, author, description, createFolder, setModalLoading, store)

  }
  
})

export default NewPage