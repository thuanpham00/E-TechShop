import { memo, useEffect, useState } from "react"
import { Outlet } from "react-router-dom"
import ModeToggle from "src/Admin/Components/Mode-Toggle"
import banner_1 from "src/Assets/img/banner_background/banner_1.webp"
import banner_2 from "src/Assets/img/banner_background/banner_2.webp"
import banner_3 from "src/Assets/img/banner_background/banner_3.webp"
import banner_4 from "src/Assets/img/banner_background/banner_4.webp"
import banner_5 from "src/Assets/img/banner_background/banner_5.webp"

const bannerList = [banner_1, banner_2, banner_3, banner_4, banner_5]

function LayoutAuthAdminInner() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % bannerList.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative h-screen flex justify-center items-center">
      {bannerList.map((item, i) => (
        <img
          key={i}
          src={item}
          alt={banner_2}
          className={`absolute top-0 left-0 w-full h-full object-cover brightness-75 transition-opacity duration-500 ${index === i ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      <div className="absolute right-4 top-2">
        <ModeToggle />
      </div>
      <div className="w-[25%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 absolute">
        <Outlet />
      </div>
    </div>
  )
}

const LayoutAuthAdmin = memo(LayoutAuthAdminInner)
export default LayoutAuthAdmin

// ngăn chặn việc component MainLayout re-render khi không cần thiết
// vì sao nó re-render là do sử dụng route
