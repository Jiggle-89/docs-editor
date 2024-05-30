import {React} from 'react'
import {auth} from './firebase'
import {onAuthStateChanged} from 'firebase/auth'
import { Outlet, Link, useNavigate } from "react-router-dom";
import { Layout, Menu } from "antd";
import {getFirestore ,collection,getDocs, doc, getDoc} from 'firebase/firestore'
import app from './firebase'
import {useEffect ,useState, useContext, useRef} from 'react'
import FetchData from './FetchData';
import savedPages from './SavedPages';
import LoginModal from './LoginModal';
import { LoadingOutlined, FileOutlined, SearchOutlined, UserOutlined, LogoutOutlined, SaveOutlined, UploadOutlined } from "@ant-design/icons";
import { Input, Empty, FloatButton, Tabs, Tour } from 'antd'
import documentation from './assets/documentation.png'
import { MobXProviderContext } from 'mobx-react';

function useStores() {
  return useContext(MobXProviderContext)
}

const db = getFirestore(app)

function App() {
  const navigate = useNavigate();
  const {Sider, Content} = Layout
  const [siderPages, setSiderPages] = useState(null);
  const [filtered, setFiltered] = useState(null); // this is the filtered list of pages that will be displayed in the sider menu after search
  const [collapsed, setCollapsed] = useState(false);
  const [ready, setReady] = useState(false);
  const [search, setSearch] = useState('');
  const [number, setNumber] = useState(''); // phone number of the user for the login modal
  const [modalOpen, setModalOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [tabKey, setTabKey] = useState('1');
  const [cachedPages, setCachedPages] = useState(null);
  const unsubscribeRef = useRef(null);

  const homeRef = useRef(null);
  const tabsRef = useRef(null);
  const searchRef = useRef(null);


  const {store} = useStores()
  
  useEffect(() => {
    execute(); // execute all async functions on load
    isSignedIn();
  }, []);

  useEffect(() => {
    if (signedIn){
      unsubscribeRef.current = savedPages(setCachedPages);
    }

    // Clean up the listener when the component unmounts
    return () => {
      if (typeof unsubscribeRef.current === 'function') {
        unsubscribeRef.current();
      }
    };
  }, [signedIn])

  useEffect(() => {
    if (siderPages) {
      setFiltered(siderPages)
      setFiltered(searchFilter(siderPages))
    }
    if (search.length < 2) {
      setFiltered(siderPages)
    }
  }, [search])

  useEffect(() => {
    // if collapsed, set the display of the class 'ant-tabs-nav-wrap' to none
    if (collapsed) {
      document.querySelector('.ant-tabs-nav-wrap').style.display = 'none'
    }
    else {
      document.querySelector('.ant-tabs-nav-wrap').style.display = 'block'
    }
  }, [collapsed])

  const siderStyle = {
    height: '100vh',
    position: 'fixed',
    overflow: 'auto',
    overflowX: 'hidden',
    top: 0,
    zIndex: 1000,
  }

  const loaderStyle = {
    fontSize: '100px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '50px',
  }

  const layoutStyle = {
    marginRight: collapsed ?  '90px' : '350px',
    transition: 'margin-right 0.3s linear',
    caretColor: 'black !important',
    width: collapsed ? 'calc( 100vw - 90px )' : 'calc( 100vw - 350px )',
    height: '100vh',
  }

  const searchBoxStyle = {
    paddingBottom: '5px',
    position: 'fixed',
    bottom: 40,
    width: collapsed ? '80px' :'350px',
    zIndex: 1000,
    display: tabKey === '1' ? 'block' : 'none', // conditionally render the search box if it's on tab 1
  }

  const titleContainerStyle = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: '15px',
    marginBottom: '15px',
  }

  const titleStyle = {
    opacity: collapsed ? 0 : 1,
    transition: 'opacity 0.1s ease-in-out',
    fontSize: '1.4rem',
    marginRight: '50px',
    whiteSpace: 'nowrap',
  }

  const imageStyle = {
    width: '50px',
    marginRight: '15px',
    cursor: 'pointer',
  }

  const searchItems = [
    {
      label: <Input onChange={(e) => searchLimiter(e)} placeholder="חיפוש..." />,
      icon: <SearchOutlined/>
    }
  ]

  const searchLimiter = (e) => { // this function makes it necessary to type at least 2 letters before searching
    if (e.target.value.length >= 2) {
      setSearch(e.target.value)
    }
    if (e.target.value.length === 0) {
      setSearch('')
    }
  }

  const ExistingPages = () => {
    return (
      <>
        <Link to="/create" style={{color: 'black', display: 'flex', justifyContent: 'center', fontSize: '1.5rem'}}>+</Link>
        <Menu
          theme="light"
          mode="inline"
          style={{paddingBottom: '92px'}}
          items={filtered}
        />

        {!ready && <LoadingOutlined style={loaderStyle} /> }

        {ready && filtered?.length === 0 && <Empty description='לא נמצאו נתונים' /> }
      </>
    )
  }

  const SavedPages = () => {
    cachedPages?.forEach((page) => {
      page.label = <Link to={`/edit-saved/${page.name}`}>{page.he}</Link>
      page.icon = <FileOutlined />
    })

    if (cachedPages === false) {
      return <LoadingOutlined style={loaderStyle} />
    }
    else
      return (
        <>
          <Link to="/create" style={{color: 'black', display: 'flex', justifyContent: 'center', fontSize: '1.5rem'}}>+</Link>

          <Menu
            theme="light"
            mode="inline"
            style={{paddingBottom: '92px'}}
            items={cachedPages}
          />
        </> 
      )
  }

  const tabItems = [
    {
      label: 'עמודי לומדה',
      key: '1',
      children: <ExistingPages />
    },
    {
      label: 'העמודים שלי',
      key: '2',
      children: <SavedPages />,
      // disable the tab if the user isn't signed in or if he is signed in but savedPages is empty
      disabled: !signedIn
    }
  ]

  const tourSteps = [
    {
      title: 'חזרה לדף בית',
      description: 'לחץ על האייקון כדי לחזור לדף הבית',
      target: () => homeRef.current,
    },
    {
      title: 'החלפת תצוגה',
      description: 'לחץ כדי להחליף בין עמודי הלומדה לעמודי השמירה שלך',
      target: () => tabsRef.current,
    },
    {
      title: 'חיפוש',
      description: 'השתמש בחיפוש כדי למצוא עמוד במהירות',
      target: () => searchRef.current,
    }
  ]

  return (
    <>
      <Layout>

        <Tour steps={tourSteps} open={store.showTour} onRequestClose={() => store.setShowTour(false)} />

        <Sider onCollapse={(value) => setCollapsed(value)} collapsible reverseArrow collapsed={collapsed} style={siderStyle} width='350px' theme="light">

          <div style={titleContainerStyle}>
            <img ref={homeRef} src={documentation} alt="documentation" style={imageStyle} onClick={() => navigate('/')}  />

            <div style={titleStyle}>
              עריכת עמודים
            </div>
          </div>

          <div ref={tabsRef}>
            <Tabs items={tabItems} defaultActiveKey='1' onChange={(key) => setTabKey(key)} />
          </div>
          
          <Menu ref={searchRef} onClick={() => setCollapsed(false)} theme="light" items={searchItems} mode="inline" style={searchBoxStyle} selectable={false} />

        </Sider>

        <Layout style={layoutStyle}>
          <Content>
            <Outlet/>
          </Content>
        </Layout>

        { !signedIn &&
          <>
            <FloatButton type="primary" onClick={(e) =>  {e.stopPropagation();setModalOpen(true)}} icon={<UserOutlined />} style={{marginLeft: '20px'}} />
            <LoginModal signedIn={signedIn} modalOpen={modalOpen} setModalOpen={setModalOpen} setNumber={setNumber} number={number} />
          </>
        }
        { signedIn &&
          <>
            <FloatButton.Group
              trigger="click"
              style={{marginLeft: '40px'}}
              icon={<UserOutlined />}
              >
              <FloatButton icon={<UploadOutlined />} tooltip={<div>העלאה</div>} onClick={uploadModal} />
              <FloatButton icon={<SaveOutlined />} tooltip={<div>שמירה</div>} onClick={cacheModal} />
              <FloatButton icon={<LogoutOutlined />} onClick={async(e) => await signOut(e)} tooltip={<div>יציאה</div>} />
            </FloatButton.Group>
          </>
        }

      </Layout>

    </>
  );

  async function execute() { // this function executes all the async functions that need to be executed before the page loads (fetching, adding hebrew names)
    try {
      const content =  await fetch('https://git-api-push.vercel.app/sider-content')
      const json = await content.json()
      await addHebrewName(json)
      setSiderPages(json)
      setFiltered(json)
    }
    catch(error) {
      console.log('error fetching pages from firebase:', error)
    }
    finally {
      setReady(true)
    }
  }

  function flatten(items) { // this function's used to flatten (un-nest) the pages array (so that we can search through it)
    return items.reduce((flat, item) => { // flat is the new array we're unnesting to, item is each object in items
      flat.push(item);
      if (item.children) {
        flat.push(...flatten(item.children)); // if the item has children, we recursively call the function on the children and push them to flat
      }
      return flat; // return flat for the next iteration
    }, []);
  }
  
  function searchFilter(items) { // comfortably search through after flattening :)
    let flatItems = flatten(items);
    return flatItems.filter((item) => item.he.includes(search));
  }

  function isSignedIn() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setSignedIn(true)
        console.log('signed in: ' + user.phoneNumber)
        console.log('admin: ' + await isAdmin())
      }
      else {
        setSignedIn(false)
        console.log('not signed in')
      }
    });
  }

  async function isAdmin() { // check if current user is admin, by reading his own document in the users collection

    if (!auth.currentUser) {
      return false;
    }
    const usersCollection = collection(db, "users");
    const userDoc = doc(usersCollection, auth.currentUser.uid);
    const userDocSnap = await getDoc(userDoc);
    const data = userDocSnap.data();
    return data.isAdmin;
  }

  async function signOut(e) {

    await auth.signOut();
    navigate('/');
    
    setSignedIn(false)
    
  }

  async function uploadModal() {
    await FetchData({store}); // fetch the data, send the store cuz it can't be used there
    store.setModalVisible(true);
  }

  function cacheModal() {
    store.setSaveModal(true);
  }
  
} // ! end of function

async function addHebrewName(data) { // this function adds the hebrew names to the pages
  const db = getFirestore(app);
  const pagesRef = collection(db, "files");
  const pagesSnapshot = await getDocs(pagesRef);
  const pagesList = pagesSnapshot.docs.map((doc) => doc.data());

  const addHebrewNamesRecursive = (items) => {
    items.forEach((item) => {
      pagesList.forEach((page) => {
        if (item.title === page.name) {
          item.icon = <FileOutlined />;
          item.label = <Link to={`/edit/${page.name}`}>{page.HE}</Link>
          item.he = page.HE
        }

      });

      if (item.children) {
        addHebrewNamesRecursive(item.children); // Recursively process children
      }
    });
  };

  addHebrewNamesRecursive(data); // Start the recursive process
}

export default App