import { memo } from "react"
import { Outlet } from "react-router-dom"
import ChatConsulting from "src/Client/Components/ChatConsulting"
import Footer from "src/Client/Components/Footer"
import Header from "src/Client/Components/Header"

function MainLayoutInner() {
  return (
    <div>
      <Header />
      <Outlet />
      <ChatConsulting />
      <Footer />
    </div>
  )
}

const MainLayout = memo(MainLayoutInner)
export default MainLayout

// ngăn chặn việc component MainLayout re-render khi không cần thiết
// vì sao nó re-render là do sử dụng route
