/* eslint-disable @typescript-eslint/no-explicit-any */
import { BarChart3, Boxes, PackageCheck, Wallet } from "lucide-react"
import { Helmet } from "react-helmet-async"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { adminAPI } from "src/Apis/admin.api"
import { SuccessResponse } from "src/Types/utils.type"
import Skeleton from "src/Components/Skeleton"
import NavigateBack from "src/Admin/Components/NavigateBack"
import { motion } from "framer-motion"
import { formatCurrency } from "src/Helpers/common"
import { Chart, Pie } from "react-chartjs-2"
import { Col, DatePicker, Row, Switch } from "antd"
import ChartDataLabels from "chartjs-plugin-datalabels"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  ChartOptions
} from "chart.js"
import dayjs, { Dayjs } from "dayjs"
import { useState } from "react"

type TypeStatistical = {
  title: string
  value: number | any[]
  color?: string
}

ChartJS.register(
  CategoryScale,
  ArcElement,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ChartDataLabels,
  Title,
  Tooltip,
  Legend
)
// queryClient.invalidateQueries({ queryKey: ["listOrderClient", token] })

const statusOrder = ["Chờ xác nhận", "Đang xử lý", "Đang vận chuyển", "Đã giao hàng", "Đã hủy"]

export default function Dashboard() {
  const [selectedMonth, setSelectedMonth] = useState<Dayjs>(dayjs())

  const getStatisticalSell = useQuery({
    queryKey: ["getStatisticalSell", selectedMonth.format("YYYY-MM")],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort()
      }, 10000) // quá 10 giây api chưa trả res về thì timeout sẽ hủy gọi api và api signal nhận tín hiệu hủy
      const month = selectedMonth.month() + 1
      const year = selectedMonth.year()

      return adminAPI.statistical.getStatisticalSell(controller.signal, {
        month: month,
        year: year
      })
    },
    placeholderData: keepPreviousData,
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 1 * 60 * 1000 // dưới 5 phút nó không gọi lại api
  })

  const getStatisticalProduct = useQuery({
    queryKey: ["getStatisticalProduct"],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort()
      }, 10000) // quá 10 giây api chưa trả res về thì timeout sẽ hủy gọi api và api signal nhận tín hiệu hủy

      return adminAPI.statistical.getStatisticalProduct(controller.signal)
    },
    placeholderData: keepPreviousData,
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 1 * 60 * 1000 // dưới 5 phút nó không gọi lại api
  })

  /**
   * AbortController giúp theo dõi và hủy request.
  Sau 10 giây, abort() được gọi, báo hiệu cho request dừng lại.
  API nhận tín hiệu hủy thông qua signal, nếu request chưa hoàn thành, nó sẽ bị ngắt.
  React Query nhận biết request bị hủy và xử lý theo trạng thái lỗi.
   */

  const dataStatisticalSell = getStatisticalSell?.data?.data as SuccessResponse<{
    totalCustomer: TypeStatistical
    totalOrder: TypeStatistical
    totalProductSold: TypeStatistical
    avgOrderValue: TypeStatistical
    countCategory: TypeStatistical
    top10ProductSold: TypeStatistical
    rateStatusOrder: any[]
  }>

  const dataStatisticalProduct = getStatisticalProduct?.data?.data as SuccessResponse<{
    countCategory: TypeStatistical
    top10ProductSold: TypeStatistical
  }>

  const totalCustomer = dataStatisticalSell?.result.totalCustomer
  const totalOrder = dataStatisticalSell?.result.totalOrder
  const totalProductSold = dataStatisticalSell?.result.totalProductSold
  const avgOrderValue = dataStatisticalSell?.result.avgOrderValue

  const countCategory = dataStatisticalProduct?.result.countCategory
  const labelData_CountCategory = (countCategory?.value as any[])?.map((item) => item.categoryName)
  const data_countCategory = (countCategory?.value as any[])?.map((item) => item.total)

  const top10ProductSold = dataStatisticalProduct?.result.top10ProductSold
  const labelData_Top10Product = (top10ProductSold?.value as any[])?.map((item) => item.name)
  const data_top10ProductSold = (top10ProductSold?.value as any[])?.map((item) => item.sold)

  const rateStatusOrder = dataStatisticalSell?.result.rateStatusOrder
  const data_rateStatusOrder = statusOrder.map((status) => {
    const found = rateStatusOrder?.find((item) => item.name === status)
    return found ? found.rate : 0 // Nếu không có, gán 0
  })

  const options: ChartOptions<"bar"> = {
    indexAxis: "y", // 🔥 Biểu đồ cột ngang
    responsive: true,
    interaction: {
      mode: "nearest",
      axis: "y",
      intersect: false
    },
    maintainAspectRatio: false, // giúp biểu đồ co dãn tốt
    plugins: {
      legend: { display: true },
      title: {
        display: true,
        text: "Thống kê sản phẩm theo danh mục",
        font: { size: 16, weight: 500 },
        padding: { top: 10, bottom: 10 }
      },
      tooltip: {
        mode: "index",
        intersect: false
      },
      datalabels: {
        anchor: "end", // vị trí gắn label (start, center, end)
        align: "right", // vị trí theo hướng ngang (left, right, center)
        formatter: (value) => `${value}`, // custom cách hiển thị số
        font: {
          weight: "normal"
        },
        color: "#000" // màu chữ
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Số lượng sản phẩm"
        }
      },
      y: {
        title: {
          display: true,
          text: "Danh mục"
        }
      }
    }
  }

  const options2: ChartOptions<"bar"> = {
    indexAxis: "y", // 🔥 Biểu đồ cột ngang
    responsive: true,
    interaction: {
      mode: "nearest",
      axis: "y",
      intersect: false
    },
    maintainAspectRatio: false, // giúp biểu đồ co dãn tốt
    plugins: {
      legend: { display: true },
      title: {
        display: true,
        text: "Top 10 sản phẩm bán chạy nhất thời đại",
        font: { size: 16, weight: 500 },
        padding: { top: 10, bottom: 10 }
      },
      tooltip: {
        mode: "index",
        intersect: false
      },
      datalabels: {
        anchor: "end", // vị trí gắn label (start, center, end)
        align: "right", // vị trí theo hướng ngang (left, right, center)
        formatter: (value) => `${value}`, // custom cách hiển thị số
        font: {
          weight: "normal"
        },
        color: "#000" // màu chữ
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Số lượt bán"
        }
      }
    }
  }

  const pieOptions: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const
      },
      title: {
        display: true,
        text: "Tỷ lệ trạng thái đơn hàng",
        font: { size: 16 },
        padding: { top: 10, bottom: 10 }
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const find = rateStatusOrder.find((item) => item.name === context.label)
            const total = find?.total ?? 0
            const rate = find?.rate ?? 0
            const status = find?.name ?? ""
            // Hiển thị đầy đủ thông tin
            return `${status}: ${total} đơn (${rate}%)`
          }
        }
      },
      datalabels: {
        formatter: (value: any) => `${value}%`, // custom cách hiển thị số
        color: "#fff", // màu chữ trắng
        font: {
          weight: "normal",
          size: 15
        }
      }
    }
  }

  const dataChart = {
    labels: labelData_CountCategory,
    datasets: [
      {
        label: "Số lượng",
        data: data_countCategory,
        backgroundColor: "rgba(75, 192, 192, 0.7)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1
      }
    ]
  }

  const dataChart_2 = {
    labels: labelData_Top10Product,
    datasets: [
      {
        label: "Lượt bán",
        data: data_top10ProductSold,
        backgroundColor: "rgba(212, 63, 21, 0.7)",
        borderColor: "#e86e22",
        borderWidth: 1
      }
    ]
  }

  const pieData = {
    labels: statusOrder,
    datasets: [
      {
        data: data_rateStatusOrder,
        backgroundColor: ["#d46b08", "#0958d9", "#08979c", "#389e0d", "#cf1322"],
        borderWidth: 1
      }
    ]
  }

  const [isMonthly, setIsMonthly] = useState(true) // true = theo tháng, false = theo năm

  return (
    <div>
      <Helmet>
        <title>Quản lý thống kê hệ thống</title>
        <meta
          name="description"
          content="Đây là trang TECHZONE | Laptop, PC, Màn hình, điện thoại, linh kiện Chính Hãng"
        />
      </Helmet>
      <NavigateBack />
      <div>
        <h1 className="text-2xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 my-2">
          Thống kê hệ thống
        </h1>
        {getStatisticalSell.isLoading && <Skeleton />}
        {!getStatisticalSell.isFetching ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between">
              <div className="text-base font-semibold tracking-wide">Quản lý bán hàng</div>
              <div className="flex gap-1 items-center">
                <Switch
                  checkedChildren="Theo tháng"
                  unCheckedChildren="Theo năm"
                  defaultChecked
                  onChange={(checked) => {
                    setIsMonthly(checked)
                  }}
                />
                {isMonthly ? (
                  <DatePicker
                    value={selectedMonth}
                    onChange={(date) => {
                      if (date) {
                        setSelectedMonth(date)
                      }
                    }}
                    picker="month"
                    format="MM/YYYY"
                    placeholder="Chọn tháng"
                  />
                ) : (
                  <DatePicker
                    value={selectedMonth}
                    // onChange={(value) => {
                    //   const updated = selectDate.year(value.year()) // giữ nguyên tháng hiện tại
                    //   setSelectDate(updated)
                    // }}
                    picker="year"
                    format="YYYY"
                    placeholder="Chọn năm"
                  />
                )}
              </div>
            </div>
            <Row gutter={[24, 24]} className="mt-2">
              <Col span={6}>
                <div
                  style={{ height: "100%" }}
                  className="border-gray-500 shadow-md rounded-xl bg-white p-6 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div className="text-sm font-semibold tracking-wide mr-2">{totalCustomer?.title}</div>
                    <Wallet size={22} color="black" />
                  </div>
                  <div className={`text-2xl font-semibold mt-4`} style={{ color: totalCustomer?.color }}>
                    {formatCurrency((totalCustomer?.value as number) || 0)}đ
                  </div>
                </div>
              </Col>

              <Col span={6}>
                <div
                  style={{ height: "100%" }}
                  className="border-gray-500 shadow-md rounded-xl bg-white p-6 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div className="text-sm font-semibold tracking-wide mr-2">{avgOrderValue?.title}</div>
                    <BarChart3 size={22} color="black" />
                  </div>
                  <div className={`text-2xl font-semibold mt-4`} style={{ color: avgOrderValue?.color }}>
                    {formatCurrency((avgOrderValue?.value as number) || 0)}đ
                  </div>
                </div>
              </Col>

              <Col span={6}>
                <div
                  style={{ height: "100%" }}
                  className="border-gray-500 shadow-md rounded-xl bg-white p-6 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div className="text-sm font-semibold tracking-wide mr-2">{totalOrder?.title}</div>
                    <PackageCheck size={22} color="black" />
                  </div>
                  <div className={`text-2xl font-semibold mt-4`} style={{ color: totalOrder?.color }}>
                    {totalOrder?.value || 0}
                  </div>
                </div>
              </Col>

              <Col span={6}>
                <div
                  style={{ height: "100%" }}
                  className="border-gray-500 shadow-md rounded-xl bg-white p-6 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div className="text-sm font-semibold tracking-wide mr-2">{totalProductSold?.title}</div>
                    <Boxes size={22} color="black" />
                  </div>
                  <div className={`text-2xl font-semibold mt-4`} style={{ color: totalProductSold?.color }}>
                    {totalProductSold?.value || 0}
                  </div>
                </div>
              </Col>

              <Col span={12}>
                <div
                  style={{
                    backgroundColor: "white",
                    border: "1px solid #dadada",
                    height: 380,
                    display: "flex",
                    justifyContent: "center",
                    borderRadius: "12px"
                  }}
                >
                  <Pie data={pieData} options={pieOptions} />
                </div>
              </Col>
            </Row>
          </motion.div>
        ) : (
          ""
        )}

        {getStatisticalProduct.isLoading && <Skeleton />}
        {!getStatisticalProduct.isFetching ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mt-4">
              <div className="text-base font-semibold tracking-wide">Quản lý sản phẩm</div>
              <Row gutter={24} className="mt-2">
                <Col span={12}>
                  <div
                    className="shadow-xl p-6"
                    style={{
                      border: "1px solid #dadada",
                      borderRadius: "8px",
                      backgroundColor: "white",
                      height: "350px"
                    }}
                  >
                    <Chart type="bar" data={dataChart} options={options} />
                  </div>
                </Col>
                <Col span={12}>
                  <div
                    className="shadow-xl p-6"
                    style={{
                      border: "1px solid #dadada",
                      borderRadius: "8px",
                      backgroundColor: "white",
                      height: "350px"
                    }}
                  >
                    <Chart type="bar" data={dataChart_2} options={options2} />
                  </div>
                </Col>
              </Row>
            </div>
          </motion.div>
        ) : (
          ""
        )}
      </div>
    </div>
  )
}
