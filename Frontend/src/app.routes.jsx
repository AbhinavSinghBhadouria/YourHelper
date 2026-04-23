
import { createBrowserRouter, Navigate } from "react-router-dom";
import Register from "./features/auth/pages/Register";
import Login from "./features/auth/pages/Login";
import Protected from "./features/auth/components/Protected";
import Home from "./features/interview/pages/Home";
import Interview from "./features/interview/pages/interview";
import LandingPage from "./features/interview/pages/LandingPage";
import Blog from "./features/interview/pages/Blog";
import Pricing from "./features/interview/pages/Pricing";
import Analytics from "./features/interview/pages/Analytics";
import AILimitError from "./pages/AILimitError";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/error/ai-limit",
    element: <AILimitError />,
  },
  {
    path: "/blog",
    element: <Blog />,
  },
  {
    path: "/pricing",
    element: <Pricing />,
  },
  {
    path: "/analytics",
    element: (<Protected>
      <Analytics />
    </Protected>),
  },
  {
    // Redirect /features → landing page until a Features page is built
    path: "/features",
    element: <Navigate to="/" replace />,
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
