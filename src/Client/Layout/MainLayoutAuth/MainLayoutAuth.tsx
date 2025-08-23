import { memo } from "react"
import { Outlet } from "react-router-dom"
import banner_2 from "src/Assets/img/banner_background/banner_2.webp"

function MainLayoutAuthInner() {
  return (
    <div className="flex items-center dark:bg-darkPrimary bg-white">
      <div className="w-[70%]">
        <img className="w-full object-cover h-screen" src={banner_2} alt="banner" />
      </div>
      <div className="w-[30%]">
        <Outlet />
      </div>
    </div>
  )
}

const MainLayoutAuth = memo(MainLayoutAuthInner)
export default MainLayoutAuth

// ngăn chặn việc component MainLayout re-render khi không cần thiết
// vì sao nó re-render là do sử dụng route
