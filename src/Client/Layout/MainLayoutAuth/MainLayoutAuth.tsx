import { memo } from "react"
import { Outlet } from "react-router-dom"
import banner_2 from "src/Assets/img/banner_background/banner_2.webp"

function MainLayoutAuthInner() {
  return (
    <div
      className="flex items-center bg-white justify-center"
      style={{
        backgroundImage: `url(${banner_2})`,
        backgroundSize: "cover",
        backgroundPosition: "center center",
        minHeight: "100vh"
      }}
    >
      <div className="w-[90%] md:w-[50%] lg:w-[40%] xl:w-[30%] bg-white rounded-md">
        <Outlet />
      </div>
    </div>
  )
}

const MainLayoutAuth = memo(MainLayoutAuthInner)
export default MainLayoutAuth

// ngăn chặn việc component MainLayout re-render khi không cần thiết
// vì sao nó re-render là do sử dụng route
