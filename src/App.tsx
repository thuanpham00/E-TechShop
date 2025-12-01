import { HelmetProvider } from "react-helmet-async"
import useRouterClient from "./Client/Routes/useRouterClient"
import useRouterAdmin from "./Admin/Routes/useRouterAdmin"
import { ToastContainer } from "react-toastify"
import { useContext, useEffect } from "react"
import { LocalStorageEventTarget } from "./Helpers/auth"
import { AppContext } from "./Context/authContext"
import ThemeProvider from "./Admin/Components/Theme-provider"
import { useLocation } from "react-router-dom"
import { io } from "socket.io-client"

function App() {
  const routerClient = useRouterClient()
  const routerAdmin = useRouterAdmin()
  const { reset, setSocket } = useContext(AppContext)
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
