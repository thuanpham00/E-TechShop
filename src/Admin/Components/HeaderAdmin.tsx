/* eslint-disable @typescript-eslint/no-explicit-any */
import { Info, LogOut, Menu } from "lucide-react"
import avatarDefault from "src/Assets/img/avatarDefault.png"
import { useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import { path } from "src/Constants/path"
import { AppContext } from "src/Context/authContext"
import { toast } from "react-toastify"
import { useMutation } from "@tanstack/react-query"
import { userAPI } from "src/Apis/user.api"
import { Popover } from "src/Components"

interface Props {
  handleSidebar: (boolean: boolean) => void
  isShowSidebar: boolean
}

export function HeaderAdmin({ handleSidebar, isShowSidebar }: Props) {
  const { nameUser, role, setIsAuthenticated, setNameUser, setRole } = useContext(AppContext)
  const navigate = useNavigate()
  const handleSideBarFunc = () => {
    handleSidebar(!isShowSidebar)
  }

  const logoutMutation = useMutation({
    mutationFn: () => {
      return userAPI.logoutUser()
    }
  })

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: (response) => {
        setIsAuthenticated(false)
        setNameUser(null)
        setRole(null)
        navigate(path.Login)
        toast.success(response.data.message, {
          autoClose: 1000
        })
      }
    })
  }

  return (
    <header className="sticky top-0 left-0 z-10 bg-white flex items-center justify-between p-3 border-b border-gray-200 ">
      <Menu size={28} onClick={handleSideBarFunc} />
      <div>
        <Popover
          renderPopover={
            <div className="bg-white shadow-md rounded-sm border border-gray-200">
              <div className="flex flex-col">
                <Link
                  to={path.Profile}
                  className="text-sm md:text-[13px] flex items-center gap-1 px-3 py-2 hover:text-primaryBlue hover:bg-slate-200 hover:underline hover:font-semibold"
                >
                  Thông tin tài khoản
                  <Info size={16} />
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm md:text-[13px] flex items-center gap-1 px-3 py-2 hover:text-primaryBlue hover:bg-slate-200 hover:underline hover:font-semibold"
                >
                  Đăng xuất
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          }
        >
          {
            <div className="flex items-center gap-1 text-black font-semibold duration-200 transition ease-linear cursor-pointer">
              <img src={avatarDefault} className="h-8 w-8" alt="avatar default" />
              <div>
                <span className="text-xs">{role}</span>
                <span className="block text-[13px] truncate w-32">{nameUser}</span>
              </div>
            </div>
          }
        </Popover>
      </div>
    </header>
  )
}
