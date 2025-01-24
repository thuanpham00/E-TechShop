import { useContext } from "react"
import { Outlet } from "react-router-dom"
import HeaderAdmin from "src/Admin/Components/HeaderAdmin"
import Sidebar from "src/Admin/Components/Sidebar"
import { AppContext } from "src/Context/authContext"

export default function MainLayoutAdmin() {
  const { isShowCategory } = useContext(AppContext)
  return (
    <div className="flex">
      <div className={` ${isShowCategory ? "w-0 opacity-0" : "w-[15%] opacity-1 "} transition-all ease-in`}>
        <Sidebar />
      </div>
      <div className={` ${isShowCategory ? "w-full" : "w-[85%]"} `}>
        <HeaderAdmin />
        <Outlet />
      </div>
    </div>
  )
}
