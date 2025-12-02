/* eslint-disable @typescript-eslint/no-explicit-any */
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { DatePicker, Empty, Form, Input, InputNumber, Modal, Radio, Select, Table, Tag } from "antd"
import { ColumnsType } from "antd/es/table"
import dayjs from "dayjs"
import { isUndefined, omitBy } from "lodash"
import { ArrowUpNarrowWide, Edit, FolderUp, Plus, Trash2, Tag as TagIcon, Percent, DollarSign } from "lucide-react"
import { useEffect, useState } from "react"
import { Helmet } from "react-helmet-async"
import { createSearchParams, Link, useNavigate } from "react-router-dom"
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
import { OrderItemType, VoucherItemType } from "src/Types/product.type"
import { queryParamConfigVoucher } from "src/Types/queryParams.type"
import { SuccessResponse } from "src/Types/utils.type"
import "../ManageOrders/ManageOrders.css"

const { RangePicker } = DatePicker
const { TextArea } = Input

export default function ManageVoucher() {
  const { theme } = useTheme()
  const isDarkMode = theme === "dark" || theme === "system"
  const navigate = useNavigate()
  const { downloadExcel } = useDownloadExcel()
  const { handleSort } = useSortList()
  const queryClient = useQueryClient()
  const [form] = Form.useForm()

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVoucher, setEditingVoucher] = useState<VoucherItemType | null>(null)

  const [isModalOrderOpen, setIsModalOrderOpen] = useState(false)
  const [selectedVouchers, setSelectedVouchers] = useState<string | null>(null)
  const [voucherType, setVoucherType] = useState<"percentage" | "fixed">("percentage")

  const queryParams: queryParamConfigVoucher = useQueryParams()
  const queryConfig: queryParamConfigVoucher = omitBy(
    {
      page: queryParams.page || "1",
      limit: queryParams.limit || "5",
      name: queryParams.name,
      created_at_start: queryParams.created_at_start,
      created_at_end: queryParams.created_at_end,
      updated_at_start: queryParams.updated_at_start,
      updated_at_end: queryParams.updated_at_end,
      sortBy: queryParams.sortBy || "new"
    },
    isUndefined
  )

  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: ["listVoucher", queryConfig],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort()
      }, 10000)
      return VoucherAPI.getVouchers(queryConfig as queryParamConfigVoucher, controller.signal)
    },
    retry: 0,
    staleTime: 3 * 60 * 1000,
    placeholderData: keepPreviousData
  })

  const result = data?.data as SuccessResponse<{
    result: VoucherItemType[]
    total: string
    page: string
    limit: string
    totalOfPage: string
  }>
  const listVoucher = result?.result?.result

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: (body: any) => {
      if (editingVoucher) {
        return VoucherAPI.updateVoucher(editingVoucher._id, body)
      }
      return VoucherAPI.createVoucher(body)
    },
    onSuccess: () => {
      toast.success(editingVoucher ? "Cập nhật voucher thành công!" : "Thêm voucher thành công!", {
        autoClose: 1500
      })
      queryClient.invalidateQueries({ queryKey: ["listVoucher", queryConfig] })
      handleCloseModal()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra!")
    }
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => VoucherAPI.deleteVoucher(id),
    onSuccess: () => {
      toast.success("Xóa voucher thành công!")
      queryClient.invalidateQueries({ queryKey: ["listVoucher", queryConfig] })
    }
  })

  const handleOpenModal = (voucher?: VoucherItemType) => {
    if (voucher) {
      setEditingVoucher(voucher)
      setVoucherType(voucher.type as "percentage" | "fixed")
      form.setFieldsValue({
        code: voucher.code,
        description: voucher.description,
        type: voucher.type,
        value: voucher.value,
        max_discount: voucher.max_discount,
        min_order_value: voucher.min_order_value,
        usage_limit: voucher.usage_limit,
        date_range: [dayjs(voucher.start_date), dayjs(voucher.end_date)],
        status: voucher.status
      })
    } else {
      setEditingVoucher(null)
      setVoucherType("percentage")
      form.resetFields()
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingVoucher(null)
    form.resetFields()
  }

  const handleSubmit = (values: any) => {
    const body = {
      code: values.code.toUpperCase(),
      description: values.description,
      type: values.type,
      value: values.value,
      max_discount: values.max_discount || 0,
      min_order_value: values.min_order_value,
      usage_limit: values.usage_limit,
      start_date: values.date_range[0].toISOString(),
      end_date: values.date_range[1].toISOString(),
      status: values.status
    }
    mutation.mutate(body)
  }

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Xác nhận xóa voucher",
      content: "Bạn có chắc chắn muốn xóa voucher này?",
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: () => deleteMutation.mutate(id)
    })
  }

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
        <Tag color={type === "percentage" ? "blue" : "green"}>{type === "percentage" ? "Phần trăm" : "Số tiền"}</Tag>
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
        <span className="text-gray-700 dark:text-gray-300">{value > 0 ? `${formatCurrency(value)}đ` : "—"}</span>
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
              className="bg-blue-500 h-2 rounded-full transition-all"
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
          active: { color: "green", text: "Hoạt động" },
          inactive: { color: "orange", text: "Chưa bắt đầu" },
          expired: { color: "red", text: "Hết hạn" }
        }
        const config = statusConfig[status as keyof typeof statusConfig] || { color: "default", text: status }
        return <Tag color={config.color}>{config.text}</Tag>
      }
    },
    {
      title: "Áp dụng",
      width: 130,
      fixed: "right",
      align: "center",
      render: (_: any, record: VoucherItemType) => {
        return (
          <button
            onClick={() => {
              setSelectedVouchers(record._id)
              setIsModalOrderOpen(true)
            }}
            type="button"
            className="text-blue-500"
          >
            Xem đơn hàng
          </button>
        )
      }
    },
    {
      title: "Hành động",
      key: "action",
      width: 120,
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handleOpenModal(record)}
            className="text-blue-500 hover:text-blue-700 transition-colors"
            title="Chỉnh sửa"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDelete(record._id)}
            className="text-red-500 hover:text-red-700 transition-colors"
            title="Xóa"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ]

  const [orderLimit, setOrderLimit] = useState<number>(5)
  const [orderPage, setOrderPage] = useState<number>(1)

  const {
    data: voucherApplyOrders,
    isFetching: isFetchingVoucherApplyOrders,
    isLoading: isLoadingVoucherApplyOrders
  } = useQuery({
    queryKey: ["voucherApplyOrders", selectedVouchers, orderLimit, orderPage],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort()
      }, 10000)
      return VoucherAPI.getVoucherApplyOrders(
        selectedVouchers as string,
        { limit: orderLimit.toString(), page: orderPage.toString() },
        controller.signal
      )
    },
    retry: 0,
    staleTime: 3 * 60 * 1000,
    placeholderData: keepPreviousData,
    enabled: Boolean(selectedVouchers)
  })

  const resultOrder = voucherApplyOrders?.data as SuccessResponse<{
    result: OrderItemType[]
    total: string
    page: string
    limit: string
    totalOfPage: string
  }>
  const listOrderApplyVoucher = resultOrder?.result?.result

  useEffect(() => {
    if (isError) {
      const status = (error as any)?.response?.status
      if (status === HttpStatusCode.NotFound) {
        navigate(path.AdminNotFound, { replace: true })
      }
    }
  }, [isError, error, navigate])

  return (
    <div>
      <Helmet>
        <title>Quản lý voucher</title>
      </Helmet>
      <NavigateBack />
      <h1 className="text-2xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-600 my-2">
        Quản lý Voucher
      </h1>

      <section className="mt-4">
        <div className="bg-white dark:bg-darkSecond mb-3 dark:border-darkBorder rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => downloadExcel(listVoucher)}
                icon={<FolderUp size={15} />}
                nameButton="Export"
                classNameButton="py-2 px-3 border border-[#E2E7FF] bg-[#E2E7FF] w-full text-[#3A5BFF] font-medium rounded-md hover:bg-blue-500/40 duration-200 text-[13px] flex items-center gap-1"
              />
              <Select
                defaultValue="new"
                className="select-sort"
                onChange={(value) => handleSort(value, queryConfig, path.AdminVoucher)}
                suffixIcon={<ArrowUpNarrowWide color={isDarkMode ? "white" : "black"} />}
                options={[
                  { value: "old", label: "Cũ nhất" },
                  { value: "new", label: "Mới nhất" }
                ]}
              />
            </div>
            <Button
              onClick={() => handleOpenModal()}
              icon={<Plus size={15} />}
              nameButton="Thêm voucher"
              classNameButton="py-2 px-3 bg-blue-500 w-full text-white font-medium rounded-md hover:bg-blue-500/80 duration-200 text-[13px] flex items-center gap-1"
            />
          </div>

          {isLoading ? (
            <Skeleton />
          ) : listVoucher && listVoucher.length > 0 ? (
            <Table
              rowKey={(r) => r._id}
              dataSource={listVoucher}
              columns={columns}
              loading={isFetching}
              pagination={{
                current: Number(queryConfig.page),
                pageSize: Number(queryConfig.limit),
                total: Number(result?.result.total || 0),
                showSizeChanger: true,
                pageSizeOptions: ["5", "10", "20", "50"],
                onChange: (page, pageSize) => {
                  navigate({
                    pathname: path.AdminVoucher,
                    search: createSearchParams({
                      ...queryConfig,
                      page: page.toString(),
                      limit: pageSize.toString()
                    }).toString()
                  })
                }
              }}
              rowClassName={(_, index) =>
                index % 2 === 0 ? "bg-[#f2f2f2] dark:bg-darkSecond" : "bg-white dark:bg-darkPrimary"
              }
              scroll={{ x: "max-content" }}
            />
          ) : (
            !isFetching && (
              <div className="text-center mt-4">
                <Empty description="Chưa có voucher nào" />
              </div>
            )
          )}
        </div>
      </section>

      <Modal
        title={
          <div className="flex items-center gap-2 text-lg font-semibold">
            <TagIcon size={20} className="text-blue-500" />
            {editingVoucher ? "Chỉnh sửa voucher" : "Thêm voucher mới"}
          </div>
        }
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={700}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
          initialValues={{
            type: "percentage",
            status: "active",
            usage_limit: 100
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            {/* Mã voucher */}
            <Form.Item
              label="Mã voucher"
              name="code"
              rules={[
                { required: true, message: "Vui lòng nhập mã voucher!" },
                { pattern: /^[A-Z0-9]+$/, message: "Chỉ chữ in hoa và số!" }
              ]}
            >
              <Input
                prefix={<TagIcon size={16} className="text-gray-400" />}
                placeholder="VD: TECHZONE10"
                className="uppercase"
                disabled={!!editingVoucher}
              />
            </Form.Item>

            {/* Loại voucher */}
            <Form.Item label="Loại giảm giá" name="type" rules={[{ required: true }]}>
              <Radio.Group onChange={(e) => setVoucherType(e.target.value)} buttonStyle="solid">
                <Radio.Button value="percentage">
                  <Percent size={14} className="inline mr-1" />
                  Phần trăm
                </Radio.Button>
                <Radio.Button value="fixed">
                  <DollarSign size={14} className="inline mr-1" />
                  Số tiền
                </Radio.Button>
              </Radio.Group>
            </Form.Item>
          </div>

          {/* Mô tả */}
          <Form.Item label="Mô tả" name="description">
            <TextArea rows={2} placeholder="Mô tả về voucher (không bắt buộc)" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            {/* Giá trị giảm */}
            <Form.Item
              label={voucherType === "percentage" ? "Giá trị giảm (%)" : "Số tiền giảm (VNĐ)"}
              name="value"
              rules={[{ required: true, message: "Vui lòng nhập giá trị!" }]}
            >
              <InputNumber
                min={0}
                max={voucherType === "percentage" ? 100 : undefined}
                className="w-full"
                formatter={(value) =>
                  voucherType === "percentage" ? `${value}` : `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => (value ? value.replace(/\$\s?|(,*)/g, "") : "") as any}
                suffix={voucherType === "percentage" ? "%" : "đ"}
              />
            </Form.Item>

            {/* Giảm tối đa (chỉ hiện khi type = percentage) */}
            {voucherType === "percentage" && (
              <Form.Item label="Giảm tối đa (VNĐ)" name="max_discount">
                <InputNumber
                  min={0}
                  className="w-full"
                  placeholder="0 = không giới hạn"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, "") as any}
                  suffix="đ"
                />
              </Form.Item>
            )}

            {voucherType === "fixed" && <div />}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Đơn hàng tối thiểu */}
            <Form.Item
              label="Đơn hàng tối thiểu (VNĐ)"
              name="min_order_value"
              rules={[{ required: true, message: "Vui lòng nhập giá trị tối thiểu!" }]}
            >
              <InputNumber
                min={0}
                className="w-full"
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(value) => value!.replace(/\$\s?|(,*)/g, "") as any}
                suffix="đ"
              />
            </Form.Item>

            {/* Số lượt sử dụng */}
            <Form.Item
              label="Số lượt sử dụng"
              name="usage_limit"
              rules={[{ required: true, message: "Vui lòng nhập số lượt!" }]}
            >
              <InputNumber min={1} className="w-full" placeholder="VD: 100" />
            </Form.Item>
          </div>

          {/* Thời gian hiệu lực */}
          <Form.Item
            label="Thời gian hiệu lực"
            name="date_range"
            rules={[{ required: true, message: "Vui lòng chọn thời gian!" }]}
          >
            <RangePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              className="w-full"
              placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
            />
          </Form.Item>

          {/* Trạng thái */}
          <Form.Item label="Trạng thái" name="status" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value="active">Hoạt động</Radio>
              <Radio value="inactive">Chưa bắt đầu</Radio>
            </Radio.Group>
          </Form.Item>

          {/* Buttons */}
          <div className="flex justify-end gap-2 mt-6">
            <Button
              onClick={handleCloseModal}
              nameButton="Hủy"
              classNameButton="px-4 py-2 border border-gray-300 rounded-md dark:text-white dark:hover:bg-gray-800 hover:bg-gray-200"
            />
            <Button
              type="submit"
              nameButton={editingVoucher ? "Cập nhật" : "Thêm mới"}
              classNameButton="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              disabled={mutation.isPending}
            />
          </div>
        </Form>
      </Modal>

      <Modal
        title={
          <div className="flex items-center gap-2 text-lg font-semibold">
            <TagIcon size={20} className="text-blue-500" />
            Danh sách đơn hàng áp dụng voucher
          </div>
        }
        open={isModalOrderOpen}
        onCancel={() => {
          setIsModalOrderOpen(false)
          setSelectedVouchers(null)
        }}
        footer={null}
        width={1200}
        style={{ top: 50 }}
      >
        {isLoadingVoucherApplyOrders ? (
          <Skeleton />
        ) : (
          <div className="mt-4">
            {listOrderApplyVoucher && listOrderApplyVoucher.length > 0 ? (
              <Table
                rowKey={(record) => record._id}
                dataSource={listOrderApplyVoucher}
                pagination={{
                  current: Number(resultOrder?.result?.page || 1),
                  pageSize: Number(resultOrder?.result?.limit || 5),
                  total: Number(resultOrder?.result?.total || 0),
                  showSizeChanger: true,
                  pageSizeOptions: ["5", "10", "20"],
                  onChange: (page, pageSize) => {
                    setOrderPage(page)
                    setOrderLimit(pageSize)
                  }
                }}
                loading={isFetchingVoucherApplyOrders}
                scroll={{ x: "max-content" }}
                columns={[
                  {
                    title: "STT",
                    key: "index",
                    width: 60,
                    align: "center",
                    render: (_, __, index) => {
                      const currentPage = Number(resultOrder?.result?.page) || 1
                      const pageSize = Number(resultOrder?.result?.limit) || 5
                      return (currentPage - 1) * pageSize + index + 1
                    }
                  },
                  {
                    title: "Mã đơn hàng",
                    dataIndex: "_id",
                    key: "_id",
                    width: 150,
                    render: (orderId: string) => (
                      <code className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded font-mono text-sm">
                        {orderId}
                      </code>
                    )
                  },
                  {
                    title: "Khách hàng",
                    dataIndex: "user_id",
                    key: "user_id",
                    width: 160,
                    render: (_: any, record: OrderItemType) => (
                      <div className="space-y-1">
                        <div className="font-medium text-gray-800 dark:text-gray-200">
                          {record?.customer_info.name || "—"}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {record?.customer_info.phone || "—"}
                        </div>
                      </div>
                    )
                  },
                  {
                    title: "Tổng tiền (Bao gồm phí vận chuyển)",
                    dataIndex: "total_amount",
                    key: "total_amount",
                    width: 170,
                    align: "right",
                    render: (_: number, record: OrderItemType) => (
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {formatCurrency(record.subTotal + record.shipping_fee)}đ
                      </span>
                    )
                  },
                  {
                    title: "Giảm giá",
                    dataIndex: "discount_amount",
                    key: "discount_amount",
                    width: 120,
                    align: "right",
                    render: (discount: number) => (
                      <span className="font-medium text-red-500">-{formatCurrency(discount)}đ</span>
                    )
                  },
                  {
                    title: "Thanh toán",
                    dataIndex: "totalAmount",
                    key: "totalAmount",
                    width: 130,
                    align: "right",
                    render: (final: number) => (
                      <span className="font-bold text-green-600 dark:text-green-400">{formatCurrency(final)}đ</span>
                    )
                  },
                  {
                    title: "Trạng thái",
                    dataIndex: "status",
                    key: "status",
                    width: 130,
                    align: "center",
                    render: (status: string) => {
                      const statusConfig: Record<string, { color: string; text: string }> = {
                        "Chờ xác nhận": { color: "orange", text: "Chờ xác nhận" },
                        "Đang xử lý": { color: "blue", text: "Đang xử lý" },
                        "Đang vận chuyển": { color: "cyan", text: "Đang vận chuyển" },
                        "Đã giao hàng": { color: "green", text: "Đã giao hàng" },
                        "Đã hủy": { color: "red", text: "Đã hủy" }
                      }
                      const config = statusConfig[status]
                      return <Tag color={config.color}>{config.text}</Tag>
                    }
                  },
                  {
                    title: "Ngày đặt",
                    dataIndex: "created_at",
                    key: "created_at",
                    width: 160,
                    render: (date: string) => (
                      <span className="text-gray-600 dark:text-gray-400 text-sm">{convertDateTime(date)}</span>
                    )
                  },
                  {
                    title: "Hành động",
                    key: "action",
                    width: 120,
                    fixed: "right",
                    align: "center",
                    render: (_, record) => (
                      <div className="flex items-center justify-center">
                        <Link
                          className="text-blue-500"
                          to={`/admin/orders/${record._id}`}
                          state={{
                            orderData: record,
                            type: record.status === "Đã giao hàng" ? "completed" : "processing"
                          }}
                        >
                          Xem chi tiết
                        </Link>
                      </div>
                    )
                  }
                ]}
                rowClassName={(_, index) =>
                  index % 2 === 0 ? "bg-[#f9fafb] dark:bg-darkSecond" : "bg-white dark:bg-darkPrimary"
                }
              />
            ) : (
              <Empty description="Chưa có đơn hàng nào sử dụng voucher này" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
