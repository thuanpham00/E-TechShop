/* eslint-disable import/no-unresolved */
import { useContext } from "react"
import { Fragment } from "react/jsx-runtime"
import { AppContext } from "src/Context/authContext"
import { Swiper, SwiperSlide } from "swiper/react"
// Import Swiper styles
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import { Navigation, Autoplay } from "swiper/modules"
import ProductItem from "src/Client/Pages/Collection/Components/ProductItem"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function ProductRecently() {
  const { recentlyViewed } = useContext(AppContext)
  return (
    <div>
      {recentlyViewed.length > 0 && (
        <div className="relative bg-white rounded-lg border border-gray-200 my-4 p-4">
          <Fragment>
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-semibold mb-2">Sản phẩm vừa xem</h1>
            </div>
            <Swiper
              modules={[Navigation, Autoplay]}
              spaceBetween={20}
              navigation={{
                nextEl: ".custom-next",
                prevEl: ".custom-prev"
              }}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              loop={true}
              className="mySwiper relative"
              breakpoints={{
                320: { slidesPerView: 2 },
                480: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
                1280: { slidesPerView: 5 }
              }}
            >
              {recentlyViewed.map((item, index) => (
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
        </div>
      )}
    </div>
  )
}
