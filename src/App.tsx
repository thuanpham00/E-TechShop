import { HelmetProvider } from "react-helmet-async"
import "./App.css"
import useRouterClient from "./Client/Routes/useRouterClient"
import useRouterAdmin from "./Admin/Routes/useRouterAdmin"
import { ToastContainer } from "react-toastify"
import { useContext, useEffect } from "react"
import { LocalStorageEventTarget } from "./Helpers/auth"
import { AppContext } from "./Context/authContext"

function App() {
  const routerClient = useRouterClient()
  const routerAdmin = useRouterAdmin()
  const { reset } = useContext(AppContext)

  useEffect(() => {
    LocalStorageEventTarget.addEventListener("ClearLS", reset) // lắng nghe sự kiện
    return () => {
      LocalStorageEventTarget.removeEventListener("ClearLS", reset) // destroy event
    }
  }, [reset])

  /**
   * Nếu bạn đặt lắng nghe sự kiện ClearLS ở bất kỳ component nào, thì chỉ component đó sẽ lắng nghe và thực hiện hành động khi sự kiện được phát.
   */

  return (
    <HelmetProvider>
      {routerAdmin}
      {routerClient}
      <ToastContainer />
    </HelmetProvider>
  )
}

export default App
