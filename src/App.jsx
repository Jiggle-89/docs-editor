import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu } from "antd";
import { useEffect, useState, useContext, useRef } from "react";
import savedPages from "./SavedPages";
import {
  LoadingOutlined,
  FileOutlined,
  SearchOutlined,
  SaveOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Input, Empty, FloatButton, Tabs, Tour } from "antd";
import documentation from "./assets/documentation.png";
import { MobXProviderContext } from "mobx-react";

function useStores() {
  return useContext(MobXProviderContext);
}


function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { Sider, Content } = Layout;
  const [siderPages, setSiderPages] = useState(null);
  const [filtered, setFiltered] = useState(null); // this is the filtered list of pages that will be displayed in the sider menu after search
  const [collapsed, setCollapsed] = useState(false);
  const [ready, setReady] = useState(false);
  const [search, setSearch] = useState("");
  const [tabKey, setTabKey] = useState("1");
  const [cachedPages, setCachedPages] = useState(null);
  const unsubscribeRef = useRef(null);

  const homeRef = useRef(null);
  const tabsRef = useRef(null);
  const searchRef = useRef(null);

  const { store } = useStores();

  useEffect(() => {
    execute(); // execute all async functions on load
  }, []);

  useEffect(() => {
    // Load saved pages from localStorage
    unsubscribeRef.current = savedPages(setCachedPages);

    // Clean up the listener when the component unmounts
    return () => {
      if (typeof unsubscribeRef.current === "function") {
        unsubscribeRef.current();
      }
    };
  }, []);

  useEffect(() => {
    if (siderPages) {
      setFiltered(siderPages);
      setFiltered(searchFilter(siderPages));
    }
    if (search.length < 2) {
      setFiltered(siderPages);
    }
  }, [search]);

  useEffect(() => {
    // if collapsed, set the display of the class 'ant-tabs-nav-wrap' to none
    if (document.querySelector(".ant-tabs-nav-wrap")) {
      if (collapsed) {
        document.querySelector(".ant-tabs-nav-wrap").style.display = "none";
      } else {
        document.querySelector(".ant-tabs-nav-wrap").style.display = "block";
      }
    }
  }, [collapsed]);

  const siderStyle = {
    height: "100vh",
    position: "fixed",
    overflow: "auto",
    overflowX: "hidden",
    top: 0,
    zIndex: 1000,
  };

  const loaderStyle = {
    fontSize: "100px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "50px",
  };

  const layoutStyle = {
    marginRight: collapsed ? "90px" : "350px",
    transition: "margin-right 0.3s linear",
    caretColor: "black !important",
    width: collapsed ? "calc( 100vw - 90px )" : "calc( 100vw - 350px )",
    height: "100vh",
  };

  const searchBoxStyle = {
    paddingBottom: "5px",
    position: "fixed",
    bottom: 40,
    width: collapsed ? "80px" : "350px",
    zIndex: 1000,
    display: tabKey === "1" ? "block" : "none", // conditionally render the search box if it's on tab 1
  };

  const titleContainerStyle = {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginTop: "15px",
    marginBottom: "15px",
  };

  const titleStyle = {
    opacity: collapsed ? 0 : 1,
    transition: "opacity 0.1s ease-in-out",
    fontSize: "1.4rem",
    marginRight: "50px",
    whiteSpace: "nowrap",
  };

  const imageStyle = {
    width: "50px",
    marginRight: "15px",
    cursor: "pointer",
  };

  const searchItems = [
    {
      label: <Input onChange={(e) => searchLimiter(e)} placeholder="חיפוש..." />,
      icon: <SearchOutlined />,
    },
  ];

  const searchLimiter = (e) => {
    // this function makes it necessary to type at least 2 letters before searching
    if (e.target.value.length >= 2) {
      setSearch(e.target.value);
    }
    if (e.target.value.length === 0) {
      setSearch("");
    }
  };

  const ExistingPages = () => {
    return (
      <>
        <Link
          to="/create"
          style={{
            color: "black",
            display: "flex",
            justifyContent: "center",
            fontSize: "1.5rem",
          }}
        >
          +
        </Link>
        <Menu
          theme="light"
          mode="inline"
          style={{ paddingBottom: "92px" }}
          items={filtered}
        />

        {!ready && <LoadingOutlined style={loaderStyle} />}

        {ready && filtered?.length === 0 && <Empty description="לא נמצאו נתונים" />}
      </>
    );
  };

  const SavedPages = () => {
    if (cachedPages === null) {
      return <LoadingOutlined style={loaderStyle} />;
    }

    if (cachedPages && cachedPages.length > 0) {
      cachedPages.forEach((page) => {
        page.label = <Link to={`/edit-saved/${page.name}`}>{page.he}</Link>;
        page.icon = <FileOutlined />;
      });
    }

    return (
      <>
        <Link
          to="/create"
          style={{
            color: "black",
            display: "flex",
            justifyContent: "center",
            fontSize: "1.5rem",
          }}
        >
          +
        </Link>

        {cachedPages && cachedPages.length > 0 ? (
          <Menu
            theme="light"
            mode="inline"
            style={{ paddingBottom: "92px" }}
            items={cachedPages}
          />
        ) : (
          <Empty description="אין טיוטות שמורות" />
        )}
      </>
    );
  };

  const tabItems = [
    {
      label: "עמודי לומדה",
      key: "1",
      children: <ExistingPages />,
    },
    {
      label: "העמודים שלי",
      key: "2",
      children: <SavedPages />,
      // No longer disabled - localStorage drafts don't require authentication
    },
  ];

  const tourSteps = [
    {
      title: "חזרה לדף בית",
      description: "לחץ על האייקון כדי לחזור לדף הבית",
      target: () => homeRef.current,
    },
    {
      title: "החלפת תצוגה",
      description: "לחץ כדי להחליף בין עמודי הלומדה לעמודים השמורים שלך",
      target: () => tabsRef.current,
    },
    {
      title: "חיפוש",
      description: "השתמש בחיפוש כדי למצוא עמוד במהירות",
      target: () => searchRef.current,
    },
  ];

  return (
    <>
      <Layout>
        <Sider
          onCollapse={(value) => setCollapsed(value)}
          collapsible
          reverseArrow
          collapsed={collapsed}
          style={siderStyle}
          width="350px"
          theme="light"
        >
          <div style={titleContainerStyle}>
            <img
              ref={homeRef}
              src={documentation}
              alt="documentation"
              style={imageStyle}
              onClick={() => navigate("/")}
            />

            <div style={titleStyle}>עריכת עמודים</div>
          </div>

          <div ref={tabsRef}>
            <Tabs items={tabItems} defaultActiveKey="1" onChange={(key) => setTabKey(key)} />
          </div>

          <div ref={searchRef} style={searchBoxStyle}>
            <Menu
              onClick={() => setCollapsed(false)}
              theme="light"
              items={searchItems}
              mode="inline"
              selectable={false}
            />
          </div>
        </Sider>

        <Layout style={layoutStyle}>
          <Content>
            <Outlet />
          </Content>
        </Layout>

        <FloatButton.Group
          trigger="click"
          style={{ marginLeft: "40px" }}
          icon={<UploadOutlined />}
        >
          <FloatButton
            icon={<UploadOutlined />}
            tooltip={<div>העלאה</div>}
            onClick={uploadModal}
          />
          <FloatButton
            icon={<SaveOutlined />}
            tooltip={<div>שמירה</div>}
            onClick={cacheModal}
          />
        </FloatButton.Group>
      </Layout>

      <Tour
        steps={tourSteps}
        open={store.showTour}
        onClose={() => store.setShowTour(false)}
      />
    </>
  );

  // =================================================================
  // ===== השינוי המרכזי נמצא כאן ===================================
  // =================================================================
  async function execute() {
    console.log("Renderer: מבקש את המידע המשולב מהתהליך הראשי...");
    try {
      // 1. קריאה אחת פשוטה ל-API שהכנו ב-main.mjs
      const mergedData = await window.api.getSiderContent();

      // 2. בדיקת שגיאות שהגיעו מהתהליך הראשי
      if (mergedData && mergedData.error) {
        throw new Error(mergedData.error);
      }
      
      // 3. הוספת רכיבי React (אייקון ותגית Link) לנתונים שהתקבלו.
      //    השמות העבריים (he) כבר קיימים, אין צורך לקרוא לפונקציית העזר הישנה.
      const addReactComponentsRecursive = (items) => {
        if (!items) return;
        items.forEach((item) => {
          if (item.title) {
            item.icon = <FileOutlined />;
            item.label = <Link to={`/edit/${item.title}`}>{item.he || item.title}</Link>;
          }
          if (item.children) {
            addReactComponentsRecursive(item.children);
          }
        });
      };
      
      addReactComponentsRecursive(mergedData);

      // 4. עדכון ה-state עם המידע המוכן להצגה
      setSiderPages(mergedData);
      setFiltered(mergedData);
      
      // 5. עדכון ה-store עם נתוני העץ עבור ה-TreeSelect
      store.setTree(mergedData);

    } catch (error) {
      console.log("error fetching content from local files:", error);
    } finally {
      setReady(true);
    }
  }

  function flatten(items) {
    // this function's used to flatten (un-nest) the pages array (so that we can search through it)
    return items.reduce((flat, item) => {
      // flat is the new array we're unnesting to, item is each object in items
      flat.push(item);
      if (item.children) {
        flat.push(...flatten(item.children)); // if the item has children, we recursively call the function on the children and push them to flat
      }
      return flat; // return flat for the next iteration
    }, []);
  }

  function searchFilter(items) {
    // comfortably search through after flattening :)
    let flatItems = flatten(items);
    // הוספת בדיקה ש-item.he קיים לפני שמנסים לגשת אליו
    return flatItems.filter((item) => item.he && item.he.includes(search));
  }


  async function uploadModal() {
    store.setModalVisible(true);
  }

  function cacheModal() {
    store.setSaveModal(true);
  }
} // ! end of function

// הפונקציה הזו הוסרה מכיוון שהלוגיקה שלה עברה לתהליך הראשי (main.mjs)
// והחלק של הוספת השמות העבריים מתבצע שם.

export default App;
