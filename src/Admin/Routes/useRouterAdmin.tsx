import { Navigate, Outlet, useRoutes } from "react-router-dom"
import { lazy, Suspense, useContext } from "react"
import MainLayoutAdmin from "../Layouts/MainLayoutAdmin"
import { path } from "src/Constants/path"
import { AppContext } from "src/Context/authContext"
import MainLayoutAuth from "src/Client/Layout/MainLayoutAuth"
// import ManageProducts from "../Pages/ManageProducts"
// import ManageOrders from "../Pages/ManageOrders"
// import ManageReceipt from "../Pages/ManageReceipts"
// import ManageSupplies from "../Pages/ManageSupplies"
// import ManageSuppliers from "../Pages/ManageSuppliers"
// import ManageRoles from "../Pages/ManageRoles"
// import ManageCategories from "../Pages/ManageCategories"
// import ManageCustomers from "../Pages/ManageCustomers"
// import ManageEmployees from "../Pages/ManageEmployees"
// import Dashboard from "../Pages/Dashboard/Dashboard"
// import LoginGoogle from "src/Client/Pages/LoginGoogle"
// import Register from "src/Client/Pages/Register"
// import Login from "src/Client/Pages/Login"
// import NotFound from "src/Client/Pages/NotFound"
// import NotFound from "src/Client/Pages/NotFound"

const Register = lazy(() => import("src/Client/Pages/Register"))
const Login = lazy(() => import("src/Client/Pages/Login"))
const LoginGoogle = lazy(() => import("src/Client/Pages/LoginGoogle"))
const NotFound = lazy(() => import("src/Client/Pages/NotFound"))
const Dashboard = lazy(() => import("src/Admin/Pages/Dashboard"))
const ManageCustomers = lazy(() => import("src/Admin/Pages/ManageCustomers"))
const ManageEmployees = lazy(() => import("src/Admin/Pages/ManageEmployees"))
const ManageCategories = lazy(() => import("src/Admin/Pages/ManageCategories"))
const ManageRoles = lazy(() => import("src/Admin/Pages/ManageRoles"))
const ManageSuppliers = lazy(() => import("src/Admin/Pages/ManageSuppliers"))
const ManageSupplies = lazy(() => import("src/Admin/Pages/ManageSupplies"))
const ManageReceipt = lazy(() => import("src/Admin/Pages/ManageReceipts"))
const ManageOrders = lazy(() => import("src/Admin/Pages/ManageOrders"))
const ManageProducts = lazy(() => import("src/Admin/Pages/ManageProducts"))

const ProtectedRoute = () => {
  const { isAuthenticated } = useContext(AppContext)
  console.log(isAuthenticated)
  return isAuthenticated ? <Outlet /> : <Navigate to={path.Login} />
} // bắt buộc đăng nhập

const RejectRouter = () => {
  const { isAuthenticated } = useContext(AppContext)
  if (!isAuthenticated) {
    return <Outlet />
  }
  return <Navigate to={path.AdminDashboard} />
}

export default function useRouterAdmin() {
  const { role } = useContext(AppContext)
  const useRouterElement = useRoutes([
    {
      path: "/admin",
      element: <ProtectedRoute />,
      children: [
        {
          path: "",
          element: <MainLayoutAdmin />,
          children: [
            {
              path: path.AdminDashboard,
              element: (
                <Suspense>
                  <Dashboard />
                </Suspense>
              )
            },
            {
              path: path.AdminCustomers,
              element: (
                <Suspense>
                  <ManageCustomers />
                </Suspense>
              )
            },
            {
              path: path.AdminEmployees,
              element: (
                <Suspense>
                  <ManageEmployees />
                </Suspense>
              )
            },
            {
              path: path.AdminCategories,
              element: (
                <Suspense>
                  <ManageCategories />
                </Suspense>
              )
            },
            {
              path: path.AdminProducts,
              element: (
                <Suspense>
                  <ManageProducts />
                </Suspense>
              )
            },
            {
              path: path.AdminOrders,
              element: (
                <Suspense>
                  <ManageOrders />
                </Suspense>
              )
            },
            {
              path: path.AdminReceipts,
              element: (
                <Suspense>
                  <ManageReceipt />
                </Suspense>
              )
            },
            {
              path: path.AdminSupplies,
              element: (
                <Suspense>
                  <ManageSupplies />
                </Suspense>
              )
            },
            {
              path: path.AdminSuppliers,
              element: (
                <Suspense>
                  <ManageSuppliers />
                </Suspense>
              )
            },
            {
              path: path.AdminRole,
              element: (
                <Suspense>
                  <ManageRoles />
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
            }
          ]
        }
      ]
    }
  ])
  return useRouterElement
}
