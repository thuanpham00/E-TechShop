/* eslint-disable import/no-unresolved */
import { Helmet } from "react-helmet-async"
import banner_1 from "src/Assets/img/banner_home/banner_1.webp"
import banner_2 from "src/Assets/img/banner_home/banner_2.webp"
import banner_3 from "src/Assets/img/banner_home/banner_3.webp"
import banner_4 from "src/Assets/img/banner_home/banner_4.webp"
import { Fragment } from "react"
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
import bannerMonitor from "src/Assets/img/banner_category/asus-monitor.webp"
import useCollectionTopSold from "src/Hook/useCollectionTopSold"
import { motion } from "framer-motion"
import SlideShow from "./Components/SlideShow"
import { Col, Row } from "antd"
import bannerQC1 from "src/Assets/img/banner_home/thang_06_banner_build_pc_top_promotion_banner_2.png"
import bannerQC2 from "src/Assets/img/banner_home/thang_06_banner_ghe_top_promotion_banner_1.png"
import ProductRecently from "src/Client/Components/ProductRecently"

export default function Home() {
  const navigate = useNavigate()

  const getCollectionLaptopTopSold = useCollectionTopSold("top-10-laptop-ban-chay", "getCollectionLaptopTopSold")
  const getCollectionLaptopGamingTopSold = useCollectionTopSold(
    "top-10-laptop-gaming-ban-chay",
    "getCollectionLaptopGamingTopSold"
  )
  const getCollectionPCTopSold = useCollectionTopSold("top-10-pc-ban-chay", "getCollectionPCTopSold")
  const getCollectionMonitorTopSold = useCollectionTopSold("top-10-man-hinh-ban-chay", "getCollectionMonitorTopSold")

  const result = getCollectionLaptopTopSold.data?.data as SuccessResponse<CollectionItemType[]>
  const resultLaptopGaming = getCollectionLaptopGamingTopSold.data?.data as SuccessResponse<CollectionItemType[]>
  const resultPC = getCollectionPCTopSold.data?.data as SuccessResponse<CollectionItemType[]>
  const resultMonitor = getCollectionMonitorTopSold.data?.data as SuccessResponse<CollectionItemType[]>

  const handleNavigateCollections = (slug: string) => {
    navigate(`/collections/${slug}`)
  }

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
            <div className="col-span-10">
              <SlideShow />
            </div>

            <div className="w-full grid grid-cols-4 gap-4 my-4">
              <img src={banner_1} alt="banner_1" className="col-span-1 object-cover" />
              <img src={banner_2} alt="banner_2" className="col-span-1 object-cover" />
              <img src={banner_3} alt="banner_3" className="col-span-1 object-cover" />
              <img src={banner_4} alt="banner_4" className="col-span-1 object-cover" />
            </div>

            <div>
              <ProductRecently />

              <div className="relative bg-white rounded-lg border border-gray-200 my-4 p-4">
                {getCollectionLaptopTopSold.isLoading && <Skeleton />}
                {!getCollectionLaptopTopSold.isFetching && (
                  <Fragment>
                    <div className="flex justify-between items-center">
                      <h1 className="text-xl font-semibold mb-2">Laptop bán chạy</h1>
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
                      {result?.result.map((item, index) => (
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

              <div className="relative bg-white rounded-lg border border-gray-200 my-4 p-4">
                {getCollectionLaptopGamingTopSold.isLoading && <Skeleton />}
                {!getCollectionLaptopGamingTopSold.isFetching && (
                  <Fragment>
                    <div className="flex justify-between items-center">
                      <h1 className="text-xl font-semibold mb-2">Laptop Gaming bán chạy</h1>
                      <button
                        onClick={() => handleNavigateCollections("top-10-laptop-gaming-ban-chay")}
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
                      {resultLaptopGaming?.result.map((item, index) => (
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

              <Row gutter={12} className="my-4">
                <Col span={12}>
                  <img src={bannerQC1} alt={bannerQC1} />
                </Col>
                <Col span={12}>
                  <img src={bannerQC2} alt={bannerQC2} />
                </Col>
              </Row>

              <div className="relative bg-white rounded-lg border border-gray-200 my-4 p-4">
                {getCollectionPCTopSold.isLoading && <Skeleton />}
                {!getCollectionPCTopSold.isFetching && (
                  <Fragment>
                    <div className="flex justify-between items-center">
                      <h1 className="text-xl font-semibold mb-2">PC bán chạy</h1>
                      <button
                        onClick={() => handleNavigateCollections("top-10-pc-ban-chay")}
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
                      {resultPC?.result.map((item, index) => (
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

              <div>
                <img src={bannerMonitor} alt="banner" className="w-full h-[300px] rounded-md shadow-3xl" />
              </div>

              <div className="relative bg-white rounded-lg border border-gray-200 my-4 p-4">
                {getCollectionMonitorTopSold.isLoading && <Skeleton />}
                {!getCollectionMonitorTopSold.isFetching && (
                  <Fragment>
                    <div className="flex justify-between items-center">
                      <h1 className="text-xl font-semibold mb-2">Màn hình chính hãng</h1>
                      <button
                        onClick={() => handleNavigateCollections("top-10-man-hinh-ban-chay")}
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
                      {resultMonitor?.result.map((item, index) => (
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
      </motion.div>
    </div>
  )
}
