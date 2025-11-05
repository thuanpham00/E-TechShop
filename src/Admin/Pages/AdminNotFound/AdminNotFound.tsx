import { Button } from "antd"
import { ArrowLeft, Home } from "lucide-react"
import { Helmet } from "react-helmet-async"
import { useNavigate } from "react-router-dom"
import { path } from "src/Constants/path"

export default function AdminNotFound() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500">
      <Helmet>
        <title>Không tìm thấy trang | Admin</title>
      </Helmet>

      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-cyan-300/30 blur-3xl animate-pulse delay-200" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl animate-pulse delay-100" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-3xl rounded-2xl border border-white/40 bg-white/80 p-10 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1 text-blue-600">
            <span className="font-semibold tracking-wide">Lỗi 404</span>
            <span className="text-blue-400">•</span>
            <span>Trang không tồn tại</span>
          </div>

          <h1 className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-5xl font-extrabold text-transparent sm:text-5xl h-[110px]">
            Oops! Không tìm thấy trang
          </h1>

          {/* Illustration */}
          <div className="mx-auto my-8 h-36 w-full">
            <svg
              viewBox="0 0 400 160"
              className="mx-auto h-full w-auto text-blue-500/20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M40 120 L80 40 L120 120" />
                <path d="M100 120 L160 40 L220 120" opacity="0.8" />
                <circle cx="270" cy="80" r="28" />
                <path d="M288 98 L320 130" />
                <rect x="330" y="60" width="30" height="60" rx="6" />
              </g>
            </svg>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button size="large" onClick={() => navigate(-1)} icon={<ArrowLeft size={16} />} className="rounded-full">
              Quay lại
            </Button>
            <Button
              type="primary"
              size="large"
              onClick={() => navigate(path.AdminDashboard)}
              icon={<Home size={16} />}
              className="rounded-full"
            >
              Về trang quản trị
            </Button>
          </div>

          <div className="mt-6 text-xs text-gray-500">
            Nếu bạn cho rằng đây là lỗi, vui lòng thử tải lại trang hoặc liên hệ quản trị viên.
          </div>
        </div>
      </div>
    </div>
  )
}
