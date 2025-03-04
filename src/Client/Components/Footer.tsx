import logo_ghn from "src/Assets/img/home/Logo-GHN-Orange.webp"
import logo_ghtk from "src/Assets/img/home/logo_ghtk.webp"
import logo_fb from "src/Assets/img/home/logo_fb.webp"
import logo_ins from "src/Assets/img/home/logo_ins.webp"

export function Footer() {
  return (
    <footer className="bg-gray-100 p-4 border-black/10 border-t text-gray-800">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-5 gap-8 px-4">
        {/* VỀ GEARVN */}
        <div>
          <h4 className="text-base mb-2 font-semibold">VỀ TECHZONE</h4>
          <ul className="space-y-2">
            <li>
              <a href="#gioithieu" className="hover:text-blue-500">
                Giới thiệu
              </a>
            </li>
            <li>
              <a href="#tuyendung" className="hover:text-blue-500">
                Tuyển dụng
              </a>
            </li>
          </ul>
        </div>

        {/* CHÍNH SÁCH */}
        <div>
          <h4 className="text-base mb-2 font-semibold">CHÍNH SÁCH</h4>
          <ul className="space-y-2">
            <li>
              <a href="#baohanh" className="hover:text-blue-500">
                Chính sách bảo hành
              </a>
            </li>
            <li>
              <a href="#giaohang" className="hover:text-blue-500">
                Chính sách giao hàng
              </a>
            </li>
            <li>
              <a href="#baomat" className="hover:text-blue-500">
                Chính sách bảo mật
              </a>
            </li>
          </ul>
        </div>

        {/* THÔNG TIN */}
        <div>
          <h4 className="text-base mb-2 font-semibold">THÔNG TIN</h4>
          <ul className="space-y-2">
            <li>
              <a href="#hethongcuahang" className="hover:text-blue-500">
                Hệ thống cửa hàng
              </a>
            </li>
            <li>
              <a href="#huongdanmuahang" className="hover:text-blue-500">
                Hướng dẫn mua hàng
              </a>
            </li>
            <li>
              <a href="#huongdanthanhtoan" className="hover:text-blue-500">
                Hướng dẫn thanh toán
              </a>
            </li>
            <li>
              <a href="#tragop" className="hover:text-blue-500">
                Hướng dẫn trả góp
              </a>
            </li>
            <li>
              <a href="#baohanh" className="hover:text-blue-500">
                Tra cứu địa chỉ bảo hành
              </a>
            </li>
            <li>
              <a href="#vesinhmienphi" className="hover:text-blue-500">
                Dịch vụ vệ sinh miễn phí
              </a>
            </li>
          </ul>
        </div>

        {/* TỔNG ĐÀI HỖ TRỢ */}
        <div>
          <h4 className="text-base mb-2 font-semibold">TỔNG ĐÀI HỖ TRỢ (9:00 - 22:00)</h4>
          <ul className="space-y-2">
            <li>
              Mua hàng:{" "}
              <a href="tel:19005301" className="text-blue-500">
                1900.0912
              </a>
            </li>
            <li>
              Bảo hành:{" "}
              <a href="tel:19005325" className="text-blue-500">
                1900.0912
              </a>
            </li>
            <li>
              Khiếu nại:{" "}
              <a href="tel:18006173" className="text-blue-500">
                1900.0912
              </a>
            </li>
            <li>
              Email:{" "}
              <a href="mailto:phamminhthuan912@gmail.com" className="text-blue-500">
                phamminhthuan912@gmail.com
              </a>
            </li>
          </ul>
        </div>

        {/* ĐƠN VỊ VẬN CHUYỂN */}
        <div>
          <h4 className="text-base mb-2 font-semibold">ĐƠN VỊ VẬN CHUYỂN</h4>
          <div className="flex items-center space-x-4">
            <img src={logo_ghtk} alt="EMS Việt Nam" className="w-10 h-10" />
            <img src={logo_ghn} alt="GHN Express" className="w-10 h-10" />
          </div>
        </div>
      </div>
      <div className="mt-10 border-t border-gray-300 py-3 text-center">
        <h4 className="text-base mb-2 font-semibold">KẾT NỐI VỚI CHÚNG TÔI</h4>
        <div className="flex justify-center items-center space-x-2">
          <a href="https://www.facebook.com/thuanpham.plus/" className="hover:scale-110 transition">
            <img src={logo_fb} alt="Facebook" className="w-8 h-8" />
          </a>
          <a href="https://www.instagram.com/minthuan_/" className="hover:scale-110 transition">
            <img src={logo_ins} alt="YouTube" className="w-[36px] h-[36px]" />
          </a>
        </div>
        <p className="mt-2">
          <strong>
            Dự án lấy ý tưởng thiết kế và hình ảnh từ website gear.vn ... mang mục đích học tập và phi thương mại.
          </strong>
        </p>
      </div>
    </footer>
  )
}
