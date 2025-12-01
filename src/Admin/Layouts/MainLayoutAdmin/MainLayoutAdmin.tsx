/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQueryClient } from "@tanstack/react-query"
import { memo, useContext, useEffect, useState } from "react"
import { Outlet } from "react-router-dom"
import { toast } from "react-toastify"
import HeaderAdmin from "src/Admin/Components/HeaderAdmin"
import Sidebar from "src/Admin/Components/Sidebar"
import { AppContext } from "src/Context/authContext"

function MainLayoutAdminInner() {
  const queryClient = useQueryClient()
  const { socket } = useContext(AppContext)
  const [isShowSidebar, setIsShowSidebar] = useState<boolean>(false)

  const handleSidebar = (boolean: boolean) => {
    setIsShowSidebar(boolean)
  }

  useEffect(() => {
    if (!socket) return

    const handleOrderNotification = (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["listOrder", { page: "1", limit: "5", sortBy: "new" }, "process"] })
      toast.info(`Bạn có đơn hàng mới từ khách hàng #${data.payload.user_id}`, {
        autoClose: false,
        pauseOnHover: false,
        draggable: false,
        closeOnClick: true
      })
    }
    socket.on("admin:order_notification", handleOrderNotification)
    return () => {
      socket.off("admin:order_notification", handleOrderNotification)
    }
  }, [socket, queryClient])

  return (
    <div className="flex">
      <div className={` ${isShowSidebar ? "w-0 opacity-0" : "w-[17%] opacity-1 "} transition-all ease-in`}>
        <Sidebar />
      </div>
      <div className={` ${isShowSidebar ? "w-full" : "w-[83%]"} dark:bg-darkSecond`}>
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
