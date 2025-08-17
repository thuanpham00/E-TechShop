/* eslint-disable @typescript-eslint/no-explicit-any */
import { BarChart3, Boxes, PackageCheck, Wallet } from "lucide-react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { adminAPI } from "src/Apis/admin.api"
import { SuccessResponse } from "src/Types/utils.type"
import Skeleton from "src/Components/Skeleton"
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

const statusOrder = ["Chờ xác nhận", "Đang xử lý", "Đang vận chuyển", "Đã giao hàng", "Đã hủy"]

export default function StatisticalSell() {
  const [selectedMonth, setSelectedMonth] = useState<Dayjs>(dayjs())
  const [selectedYear, setSelectedYear] = useState<number>(dayjs().year())
  const [isMonthly, setIsMonthly] = useState(true) // true = theo tháng, false = theo năm

  const getStatisticalSell = useQuery({
    queryKey: isMonthly
      ? ["getStatisticalSell", "month", selectedMonth.format("YYYY-MM")]
      : ["getStatisticalSell", "year", selectedYear],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort()
      }, 10000) // quá 10 giây api chưa trả res về thì timeout sẽ hủy gọi api và api signal nhận tín hiệu hủy
      const month = selectedMonth.month() + 1
      const year = isMonthly ? selectedMonth.year() : selectedYear

      return adminAPI.statistical.getStatisticalSell(controller.signal, {
        ...(isMonthly ? { month } : {}),
        year: year
      })
    },
    placeholderData: keepPreviousData,
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 1 * 60 * 1000 // dưới 5 phút nó không gọi lại api
  })

  const dataStatisticalSell = getStatisticalSell?.data?.data as SuccessResponse<{
    totalCustomer: TypeStatistical
    totalOrder: TypeStatistical
    totalProductSold: TypeStatistical
    avgOrderValue: TypeStatistical
    countCategory: TypeStatistical
    top10ProductSold: TypeStatistical
    rateStatusOrder: any[]
    revenueFor6Month: TypeStatistical
  }>

  const totalCustomer = dataStatisticalSell?.result.totalCustomer
  const totalOrder = dataStatisticalSell?.result.totalOrder
  const totalProductSold = dataStatisticalSell?.result.totalProductSold
  const avgOrderValue = dataStatisticalSell?.result.avgOrderValue

  // xử lý biểu đồ tỷ lệ trạng thái đơn hàng
  const rateStatusOrder = dataStatisticalSell?.result.rateStatusOrder
  const data_rateStatusOrder = statusOrder.map((status) => {
    const found = rateStatusOrder?.find((item) => item.name === status)
    return found ? found.rate : 0 // Nếu không có, gán 0
  })

  // xử lý biểu đồ doanh thu 6 tháng gần nhất
  const revenueFor6Month = dataStatisticalSell?.result.revenueFor6Month
  const labelData_revenueFor6Month = (revenueFor6Month?.value as any[])?.map((item: any) => item.label)
  const data_revenueFor6Month = (revenueFor6Month?.value as any[])?.map((item: any) => item.revenue)

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

  const options3: ChartOptions<"bar" | "line"> = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: {
        display: true,
        text: "Doanh thu 6 tháng gần nhất",
        font: { size: 16, weight: 500 },
        padding: { top: 10, bottom: 10 }
      },
      datalabels: {
        formatter: function (value: number) {
          return value.toLocaleString("vi-VN") + "đ"
        },
        font: {
          weight: "normal"
        },
        color: "#000" // màu chữ
      }
    },
    interaction: {
      mode: "index" as const,
      intersect: false
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Triệu đồng"
        }
      }
    }
  }

  const dataChart_3 = {
    labels: labelData_revenueFor6Month,
    datasets: [
      {
        type: "bar" as const,
        label: "Doanh thu",
        data: data_revenueFor6Month,
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
        yAxisID: "y"
      },
      {
        type: "line" as const,
        label: "Xu hướng",
        data: data_revenueFor6Month,
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        tension: 0.3,
        yAxisID: "y"
      }
    ]
  }

  return (
    <>
      {getStatisticalSell.isLoading && <Skeleton />}
      {!getStatisticalSell.isFetching ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex gap-1 items-center mb-3 justify-end">
            <Switch
              checkedChildren="Theo năm"
              unCheckedChildren="Theo tháng"
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
                value={dayjs().year(selectedYear)}
                onChange={(value) => {
                  setSelectedYear(value.year())
                }}
                picker="year"
                format="YYYY"
                placeholder="Chọn năm"
              />
            )}
          </div>
          <Row gutter={[24, 24]} className="mt-2">
            <Col span={6}>
              <div
                style={{ height: "100%" }}
                className="border-gray-500 shadow-md rounded-xl bg-white p-6 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div className="text-[15px] font-semibold tracking-wide mr-1">{totalCustomer?.title}</div>
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
                  <div className="text-[15px] font-semibold tracking-wide mr-1">{avgOrderValue?.title}</div>
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
                  <div className="text-[15px] font-semibold tracking-wide mr-1">{totalOrder?.title}</div>
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
                  <div className="text-[15px] font-semibold tracking-wide mr-1">{totalProductSold?.title}</div>
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
                  height: 350,
                  padding: 12,
                  display: "flex",
                  justifyContent: "center",
                  borderRadius: "12px"
                }}
              >
                <Pie data={pieData} options={pieOptions} />
              </div>
            </Col>

            <Col span={12}>
              <div
                style={{
                  backgroundColor: "white",
                  border: "1px solid #dadada",
                  height: 350,
                  padding: 12,
                  display: "flex",
                  justifyContent: "center",
                  borderRadius: "12px"
                }}
              >
                <Chart type="bar" data={dataChart_3} options={options3} />
              </div>
            </Col>
          </Row>
        </motion.div>
      ) : (
        ""
      )}
    </>
  )
}
