import logo from "src/Assets/img/logo_cut.png"
import avatarDefault from "src/Assets/img/avatarDefault.png"
import { Heart, Info, LogOut, PackageSearch, ShoppingCart } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { path } from "src/Constants/path"
import { useContext } from "react"
import { useMutation } from "@tanstack/react-query"
import { userAPI } from "src/Apis/user.api"
import { toast } from "react-toastify"
import { AppContext } from "src/Context/authContext"
import Popover from "src/Components/Popover"

export default function Header() {
  const navigate = useNavigate()
  const { isAuthenticated, nameUser, setIsAuthenticated, setNameUser, setRole, setIsShowCategory } =
    useContext(AppContext)

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
        toast.success(response.data.message, {
          autoClose: 1000
        })
      }
    })
  }

  const handleShowCategory = () => {
    setIsShowCategory(true)
  }

  return (
    <div className="bg-primaryBlue sticky top-0 left-0 z-20">
      <div className="container">
        <div className="grid grid-cols-12 items-center gap-4 py-3">
          <div className="col-span-3">
            <div className="flex items-center gap-2">
              <button className="w-[55%]" onClick={() => navigate(path.Home)}>
                <img src={logo} alt="logo TECHZONE" className="object-contain w-full h-[50px]" />
              </button>
              <button
                onClick={handleShowCategory}
                className="w-[45%] bg-secondBlue rounded-[4px] p-3 hover:bg-secondBlue/50 transition ease-in duration-100 cursor-pointer flex items-center gap-2"
              >
                <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="-0.00012207" y="0.000190735" width="18" height="2" rx="1" fill="white"></rect>
                  <rect x="-0.00012207" y="5.99999" width="18" height="2" rx="1" fill="white"></rect>
                  <rect x="-0.00012207" y="12.0001" width="18" height="2" rx="1" fill="white"></rect>
                </svg>
                <span className="text-[13px] text-white font-semibold">Danh mục</span>
              </button>
            </div>
          </div>
          <div className="col-span-4">
            <form className="w-full relative flex">
              <input
                type="text"
                className="flex-grow text-[13px] p-3 outline-none rounded-[4px]"
                placeholder="Bạn cần tìm gì?"
              />
              <button className="absolute top-1/2 -translate-y-1/2 right-2" type="submit">
                <div className="">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="black"
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                    />
                  </svg>
                </div>
              </button>
            </form>
          </div>
          <div className="col-span-5">
            <div className="flex">
              <div className="w-[65%] flex items-center">
                <div className="flex-1">
                  <div className="flex items-center justify-center gap-1 cursor-pointer relative">
                    <PackageSearch color="white" size={28} />
                    <span className="text-[13px] text-white font-semibold text-center">Đơn hàng</span>
                    {isAuthenticated ? (
                      <span className="absolute -top-1 left-8 w-[14px] h-[14px] bg-yellow-500 border border-white text-black text-[10px] flex items-center justify-center rounded-full">
                        0
                      </span>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-center gap-1 cursor-pointer relative">
                    <Heart color="white" size={24} />
                    <span className="text-[13px] text-white font-semibold">Yêu thích</span>
                    {isAuthenticated ? (
                      <span className="absolute -top-1 left-8 w-[14px] h-[14px] bg-yellow-500 border border-white text-black text-[10px] flex items-center justify-center rounded-full">
                        0
                      </span>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <Link to={path.Cart} className="flex items-center justify-center gap-1 cursor-pointer relative">
                    <ShoppingCart color="white" size={24} />
                    <span className="text-[13px] text-white font-semibold">Giỏ hàng</span>
                    {isAuthenticated ? (
                      <span className="absolute -top-1 left-8 w-[14px] h-[14px] bg-yellow-500 border border-white text-black text-[10px] flex items-center justify-center rounded-full">
                        0
                      </span>
                    ) : (
                      ""
                    )}
                  </Link>
                </div>
              </div>
              <div className="w-[35%]">
                {isAuthenticated ? (
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
                      <div className="flex items-center gap-1 py-1 px-2 rounded-[4px] bg-secondBlue text-white font-semibold hover:bg-secondBlue/50 duration-200 transition ease-linear cursor-pointer">
                        <img src={avatarDefault} className="h-8 w-8" alt="avatar default" />
                        <div>
                          <span className="text-xs">Xin chào</span>
                          <span className="block text-[13px] truncate w-32">{nameUser}</span>
                        </div>
                      </div>
                    }
                  </Popover>
                ) : (
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      to={path.Register}
                      className="py-2 px-3 rounded-[4px] bg-secondBlue text-white text-[13px] font-semibold hover:bg-secondBlue/50 duration-200 transition ease-linear"
                    >
                      Đăng ký
                    </Link>
                    <Link
                      to={path.Login}
                      className="py-2 px-3 rounded-[4px] bg-secondBlue text-white text-[13px] font-semibold hover:bg-secondBlue/50 duration-200 transition ease-linear"
                    >
                      Đăng nhập
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
