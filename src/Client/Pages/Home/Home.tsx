/* eslint-disable import/no-unresolved */
import { Helmet } from "react-helmet-async"
import banner_1 from "src/Assets/img/banner_home/banner_1.webp"
import banner_2 from "src/Assets/img/banner_home/banner_2.webp"
import banner_3 from "src/Assets/img/banner_home/banner_3.webp"
import banner_4 from "src/Assets/img/banner_home/banner_4.webp"
import { SuccessResponse } from "src/Types/utils.type"
import { CollectionItemType, TopReviewOrderItemType } from "src/Types/product.type"
// Import Swiper styles
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import "../../../index.css"
import bannerMonitor from "src/Assets/img/banner_category/asus-monitor.webp"
import useCollectionTopSold from "src/Hook/useCollectionTopSold"
import { motion } from "framer-motion"
import SlideShow from "./Components/SlideShow"
import bannerQC1 from "src/Assets/img/banner_home/thang_06_banner_build_pc_top_promotion_banner_2.png"
import bannerQC2 from "src/Assets/img/banner_home/thang_06_banner_ghe_top_promotion_banner_1.png"
import ProductRecently from "src/Client/Components/ProductRecently"
import ProductListShow from "./Components/ProductListShow"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { OrderApi } from "src/Apis/client/order.api"
import { Swiper, SwiperSlide } from "swiper/react"
import { Rate } from "antd"
import { Autoplay, Navigation } from "swiper/modules"

