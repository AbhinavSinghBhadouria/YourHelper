
import { createBrowserRouter, Navigate } from "react-router-dom";
import Register from "./features/auth/pages/Register";
import Login from "./features/auth/pages/Login";
import Protected from "./features/auth/components/Protected";
import Home from "./features/interview/pages/Home";
import Interview from "./features/interview/pages/interview";
import LandingPage from "./features/interview/pages/LandingPage";
import Blog from "./features/interview/pages/Blog";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/blog",
    element: <Blog />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/dashboard",
    element: (<Protected>
      <Home />
    </Protected>),
  },
  {
    path: "/interview/:interviewId",
    element: (<Protected>
      <Interview />
    </Protected>),
  },
]);
