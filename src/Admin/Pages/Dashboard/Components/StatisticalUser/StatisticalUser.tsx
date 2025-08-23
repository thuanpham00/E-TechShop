/* eslint-disable @typescript-eslint/no-explicit-any */
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { adminAPI } from "src/Apis/admin.api"
import { SuccessResponse } from "src/Types/utils.type"
import Skeleton from "src/Components/Skeleton"
import { motion } from "framer-motion"
import { Col, DatePicker, Row, Switch, Table } from "antd"
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
import { ClipboardCheck, Copy, User, Users } from "lucide-react"
import useCopyText from "src/Hook/useCopyText"
import { formatCurrency } from "src/Helpers/common"
import { Pie } from "react-chartjs-2"
import { useTheme } from "src/Admin/Components/Theme-provider/Theme-provider"

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

type StatisticalUser = {
  _id: string
  name: string
  email: string
  totalRevenue: number
}

export default function StatisticalUser() {
  const { theme } = useTheme()
  const isDarkMode = theme === "dark" || theme === "system"

  const { copiedId, handleCopyText } = useCopyText()

  const [selectedMonth, setSelectedMonth] = useState<Dayjs>(dayjs())
  const [selectedYear, setSelectedYear] = useState<number>(dayjs().year())
  const [isMonthly, setIsMonthly] = useState(true) // true = theo tháng, false = theo năm

  const getStatisticalUser = useQuery({
    queryKey: isMonthly
      ? ["getStatisticalUser", "month", selectedMonth.format("YYYY-MM")]
      : ["getStatisticalUser", "year", selectedYear],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort()
      }, 10000) // quá 10 giây api chưa trả res về thì timeout sẽ hủy gọi api và api signal nhận tín hiệu hủy
      const month = selectedMonth.month() + 1
      const year = isMonthly ? selectedMonth.year() : selectedYear

      return adminAPI.statistical.getStatisticalUser(controller.signal, {
        ...(isMonthly ? { month } : {}),
        year
      })
    },
    placeholderData: keepPreviousData,
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 1 * 60 * 1000 // dưới 5 phút nó không gọi lại api
  })

  const dataStatisticalUser = getStatisticalUser?.data?.data as SuccessResponse<{
    totalCustomer: TypeStatistical
    totalStaff: TypeStatistical
    top10CustomerBuyTheMost: any
    rateReturningCustomers: any
  }>

  const totalCustomer = dataStatisticalUser?.result.totalCustomer
  const totalStaff = dataStatisticalUser?.result.totalStaff
  const top10CustomerBuyTheMost = dataStatisticalUser?.result.top10CustomerBuyTheMost
  const rateReturningCustomers = dataStatisticalUser?.result.rateReturningCustomers[0]

  const columns = [
    {
      title: "Mã khách hàng",
      dataIndex: "_id",
      render: (_: any, record: StatisticalUser) => {
        return (
          <div className="text-blue-500 font-semibold">
            {record._id}

            <button onClick={() => handleCopyText(record._id)} className="p-1 border rounded mr-2">
              {copiedId === record._id ? (
                <ClipboardCheck color="#8d99ae" size={12} />
              ) : (
                <Copy color="#8d99ae" size={12} />
              )}
            </button>
          </div>
        )
      }
    },
    {
      title: "Tên khách hàng",
      dataIndex: "name"
    },
    {
      title: "Email",
      dataIndex: "email"
    },
    {
      title: "Mua hàng",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      render: (revenue: number) => {
        return <div className="text-red-500 font-semibold">{formatCurrency(revenue)}đ</div>
      }
    }
  ]

  const pieOptions: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: {
          color: isDarkMode ? "white" : "black", // đổi màu chữ tag
          font: { size: 13 }
        }
      },
      title: {
        display: true,
        text: "Tỷ lệ khách hàng (3 tháng gần nhất)",
        font: { size: 16 },
        padding: { top: 10, bottom: 10 },
        color: isDarkMode ? "white" : "dark"
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
    labels: ["Khách mua 1 lần", "Khách quay lại"],
    datasets: [
      {
        data: [
          100 - rateReturningCustomers?.retentionRate.toFixed(2),
          rateReturningCustomers?.retentionRate.toFixed(2)
        ],
        backgroundColor: ["#cf1322", "#08979c"],
        borderWidth: 1
      }
    ]
  }

  return (
    <>
      {getStatisticalUser.isLoading && <Skeleton />}
      {!getStatisticalUser.isFetching ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Row gutter={[24, 24]} className="mt-4 h-[300px]">
            <Col span={12} style={{ height: "100%" }}>
              <Row gutter={[24, 24]} style={{ height: "100%" }}>
                <Col span={12}>
                  <div
                    style={{ height: "100%" }}
                    className="border-gray-500 shadow-md rounded-xl bg-white dark:bg-darkPrimary p-6 flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between">
                      <div className="text-[16px] font-semibold tracking-wide mr-2 text-black dark:text-white">
                        {totalStaff?.title}
                      </div>
                      <Users size={22} color={isDarkMode ? "white" : "black"} />
                    </div>
                    <div className={`text-2xl font-semibold mt-4`} style={{ color: totalStaff?.color }}>
                      {totalStaff.value || 0}
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div
                    style={{ height: "100%" }}
                    className="border-gray-500 shadow-md rounded-xl bg-white dark:bg-darkPrimary p-6 flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between">
                      <div className="text-[16px] font-semibold tracking-wide mr-2 text-black dark:text-white">
                        {totalCustomer?.title}
                      </div>
                      <User size={22} color={isDarkMode ? "white" : "black"} />
                    </div>
                    <div className={`text-2xl font-semibold mt-4`} style={{ color: totalCustomer?.color }}>
                      {totalCustomer?.value || 0}
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div
                    style={{ height: "100%" }}
                    className="border-gray-500 shadow-md rounded-xl bg-white dark:bg-darkPrimary p-6 flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between">
                      <div className="text-[16px] font-semibold tracking-wide mr-2 text-black dark:text-white">
                        {totalStaff?.title}
                      </div>
                      <Users size={22} color={isDarkMode ? "white" : "black"} />
                    </div>
                    <div className={`text-2xl font-semibold mt-4`} style={{ color: totalStaff?.color }}>
                      {totalStaff.value || 0}
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div
                    style={{ height: "100%" }}
                    className="border-gray-500 shadow-md rounded-xl bg-white dark:bg-darkPrimary p-6 flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between">
                      <div className="text-[16px] font-semibold tracking-wide mr-2 text-black dark:text-white">
                        {totalCustomer?.title}
                      </div>
                      <User size={22} color={isDarkMode ? "white" : "black"} />
                    </div>
                    <div className={`text-2xl font-semibold mt-4`} style={{ color: totalCustomer?.color }}>
                      {totalCustomer?.value || 0}
                    </div>
                  </div>
                </Col>
              </Row>
            </Col>
            <Col span={12} style={{ height: "100%" }}>
              <div
                style={{
                  height: "100%",
                  padding: 12,
                  display: "flex",
                  justifyContent: "center",
                  borderRadius: "12px"
                }}
                className="shadow-md bg-white border border-[#dadada] dark:bg-darkPrimary dark:border-darkBorder"
              >
                <Pie data={pieData} options={pieOptions} />
              </div>
            </Col>
          </Row>

          <Row gutter={[24, 24]} className="mt-4">
            <Col span={24}>
              <div
                className="shadow-md p-6 bg-white border border-[#dadada] dark:bg-darkPrimary dark:border-darkBorder"
                style={{
                  borderRadius: "8px",
                  position: "relative"
                }}
              >
                <div className="absolute top-0 right-3 flex gap-1 items-center my-3 justify-end">
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
                    />
                  ) : (
                    <DatePicker
                      value={dayjs().year(selectedYear)}
                      onChange={(value) => {
                        setSelectedYear(value.year())
                      }}
                      picker="year"
                      format="YYYY"
                    />
                  )}
                </div>
                <div className="text-base font-semibold text-center mb-2 text-black dark:text-white">
                  Top 10 Khách hàng mua sắm cao nhất
                </div>

                <div style={{ minHeight: "100px", overflowY: "auto" }}>
                  <Table
                    columns={columns}
                    dataSource={
                      top10CustomerBuyTheMost as {
                        _id: string
                        name: string
                        email: string
                        totalRevenue: number
                      }[]
                    }
                    pagination={false}
                  />
                </div>
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
