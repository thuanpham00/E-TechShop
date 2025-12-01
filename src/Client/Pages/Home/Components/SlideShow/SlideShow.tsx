/* eslint-disable import/no-unresolved */
import { Swiper, SwiperSlide } from "swiper/react"
// Import Swiper styles
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import { Navigation, Pagination, Autoplay } from "swiper/modules"
import banner_1 from "src/Assets/img/banner_category/acer.webp"
import banner_2 from "src/Assets/img/banner_category/asus.webp"
import banner_3 from "src/Assets/img/banner_category/laptop_duoi_15_trieu.webp"
import banner_4 from "src/Assets/img/banner_category/lenovo.webp"
import banner_5 from "src/Assets/img/banner_category/thang_02_pc_gvn_banner_web_collection_1920x420.webp"
import banner_7 from "src/Assets/img/banner_category/asus-monitor.webp"
import banner_8 from "src/Assets/img/banner_category/dell-monitor.webp"
import banner_9 from "src/Assets/img/banner_category/banner-man-hinh-viewsonic.jpg"

export default function SlideShow() {
  return (
    <Swiper
      cssMode={true} // Kích hoạt chế độ CSS để điều khiển hoạt động của slider mà không cần sử dụng JavaScript.
      navigation={true} // Hiển thị các nút "Next" và "Previous" để người dùng điều hướng giữa các slide.
      pagination={true} // Hiển thị các chấm (dots) để chỉ thị số lượng slide và trạng thái slide hiện tại.
      className="mySwiper"
      autoplay={{
        delay: 3000, // Thời gian giữa các slide (tính bằng ms)
        disableOnInteraction: false // Slide vẫn tiếp tục tự chạy sau khi người dùng tương tác
      }}
      loop={true}
      modules={[Navigation, Pagination, Autoplay]}
    >
      <SwiperSlide>
        <img
          src={banner_1}
          width={1920}
          height={420}
          className="object-fill w-full h-[150px] md:h-[230px] lg:h-[300px] block rounded-md"
          alt="banner_1"
        />
      </SwiperSlide>
      <SwiperSlide>
        <img
          src={banner_2}
          width={1920}
          height={420}
          className="object-fill w-full h-[150px] md:h-[230px] lg:h-[300px] block rounded-md"
          alt="banner_2"
        />
      </SwiperSlide>
      <SwiperSlide>
        <img
          src={banner_3}
          width={1920}
          height={420}
          className="object-fill w-full h-[150px] md:h-[230px] lg:h-[300px] block rounded-md"
          alt="banner_2"
        />
      </SwiperSlide>
      <SwiperSlide>
        <img
          src={banner_4}
          width={1920}
          height={420}
          className="object-fill w-full h-[150px] md:h-[230px] lg:h-[300px] block rounded-md"
          alt="banner_2"
        />
      </SwiperSlide>
      <SwiperSlide>
        <img
          src={banner_5}
          width={1920}
          height={420}
          className="object-fill w-full h-[150px] md:h-[230px] lg:h-[300px] block rounded-md"
          alt="banner_1"
        />
      </SwiperSlide>
      <SwiperSlide>
        <img
          src={banner_7}
          width={1920}
          height={420}
          className="object-fill w-full h-[150px] md:h-[230px] lg:h-[300px] block rounded-md"
          alt="banner_2"
        />
      </SwiperSlide>
      <SwiperSlide>
        <img
          src={banner_8}
          width={1920}
          height={420}
          className="object-fill w-full h-[150px] md:h-[230px] lg:h-[300px] block rounded-md"
          alt="banner_2"
        />
      </SwiperSlide>
      <SwiperSlide>
        <img
          src={banner_9}
          width={1920}
          height={420}
          className="object-fill w-full h-[150px] md:h-[230px] lg:h-[300px] block rounded-md"
          alt="banner_2"
        />
      </SwiperSlide>
    </Swiper>
  )
}
