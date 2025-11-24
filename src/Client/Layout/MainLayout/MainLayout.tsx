import { memo } from "react"
import { Outlet } from "react-router-dom"
import ChatConsulting from "src/Client/Components/ChatConsulting"
import Footer from "src/Client/Components/Footer"
import Header from "src/Client/Components/Header"
import sideBarLeft from "src/Assets/img/side_bar_left.jpg"
import sideBarRight from "src/Assets/img/side_bar_right.jpg"

function MainLayoutInner() {
  return (
    <div className="relative bg-[#f1f1f1]">
      <Header />

      <aside className="fixed left-4 top-48 z-10 hidden xl:block">
        <div className="content-block rounded overflow-hidden shadow-md">
          <img src={sideBarLeft} alt="Featured collection" className="w-[120px] h-[350px] object-fill" loading="lazy" />
        </div>
      </aside>

      <Outlet />

      <aside className="fixed right-4 top-48 z-10 hidden xl:block">
        <div className="content-block rounded overflow-hidden shadow-md">
          <img
            src={sideBarRight}
            alt="Featured collection"
            className="w-[120px] h-[350px] object-fill"
            loading="lazy"
          />
        </div>
      </aside>

      <ChatConsulting />
      <Footer />
    </div>
  )
}

const MainLayout = memo(MainLayoutInner)
export default MainLayout

// ngăn chặn việc component MainLayout re-render khi không cần thiết
// vì sao nó re-render là do sử dụng route
