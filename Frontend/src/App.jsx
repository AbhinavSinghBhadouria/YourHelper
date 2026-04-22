
import React from 'react'
import { RouterProvider } from 'react-router'
import { router } from './app.routes'
import { AuthProvider } from './features/auth/authContext.jsx'
import { InterviewProvider } from './features/interview/interview.context.jsx'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {


  return (
    <AuthProvider>
      <InterviewProvider>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          theme="dark"
        />

        <RouterProvider router={router} />
      </InterviewProvider>
    </AuthProvider>
  )
}
export default App