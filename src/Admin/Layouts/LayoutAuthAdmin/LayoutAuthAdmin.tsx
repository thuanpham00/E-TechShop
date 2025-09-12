import { memo } from "react"
import { Outlet } from "react-router-dom"
import ModeToggle from "src/Admin/Components/Mode-Toggle"
import banner_2 from "src/Assets/img/ui_admin_login.png"

function LayoutAuthAdminInner() {
  return (
    <div className="relative bg-[#f2f2f2] dark:bg-darkSecond">
      <div className="absolute right-4 top-2">
        <ModeToggle />
      </div>
      <div className="h-screen flex items-center justify-center">
        <div className="w-[80%] h-[500px] rounded-lg shadow-lg flex items-center justify-center">
          <div
            className="w-[70%] h-full rounded-tl-lg rounded-bl-lg p-16"
            style={{
              backgroundImage: "linear-gradient(135deg, #FCCF31 10%, #F55555 100%)"
            }}
          >
            <img src={banner_2} alt="banner_2" className="w-full h-full object-cover rounded-lg" />
          </div>
          <div className="w-[30%] h-full">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}

const LayoutAuthAdmin = memo(LayoutAuthAdminInner)
export default LayoutAuthAdmin

// ngăn chặn việc component MainLayout re-render khi không cần thiết
// vì sao nó re-render là do sử dụng route
