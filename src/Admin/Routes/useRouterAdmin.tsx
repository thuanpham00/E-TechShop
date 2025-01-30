import { Navigate, Outlet, useRoutes } from "react-router-dom"
import { lazy, Suspense, useContext } from "react"
import MainLayoutAdmin from "../Layouts/MainLayoutAdmin"
import { path } from "src/Constants/path"
import { AppContext } from "src/Context/authContext"

const Home = lazy(() => import("src/Admin/Pages/Home"))

const ProtectedRoute = () => {
  const { isAuthenticated } = useContext(AppContext)
  return isAuthenticated ? <Outlet /> : <Navigate to={path.Login} />
} // bắt buộc đăng nhập

export default function useRouterAdmin() {
  const useRouterElement = useRoutes([
    {
      path: "",
      element: <ProtectedRoute />,
      children: [
        {
          path: "",
          element: <MainLayoutAdmin />,
          children: [
            {
              path: path.Admin,
              element: (
                <Suspense>
                  <Home />
                </Suspense>
              )
            }
          ]
        }
      ]
    }
  ])
  return useRouterElement
}
