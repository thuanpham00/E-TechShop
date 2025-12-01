/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query"
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
  ChartOptions
} from "chart.js"
import { useTheme } from "src/Admin/Components/Theme-provider/Theme-provider"
import { toast } from "react-toastify"
import dayjs from "dayjs"
import { SupplyAPI } from "src/Apis/admin/supply.api"
import { ReceiptAPI } from "src/Apis/admin/receipt.api"
import { SupplierAPI } from "src/Apis/admin/supplier.api"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels)

type SupplyItem = any
type ReceiptItem = any
type SupplierItem = any

export default function StatisticalSupply() {
  const { theme } = useTheme()
  const isDarkMode = theme === "dark" || theme === "system"

  const getSupplies = useQuery({
    queryKey: ["getSupplies", { limit: "1000", page: "1" }],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => controller.abort(), 10000)
      return SupplyAPI.getSupplies({ page: "1", limit: "1000" }, controller.signal)
    },
    retry: 0
  })

  const getReceipts = useQuery({
    queryKey: ["getReceiptsForStats"],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => controller.abort(), 10000)
      return ReceiptAPI.getReceipts({ page: "1", limit: "1000" }, controller.signal)
    },
    retry: 0
  })

  const getSuppliers = useQuery({
    queryKey: ["getSuppliers", { limit: "1", page: "1" }],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => controller.abort(), 10000)
      return SupplierAPI.getSuppliers({ page: "1", limit: "1" }, controller.signal)
    },
    retry: 0
  })

  const suppliesResult = getSupplies.data?.data as SuccessResponse<{ result: SupplyItem[]; total: string }>
  const receiptsResult = getReceipts.data?.data as SuccessResponse<{ result: ReceiptItem[]; total: string }>
  const suppliersResult = getSuppliers.data?.data as SuccessResponse<{ result: SupplierItem[]; total: string }>

  const supplies = suppliesResult?.result?.result ?? suppliesResult?.result ?? []
  const receipts = receiptsResult?.result?.result ?? receiptsResult?.result ?? []
  const totalSuppliers = Number(suppliersResult?.result?.total ?? suppliersResult?.result ?? 0)

  // compute metrics
  const totalSupplies = Array.isArray(supplies) ? supplies.length : 0
  const avgImportPrice =
    Array.isArray(supplies) && supplies.length
      ? Math.round(supplies.reduce((s: number, it: any) => s + (Number(it.importPrice || 0) || 0), 0) / supplies.length)
      : 0
  const avgLeadTime =
    Array.isArray(supplies) && supplies.length
      ? Math.round(
          supplies.reduce((s: number, it: any) => s + (Number(it.leadTimeDays || 0) || 0), 0) / supplies.length
        )
      : 0

  // top suppliers by number of supplies
  const supplierMap: Record<string, { name: string; count: number; totalImport: number }> = {}
  if (Array.isArray(supplies)) {
    supplies.forEach((it: any) => {
      const supplierName =
        (it.supplierId && it.supplierId[0] && it.supplierId[0].name) || it.name_supplier || "Không rõ"
      const key = supplierName
      if (!supplierMap[key]) supplierMap[key] = { name: supplierName, count: 0, totalImport: 0 }
      supplierMap[key].count += 1
      supplierMap[key].totalImport += Number(it.importPrice || 0) * Number(it.quantity || 1)
    })
  }

  const topSuppliers = Object.values(supplierMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // receipts per month (last 6 months)
  const months: string[] = []
  const receiptsCountByMonth: number[] = []
  for (let i = 5; i >= 0; i--) {
    const m = dayjs().subtract(i, "month")
    months.push(m.format("MM/YYYY"))
    receiptsCountByMonth.push(0)
  }
  if (Array.isArray(receipts)) {
    receipts.forEach((r: any) => {
      const created = r.created_at || r.import_date || r.createdAt
      if (!created) return
      const idx = months.findIndex((m) => m === dayjs(created).format("MM/YYYY"))
      if (idx >= 0) receiptsCountByMonth[idx] = (receiptsCountByMonth[idx] || 0) + 1
    })
  }

  const barOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Số đơn nhập theo tháng (6 tháng gần nhất)", color: isDarkMode ? "white" : "black" }
    }
  }

  const barData = {
    labels: months,
    datasets: [
      {
        label: "Số đơn nhập",
        data: receiptsCountByMonth,
        backgroundColor: "rgba(54, 162, 235, 0.7)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1
      }
    ]
  }

  const columns = [
    { title: "Nhà cung cấp", dataIndex: "name", key: "name" },
    { title: "Số lần cung ứng", dataIndex: "count", key: "count" },
    {
      title: "Tổng giá trị nhập",
      dataIndex: "totalImport",
      key: "totalImport",
      render: (v: number) => <div className="text-red-500 font-semibold">{v ? v.toLocaleString() + "đ" : ""}</div>
    }
  ]

  // handle errors
  if (getSupplies.isError || getReceipts.isError || getSuppliers.isError) {
    const err = (getSupplies.error || getReceipts.error || getSuppliers.error) as any
    toast.error(err?.response?.data?.message || "Lỗi lấy dữ liệu thống kê cung ứng", { autoClose: 1500 })
  }

  return (
    <>
      {(getSupplies.isLoading || getReceipts.isLoading || getSuppliers.isLoading) && <Skeleton />}
      {!getSupplies.isFetching && !getReceipts.isFetching && !getSuppliers.isFetching ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mt-4">
            <Row gutter={[16, 16]} className="mb-4">
              <Col span={6}>
                <div className="shadow-md p-4 bg-white border border-[#dadada] dark:bg-darkPrimary dark:border-darkBorder rounded-md">
                  <div className="text-sm text-black dark:text-white">Tổng nhà cung cấp</div>
                  <div className="text-2xl font-semibold mt-2">{totalSuppliers || 0}</div>
                </div>
              </Col>
              <Col span={6}>
                <div className="shadow-md p-4 bg-white border border-[#dadada] dark:bg-darkPrimary dark:border-darkBorder rounded-md">
                  <div className="text-sm text-black dark:text-white">Tổng bản ghi cung ứng</div>
                  <div className="text-2xl font-semibold mt-2">{totalSupplies || 0}</div>
                </div>
              </Col>
              <Col span={6}>
                <div className="shadow-md p-4 bg-white border border-[#dadada] dark:bg-darkPrimary dark:border-darkBorder rounded-md">
                  <div className="text-sm text-black dark:text-white">Giá nhập trung bình</div>
                  <div className="text-2xl font-semibold mt-2 text-red-500">
                    {avgImportPrice ? avgImportPrice.toLocaleString() + "đ" : "0đ"}
                  </div>
                </div>
              </Col>
              <Col span={6}>
                <div className="shadow-md p-4 bg-white border border-[#dadada] dark:bg-darkPrimary dark:border-darkBorder rounded-md">
                  <div className="text-sm text-black dark:text-white">Lead-time trung bình (ngày)</div>
                  <div className="text-2xl font-semibold mt-2">{avgLeadTime || 0}</div>
                </div>
              </Col>
            </Row>

            <Row gutter={[24, 24]}>
              <Col span={12}>
                <div
                  className="shadow-md p-6 bg-white border border-[#dadada] dark:bg-darkPrimary dark:border-darkBorder"
                  style={{ borderRadius: 8, height: 350, display: "flex", flexDirection: "column" }}
                >
                  <div style={{ flex: 1 }}>
                    <Chart type="bar" data={barData} options={barOptions} />
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div
                  className="shadow-md p-6 bg-white border border-[#dadada] dark:bg-darkPrimary dark:border-darkBorder"
                  style={{ borderRadius: 8, height: 350, display: "flex", flexDirection: "column" }}
                >
                  <div className="text-base font-semibold text-center mb-2 text-black dark:text-white">
                    Top 5 nhà cung cấp (theo số lần cung ứng)
                  </div>
                  <div style={{ flex: 1, overflowY: "auto" }}>
                    <Table
                      columns={columns}
                      dataSource={topSuppliers.map((s) => ({ ...s, key: s.name }))}
                      pagination={false}
                      size="small"
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
