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
  title,
  slug
}: {
  getCollectionQuery: UseQueryResult<AxiosResponse<any, any>, Error>
  result: CollectionItemType[]
  title: string
  slug: string
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
              onClick={() => handleNavigateCollections(slug)}
              className="text-blue-500 text-sm hover:text-blue-400 cursor-pointer duration-200"
            >
              Xem tất cả
            </button>
          </div>
          <div className="mt-3 relative">
            <Swiper
              modules={[Navigation, Autoplay]}
              spaceBetween={20}
              loop={true}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              navigation={{
                nextEl: ".custom-next",
                prevEl: ".custom-prev"
              }}
              breakpoints={{
                320: { slidesPerView: 2 },
                480: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
                1280: { slidesPerView: 5 }
              }}
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
          </div>
        </Fragment>
      )}
    </div>
  )
}
