import { HelmetProvider } from "react-helmet-async"
import "./App.css"
import useRouterClient from "./Client/Routes/useRouterClient"
import useRouterAdmin from "./Admin/Routes/useRouterAdmin"
import AppClientProvider from "./Client/Context/authContext"
import { ToastContainer } from "react-toastify"
import { useLocation } from "react-router-dom"
import { useMemo } from "react"

function App() {
  const routerClient = useRouterClient()
  const routerAdmin = useRouterAdmin()
  const { pathname } = useLocation()

  const route = useMemo(() => {
    if (pathname.startsWith("/admin")) {
      return routerAdmin
    }
    return routerClient
  }, [pathname, routerAdmin, routerClient])

  return (
    <HelmetProvider>
      {pathname.startsWith("/admin") ? route : <AppClientProvider>{route}</AppClientProvider>}
      <ToastContainer />
    </HelmetProvider>
  )
}

export default App
