import {auth} from './firebase.js'
import app from './firebase.js'
import {RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import {Modal, Form, InputNumber, Input, Button} from 'antd'
import {useState,useEffect, useContext} from 'react'
import PropTypes from 'prop-types'
import { getFirestore, collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { MobXProviderContext } from 'mobx-react';



const db = getFirestore(app)


// eslint-disable-next-line react/prop-types
function LoginModal({modalOpen, setModalOpen, setNumber, number, signedIn}) {
  const [form] = Form.useForm();
  const [smsCode, setSmsCode] = useState(''); // this is the sms code that the user will enter
  const [smsSent, setSmsSent] = useState(false); // this is used to determine whether to show the sms code input or not, after sms was sent
  const [result , setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (modalOpen){
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'getSms-button', {
        size: 'invisible',
        callback: (response) => {
          console.log('recaptcha puzzle success')
        },
      })
    }
  }, [modalOpen])

  return (

    <Modal footer={false} open={modalOpen} onCancel={() => setModalOpen(false)} centered width="400px" okText="התחבר">

      { !smsSent && 
        <>
          <h3 style={{textAlign: 'center'}}>הזן מספר טלפון</h3>

          <Form form={form}>
            <Form.Item name="phone" validateTrigger="onBlur"
              rules={[
                {
                  required: true,
                  message: 'אנא הכנס מספר טלפון',
                },
                {
                  validator: (_, value) =>
                    value && value.toString().length !== 9
                      ? Promise.reject('אנא הכנס מספר תקין')
                      : Promise.resolve(),
                },
              ]}>
              <InputNumber size="large" controls={false} maxLength={9} addonAfter="972+"  onChange={(e) => setNumber(e)} placeholder="501234567" style={{dir: 'ltr !important', textAlign: 'end !important'}} />
            </Form.Item>

          </Form>

          <Button loading={loading} id="getSms-button" type="primary" style={{position: 'absolute', left: '10px', bottom: '10px'}} onClick={getSms} >קבל סמס</Button>
        </>
      }

      { smsSent &&
        <>
          <Form form={form}>
            <Form.Item label="קוד" validateFirst={true} validateTrigger="onBlur" name="סמס" 
            rules={[
              {required: true, message: "אנא הזן סמס"},
              {
                validator: (_, value) =>
                  value && value.toString().length !== 6
                    ? Promise.reject('אנא הכנס מספר תקין')
                    : Promise.resolve(),
              },
              {
                pattern: new RegExp(/^[0-9\b]+$/),
                message: 'אנא הכנס ספרות בלבד'
              }
            ]}>
              <Input maxLength={6} size="large" placeholder="123456" onChange={(e) => setSmsCode(e.target.value)} style={{dir: 'ltr !important', textAlign: 'end !important', width: '150px'}}  />
            </Form.Item>
          </Form>

          <Button loading={loading} type="primary" style={{position: 'absolute', left: '10px', bottom: '10px'}} onClick={logIn} >התחבר</Button>
        </>
      }

    </Modal>

  )

  async function getSms() {
    if (!await isFormValid()) {
      return;
    }

    const phoneNumber = concatPhone(number)
    const appVerifier = window.recaptchaVerifier;

    let confirmationResult;
    try {
      setLoading(true)
      confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setResult(confirmationResult)
      console.log('sms sent to user successfully')
      setSmsSent(true) // switch to OTP screen
      setLoading(false)
    }
    catch(error) {
      console.log('error sending code to user:', error)
      window.recaptchaVerifier.render().then(function(widgetId) {
        window.recaptchaVerifier.reset(widgetId);
      });
    }
  }

  async function logIn() {

    if (!await isFormValid()) {
      return;
    }

    try {
      setLoading(true)
      let userCredential = await result.confirm(smsCode)
      console.log('logged in successfully', )
    }
    catch(error) {
      console.log('error confirming code/initializing firestore:', error)
    }
    // check if user exists in db, if not, add him

    if (!await userExists()) { // if user doesn't exist in db, add him
      try {
        await addUserToDb()
        setModalOpen(false)
        console.log('user added to db successfully')
      }
      catch(error) {
        console.log('error adding user to db:', error)
      }
      finally {
        setLoading(false)
      }
    }
    else 
      setLoading(false)

  }

  async function addUserToDb() {
    const phoneNumber = concatPhone(number)
    const usersRef = collection(db, 'users');
    // create a new user in the collection if it doesn't exist, name should be auth.currentUser.uid
    const docRef = doc(usersRef, auth.currentUser.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.data()) {
      await setDoc(docRef, {
        phoneNumber: phoneNumber,
        isAdmin: false,
      });
    }

  }

  async function userExists() {
    const usersRef = collection(db, 'users');
    const docRef = doc(usersRef, auth.currentUser.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return true;
    }
    else {
      return false;
    }
  }

  async function isFormValid() {
    try {
      await form.validateFields();
      return true;
    }
    catch(error) {
      console.log('forms values invalid')
      return false;
    }
  }

  function concatPhone(number) { // concat +972 to the phone number and set it to it
    return `+972${number}`
  }


} // ! end of node











LoginModal.propTypes = {
  modalOpen: PropTypes.bool,
  setModalOpen: PropTypes.func,
  setNumber: PropTypes.func,
  signedIn: PropTypes.bool,
}

export default LoginModal
