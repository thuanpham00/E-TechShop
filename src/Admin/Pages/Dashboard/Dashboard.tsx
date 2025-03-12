import { PackageSearch, Truck, User, Users } from "lucide-react"
import { Helmet } from "react-helmet-async"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { adminAPI } from "src/Apis/admin.api"
import { SuccessResponse } from "src/Types/utils.type"
import Statistical from "./Components/Statistical"
import Skeleton from "src/Components/Skeleton"
import NavigateBack from "src/Admin/Components/NavigateBack"

const statistical = [
  {
    name: "Số lượng Lượt bán",
    icon: <Truck size={22} color="white" />,
    classNameCircle: "bg-primaryBlue"
  },
  {
    name: "Số lượng Khách hàng",
    icon: <User size={22} color="white" />,
    classNameCircle: "bg-[#ffbe0b]"
  },
  {
    name: "Số lượng Nhân viên",
    icon: <Users size={22} color="white" />,
    classNameCircle: "bg-[#df0019]"
  },
  {
    name: "Số lượng Sản phẩm",
    icon: <PackageSearch size={22} color="white" />,
    classNameCircle: "bg-[#85cb33]"
  }
]

const statisticalMapping = {
  "Số lượng Lượt bán": "totalSales",
  "Số lượng Khách hàng": "totalCustomer",
  "Số lượng Nhân viên": "totalEmployee",
  "Số lượng Sản phẩm": "totalProduct"
}

export default function Dashboard() {
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["getStatistical"],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort()
      }, 10000) // quá 10 giây api chưa trả res về thì timeout sẽ hủy gọi api và api signal nhận tín hiệu hủy
      return adminAPI.statistical.getStatistical(controller.signal)
    },
    placeholderData: keepPreviousData,
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 5 * 60 * 1000 // dưới 5 phút nó không gọi lại api
  })

  /**
   * AbortController giúp theo dõi và hủy request.
  Sau 10 giây, abort() được gọi, báo hiệu cho request dừng lại.
  API nhận tín hiệu hủy thông qua signal, nếu request chưa hoàn thành, nó sẽ bị ngắt.
  React Query nhận biết request bị hủy và xử lý theo trạng thái lỗi.
   */

  const dataStatistical = data?.data as SuccessResponse<{
    totalCustomer: string
    totalProduct: string
    totalEmployee: string
    totalSales: string
  }>

  return (
    <div>
      <Helmet>
        <title>Quản lý hệ thống Quản trị viên</title>
        <meta
          name="description"
          content="Đây là trang TECHZONE | Laptop, PC, Màn hình, điện thoại, linh kiện Chính Hãng"
        />
      </Helmet>
      <NavigateBack />
      <div>
        {isLoading && <Skeleton />}
        {!isFetching ? (
          <div className="flex items-center flex-wrap gap-4">
            {statistical.map((item, index) => {
              const key = statisticalMapping[item.name as keyof typeof statisticalMapping]
              const value = dataStatistical?.result[key as keyof typeof dataStatistical.result] || "0" // đảm bảo key phải là 1 trong các giá trị của keyof typeof
              return (
                <div key={index} className="flex-1">
                  <Statistical classNameCircle={item.classNameCircle} name={item.name} icon={item.icon} value={value} />
                </div>
              )
            })}
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  )
}
