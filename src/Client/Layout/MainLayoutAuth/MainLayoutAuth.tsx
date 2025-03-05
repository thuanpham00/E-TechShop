import { memo, useEffect, useState } from "react"
import { Outlet } from "react-router-dom"
import banner_1 from "src/Assets/img/banner_background/banner_1.webp"
import banner_2 from "src/Assets/img/banner_background/banner_2.webp"
import banner_3 from "src/Assets/img/banner_background/banner_3.webp"
import banner_4 from "src/Assets/img/banner_background/banner_4.webp"
import banner_5 from "src/Assets/img/banner_background/banner_5.webp"

const bannerImg = [banner_1, banner_2, banner_3, banner_4, banner_5]

function MainLayoutAuthInner() {
  const [indexBanner, setIndexBanner] = useState(0)

  useEffect(() => {
    setIndexBanner(Math.floor(Math.random() * bannerImg.length))
  }, [])

  return (
    <div className="flex items-center bg-white">
      <div className="w-[70%]">
        <img className="w-full object-cover h-screen" src={`${bannerImg[indexBanner]}`} alt="banner" />
      </div>
      <div className="w-[30%]">
        <Outlet />
      </div>
    </div>
  )
}

const MainLayoutAuth = memo(MainLayoutAuthInner)
export default MainLayoutAuth

// ngăn chặn việc component MainLayout re-render khi không cần thiết
// vì sao nó re-render là do sử dụng route
