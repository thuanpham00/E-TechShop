/* eslint-disable import/no-unresolved */
import { Swiper, SwiperSlide } from "swiper/react"
// Import Swiper styles
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import { Navigation, Pagination, Autoplay } from "swiper/modules"
import banner_1 from "src/Assets/img/banner_home/banner-home-1.jpeg"
import banner_2 from "src/Assets/img/banner_home/banner-home-2.jpeg"
import banner_3 from "src/Assets/img/banner_home/lenovo_brand_700x280px.jpg"
import banner_4 from "src/Assets/img/banner_home/banner-home-3.jpeg"

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
        <img src={banner_1} className="object-cover w-full h-[480px] block rounded-[4px]" alt="banner_1" />
      </SwiperSlide>
      <SwiperSlide>
        <img src={banner_2} className="object-cover w-full h-[480px] block rounded-[4px]" alt="banner_2" />
      </SwiperSlide>
      <SwiperSlide>
        <img src={banner_3} className="object-cover w-full h-[480px] block rounded-[4px]" alt="banner_2" />
      </SwiperSlide>
      <SwiperSlide>
        <img src={banner_4} className="object-cover w-full h-[480px] block rounded-[4px]" alt="banner_2" />
      </SwiperSlide>
    </Swiper>
  )
}
