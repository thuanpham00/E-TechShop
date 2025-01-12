import { HelmetProvider } from "react-helmet-async"
import "./App.css"
import useRouterElement from "./Client/Routes/useRouterElement"

function App() {
  const routerElementClient = useRouterElement()
  return <HelmetProvider>{routerElementClient}</HelmetProvider>
}

export default App
