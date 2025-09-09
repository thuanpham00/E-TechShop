import { Navigate, Outlet, useRoutes } from "react-router-dom"
import { lazy, Suspense, useContext } from "react"
import MainLayoutAdmin from "../Layouts/MainLayoutAdmin"
import { path } from "src/Constants/path"
import { AppContext } from "src/Context/authContext"
import Permission from "../Pages/ManagePermissions/Permission"
import LayoutAuthAdmin from "../Layouts/LayoutAuthAdmin"

const LoginAdmin = lazy(() => import("src/Admin/Pages/LoginAdmin"))
const NotFound = lazy(() => import("src/Client/Pages/NotFound"))
const Dashboard = lazy(() => import("src/Admin/Pages/Dashboard"))
const ManageCustomers = lazy(() => import("src/Admin/Pages/ManageCustomers"))
const ManageStaff = lazy(() => import("src/Admin/Pages/ManageStaff"))
const ManageCategories = lazy(() => import("src/Admin/Pages/ManageCategories"))
const ManageRoles = lazy(() => import("src/Admin/Pages/ManageRoles"))
const ManageSuppliers = lazy(() => import("src/Admin/Pages/ManageSuppliers"))
const ManageSupplies = lazy(() => import("src/Admin/Pages/ManageSupplies"))
const ManageReceipt = lazy(() => import("src/Admin/Pages/ManageReceipt"))
const ManageOrders = lazy(() => import("src/Admin/Pages/ManageOrders"))
const ManageProducts = lazy(() => import("src/Admin/Pages/ManageProducts"))
const ManageBrand = lazy(() => import("src/Admin/Pages/ManageBrand"))
const ManagePermissions = lazy(() => import("src/Admin/Pages/ManagePermissions"))
const AddProduct = lazy(() => import("src/Admin/Pages/AddProduct"))
const AddReceipt = lazy(() => import("src/Admin/Pages/AddReceipt"))
const AdminEmail = lazy(() => import("src/Admin/Pages/AdminEmail"))
const AdminChatting = lazy(() => import("src/Admin/Pages/AdminChatting"))
const AdminProfile = lazy(() => import("src/Admin/Pages/AdminProfile"))

const ProtectedRoute = () => {
  const { isAuthenticated } = useContext(AppContext)
  return isAuthenticated ? <Outlet /> : <Navigate to={path.AdminLogin} />
} // bắt buộc đăng nhập

const RejectRouter = () => {
  const { isAuthenticated } = useContext(AppContext)
  if (!isAuthenticated) {
    return <Outlet />
  }
  return <Navigate to={path.AdminDashboard} />
}

const BlockClientForAdmin = () => {
  const { role } = useContext(AppContext)
  if (role === "Customer") {
    return <Navigate to={path.NotFound} replace />
  }
  return <Outlet />
}

export default function useRouterAdmin() {
  const { role } = useContext(AppContext)
  const useRouterElement = useRoutes([
    {
      path: "",
      element: <BlockClientForAdmin />,
      children: [
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
                      <ManageStaff />
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
                  path: path.AdminCategoryDetail,
                  element: (
                    <Suspense>
                      <ManageBrand />
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
                  path: path.AddProduct,
                  element: (
                    <Suspense>
                      <AddProduct />
                    </Suspense>
                  )
                },
                {
                  path: path.AddReceipt,
                  element: (
                    <Suspense>
                      <AddReceipt />
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
                  path: path.AdminPermission,
                  element: (
                    <Suspense>
                      <ManagePermissions />
                    </Suspense>
                  )
                },
                {
                  path: "/admin/permission_2",
                  element: (
                    <Suspense>
                      <Permission />
                    </Suspense>
                  )
                },
                {
                  path: path.AdminEmail,
                  element: (
                    <Suspense>
                      <AdminEmail />
                    </Suspense>
                  )
                },
                {
                  path: path.AdminChat,
                  element: (
                    <Suspense>
                      <AdminChatting />
                    </Suspense>
                  )
                },
                {
                  path: path.AdminProfile,
                  element: (
                    <Suspense>
                      <AdminProfile />
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
                },
                {
                  path: path.AdminNotFound,
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
              element: <LayoutAuthAdmin />,
              children: [
                {
                  path: path.AdminLogin,
                  element: (
                    <Suspense>
                      <LoginAdmin />
                    </Suspense>
                  )
                }
              ]
            }
          ]
        }
      ]
    }
  ])
  return useRouterElement
}
