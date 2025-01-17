import { useRoutes } from "react-router-dom"
import MainLayout from "../Layout/MainLayout"
import { path } from "../Constants/path"
import { lazy, Suspense } from "react"
import MainLayoutAuth from "../Layout/MainLayoutAuth"
const Home = lazy(() => import("../Pages/Home"))
const Login = lazy(() => import("../Pages/Login"))
const Register = lazy(() => import("../Pages/Register"))
const LoginGoogle = lazy(() => import("../Pages/LoginGoogle"))

export default function useRouterClient() {
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
        }
      ]
    },
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
