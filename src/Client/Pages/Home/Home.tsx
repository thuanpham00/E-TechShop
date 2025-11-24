/* eslint-disable import/no-unresolved */
import { Helmet } from "react-helmet-async"
import banner_1 from "src/Assets/img/banner_home/banner_1.webp"
import banner_2 from "src/Assets/img/banner_home/banner_2.webp"
import banner_3 from "src/Assets/img/banner_home/banner_3.webp"
import banner_4 from "src/Assets/img/banner_home/banner_4.webp"
import { SuccessResponse } from "src/Types/utils.type"
import { CollectionItemType } from "src/Types/product.type"
// Import Swiper styles
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import "../../../index.css"
import bannerMonitor from "src/Assets/img/banner_category/asus-monitor.webp"
import useCollectionTopSold from "src/Hook/useCollectionTopSold"
import { motion } from "framer-motion"
import SlideShow from "./Components/SlideShow"
import { Col, Row } from "antd"
import bannerQC1 from "src/Assets/img/banner_home/thang_06_banner_build_pc_top_promotion_banner_2.png"
import bannerQC2 from "src/Assets/img/banner_home/thang_06_banner_ghe_top_promotion_banner_1.png"
import ProductRecently from "src/Client/Components/ProductRecently"
import ProductListShow from "./Components/ProductListShow"

export default function Home() {
  const getCollectionLaptopTopSold = useCollectionTopSold("top-10-laptop-ban-chay", "getCollectionLaptopTopSold")
  const getCollectionLaptopGamingTopSold = useCollectionTopSold(
    "top-10-laptop-gaming-ban-chay",
    "getCollectionLaptopGamingTopSold"
  )
  const getCollectionPCTopSold = useCollectionTopSold("top-10-pc-ban-chay", "getCollectionPCTopSold")
  const getCollectionMonitorTopSold = useCollectionTopSold("top-10-man-hinh-ban-chay", "getCollectionMonitorTopSold")
  const getCollectionKeyboardTopSold = useCollectionTopSold("top-10-ban-phim-ban-chay", "getCollectionKeyboardTopSold")

  const result = getCollectionLaptopTopSold.data?.data as SuccessResponse<CollectionItemType[]>
  const resultLaptopGaming = getCollectionLaptopGamingTopSold.data?.data as SuccessResponse<CollectionItemType[]>
  const resultPC = getCollectionPCTopSold.data?.data as SuccessResponse<CollectionItemType[]>
  const resultMonitor = getCollectionMonitorTopSold.data?.data as SuccessResponse<CollectionItemType[]>
  const resultKeyboard = getCollectionKeyboardTopSold.data?.data as SuccessResponse<CollectionItemType[]>

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

              <ProductListShow
                getCollectionQuery={getCollectionLaptopTopSold}
                result={result?.result || []}
                title="Laptop bán chạy"
              />

              <ProductListShow
                getCollectionQuery={getCollectionLaptopGamingTopSold}
                result={resultLaptopGaming?.result || []}
                title="Laptop Gaming bán chạy"
              />

              <Row gutter={12} className="my-4">
                <Col span={12}>
                  <img src={bannerQC1} alt={bannerQC1} />
                </Col>
                <Col span={12}>
                  <img src={bannerQC2} alt={bannerQC2} />
                </Col>
              </Row>

              <ProductListShow
                getCollectionQuery={getCollectionPCTopSold}
                result={resultPC?.result || []}
                title="PC bán chạy"
              />

              <div>
                <img src={bannerMonitor} alt="banner" className="w-full h-[300px] rounded-md shadow-3xl" />
              </div>

              <ProductListShow
                getCollectionQuery={getCollectionMonitorTopSold}
                result={resultMonitor?.result || []}
                title="Màn hình chính hãng"
              />

              <ProductListShow
                getCollectionQuery={getCollectionMonitorTopSold}
                result={resultMonitor?.result || []}
                title="Màn hình chính hãng"
              />

              <ProductListShow
                getCollectionQuery={getCollectionKeyboardTopSold}
                result={resultKeyboard?.result || []}
                title="Bàn phím bán chạy"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