export default function Home() {
  const getCollectionLaptopTopSold = useCollectionTopSold("top-10-laptop-ban-chay", "getCollectionLaptopTopSold")
  const getCollectionLaptopGamingTopSold = useCollectionTopSold(
    "top-10-laptop-gaming-ban-chay",
    "getCollectionLaptopGamingTopSold"
  )
  const getCollectionPCTopSold = useCollectionTopSold("top-10-pc-ban-chay", "getCollectionPCTopSold")
  const getCollectionMonitorTopSold = useCollectionTopSold("top-10-man-hinh-ban-chay", "getCollectionMonitorTopSold")
  const getCollectionKeyboardTopSold = useCollectionTopSold("top-10-ban-phim-ban-chay", "getCollectionKeyboardTopSold")
  const getCollectionMouseTopSold = useCollectionTopSold("top-10-chuot-ban-chay", "getCollectionMouseTopSold")
  const getCollectionHeadphoneTopSold = useCollectionTopSold(
    "top-10-tai-nghe-ban-chay",
    "getCollectionHeadphoneTopSold"
  )

  const result = getCollectionLaptopTopSold.data?.data as SuccessResponse<CollectionItemType[]>
  const resultLaptopGaming = getCollectionLaptopGamingTopSold.data?.data as SuccessResponse<CollectionItemType[]>
  const resultPC = getCollectionPCTopSold.data?.data as SuccessResponse<CollectionItemType[]>
  const resultMonitor = getCollectionMonitorTopSold.data?.data as SuccessResponse<CollectionItemType[]>
  const resultKeyboard = getCollectionKeyboardTopSold.data?.data as SuccessResponse<CollectionItemType[]>
  const resultMouse = getCollectionMouseTopSold.data?.data as SuccessResponse<CollectionItemType[]>
  const resultHeadphone = getCollectionHeadphoneTopSold.data?.data as SuccessResponse<CollectionItemType[]>

  const getListTopReviewNewest = useQuery({
    queryKey: ["listTopReviewNewest"],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)
      return OrderApi.getTopReviewNewest(controller.signal)
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 10 * 60 * 1000, // dưới 5 phút nó không gọi lại api
    placeholderData: keepPreviousData
  })

  const listTop10ReviewNewest = (getListTopReviewNewest.data?.data.result || []) as TopReviewOrderItemType[]

  return (
    <div>
      <Helmet>
        <title>TECHZONE | Laptop, PC, Màn hình, điện thoại, linh kiện Chính Hãng</title>
        <meta
          name="description"
          content="TechZone - Hệ thống bán lẻ laptop, PC, linh kiện, gaming gear và phụ kiện chính hãng. Giá tốt, khuyến mãi hấp dẫn, giao hàng toàn quốc."
        />
      </Helmet>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mt-4">
          <div className="container">
            <SlideShow />

            <div className="w-full hidden md:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 my-4">
              <img src={banner_1} alt="banner_1" className="w-full object-cover" />
              <img src={banner_2} alt="banner_2" className="w-full object-cover" />
              <img src={banner_3} alt="banner_3" className="w-full object-cover" />
              <img src={banner_4} alt="banner_4" className="w-full object-cover" />
            </div>

            <div>
              <ProductRecently />

              <ProductListShow
                getCollectionQuery={getCollectionLaptopTopSold}
                result={result?.result || []}
                title="Laptop bán chạy"
                slug="top-10-laptop-ban-chay"
              />

              <ProductListShow
                getCollectionQuery={getCollectionLaptopGamingTopSold}
                result={resultLaptopGaming?.result || []}
                title="Laptop Gaming bán chạy"
                slug="top-10-laptop-gaming-ban-chay"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <img src={bannerQC1} alt="bannerQC1" className="w-full object-cover rounded-md" />
                <img src={bannerQC2} alt="bannerQC2" className="w-full object-cover rounded-md" />
              </div>

              <ProductListShow
                getCollectionQuery={getCollectionPCTopSold}
                result={resultPC?.result || []}
                title="PC bán chạy"
                slug="top-10-pc-ban-chay"
              />

              <div>
                <img
                  src={bannerMonitor}
                  alt="banner"
                  className="w-full h-[150px] md:h-[230px] lg:h-[300px] rounded-md shadow-3xl"
                />
              </div>

              <ProductListShow
                getCollectionQuery={getCollectionMonitorTopSold}
                result={resultMonitor?.result || []}
                title="Màn hình chính hãng"
                slug="top-10-man-hinh-ban-chay"
              />

              <ProductListShow
                getCollectionQuery={getCollectionMouseTopSold}
                result={resultMouse?.result || []}
                title="Chuột bán chạy"
                slug="top-10-chuot-ban-chay"
              />

              <ProductListShow
                getCollectionQuery={getCollectionKeyboardTopSold}
                result={resultKeyboard?.result || []}
                title="Bàn phím bán chạy"
                slug="top-10-ban-phim-ban-chay"
              />

              <ProductListShow
                getCollectionQuery={getCollectionHeadphoneTopSold}
                result={resultHeadphone?.result || []}
                title="Tai nghe bán chạy"
                slug="top-10-tai-nghe-ban-chay"
              />

              <div className="my-8">
                <h2 className="text-xl font-bold mb-4">Đánh giá sản phẩm mới nhất</h2>
                <Swiper
                  modules={[Navigation, Autoplay]}
                  spaceBetween={20}
                  slidesPerView={1}
                  breakpoints={{
                    320: { slidesPerView: 1 },
                    480: { slidesPerView: 2 },
                    768: { slidesPerView: 3 },
                    1024: { slidesPerView: 4 },
                    1280: { slidesPerView: 4 }
                  }}
                  style={{ paddingBottom: 6 }}
                  autoplay={{ delay: 3000, disableOnInteraction: false }}
                  loop={true}
                >
                  {listTop10ReviewNewest.map((review) => (
                    <SwiperSlide key={review._id}>
                      <div className="bg-white rounded-xl shadow p-4 flex flex-col h-[250px]">
                        <div className="flex items-center gap-3 mb-2">
                          <img
                            src={review.userId.avatar}
                            alt={review.userId.name}
                            className="w-10 h-10 rounded-full object-cover border"
                          />
                          <span className="font-semibold">{review.userId.name}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <img
                            src={review.productId.banner.url}
                            alt={review.productId.name}
                            className="w-12 h-12 object-cover rounded border"
                          />
                          <span className="font-medium text-gray-800">{review.productId.name}</span>
                        </div>
                        <Rate disabled value={review.rating} />
                        <div className="font-medium text-gray-700 mt-2">{review.title}</div>
                        <div className="text-gray-600 mt-1 line-clamp-3">{review.comment}</div>
                        <div className="text-xs text-gray-400 mt-2">
                          {new Date(review.created_at).toLocaleString("vi-VN")}
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
