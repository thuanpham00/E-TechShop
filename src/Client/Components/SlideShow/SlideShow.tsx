/* eslint-disable import/no-unresolved */
import { Swiper, SwiperSlide } from "swiper/react"
// Import Swiper styles
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import { Navigation, Pagination, Keyboard, Autoplay } from "swiper/modules"
import banner_1 from "src/Assets/img/banner_home/banner_5.webp"
import banner_2 from "src/Assets/img/banner_home/banner_6.webp"
import banner_3 from "src/Assets/img/banner_home/banner_7.webp"
import banner_4 from "src/Assets/img/banner_home/banner_8 (1).webp"

export default function SlideShow() {
  return (
    <Swiper
      cssMode={true} // Kích hoạt chế độ CSS để điều khiển hoạt động của slider mà không cần sử dụng JavaScript.
      navigation={true} // Hiển thị các nút "Next" và "Previous" để người dùng điều hướng giữa các slide.
      pagination={true} // Hiển thị các chấm (dots) để chỉ thị số lượng slide và trạng thái slide hiện tại.
      keyboard={true} // Kích hoạt điều hướng bằng bàn phím.
      className="mySwiper"
      autoplay={{
        delay: 3000, // Thời gian giữa các slide (tính bằng ms)
        disableOnInteraction: false // Slide vẫn tiếp tục tự chạy sau khi người dùng tương tác
      }}
      modules={[Navigation, Pagination, Keyboard, Autoplay]}
    >
      <SwiperSlide>
        <img src={banner_1} className="object-cover w-full h-[380px] block rounded-[4px]" alt="banner_1" />
      </SwiperSlide>
      <SwiperSlide>
        <img src={banner_2} className="object-cover w-full h-[380px] block rounded-[4px]" alt="banner_2" />
      </SwiperSlide>
      <SwiperSlide>
        <img src={banner_3} className="object-cover w-full h-[380px] block rounded-[4px]" alt="banner_3" />
      </SwiperSlide>
      <SwiperSlide>
        <img src={banner_4} className="object-cover w-full h-[380px] block rounded-[4px]" alt="banner_4" />
      </SwiperSlide>
    </Swiper>
  )
}
