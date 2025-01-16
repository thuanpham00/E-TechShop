import logo from "src/Assets/img/logo_cut.png"
import { Heart, ShoppingCart, UserRound } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { path } from "src/Client/Constants/path"
import { useContext } from "react"
import { AppContext } from "src/Client/Context/authContext"

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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="white"
                    className="h-5 w-5 flex-shrink-0"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
                    />
                  </svg>
                  <span className="text-[13px] text-white font-semibold text-center">Tra cứu đơn hàng</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-center gap-1">
                  <Heart color="white" size={20} />
                  <span className="text-[13px] text-white font-semibold">Yêu thích</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-center gap-1">
                  <ShoppingCart color="white" size={20} />
                  <span className="text-[13px] text-white font-semibold">Giỏ hàng</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-2">
            {isAuthenticated ? (
              <div className="flex items-center gap-1 py-1 px-3 rounded-[4px] bg-secondRed text-white font-semibold hover:bg-secondRed/50 duration-200 transition ease-linear cursor-pointer">
                <UserRound />
                <div>
                  <span className="text-xs">Xin chào</span>
                  <span className="block text-[13px] truncate w-32">Phạm Minh Thuận</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(path.Register)}
                  className="py-2 px-3 rounded-[4px] bg-secondRed text-white text-[13px] font-semibold hover:bg-secondRed/50 duration-200 transition ease-linear"
                >
                  Đăng ký
                </button>
                <button
                  onClick={() => navigate(path.Login)}
                  className="py-2 px-3 rounded-[4px] bg-secondRed text-white text-[13px] font-semibold hover:bg-secondRed/50 duration-200 transition ease-linear"
                >
                  Đăng nhập
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
