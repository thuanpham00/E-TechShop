import { Helmet } from "react-helmet-async"
import { Cpu, HardDrive, Headset, Keyboard, Laptop, LaptopMinimal, Monitor, Mouse } from "lucide-react"
import CategoryItem from "src/Client/Components/CategoryItem/CategoryItem"
import SlideShow from "src/Client/Components/SlideShow"
import banner_1 from "src/Assets/img/banner_home/banner_1.webp"
import banner_2 from "src/Assets/img/banner_home/banner_2.webp"
import banner_3 from "src/Assets/img/banner_home/banner_3.webp"
import banner_4 from "src/Assets/img/banner_home/banner_4.webp"
import banner_9 from "src/Assets/img/banner_home/banner_9.webp"
import { useCallback, useContext, useState } from "react"
import { AppContext } from "src/Context/authContext"
import CategoryDetail from "src/Client/Components/CategoryDetail"

const categories = [
  { index: "0", name: "Laptop", icon: <Laptop size={22} /> },
  { index: "1", name: "Laptop Gaming", icon: <LaptopMinimal size={22} /> },
  { index: "2", name: "PC GVN", icon: <Laptop size={22} /> },
  { index: "3", name: "Main, CPU, VGA", icon: <Cpu size={22} /> },
  { index: "4", name: "Case, Nguồn, Tản", icon: <Cpu size={22} /> },
  { index: "5", name: "Ổ cứng, RAM, Thẻ nhớ", icon: <HardDrive size={22} /> },
  { index: "6", name: "Màn hình", icon: <Monitor size={22} /> },
  { index: "7", name: "Bàn phím", icon: <Keyboard size={22} /> },
  { index: "8", name: "Chuột + Lót chuột", icon: <Mouse size={22} /> },
  { index: "9", name: "Tai nghe", icon: <Headset size={22} /> }
]

export default function Home() {
  const { isShowCategory, setIsShowCategory } = useContext(AppContext)
  const [showCategoryDetail, setShowCategoryDetail] = useState<string>("")
  const [isHover, setIsHover] = useState(false)

  const handleExitLayout = useCallback(() => {
    setIsShowCategory(false)
  }, [setIsShowCategory])

  const handleCategory = useCallback((index: string) => {
    setShowCategoryDetail(index)
    setIsHover(true)
  }, [])

  const handleExitCategory = useCallback(() => {
    setShowCategoryDetail("")
    setIsHover(false)
  }, [])

  return (
    <div>
      <Helmet>
        <title>TECHZONE | Laptop, PC, Màn hình, điện thoại, linh kiện Chính Hãng</title>
        <meta
          name="description"
          content="Đây là trang TECHZONE | Laptop, PC, Màn hình, điện thoại, linh kiện Chính Hãng"
        />
      </Helmet>
      <div className="mt-4">
        <div className="container">
          <div onMouseLeave={handleExitCategory} className="grid grid-cols-12 gap-2">
            <div className="col-span-2">
              {categories.map((category) => (
                <div
                  onMouseEnter={() => handleCategory(category.index)}
                  key={category.index}
                  className="pl-3 pr-2 pt-2 pb-[6px] bg-white shadow first:rounded-tl-[4px] first:rounded-tr-[4px] last:rounded-bl-[4px] last:rounded-br-[4px] last:pb-2 hover:text-white hover:bg-primaryRed"
                >
                  <CategoryItem nameCategory={category.name} iconCategory={category.icon} />
                </div>
              ))}
            </div>
            {isHover ? (
              <div className="col-span-10">
                <div className="h-[520px]">
                  <div className="bg-white rounded-[4px] h-[500px] shadow pl-3 pr-2 pt-2">
                    <CategoryDetail showDetail={showCategoryDetail} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="col-span-10">
                <div className="flex items-stretch gap-2">
                  <div className="w-[66%]">
                    <SlideShow />
                    <div className="flex gap-2">
                      <img src={banner_1} alt="banner_1" className="w-[50%] object-cover rounded-[4px]" />
                      <img src={banner_3} alt="banner_2" className="w-[50%] object-cover rounded-[4px]" />
                    </div>
                  </div>
                  <div className="w-[34%]">
                    <img src={banner_4} alt="banner_4" className="w-full rounded-[4px] object-cover" />
                    <img src={banner_9} alt="banner_4" className="w-full rounded-[4px] object-cover" />
                    <img src={banner_2} alt="banner_3" className="w-full rounded-[4px] object-cover" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {isShowCategory && (
          <button onClick={handleExitLayout} className="fixed left-0 top-0 z-30 w-screen h-screen bg-black/60"></button>
        )}
        {isShowCategory && (
          <div className="container">
            <div
              onMouseLeave={handleExitCategory}
              className={`grid grid-cols-12 gap-2 ${isHover && "top-[90px] z-40 fixed"}`}
            >
              <div className={`col-span-2 ${!isHover && "top-[90px] z-40 fixed"}`}>
                {categories.map((category) => (
                  <div
                    onMouseEnter={() => handleCategory(category.index)}
                    key={category.index}
                    className="pl-3 pr-2 pt-2 pb-[6px] bg-white shadow first:rounded-tl-[4px] first:rounded-tr-[4px] last:rounded-bl-[4px] last:rounded-br-[4px] last:pb-2 hover:text-white hover:bg-primaryRed"
                  >
                    <CategoryItem nameCategory={category.name} iconCategory={category.icon} />
                  </div>
                ))}
              </div>
              {isHover && (
                <div className="col-span-10">
                  <div className="bg-white rounded-[4px] h-[500px] shadow pl-3 pr-2 pt-2">
                    <CategoryDetail showDetail={showCategoryDetail} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
