import { createBrowserRouter } from "react-router-dom"
// pages
import { Home } from "./pages/home/Home"
// import { Cart } from "./pages/cart/Cart"
import Login  from "./pages/login/login"
import Register  from "./pages/register/register"
import { SuccessPage } from './pages/SuccessPage';
import { CancelPage } from './pages/CancelPage';
import { OrdersPage } from "./pages/Orders/OrdersPage";
// layout component
import { Layout } from "./components/layout/layout"

// Private route component
import { PrivateRoutes } from './routes/Private'

// Error page component
import { ErrorPage } from './pages/error'

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/login",
        element: <Login />
      },
      {
        path: "/register",
        element: <Register />
      },
      {
        path: "/",
        element: (<PrivateRoutes><Home /></PrivateRoutes>)
      },
      {
        path: "/cart",
        element: (<PrivateRoutes><CancelPage /></PrivateRoutes>)
      },
      {
        path: "orders",
        element: (<PrivateRoutes><OrdersPage /></PrivateRoutes>)
      },
      {
        path: "/success",
        element: (<PrivateRoutes><SuccessPage /></PrivateRoutes>)
      },
      {
        path: "*",
        element: <ErrorPage />
      }
    ]
  }
])