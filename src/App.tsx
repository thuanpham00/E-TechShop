import { HelmetProvider } from "react-helmet-async"
import "./App.css"
import useRouterClient from "./Client/Routes/useRouterClient"
import useRouterAdmin from "./Admin/Routes/useRouterAdmin"
import AppClientProvider from "./Client/Context/authContext"

function App() {
  const routerClient = useRouterClient()
  const routerAdmin = useRouterAdmin()
  return (
    <HelmetProvider>
      <AppClientProvider>{routerClient}</AppClientProvider>
      {routerAdmin}
    </HelmetProvider>
  )
}

export default App
