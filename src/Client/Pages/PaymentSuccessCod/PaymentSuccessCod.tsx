import { Steps } from "antd"
import { ChevronLeft } from "lucide-react"
import { Helmet } from "react-helmet-async"
import { Link, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { path } from "src/Constants/path"
import { convertDateTime, formatCurrency } from "src/Helpers/common"
import { useEffect, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { getAccessTokenFromLS } from "src/Helpers/auth"

export default function PaymentSuccessCod() {
  const queryClient = useQueryClient()
  const token = getAccessTokenFromLS()
  const { state } = useLocation()
  const infoOrder = state?.infoOrder
  const calledRef = useRef(false)

  useEffect(() => {
    window.scroll(0, 0) // scroll mượt
  }, [])

  useEffect(() => {
    if (calledRef.current) return
    queryClient.invalidateQueries({ queryKey: ["listCart", token] })
    queryClient.invalidateQueries({ queryKey: ["listOrder", token] })
    calledRef.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      <Helmet>
        <title>Thanh toán thành công</title>
        <meta
          name="description"
          content="Đơn hàng của bạn đã được thanh toán thành công tại TechZone. Chúng tôi sẽ xử lý và giao hàng trong thời gian sớm nhất."
        />
      </Helmet>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="my-4">
          <div className="container" style={{ maxWidth: "70rem" }}>
            <Link to={"/home"} className="flex items-center gap-[2px] cursor-pointer">
              <ChevronLeft size={16} color="blue" />
              <span className="text-[14px] font-medium text-blue-500">Mua thêm sản phẩm khác</span>
            </Link>

            <div className="p-4 bg-white rounded-md mt-4">
              <div className="relative">
                <div className="bg-red-50 px-4 py-6">
                  <Steps
                    size="small"
                    current={3}
                    type="default"
                    items={[
                      {
                        title: <span style={{ color: "red", fontWeight: "500" }}>Giỏ hàng</span>
                      },
                      {
                        title: <span style={{ color: "red", fontWeight: "500" }}>Thông tin đặt hàng</span>
                      },
                      {
                        title: <span style={{ color: "red", fontWeight: "500" }}>Thanh toán</span>
                      },
                      {
                        title: <span style={{ color: "red", fontWeight: "500" }}>Hoàn tất</span>
                      }
                    ]}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-center bg-gray-100">
                    <div className="my-8 w-full max-w-[480px] bg-white rounded-2xl shadow-xl p-8">
                      <div className="flex flex-col items-center">
                        <div className="bg-green-100 p-4 rounded-full ">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="#22c55e"
                            className="h-10 w-10"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0Z"
                            />
                          </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-green-600 mt-4">Đặt hàng thành công</h2>
                        <p className="text-sm text-gray-500 text-center mt-2">
                          Cảm ơn bạn đã đặt hàng. Vui lòng thanh toán trước khi nhận hàng.
                        </p>
                      </div>

                      <div className="border-t border-gray-200 mt-6 pt-4 space-y-3 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Mã đơn hàng:</span>
                          <span className="text-gray-800">{infoOrder?._id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Phương thức thanh toán:</span>
                          <span className="text-gray-800 text-right">
                            {infoOrder?.type_order === "cod"
                              ? "Thanh toán khi giao hàng"
                              : "Thanh toán online qua VNpay"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Khách hàng:</span>
                          <span className="text-gray-800">{infoOrder?.customer_info.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Số điện thoại:</span>
                          <span className="text-gray-800">{infoOrder?.customer_info.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Địa chỉ nhận hàng:</span>
                          <span className="text-gray-800">{infoOrder?.customer_info.address}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Ngày đặt:</span>
                          <span className="text-gray-800 text-right">{convertDateTime(infoOrder?.updated_at)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-base text-black pt-2 border-t border-gray-100">
                          <span>Số tiền cần thanh toán:</span>
                          <span>{formatCurrency(infoOrder?.totalAmount)}đ</span>
                        </div>
                      </div>

                      <Link
                        to={path.Home}
                        className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-full flex items-center justify-center gap-2 transition"
                      >
                        Tiếp tục mua sắm
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                          />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
