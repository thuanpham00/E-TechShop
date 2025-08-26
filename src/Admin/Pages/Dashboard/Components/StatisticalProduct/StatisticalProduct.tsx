/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClipboardCheck, Copy } from "lucide-react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { adminAPI } from "src/Apis/admin.api"
import { SuccessResponse } from "src/Types/utils.type"
import Skeleton from "src/Components/Skeleton"
import { motion } from "framer-motion"
import { Chart } from "react-chartjs-2"
import { Button, Col, Row, Table, Tag } from "antd"
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

type ProductRunningOutOfStock = {
  name: string
  _id: string
  categoryInfo: string
  stock: number
}

export default function StatisticalProduct() {
  const { theme } = useTheme()
  const isDarkMode = theme === "dark" || theme === "system"
  const { copiedId, handleCopyText } = useCopyText()

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

  const dataStatisticalProduct = getStatisticalProduct?.data?.data as SuccessResponse<{
    countCategory: TypeStatistical
    top10ProductSold: TypeStatistical
    productRunningOutOfStock: TypeStatistical
  }>

  // xử lý biểu đồ thống kê sản phẩm theo danh mục
  const countCategory = dataStatisticalProduct?.result.countCategory
  const labelData_CountCategory = (countCategory?.value as any[])?.map((item) => item.categoryName)
  const data_countCategory = (countCategory?.value as any[])?.map((item) => item.total)

  // xử lý biểu đồ top 10 sản phẩm bán chạy
  const top10ProductSold = dataStatisticalProduct?.result.top10ProductSold
  const labelData_Top10Product = (top10ProductSold?.value as any[])?.map((item) => item.name)
  const data_top10ProductSold = (top10ProductSold?.value as any[])?.map((item) => item.sold)

  // xử lý biểu đồ danh sách các sản phẩm sắp hết hàng
  const productRunningOutOfStock = dataStatisticalProduct?.result.productRunningOutOfStock

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
        text: "Top 10 sản phẩm bán chạy nhất thời đại",
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

  const columns = [
    {
      title: "Mã sản phẩm",
      dataIndex: "_id",
      render: (_: any, record: ProductRunningOutOfStock) => {
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
      title: "Sản phẩm",
      dataIndex: "name"
    },
    {
      title: "Danh mục",
      dataIndex: "categoryInfo"
    },
    {
      title: "Tồn kho",
      dataIndex: "stock",
      key: "stock",
      render: (stock: number) => {
        const color = stock === 0 ? "red" : stock < 5 ? "orange" : "green"
        return <Tag color={color}>{stock}</Tag>
      }
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_: any, record: ProductRunningOutOfStock) => {
        if (record.stock === 0) return <Tag color="red">Hết hàng</Tag>
        if (record.stock < 5) return <Tag color="orange">Sắp hết</Tag>
        return <Tag color="green">Đủ hàng</Tag>
      }
    },
    {
      title: "Hành động",
      key: "action",
      render: () => <Button type="primary">Nhập hàng</Button>
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
              <Col span={12}>
                <div
                  className="shadow-md p-6 bg-white border border-[#dadada] dark:bg-darkPrimary dark:border-darkBorder"
                  style={{
                    borderRadius: "8px",
                    height: "350px"
                  }}
                >
                  <Chart type="bar" data={dataChart} options={options} />
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
                    Danh sách các sản phẩm sắp hết hàng
                  </div>

                  <div style={{ height: "350px", overflowY: "auto" }}>
                    <Table
                      columns={columns}
                      dataSource={
                        productRunningOutOfStock?.value as {
                          name: string
                          _id: string
                          categoryInfo: string
                          stock: number
                        }[]
                      }
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
