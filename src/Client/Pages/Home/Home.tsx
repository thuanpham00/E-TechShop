import { Helmet } from "react-helmet-async"
import Cookies from "js-cookie"
import { ChevronRight, Laptop } from "lucide-react"

export default function Home() {
  const token = Cookies.get("refresh_token")
  console.log(token)
  return (
    <div className="h-[500px]">
      <Helmet>
        <title>TECHZONE | Laptop, PC, Màn hình, điện thoại, linh kiện Chính Hãng</title>
        <meta
          name="description"
          content="Đây là trang TECHZONE | Laptop, PC, Màn hình, điện thoại, linh kiện Chính Hãng"
        />
      </Helmet>
      <div className="mt-2">
        <div className="container">
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-2 px-3 py-2 bg-white rounded-[4px]">
              <div className="flex items-center gap-2">
                <Laptop size={20} />
                <div className="w-full flex justify-between items-center">
                  <span className="text-[13px] font-semibold">Laptop</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            </div>
            <div className="col-span-10">THuan</div>
          </div>
        </div>
      </div>
    </div>
  )
}
