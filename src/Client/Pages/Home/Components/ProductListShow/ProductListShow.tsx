/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/no-unresolved */
import { Fragment } from "react/jsx-runtime"
import Skeleton from "src/Components/Skeleton"
import { Swiper, SwiperSlide } from "swiper/react"
// Import Swiper styles
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import { Navigation, Autoplay } from "swiper/modules"
import { ChevronLeft, ChevronRight } from "lucide-react"
import ProductItem from "src/Client/Pages/Collection/Components/ProductItem"
import { AxiosResponse } from "axios"
import { UseQueryResult } from "@tanstack/react-query"
import { CollectionItemType } from "src/Types/product.type"
import { useNavigate } from "react-router-dom"

export default function ProductListShow({
  getCollectionQuery,
  result,
  title
}: {
  getCollectionQuery: UseQueryResult<AxiosResponse<any, any>, Error>
  result: CollectionItemType[]
  title: string
}) {
  const navigate = useNavigate()

  const handleNavigateCollections = (slug: string) => {
    navigate(`/collections/${slug}`)
  }

  return (
    <div className="relative bg-white rounded-lg border border-gray-200 my-4 p-4">
      {getCollectionQuery.isLoading && <Skeleton />}
      {!getCollectionQuery.isFetching && (
        <Fragment>
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold mb-2">{title}</h1>
            <button
              onClick={() => handleNavigateCollections("top-10-laptop-ban-chay")}
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
            {result.map((item, index) => (
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
  )
}
