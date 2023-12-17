import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import App from './App.jsx'
import EditFile from './EditFile.jsx'
import ErrorPage from './routes/error-page.jsx';
import HomePage from './HomePage.jsx'
import NewPage from './NewPage.jsx';
import './index.css'


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
        path: ":name", // match any route that starts with the file path, and its following children
        element: <EditFile />,
      },
      {
        path: '/create',
        element: <NewPage />,
      }
    ],

    errorElement: <ErrorPage />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)