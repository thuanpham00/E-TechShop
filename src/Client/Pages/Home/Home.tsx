/* eslint-disable import/no-unresolved */
import { Helmet } from "react-helmet-async"
import banner_1 from "src/Assets/img/banner_home/banner_1.webp"
import banner_2 from "src/Assets/img/banner_home/banner_2.webp"
import banner_3 from "src/Assets/img/banner_home/banner_3.webp"
import banner_4 from "src/Assets/img/banner_home/banner_4.webp"
import banner_9 from "src/Assets/img/banner_home/banner_9.webp"
import { Fragment, useCallback, useState } from "react"
import { categories } from "src/Client/Constants/categories"
import MenuCategoryItem from "src/Client/Components/MenuCategoryItem"
import CategoryDetail from "src/Client/Components/CategoryDetail"
import SlideShow from "./Components/SlideShow"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { collectionAPI } from "src/Apis/collections.api"
import Skeleton from "src/Components/Skeleton"
import { SuccessResponse } from "src/Types/utils.type"
import { CollectionItemType } from "src/Types/product.type"
import ProductItem from "../Collection/Components/ProductItem"
import { Swiper, SwiperSlide } from "swiper/react"
// Import Swiper styles
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import { Navigation, Autoplay } from "swiper/modules"
import "../../../index.css"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function Home() {
  const navigate = useNavigate()
  const [showCategoryDetail, setShowCategoryDetail] = useState<string>("")
  const [isHover, setIsHover] = useState(false)

  const handleCategory = useCallback((index: string) => {
    setShowCategoryDetail(index)
    setIsHover(true)
  }, [])

  const handleExitCategory = useCallback(() => {
    setShowCategoryDetail("")
    setIsHover(false)
  }, [])

  const getCollectionLaptopTopSold = useQuery({
    queryKey: ["getCollectionLaptopTopSold"],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)

      return collectionAPI
        .getCollections("laptop-ban-chay", controller.signal)
        .then((res) => res)
        .catch((err) => Promise.reject(err))
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 15 * 60 * 1000, // dưới 5 phút nó không gọi lại api
    placeholderData: keepPreviousData
  })

  const result = getCollectionLaptopTopSold.data?.data as SuccessResponse<CollectionItemType[]>

  const handleNavigateCollections = (slug: string) => {
    navigate(`/collections/${slug}`)
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
          <div onMouseLeave={handleExitCategory} className="grid grid-cols-12 gap-2">
            <div className="col-span-2">
              {categories.map((category) => (
                <div
                  onMouseEnter={() => handleCategory(category.index)}
                  key={category.index}
                  className={`pl-3 pr-2 pt-2 pb-[10px] shadow first:rounded-tl-[4px] first:rounded-tr-[4px] last:rounded-bl-[4px] last:rounded-br-[4px] last:pb-2 hover:text-white hover:bg-primaryBlue ${showCategoryDetail === category.index ? "bg-primaryBlue text-white" : "bg-white text-black"}`}
                >
                  <MenuCategoryItem nameCategory={category.name} iconCategory={category.icon} />
                </div>
              ))}
            </div>
            {isHover ? (
              <div className="col-span-10">
                <div className="h-[520px]">
                  <div className="bg-white rounded-[4px] h-[500px] shadow p-4">
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

          <div>
            <div className="relative bg-white rounded-lg shadow-md my-4 p-4">
              {getCollectionLaptopTopSold.isLoading && <Skeleton />}
              {!getCollectionLaptopTopSold.isFetching && (
                <Fragment>
                  <div className="flex justify-between items-center">
                    <h1 className="text-xl font-semibold mb-2">Laptop bán chạy</h1>
                    <button
                      onClick={() => handleNavigateCollections("laptop-ban-chay")}
                      className="text-blue-500 text-sm hover:text-blue-400 cursor-pointer duration-200"
                    >
                      Xem tất cả
                    </button>
                  </div>
                  <Swiper
                    modules={[Navigation, Autoplay]}
                    slidesPerView={5}
                    spaceBetween={20}
                    navigation={{
                      nextEl: ".custom-next",
                      prevEl: ".custom-prev"
                    }}
                    autoplay={{ delay: 3000, disableOnInteraction: false }}
                    loop={true}
                    className="mySwiper relative"
                  >
                    {result.result.map((item, index) => (
                      <SwiperSlide key={index}>
                        <ProductItem item={item} />
                      </SwiperSlide>
                    ))}
                  </Swiper>

                  <button className="custom-prev">
                    <ChevronLeft />
                  </button>

                  <button className="custom-next">
                    <ChevronRight />
                  </button>
                </Fragment>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
