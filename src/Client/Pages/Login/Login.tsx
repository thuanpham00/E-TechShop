import { Helmet } from "react-helmet-async"
import { Link } from "react-router-dom"
import { path } from "src/Client/Constants/path"

const getGoogleAuthUrl = () => {
  const { VITE_GOOGLE_CLIENT_ID, VITE_GOOGLE_AUTHORIZED_REDIRECT_URI } = import.meta.env
  const url = `https://accounts.google.com/o/oauth2/v2/auth`
  const query = {
    redirect_uri: VITE_GOOGLE_AUTHORIZED_REDIRECT_URI, // sau khi chọn tài khoản và redirect về server be
    client_id: VITE_GOOGLE_CLIENT_ID,
    response_type: "code",
    scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"].join(
      " "
    ), // 2 quyền khi đăng ký google cloud
    prompt: "consent",
    access_type: "offline" // để trả về RT
  }
  const queryString = new URLSearchParams(query) // tạo ra query "?"
  return `${url}?${queryString}`
}

const googleAuth = getGoogleAuthUrl()

export default function Login() {
  return (
    <div>
      <Helmet>
        <title>Đăng nhập tài khoản</title>
        <meta name="description" content="Đây là trang đăng nhập người dùng của hệ thống" />
      </Helmet>
      <div className="bg-white rounded-sm p-6 w-[400px] shadow-md">
        <h1 className="text-xl font-semibold text-center">Đăng nhập</h1>
        <Link
          to={googleAuth}
          className="mt-4 border border-black/80 rounded-full w-[80%] mx-auto p-2 flex items-center justify-center gap-2"
        >
          <div
            className="w-5 h-5"
            style={{
              backgroundImage: `url("https://accounts.scdn.co/sso/images/new-google-icon.72fd940a229bc94cf9484a3320b3dccb.svg")`,
              backgroundPosition: "center center",
              backgroundRepeat: "no-repeat"
            }}
          ></div>
          <span className="text-sm font-semibold">Đăng nhập với Google</span>
        </Link>
        <div className="flex items-center justify-center mt-2">
          <div className="w-[45%] h-[1px] bg-gray-500"></div>
          <span className="w-[10%] text-center block text-gray-400">or</span>
          <div className="w-[45%] h-[1px] bg-gray-500"></div>
        </div>
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
            Đăng nhập
          </button>
        </form>
        <div className="bg-gray-500 w-full h-[1px] mt-4"></div>
        <div className="mt-2 flex items-center justify-center gap-1">
          <span className="text-sm font-semibold">Bạn chưa có tài khoản?</span>
          <Link to={path.Register} className="font-bold underline underline-offset-2">
            Đăng ký
          </Link>
        </div>
      </div>
    </div>
  )
}
