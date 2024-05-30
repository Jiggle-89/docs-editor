import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter,RouterProvider} from "react-router-dom";
import { Provider } from 'mobx-react';
import Store from './Store.jsx';
import App from './App.jsx'
import Admin from './Admin.jsx'
import EditFile from './EditFile.jsx'
import EditSaved from './EditSaved.jsx'
import ErrorPage from './routes/error-page.jsx'
import HomePage from './HomePage.jsx'
import NewPage from './NewPage.jsx'
import heIL from 'antd/locale/he_IL'
import {ConfigProvider} from 'antd'
import './index.css'

const store = new Store();

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "/edit", // match any route that starts with the file path, and its following children
        children: [
          {
            path: ":name",
            element: <EditFile />,
          },
        ],
      },
      {
        path: '/edit-saved',
        children: [
          {
            path: ':name',
            element: <EditSaved />
          }
        ]
      },
      {
        path: '/create',
        element: <NewPage />,
      },
      {
        path: '/admin',
        element: <Admin />,
      }
    ],


    errorElement: <ErrorPage />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <ConfigProvider locale={heIL} direction="rtl">
        <RouterProvider router={router} />
      </ConfigProvider>
    </Provider>
  </React.StrictMode>
)