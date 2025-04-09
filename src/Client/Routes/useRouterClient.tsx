import { Navigate, Outlet, useLocation, useRoutes, useSearchParams } from "react-router-dom"
import MainLayout from "../Layout/MainLayout"
import { path } from "../../Constants/path"
import { lazy, Suspense, useContext } from "react"
import MainLayoutAuth from "../Layout/MainLayoutAuth"
import { AppContext } from "src/Context/authContext"
import { RoleType } from "src/Constants/enum"

const Home = lazy(() => import("../Pages/Home"))
const Login = lazy(() => import("../Pages/Login"))
const Register = lazy(() => import("../Pages/Register"))
const LoginGoogle = lazy(() => import("../Pages/LoginGoogle"))
const Cart = lazy(() => import("../Pages/Cart"))
const Profile = lazy(() => import("../Pages/Profile"))
const Collection = lazy(() => import("../Pages/Collection"))
const NotFound = lazy(() => import("../Pages/NotFound"))
const VerifyEmail = lazy(() => import("../Pages/VerifyEmail"))
const ForgotPassword = lazy(() => import("../Pages/ForgotPassword"))
const ResetPassword = lazy(() => import("../Pages/ResetPassword"))
const ProductDetail = lazy(() => import("../Pages/ProductDetail"))

const ProjectRouter = () => {
  const { isAuthenticated } = useContext(AppContext)
  const { pathname } = useLocation()
  return isAuthenticated ? <Outlet /> : <Navigate to={`${path.Login}?redirect_url=${encodeURIComponent(pathname)}`} />
}

const RejectRouter = () => {
  const { isAuthenticated, role } = useContext(AppContext)
  const [searchParams] = useSearchParams()
  if (!isAuthenticated) {
    return <Outlet />
  }
  const navigate = role === RoleType.ADMIN ? path.AdminDashboard : searchParams.get("redirect_url") || path.Home
  return <Navigate to={navigate} />
}

export default function useRouterClient() {
  const { role } = useContext(AppContext)
  const routerElement = useRoutes([
    {
      path: "",
      element: <MainLayout />,
      children: [
        {
          path: "",
          element: (
            <Suspense>
              <Home />
            </Suspense>
          )
        },
        {
          path: path.Home,
          element: (
            <Suspense>
              <Home />
            </Suspense>
          )
        },
        {
          path: path.ProductDetail,
          element: (
            <Suspense>
              <ProductDetail />
            </Suspense>
          )
        },
        {
          path: path.Collection,
          element: (
            <Suspense>
              <Collection />
            </Suspense>
          )
        },
        {
          path: path.VerifyEmail,
          element: (
            <Suspense>
              <VerifyEmail />
            </Suspense>
          )
        },
        {
          path: path.NotFound,
          element: (
            <Suspense>
              <NotFound role={role} />
            </Suspense>
          )
        }
      ]
    },
    {
      path: "",
      element: <ProjectRouter />,
      children: [
        {
          path: "",
          element: <MainLayout />,
          children: [
            {
              path: path.Cart,
              element: (
                <Suspense>
                  <Cart />
                </Suspense>
              )
            },
            {
              path: path.Profile,
              element: (
                <Suspense>
                  <Profile />
                </Suspense>
              )
            }
          ]
        }
      ]
    },
    {
      path: "",
      element: <RejectRouter />,
      children: [
        {
          path: "",
          element: <MainLayoutAuth />,
          children: [
            {
              path: path.Register,
              element: (
                <Suspense>
                  <Register />
                </Suspense>
              )
            },
            {
              path: path.Login,
              element: (
                <Suspense>
                  <Login />
                </Suspense>
              )
            },
            {
              path: path.LoginGoogle,
              element: (
                <Suspense>
                  <LoginGoogle />
                </Suspense>
              )
            },
            {
              path: path.ForgotPassword,
              element: (
                <Suspense>
                  <ForgotPassword />
                </Suspense>
              )
            },
            {
              path: path.ResetPassword,
              element: (
                <Suspense>
                  <ResetPassword />
                </Suspense>
              )
            }
          ]
        }
      ]
    }
  ])
  return routerElement
}

/**
 * Suspense là một công cụ quan trọng để cải thiện trải nghiệm khi sử dụng lazy loading trong React,
 * giúp quản lý giao diện chờ trong khi các thành phần lớn hoặc không thường xuyên được sử dụng đang tải.
 */
