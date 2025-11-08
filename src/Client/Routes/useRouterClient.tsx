import { Navigate, Outlet, useLocation, useRoutes, useSearchParams } from "react-router-dom"
import MainLayout from "../Layout/MainLayout"
import UserLayout from "../Pages/User/Layout/UserLayout"
import MainLayoutAuth from "../Layout/MainLayoutAuth"
import { path } from "../../Constants/path"
import { lazy, Suspense, useContext, useEffect, useRef } from "react"
import { AppContext } from "src/Context/authContext"
import { rolesForApi } from "src/Helpers/role_permission"
import { toast } from "react-toastify"

const Home = lazy(() => import("../Pages/Home"))
const Login = lazy(() => import("../Pages/Login"))
const Register = lazy(() => import("../Pages/Register"))
const LoginGoogle = lazy(() => import("../Pages/LoginGoogle"))
const Cart = lazy(() => import("../Pages/Cart"))
const Collection = lazy(() => import("../Pages/Collection"))
const NotFound = lazy(() => import("../Pages/NotFound"))
const VerifyEmail = lazy(() => import("../Pages/VerifyEmail"))
const ForgotPassword = lazy(() => import("../Pages/ForgotPassword"))
const ResetPassword = lazy(() => import("../Pages/ResetPassword"))
const ProductDetail = lazy(() => import("../Pages/ProductDetail"))
const Order = lazy(() => import("../Pages/Order"))
const InfoOrder = lazy(() => import("../Pages/InfoOrder"))
const PaymentSuccessVNPay = lazy(() => import("../Pages/PaymentSuccessVNPay"))
const PaymentSuccessCod = lazy(() => import("../Pages/PaymentSuccessCod"))
const ChangePassword = lazy(() => import("../Pages/User/Pages/ChangePassword"))
const Profile = lazy(() => import("../Pages/User/Pages/Profile"))
const PaymentMethod = lazy(() => import("../Pages/PaymentMethod"))

const ProjectRouter = () => {
  const { isAuthenticated } = useContext(AppContext)
  const { pathname } = useLocation()
  const hasShowToast = useRef(false)

  useEffect(() => {
    // chỉ chạy khi chưa login & chưa hiển thị toast
    if (!isAuthenticated && !hasShowToast.current) {
      toast.error("Vui lòng đăng nhập để tiếp tục", {
        autoClose: 1500
      })
    }
    hasShowToast.current = true
  }, [isAuthenticated])

  return isAuthenticated ? <Outlet /> : <Navigate to={`${path.Login}?redirect_url=${encodeURIComponent(pathname)}`} />
}

const RejectRouter = () => {
  const { isAuthenticated } = useContext(AppContext)
  const [searchParams] = useSearchParams()
  if (!isAuthenticated) {
    // isAuthenticated = false
    return <Outlet />
  }
  const navigate = searchParams.get("redirect_url") || path.Home
  return <Navigate to={navigate} />
}

const BlockAdminForClient = () => {
  const { role } = useContext(AppContext)
  if (role === rolesForApi.ADMIN) {
    return <Navigate to={path.AdminNotFound} replace />
  }
  return <Outlet />
}

export default function useRouterClient() {
  const routerElement = useRoutes([
    {
      path: "",
      element: <BlockAdminForClient />,
      children: [
        {
          path: "",
          element: <MainLayout />,
          children: [
            {
              index: true,
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
              path: path.Cart,
              element: (
                <Suspense>
                  <Cart />
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
                  path: path.InfoOrder,
                  element: (
                    <Suspense>
                      <InfoOrder />
                    </Suspense>
                  )
                },
                {
                  path: path.PaymentMethod,
                  element: (
                    <Suspense>
                      <PaymentMethod />
                    </Suspense>
                  )
                },
                {
                  path: path.CheckoutSuccess,
                  element: (
                    <Suspense>
                      <PaymentSuccessVNPay />
                    </Suspense>
                  )
                },
                {
                  path: path.CheckoutSuccessCod,
                  element: (
                    <Suspense>
                      <PaymentSuccessCod />
                    </Suspense>
                  )
                },
                {
                  path: path.Order,
                  element: (
                    <Suspense>
                      <Order />
                    </Suspense>
                  )
                },
                {
                  path: path.User,
                  element: <UserLayout />,
                  children: [
                    {
                      path: path.Profile,
                      element: (
                        <Suspense>
                          <Profile />
                        </Suspense>
                      )
                    },
                    {
                      path: path.ChangePassword,
                      element: (
                        <Suspense>
                          <ChangePassword />
                        </Suspense>
                      )
                    }
                  ]
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
        },
        {
          path: path.NotFound,
          element: (
            <Suspense>
              <NotFound />
            </Suspense>
          )
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
