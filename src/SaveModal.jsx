import { observer } from "mobx-react";
import app from "./firebase";
import {auth} from './firebase'
import { Modal, Form, Button, Input } from "antd";
import { useState, useContext } from "react";
import { MobXProviderContext } from "mobx-react";
import { checkHeExists, checkDocExists } from "./Checks";
import { getFirestore, collection, doc, getDoc, setDoc, getDocs } from "firebase/firestore";

function useStores() {
  return useContext(MobXProviderContext)
}

const db = getFirestore(app);


const SaveModal = observer(({saveChanges, modalLoading, setEnText, setHeText, form}) => {
  const {store} = useStores()

  return (
    <>
      <Modal width="440px" okButtonProps={{htmlType: 'submit'}} confirmLoading={modalLoading} centered open={store.saveModal} onOk={saveChanges} onCancel={() => store.setSaveModal(false)}>

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
            <Input onChange={(e) => setEnText(e.target.value)} maxLength={15} count={{maxLength: '15', show: 'true'}} placeholder="שם באנגלית (לצורך קישור)" style={{width: '350px'}} ></Input>
          </Form.Item>

        </Form>

      </Modal>
    </>
  )

})

export default SaveModal;