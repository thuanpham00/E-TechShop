import { Helmet } from "react-helmet-async"
import { Cpu, HardDrive, Headset, Keyboard, Laptop, LaptopMinimal, Monitor, Mouse } from "lucide-react"
import CategoryItem from "src/Client/Components/CategoryItem/CategoryItem"
import SlideShow from "src/Client/Components/SlideShow"
import banner_1 from "src/Assets/img/banner_home/banner_1.webp"
import banner_2 from "src/Assets/img/banner_home/banner_2.webp"
import banner_3 from "src/Assets/img/banner_home/banner_3.webp"
import banner_4 from "src/Assets/img/banner_home/banner_4.webp"
import banner_9 from "src/Assets/img/banner_home/banner_9.webp"
import { useContext } from "react"
import { AppContext } from "src/Context/authContext"

export default function Home() {
  const { isShowCategory, setIsShowCategory } = useContext(AppContext)

  const handleExitLayout = () => {
    setIsShowCategory(false)
  }

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
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-2">
              <div className="bg-white rounded-[4px] h-[370px] shadow mt-1 pl-3 pr-2 pt-2">
                <CategoryItem nameCategory="Laptop" iconCategory={<Laptop size={22} />} />
                <CategoryItem nameCategory="Laptop Gaming" iconCategory={<LaptopMinimal size={22} />} />
                <CategoryItem nameCategory="PC GVN" iconCategory={<Laptop size={22} />} />
                <CategoryItem nameCategory="Main, CPU, VGA" iconCategory={<Cpu size={22} />} />
                <CategoryItem nameCategory="Case, Nguồn, Tản" iconCategory={<Cpu size={22} />} />
                <CategoryItem nameCategory="Ổ cứng, RAM, Thẻ nhớ" iconCategory={<HardDrive size={22} />} />
                <CategoryItem nameCategory="Màn hình" iconCategory={<Monitor size={22} />} />
                <CategoryItem nameCategory="Bàn phím" iconCategory={<Keyboard size={22} />} />
                <CategoryItem nameCategory="Chuột + Lót chuột" iconCategory={<Mouse size={22} />} />
                <CategoryItem nameCategory="Tai nghe" iconCategory={<Headset size={22} />} />
              </div>
            </div>
            <div className="col-span-10">
              <div className="flex items-center gap-2">
                <div className="w-[65%]">
                  <SlideShow />
                  <div className="flex gap-2">
                    <img src={banner_1} alt="banner_1" className="w-[50%] object-cover rounded-[4px]" />
                    <img src={banner_2} alt="banner_2" className="w-[50%] object-cover rounded-[4px]" />
                  </div>
                </div>
                <div className="w-[35%] flex flex-col justify-between">
                  <img src={banner_9} alt="banner_4" className="w-full rounded-[4px] object-cover" />
                  <img src={banner_3} alt="banner_3" className="w-full rounded-[4px] object-cover" />
                  <img src={banner_4} alt="banner_4" className="w-full rounded-[4px] object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
        {isShowCategory ? (
          <button onClick={handleExitLayout} className="fixed left-0 top-0 z-30 w-screen h-screen bg-black/60"></button>
        ) : (
          ""
        )}
        {isShowCategory ? (
          <div className="container">
            <div className="grid grid-cols-12">
              <div className="col-span-2 top-24 z-40 fixed transition ease-in-out duration-100">
                <div className=" bg-white rounded-[4px] h-[370px] shadow mt-1 pl-3 pr-2 pt-2">
                  <CategoryItem nameCategory="Laptop" iconCategory={<Laptop size={22} />} />
                  <CategoryItem nameCategory="Laptop Gaming" iconCategory={<LaptopMinimal size={22} />} />
                  <CategoryItem nameCategory="PC GVN" iconCategory={<Laptop size={22} />} />
                  <CategoryItem nameCategory="Main, CPU, VGA" iconCategory={<Cpu size={22} />} />
                  <CategoryItem nameCategory="Case, Nguồn, Tản" iconCategory={<Cpu size={22} />} />
                  <CategoryItem nameCategory="Ổ cứng, RAM, Thẻ nhớ" iconCategory={<HardDrive size={22} />} />
                  <CategoryItem nameCategory="Màn hình" iconCategory={<Monitor size={22} />} />
                  <CategoryItem nameCategory="Bàn phím" iconCategory={<Keyboard size={22} />} />
                  <CategoryItem nameCategory="Chuột + Lót chuột" iconCategory={<Mouse size={22} />} />
                  <CategoryItem nameCategory="Tai nghe" iconCategory={<Headset size={22} />} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  )
}
