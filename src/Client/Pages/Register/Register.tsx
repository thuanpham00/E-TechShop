import { Helmet } from "react-helmet-async"
import { Link } from "react-router-dom"
import { path } from "src/Constants/path"

export default function Register() {
  return (
    <div>
      <Helmet>
        <title>Đăng ký tài khoản</title>
        <meta name="description" content="Đây là trang đăng ký người dùng của hệ thống" />
      </Helmet>

      <div className="bg-white rounded-sm p-6 w-[400px] shadow-md">
        <h1 className="text-xl font-semibold text-center">Đăng ký</h1>
        <form className="mt-2">
          <div>
            <span>Email</span>
            <input
              type="text"
              name="email"
              className="mt-1 p-2 w-full border border-black/60 rounded-sm focus:border-blue-500 focus:ring-2 outline-none"
              placeholder="Nhập email"
            />
            <span className="mt-1 text-red-500 text-sm min-h-[1.25rem] block"></span>
          </div>
          <div>
            <span>Mật khẩu</span>
            <input
              type="text"
              name="email"
              className="mt-1 p-2 w-full border border-black/60 rounded-sm focus:border-blue-500 focus:ring-2 outline-none"
              placeholder="Nhập mật khẩu"
            />
            <span className="mt-1 text-red-500 text-sm min-h-[1.25rem] block"></span>
          </div>
          <button className="p-4 bg-blue-500 mt-2 w-full text-white font-semibold rounded-sm hover:bg-blue-500/80 duration-200">
            Đăng ký
          </button>
        </form>
        <div className="bg-gray-500 w-full h-[1px] mt-4"></div>

        <div className="mt-2 flex items-center justify-center gap-1">
          <span className="text-sm font-semibold">Bạn đã có tài khoản chưa?</span>
          <Link to={path.Login} className="font-bold underline underline-offset-2">
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  )
}
