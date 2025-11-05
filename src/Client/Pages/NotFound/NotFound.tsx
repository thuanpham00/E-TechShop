import { Button } from "antd"
import { ArrowLeft, Home } from "lucide-react"
import { Helmet } from "react-helmet-async"
import { useNavigate } from "react-router-dom"

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500">
      <Helmet>
        <title>Không tìm thấy trang | Restaurant</title>
      </Helmet>

      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 -left-28 h-72 w-72 rounded-full bg-white/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-28 -right-28 h-80 w-80 rounded-full bg-cyan-300/30 blur-3xl animate-pulse delay-200" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-emerald-300/20 blur-3xl animate-pulse delay-100" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-3xl rounded-2xl border border-white/40 bg-white/80 p-10 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1 text-emerald-600">
            <span className="font-semibold tracking-wide">Lỗi 404</span>
            <span className="text-emerald-400">•</span>
            <span>Trang không tồn tại</span>
          </div>

          <h1 className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-5xl font-extrabold text-transparent sm:text-5xl h-[110px]">
            Rất tiếc! Không tìm thấy trang
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-gray-600">
            Liên kết có thể đã bị thay đổi hoặc tạm thời không khả dụng. Vui lòng kiểm tra lại đường dẫn.
          </p>

          {/* Illustration */}
          <div className="mx-auto my-8 h-36 w-full">
            <svg
              viewBox="0 0 400 160"
              className="mx-auto h-full w-auto text-emerald-500/25"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M30 120 Q80 20 130 120" />
                <path d="M120 120 Q170 40 220 120" opacity="0.85" />
                <circle cx="280" cy="80" r="26" />
                <path d="M296 98 L328 130" />
                <rect x="336" y="60" width="30" height="60" rx="6" />
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
              onClick={() => navigate("/")}
              icon={<Home size={16} />}
              className="rounded-full"
            >
              Về trang chủ
            </Button>
          </div>

          <div className="mt-6 text-xs text-gray-500">
            Nếu bạn cho rằng đây là lỗi, hãy thử tải lại trang hoặc quay về trang chủ.
          </div>
        </div>
      </div>
    </div>
  )
}
