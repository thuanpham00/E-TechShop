import { memo } from "react"
import { Outlet } from "react-router-dom"
import banner_2 from "src/Assets/img/ui_admin_login.png"

function LayoutAuthAdminInner() {
  return (
    <div className="h-screen flex items-center justify-center">
      <div
        className="w-[80%] h-[550px] rounded-lg shadow-lg flex items-center justify-center"
        style={{
          backgroundImage: "linear-gradient(135deg, #FCCF31 10%, #F55555 100%)"
        }}
      >
        <div className="w-[90%] h-[450px] flex justify-center">
          <div className="w-[70%] bg-white h-full rounded-tl-lg rounded-bl-lg">
            <img src={banner_2} alt="banner_2" className="w-full h-full rounded-tl-lg rounded-bl-lg" />
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
