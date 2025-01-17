import { HelmetProvider } from "react-helmet-async"
import "./App.css"
import useRouterClient from "./Client/Routes/useRouterClient"
import useRouterAdmin from "./Admin/Routes/useRouterAdmin"
import AppClientProvider from "./Client/Context/authContext"
import { ToastContainer } from "react-toastify"

function App() {
  const routerClient = useRouterClient()
  const routerAdmin = useRouterAdmin()
  return (
    <HelmetProvider>
      <AppClientProvider>{routerClient}</AppClientProvider>
      {routerAdmin}
      <ToastContainer />
    </HelmetProvider>
  )
}

export default App
