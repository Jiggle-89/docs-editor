import { useState, useEffect, useContext, useRef } from 'react'
import {useNavigate} from 'react-router-dom'
import { observer } from 'mobx-react';
import { MobXProviderContext } from 'mobx-react'
import './index.css'
import './mdxeditor.css'
// Firebase imports removed - using localStorage instead
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
// Firebase database reference removed - using localStorage instead

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

    try {
      // Get current draft data to preserve existing fields
      const draftKey = `draft_${name}`;
      const existingDraft = localStorage.getItem(draftKey);
      let existingData = {};
      
      if (existingDraft) {
        existingData = JSON.parse(existingDraft);
      }

      const html = editorRef.current.getData()
      const jsxData = htmlToJsx(html)

      // Update draft with new content while preserving existing metadata
      const updatedDraftData = {
        ...existingData,
        he: existingData.he || heText,
        name: existingData.name || name,
        status: 'draft',
        content: jsxData,
        html: html,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(draftKey, JSON.stringify(updatedDraftData));
      
      // Trigger custom event to update saved pages list
      window.dispatchEvent(new CustomEvent('localStorageChanged'));
      
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
    try {
      const draftKey = `draft_${name}`;
      localStorage.removeItem(draftKey);
      
      // Trigger custom event to update saved pages list
      window.dispatchEvent(new CustomEvent('localStorageChanged'));
      
      openNotification('העמוד נמחק', 'הטיוטה נמחקה בהצלחה');
      navigate('/');
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

async function fetchPath({name}) { // this function fetches the data from localStorage according to name variable
  try {
    const draftKey = `draft_${name}`;
    const draftData = localStorage.getItem(draftKey);
    
    if (!draftData) {
      throw new Error(`Draft '${name}' not found in localStorage`);
    }
    
    const data = JSON.parse(draftData);
    return data;
  } catch (error) {
    console.error('Error fetching draft from localStorage:', error);
    throw error;
  }
}

export default EditSaved