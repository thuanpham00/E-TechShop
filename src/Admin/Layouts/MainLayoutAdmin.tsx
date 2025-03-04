import { memo, useState } from "react"
import { Outlet } from "react-router-dom"
import { HeaderAdmin, Sidebar } from "src/Admin/Components"

function MainLayoutAdminInner() {
  const [isShowSidebar, setIsShowSidebar] = useState<boolean>(false)

  const handleSidebar = (boolean: boolean) => {
    setIsShowSidebar(boolean)
  }

  return (
    <div className="flex">
      <div className={` ${isShowSidebar ? "w-0 opacity-0" : "w-[17%] opacity-1 "} transition-all ease-in`}>
        <Sidebar />
      </div>
      <div className={` ${isShowSidebar ? "w-full" : "w-[83%]"} `}>
        <HeaderAdmin handleSidebar={handleSidebar} isShowSidebar={isShowSidebar} />
        <div className="px-4 py-2">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

const MainLayoutAdmin = memo(MainLayoutAdminInner)
export default MainLayoutAdmin
// ngăn chặn việc component MainLayout re-render khi không cần thiết
// vì sao nó re-render là do sử dụng route
