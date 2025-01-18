import logo from "src/Assets/img/logo_cut.png"
import { Heart, Info, LogOut, PackageSearch, ShoppingCart, UserRound } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { path } from "src/Client/Constants/path"
import { useContext } from "react"
import { AppContext } from "src/Client/Context/authContext"
import Popover from "src/Components/Popover"

export default function Header() {
  const navigate = useNavigate()
  const { isAuthenticated } = useContext(AppContext)

  return (
    <div className="bg-primaryRed">
      <div className="container">
        <div className="grid grid-cols-12 items-center gap-4 py-3">
          <div className="col-span-3">
            <div className="flex items-center gap-2">
              <button className="w-[55%]" onClick={() => navigate(path.Home)}>
                <img src={logo} alt="logo TECHZONE" className="object-contain w-full h-[50px]" />
              </button>
              <div className="w-[45%] bg-secondRed rounded-[4px] p-3 hover:bg-secondRed/50 transition ease-in duration-100 cursor-pointer">
                <div className="flex items-center gap-2">
                  <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="-0.00012207" y="0.000190735" width="18" height="2" rx="1" fill="white"></rect>
                    <rect x="-0.00012207" y="5.99999" width="18" height="2" rx="1" fill="white"></rect>
                    <rect x="-0.00012207" y="12.0001" width="18" height="2" rx="1" fill="white"></rect>
                  </svg>
                  <span className="text-[13px] text-white font-semibold">Danh mục</span>
                </div>
              </div>
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
          <div className="col-span-3">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="flex items-center justify-center gap-1">
                  <PackageSearch color="white" size={36} />
                  <span className="text-[13px] text-white font-semibold text-center">Tra cứu đơn hàng</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-center gap-1">
                  <Heart color="white" size={24} />
                  <span className="text-[13px] text-white font-semibold">Yêu thích</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-center gap-1">
                  <ShoppingCart color="white" size={24} />
                  <span className="text-[13px] text-white font-semibold">Giỏ hàng</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-2">
            {isAuthenticated ? (
              <Popover
                renderPopover={
                  <div className="bg-white relative shadow-md rounded-sm border border-gray-200">
                    <div className="flex flex-col">
                      <button
                        // onClick={toggleLight}
                        className="text-sm md:text-[13px] flex items-center gap-1 px-3 py-2 hover:text-primaryRed hover:bg-slate-200 hover:underline hover:font-semibold"
                      >
                        Thông tin tài khoản
                        <Info size={16} />
                      </button>
                      <button
                        // onClick={toggleDark}
                        className="text-sm md:text-[13px] flex items-center gap-1 px-3 py-2 hover:text-primaryRed hover:bg-slate-200 hover:underline hover:font-semibold"
                      >
                        Đăng xuất
                        <LogOut size={16} />
                      </button>
                    </div>
                  </div>
                }
              >
                {
                  <div className="flex items-center gap-1 py-1 px-3 rounded-[4px] bg-secondRed text-white font-semibold hover:bg-secondRed/50 duration-200 transition ease-linear cursor-pointer">
                    <UserRound />
                    <div>
                      <span className="text-xs">Xin chào</span>
                      <span className="block text-[13px] truncate w-32">Phạm Minh Thuận</span>
                    </div>
                  </div>
                }
              </Popover>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to={path.Register}
                  className="py-2 px-3 rounded-[4px] bg-secondRed text-white text-[13px] font-semibold hover:bg-secondRed/50 duration-200 transition ease-linear"
                >
                  Đăng ký
                </Link>
                <Link
                  to={path.Login}
                  className="py-2 px-3 rounded-[4px] bg-secondRed text-white text-[13px] font-semibold hover:bg-secondRed/50 duration-200 transition ease-linear"
                >
                  Đăng nhập
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
