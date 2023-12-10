import { Outlet, Link } from "react-router-dom";
import { Layout, Menu } from "antd";
import {getFirestore ,collection, doc, getDoc,getDocs} from 'firebase/firestore'
import app from './firebase'
import {useEffect, useState} from 'react'
// ! github personal access token: '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'

function App() {
  const {Sider, Content} = Layout
  const [pages, setPages] = useState(null);

  useEffect(() => {
    fetchPages().then(data => setPages(data));
  }, []);

  const siderStyle = {
    overflow: 'auto',
    height: '100vh',
    position: 'fixed',
    right: 0,
    top: 0,
    bottom: 0,
    direction: 'rtl',
    zIndex: 1000,
  }

  return (
    <>
      <Layout hasSider>

        <Sider style={siderStyle} width='300px' theme="light">

          <div className="menuTitle" style={{color: 'black', display: 'flex', justifyContent: 'center'}}>
            <h1 style={{margin: '0'}}>תפריט</h1>
          </div>

          <Menu
          theme="light"
          mode="inline"
          >
            {pages && pages.map(page => (
              <Menu.Item key={page.key}>
                <Link to={page.path}>{page.label}</Link>
              </Menu.Item>
            ))}
          </Menu>
        </Sider>

        
        <Layout style={{marginRight: 300, caretColor: 'black'}}>
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