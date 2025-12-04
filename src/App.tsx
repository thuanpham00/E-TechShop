import { HelmetProvider } from "react-helmet-async"
import useRouterClient from "./Client/Routes/useRouterClient"
import useRouterAdmin from "./Admin/Routes/useRouterAdmin"
import { ToastContainer } from "react-toastify"
import { useContext, useEffect, useMemo } from "react"
import { LocalStorageEventTarget } from "./Helpers/auth"
import { AppContext } from "./Context/authContext"
import ThemeProvider from "./Admin/Components/Theme-provider"
import { useLocation } from "react-router-dom"
import { io } from "socket.io-client"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { PermissionAPI } from "./Apis/admin/permission.api"

export interface PermissionItem {
  _id: string
  code: string
  api_endpoints: {
    method: string
    path: string
  }
}

function App() {
  const routerClient = useRouterClient()
  const routerAdmin = useRouterAdmin()
  const { reset, setSocket, isAuthenticated, setPermissions, userId } = useContext(AppContext)
  const location = useLocation()

  useEffect(() => {
    LocalStorageEventTarget.addEventListener("ClearLS", reset) // lắng nghe sự kiện
    return () => {
      LocalStorageEventTarget.removeEventListener("ClearLS", reset) // destroy event
    }
  }, [reset])

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (token) {
      const socket = io(import.meta.env.VITE_API_SERVER, {
        auth: {
          Authorization: `Bearer ${token}`
        }
      })
      setSocket(socket)
    }
  }, [setSocket])

  const listPermission = useQuery({
    queryKey: ["listPermissionForUserUsed", userId],
    queryFn: () => {
      return PermissionAPI.getPermissionForUser()
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 10 * 60 * 1000, // dưới 3 phút nó không gọi lại api
    placeholderData: keepPreviousData,
    enabled: Boolean(isAuthenticated) // chỉ chạy query khi đã đăng nhập
  })

  const listPermissionData: PermissionItem[] = useMemo(
    () => listPermission.data?.data?.result?.[0]?.permissions ?? [],
    [listPermission.data]
  )

  useEffect(() => {
    if (listPermissionData.length) setPermissions(listPermissionData)
  }, [listPermissionData, setPermissions])

  /**
   * Chỉ khi hàm clearLS() được gọi, sự kiện ClearLS mới được phát thông qua dispatchEvent, và khi đó, useEffect trong App (hoặc bất kỳ component nào đang lắng nghe sự kiện ClearLS) sẽ được kích hoạt.
   *
   * useEffect không tự kích hoạt lại khi không có sự kiện. Chỉ khi sự kiện ClearLS được phát, hàm reset (listener) mới được gọi.
   */
  const isAdminPath = location.pathname.startsWith("/admin")
  return (
    <HelmetProvider>
      {isAdminPath ? <ThemeProvider>{routerAdmin}</ThemeProvider> : routerClient}
      <ToastContainer />
    </HelmetProvider>
  )
}

export default App
