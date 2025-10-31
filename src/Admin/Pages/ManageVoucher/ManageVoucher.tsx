/* eslint-disable @typescript-eslint/no-explicit-any */
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { Empty, Select, Table, Tag } from "antd"
import { ColumnsType } from "antd/es/table"
import { isUndefined, omitBy } from "lodash"
import { ArrowUpNarrowWide, Edit, FolderUp, Plus, Trash2 } from "lucide-react"
import { useEffect } from "react"
import { Helmet } from "react-helmet-async"
import { createSearchParams, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import NavigateBack from "src/Admin/Components/NavigateBack"
import { useTheme } from "src/Admin/Components/Theme-provider/Theme-provider"
import { VoucherAPI } from "src/Apis/admin/voucher.api"
import Button from "src/Components/Button"
import Skeleton from "src/Components/Skeleton"
import { HttpStatusCode } from "src/Constants/httpStatus"
import { path } from "src/Constants/path"
import { convertDateTime, formatCurrency } from "src/Helpers/common"
import useDownloadExcel from "src/Hook/useDownloadExcel"
import useQueryParams from "src/Hook/useQueryParams"
import useSortList from "src/Hook/useSortList"
import { VoucherItemType } from "src/Types/product.type"
import { queryParamConfigVoucher } from "src/Types/queryParams.type"
import { SuccessResponse } from "src/Types/utils.type"

export default function ManageVoucher() {
  const { theme } = useTheme()
  const isDarkMode = theme === "dark" || theme === "system"
  const navigate = useNavigate()
  const { downloadExcel } = useDownloadExcel()
  // const queryClient = useQueryClient()
  const queryParams: queryParamConfigVoucher = useQueryParams()
  const queryConfig: queryParamConfigVoucher = omitBy(
    {
      page: queryParams.page || "1", // mặc định page = 1
      limit: queryParams.limit || "5", // mặc định limit =
      name: queryParams.name,

      created_at_start: queryParams.created_at_start,
      created_at_end: queryParams.created_at_end,
      updated_at_start: queryParams.updated_at_start,
      updated_at_end: queryParams.updated_at_end,

      sortBy: queryParams.sortBy || "new" // mặc định sort mới nhất
    },
    isUndefined
  )

  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: ["listSupplier", queryConfig],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)
      return VoucherAPI.getVouchers(queryConfig as queryParamConfigVoucher, controller.signal)
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 3 * 60 * 1000, // dưới 3 phút nó không gọi lại api

    placeholderData: keepPreviousData
  })

  const result = data?.data as SuccessResponse<{
    result: VoucherItemType[]
    total: string
    page: string
    limit: string
    totalOfPage: string
  }>
  const listSupplier = result?.result?.result

  const { handleSort } = useSortList()

  const columns: ColumnsType<VoucherItemType> = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: "center",
      render: (_, __, index) => {
        const currentPage = Number(queryConfig.page) || 1
        const pageSize = Number(queryConfig.limit) || 5
        return (currentPage - 1) * pageSize + index + 1
      }
    },
    {
      title: "Mã voucher",
      dataIndex: "code",
      key: "code",
      width: 150,
      render: (code: string) => (
        <code className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded font-mono text-sm">
          {code}
        </code>
      )
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 250,
      ellipsis: true,
      render: (text: string) => <span className="text-gray-700 dark:text-gray-300">{text || "—"}</span>
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      width: 120,
      align: "center",
      render: (type: string) => (
        <Tag color={type === "percentage" ? "blue" : "green"}>
          {type === "percentage" ? "Phần trăm" : "Số tiền cố định"}
        </Tag>
      )
    },
    {
      title: "Giá trị",
      dataIndex: "value",
      key: "value",
      width: 120,
      align: "right",
      render: (value: number, record: VoucherItemType) => (
        <span className="font-medium text-red-500">
          {record.type === "percentage" ? `${value}%` : `${formatCurrency(value)}đ`}
        </span>
      )
    },
    {
      title: "Giảm tối đa",
      dataIndex: "max_discount",
      key: "max_discount",
      width: 120,
      align: "right",
      render: (value: number) => (
        <span className="text-gray-700 dark:text-gray-300">
          {value > 0 ? `${formatCurrency(value)}đ` : "Không giới hạn"}
        </span>
      )
    },
    {
      title: "Đơn tối thiểu",
      dataIndex: "min_order_value",
      key: "min_order_value",
      width: 130,
      align: "right",
      render: (value: number) => <span className="text-gray-700 dark:text-gray-300">{formatCurrency(value)}đ</span>
    },
    {
      title: "Sử dụng",
      key: "usage",
      width: 120,
      align: "center",
      render: (_, record: VoucherItemType) => (
        <div className="flex flex-col items-center gap-1">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {record.used_count}/{record.usage_limit}
          </span>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{
                width: `${Math.min((record.used_count / record.usage_limit) * 100, 100)}%`
              }}
            />
          </div>
        </div>
      )
    },
    {
      title: "Thời gian",
      key: "date_range",
      width: 200,
      render: (_, record: VoucherItemType) => (
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-1">
            <span className="text-gray-500 dark:text-gray-400">Từ:</span>
            <span className="text-gray-700 dark:text-gray-300">{convertDateTime(record.start_date)}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-500 dark:text-gray-400">Đến:</span>
            <span className="text-gray-700 dark:text-gray-300">{convertDateTime(record.end_date)}</span>
          </div>
        </div>
      )
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      align: "center",
      render: (status: string) => {
        const statusConfig = {
          active: { color: "green", text: "Đang hoạt động" },
          inactive: { color: "orange", text: "Chưa bắt đầu" },
          expired: { color: "red", text: "Hết hạn" }
        }
        const config = statusConfig[status as keyof typeof statusConfig] || { color: "default", text: status }
        return <Tag color={config.color}>{config.text}</Tag>
      }
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      width: 180,
      render: (date: string) => <span className="text-gray-600 dark:text-gray-400">{convertDateTime(date)}</span>
    },
    {
      title: "Hành động",
      key: "action",
      width: 120,
      fixed: "right",
      align: "center",
      render: () => (
        <div className="flex items-center justify-center gap-2">
          <button
            // onClick={() => handleEdit(record)}
            className="text-blue-500 hover:text-blue-700 transition-colors"
            title="Chỉnh sửa"
          >
            <Edit size={18} />
          </button>
          <button
            // onClick={() => handleDelete(record._id)}
            className="text-red-500 hover:text-red-700 transition-colors"
            title="Xóa"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ]

  useEffect(() => {
    if (isError) {
      const message = (error as any).response?.data?.message
      const status = (error as any)?.response?.status
      if (message === "Không có quyền truy cập!") {
        toast.error(message, { autoClose: 1500 })
      }

      if (status === HttpStatusCode.NotFound) {
        navigate(path.AdminNotFound, { replace: true })
      }
    }
  }, [isError, error, navigate])

  return (
    <div>
      <Helmet>
        <title>Quản lý voucher</title>
        <meta
          name="description"
          content="Đây là trang TECHZONE | Laptop, PC, Màn hình, điện thoại, linh kiện Chính Hãng"
        />
      </Helmet>
      <NavigateBack />
      <h1 className="text-2xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-600 my-2">
        Quản lý voucher
      </h1>
      <section className="mt-4">
        <div className="bg-white dark:bg-darkPrimary mb-3 dark:border-darkBorder rounded-2xl">
          {isLoading && <Skeleton />}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => downloadExcel(listSupplier)}
                icon={<FolderUp size={15} />}
                nameButton="Export"
                classNameButton="py-2 px-3 border border-[#E2E7FF] bg-[#E2E7FF] w-full text-[#3A5BFF] font-medium rounded-md hover:bg-blue-500/40 duration-200 text-[13px] flex items-center gap-1"
              />
              <Select
                defaultValue="Mới nhất"
                className="select-sort"
                onChange={(value) => handleSort(value, queryConfig, path.AdminVoucher)}
                suffixIcon={<ArrowUpNarrowWide color={isDarkMode ? "white" : "black"} />}
                options={[
                  { value: "old", label: "Cũ nhất" },
                  { value: "new", label: "Mới nhất" }
                ]}
              />
            </div>
            <div>
              <Button
                // onClick={() => setAddItem(true)}
                icon={<Plus size={15} />}
                nameButton="Thêm mới"
                classNameButton="py-2 px-3 bg-blue-500 w-full text-white font-medium rounded-md hover:bg-blue-500/80 duration-200 text-[13px] flex items-center gap-1"
              />
            </div>
          </div>
          {!isFetching ? (
            <div>
              {listSupplier?.length > 0 ? (
                <Table
                  rowKey={(r) => r._id}
                  dataSource={listSupplier}
                  columns={columns}
                  loading={isLoading}
                  pagination={{
                    current: Number(queryConfig.page),
                    pageSize: Number(queryConfig.limit),
                    total: Number(result?.result.total || 0),
                    showSizeChanger: true,
                    pageSizeOptions: ["5", "10", "20", "50"],
                    onChange: (page, pageSize) => {
                      navigate({
                        pathname: path.AdminSuppliers,
                        search: createSearchParams({
                          ...queryConfig,
                          page: page.toString(),
                          limit: pageSize.toString()
                        }).toString()
                      })
                    }
                  }}
                  rowClassName={(_, index) => (index % 2 === 0 ? "bg-[#f2f2f2]" : "bg-white")}
                  scroll={{ x: "max-content" }}
                />
              ) : (
                <div className="text-center mt-4">
                  <Empty />
                </div>
              )}
            </div>
          ) : (
            <Skeleton />
          )}
        </div>
      </section>
    </div>
  )
}
