import { Outlet, Link } from "react-router-dom";
import { Layout, Menu } from "antd";
import {getFirestore ,collection,getDocs} from 'firebase/firestore'
import app from './firebase'
import {useEffect, useState} from 'react'
import { LoadingOutlined } from "@ant-design/icons";
import {Divider} from 'antd'
import documentation from './assets/documentation.png'
// ! github personal access token: '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'

function App() {
  const {Sider, Content} = Layout
  const [pages, setPages] = useState(null);

  useEffect(() => {
    fetchPages().then(data => setPages(data));
  }, []);

  const siderStyle = {
    height: '100vh',
    overflow: 'auto',
    overflowX: 'hidden',
    position: 'fixed',
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 1000,
  }

  const loaderStyle = {
    fontSize: '100px',
    display: 'flex',
    justifyContent: 'center',
    marginTop: '24px',
    height: '100%'
  }

  return (
    <>
      <Layout hasSider>

        <Sider style={siderStyle} width='300px' theme="light">

          <div style={{color: 'black', display: 'flex', justifyContent: 'center'}}>
            <h1 style={{margin: '0'}}>תפריט</h1>
          </div>

          <Menu
          theme="light"
          mode="inline"
          >
            <Menu.Item key="new" style={{textAlign: 'center', justifyContent: 'center', fontSize: '1.5rem'}}>
              <Link to="/create" >+</Link>
            </Menu.Item>
            {pages && pages.map(page => (
              <Menu.Item key={page.key}>
                <Link to={page.path}>{page.label}</Link>
              </Menu.Item>
            ))}

          </Menu>

          {!pages && <LoadingOutlined style={loaderStyle} /> }

          <div style={{paddingBottom: '20px',position: 'sticky', bottom: '0', width: '100%', textAlign: 'center', backgroundColor: 'white'}}>
            <Divider />

            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
              <img src={documentation} alt="documentation" style={{width: '40px', marginRight: '-20px', right: '30px', position: 'absolute'}} />
              <div style={{fontSize: '1.2rem'}}>עריכת עמודים</div>
            </div>
          </div>

        </Sider>

        
        <Layout style={{marginRight: 300, caretColor: 'black !important'}}>
          <Content>
            <div>
              <Outlet />
            </div>
          </Content>
        </Layout>

        
      </Layout>
    </>
  );
}

// function SideBar() {

//   const [pages, setPages] = useState(null);

//   useEffect(() => {
//     fetchPages().then(data => setPages(data));
//   }, []);


//   return (
//     <>
//       {pages && pages.map(page => (
//         <Menu.Item key={page.key}>
//           <Link to={page.path}>{page.label}</Link>
//         </Menu.Item>
//       ))}
//     </>
//   )
// }

async function fetchPages() {
  const db = getFirestore(app);

  const pagesRef = collection(db, 'files');
  const pagesSnapshot = await getDocs(pagesRef);
  const pagesList = pagesSnapshot.docs.map(doc => doc.data());
  // from pagesList, extract the hebrew name called 'HE' and the english name called 'name' and put it into a new object
  const pages = pagesList.map((page, index) => ({key: String(index+1), label: page.HE, path: `./${page.name}`}))
  return pages;
}

export default App