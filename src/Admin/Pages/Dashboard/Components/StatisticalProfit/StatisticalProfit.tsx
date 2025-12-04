/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClipboardCheck, Copy } from "lucide-react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { SuccessResponse } from "src/Types/utils.type"
import Skeleton from "src/Components/Skeleton"
import { motion } from "framer-motion"
import { Chart } from "react-chartjs-2"
import { Col, Row, Table } from "antd"
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
import useCopyText from "src/Hook/useCopyText"
import { useTheme } from "src/Admin/Components/Theme-provider/Theme-provider"
import { useEffect } from "react"
import { toast } from "react-toastify"
import { StatisticalAPI } from "src/Apis/admin/statistical.api"

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

type ProfitResponse = {
  totalRevenue: number
  totalCost: number
  totalProfit: number
  marginPercent: number
  topProductsByProfit: Array<{
    productId: string
    name: string
    quantity: number
    sellPerUnit: number
    costPerUnit: number
    revenue: number
    cost: number
    profit: number
  }>
}

export default function StatisticalProfit() {
  const { theme } = useTheme()
  const isDarkMode = theme === "dark" || theme === "system"
  const { copiedId, handleCopyText } = useCopyText()

  const getStatisticalProduct = useQuery({
    queryKey: ["getStatisticalProfit"],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort()
      }, 10000)
      return StatisticalAPI.getStatisticalProfit(controller.signal)
    },
    placeholderData: keepPreviousData,
    retry: 0,
    staleTime: 1 * 60 * 1000
  })

  const dataStatisticalProduct = getStatisticalProduct?.data?.data as SuccessResponse<{
    countCategory: TypeStatistical
    top10ProductSold: TypeStatistical
    productRunningOutOfStock: TypeStatistical
    totalRevenue?: number
    totalCost?: number
    totalProfit?: number
    marginPercent?: number
    itemsByProduct?: Array<{
      _id: string
      productId: string
      totalQuantity: number
      totalRevenue: number
      totalCost: number
      totalProfit: number
    }>
    topProductsByProfit?: Array<{
      _id: string
      productId: string
      totalQuantity: number
      totalRevenue: number
      totalCost: number
      totalProfit: number
    }>
  }>

  // Use API result when available. If data is missing, use safe empty defaults so charts render gracefully.
  // Ưu tiên dùng itemsByCategory từ response mới; fallback sang countCategory
  const itemsByCategory = (dataStatisticalProduct?.result as any)?.itemsByCategory as
    | Array<{ _id: string; totalQuantity: number }>
    | undefined
  const countCategory = dataStatisticalProduct?.result.countCategory
  const categoriesArray = itemsByCategory
    ? itemsByCategory.map((c) => ({ categoryName: c._id, total: c.totalQuantity }))
    : ((countCategory?.value ?? []) as { categoryName: string; total: number }[])
  const labelData_CountCategory = categoriesArray.map((item) => item.categoryName)
  const data_countCategory = categoriesArray.map((item) => item.total)

  // new profit fields
  const profitData: ProfitResponse | null = dataStatisticalProduct?.result
    ? {
        totalRevenue: (dataStatisticalProduct.result.totalRevenue as number) ?? 0,
        totalCost: (dataStatisticalProduct.result.totalCost as number) ?? 0,
        totalProfit: (dataStatisticalProduct.result.totalProfit as number) ?? 0,
        marginPercent: (dataStatisticalProduct.result.marginPercent as number) ?? 0,
        topProductsByProfit: ((dataStatisticalProduct.result.topProductsByProfit || []) as any).map(
          (p: {
            _id: string
            productId: string
            totalQuantity: number
            totalRevenue: number
            totalCost: number
            totalProfit: number
          }) => ({
            productId: p.productId,
            name: p._id,
            quantity: p.totalQuantity,
            sellPerUnit: 0,
            costPerUnit: 0,
            revenue: p.totalRevenue,
            cost: p.totalCost,
            profit: p.totalProfit
          })
        )
      }
    : null

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
      legend: {
        display: true,
        labels: {
          color: isDarkMode ? "white" : "black", // đổi màu chữ tag
          font: { size: 13 }
        }
      },
      title: {
        display: true,
        text: "Thống kê sản phẩm theo danh mục",
        font: { size: 16, weight: 500 },
        padding: { top: 10, bottom: 10 },
        color: isDarkMode ? "white" : "dark"
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
        color: isDarkMode ? "white" : "black"
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Số lượng sản phẩm",
          color: isDarkMode ? "white" : "black"
        },
        ticks: {
          color: isDarkMode ? "white" : "black" // đổi màu label trục X
        }
      },
      y: {
        title: {
          display: true,
          text: "Danh mục",
          color: isDarkMode ? "white" : "black"
        },
        ticks: {
          color: isDarkMode ? "white" : "black" // đổi màu label trục X
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
      legend: {
        display: true,
        labels: {
          color: isDarkMode ? "white" : "black", // đổi màu chữ tag
          font: { size: 13 }
        }
      },
      title: {
        display: true,
        text: "Top sản phẩm theo lợi nhuận",
        font: { size: 16, weight: 500 },
        padding: { top: 10, bottom: 10 },
        color: isDarkMode ? "white" : "dark"
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
        color: isDarkMode ? "white" : "black"
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Số lượt bán",
          color: isDarkMode ? "white" : "black"
        },
        ticks: {
          color: isDarkMode ? "white" : "black" // đổi màu số trục Y
        }
      },
      y: {
        ticks: {
          color: isDarkMode ? "white" : "black" // đổi màu số trục Y
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
        backgroundColor: "rgba(59, 130, 246, 0.75)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1
      }
    ]
  }

  const dataChart_2 = {
    labels: (dataStatisticalProduct?.result.topProductsByProfit || []).map((p: any) => p._id),
    datasets: [
      {
        label: "Lợi nhuận (đ)",
        data: (dataStatisticalProduct?.result.topProductsByProfit || []).map((p: any) => p.totalProfit),
        backgroundColor: "rgba(99, 102, 241, 0.7)",
        borderColor: "rgba(99, 102, 241, 1)",
        borderWidth: 1
      }
    ]
  }

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "_id",
      render: (name: string, record: { productId: string }) => (
        <div className="text-blue-500 font-semibold">
          {name}
          <button onClick={() => handleCopyText(record.productId)} className="p-1 border rounded ml-2">
            {copiedId === record.productId ? (
              <ClipboardCheck color="#8d99ae" size={12} />
            ) : (
              <Copy color="#8d99ae" size={12} />
            )}
          </button>
        </div>
      )
    },
    {
      title: "Số lượng",
      dataIndex: "totalQuantity"
    },
    {
      title: "Doanh thu",
      dataIndex: "totalRevenue",
      render: (v: number) => v?.toLocaleString("vi-VN")
    },
    {
      title: "Chi phí",
      dataIndex: "totalCost",
      render: (v: number) => v?.toLocaleString("vi-VN")
    },
    {
      title: "Lợi nhuận",
      dataIndex: "totalProfit",
      render: (v: number) => <span className="text-green-600 font-semibold">{v?.toLocaleString("vi-VN")}</span>
    }
  ]

  useEffect(() => {
    if (getStatisticalProduct.isError) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toast.error((getStatisticalProduct.error as any).response?.data?.message, { autoClose: 1500 })
    }
  }, [getStatisticalProduct.isError, getStatisticalProduct.error])

  return (
    <>
      {getStatisticalProduct.isLoading && <Skeleton />}
      {!getStatisticalProduct.isFetching ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mt-4">
            <Row gutter={[24, 24]} className="mt-2">
              {/* Revenue / Cost / Profit summary */}
              <Col span={24}>
                <Row gutter={[16, 16]}>
                  <Col span={6}>
                    <div className="shadow-md p-4 bg-white border border-[#dadada] dark:bg-darkPrimary dark:border-darkBorder rounded-md">
                      <div className="text-sm text-black dark:text-white">Doanh thu</div>
                      <div className="text-2xl font-semibold mt-2 text-blue-600 dark:text-blue-400">
                        {(profitData?.totalRevenue || 0).toLocaleString("vi-VN")}đ
                      </div>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div className="shadow-md p-4 bg-white border border-[#dadada] dark:bg-darkPrimary dark:border-darkBorder rounded-md">
                      <div className="text-sm text-black dark:text-white">Chi phí</div>
                      <div className="text-2xl font-semibold mt-2 text-rose-600 dark:text-rose-400">
                        {(profitData?.totalCost || 0).toLocaleString("vi-VN")}đ
                      </div>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div className="shadow-md p-4 bg-white border border-[#dadada] dark:bg-darkPrimary dark:border-darkBorder rounded-md">
                      <div className="text-sm text-black dark:text-white">Lợi nhuận</div>
                      <div className="text-2xl font-semibold mt-2 text-green-600 dark:text-green-400">
                        {(profitData?.totalProfit || 0).toLocaleString("vi-VN")}đ
                      </div>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div className="shadow-md p-4 bg-white border border-[#dadada] dark:bg-darkPrimary dark:border-darkBorder rounded-md">
                      <div className="text-sm text-black dark:text-white">Biên lợi nhuận</div>
                      <div className="text-2xl font-semibold mt-2 text-violet-600 dark:text-violet-400">
                        {`${profitData?.marginPercent || 0}%`}
                      </div>
                    </div>
                  </Col>
                </Row>
              </Col>
              <Col span={12}>
                <div
                  className="shadow-md p-6 bg-white border border-[#dadada] dark:bg-darkPrimary dark:border-darkBorder"
                  style={{
                    borderRadius: "8px",
                    minHeight: "350px"
                  }}
                >
                  {data_countCategory.length > 0 ? (
                    <Chart type="bar" data={dataChart} options={options} />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      Không có dữ liệu danh mục để hiển thị
                    </div>
                  )}
                </div>
              </Col>
              <Col span={12}>
                <div
                  className="shadow-md p-6 bg-white border border-[#dadada] dark:bg-darkPrimary dark:border-darkBorder"
                  style={{
                    borderRadius: "8px",
                    height: "350px"
                  }}
                >
                  <Chart type="bar" data={dataChart_2} options={options2} />
                </div>
              </Col>
              <Col span={24}>
                <div
                  className="shadow-md p-6 bg-white border border-[#dadada] dark:bg-darkPrimary dark:border-darkBorder"
                  style={{
                    borderRadius: "8px"
                  }}
                >
                  <div className="text-base font-semibold text-center mb-2 text-black dark:text-white">
                    Thống kê theo sản phẩm
                  </div>

                  <div style={{ height: "350px", overflowY: "auto" }}>
                    <Table
                      columns={columns}
                      dataSource={((dataStatisticalProduct?.result.itemsByProduct || []) as any[]).map((p, idx) => ({
                        key: idx,
                        ...p
                      }))}
                      pagination={false}
                    />
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </motion.div>
      ) : (
        ""
      )}
    </>
  )
}
