import { Helmet } from "react-helmet-async"
import NavigateBack from "src/Admin/Components/NavigateBack"
import { ArrowUpFromLine, ArrowUpNarrowWide, FolderUp, Plus, RotateCcw, Search, X } from "lucide-react"
import { createSearchParams, Link, useNavigate } from "react-router-dom"
import Button from "src/Components/Button"
import { AnimatePresence, motion } from "framer-motion"
import Input from "src/Components/Input"
import { path } from "src/Constants/path"
import useQueryParams from "src/Hook/useQueryParams"
import { isUndefined, omit, omitBy } from "lodash"
import { queryParamConfigOrder } from "src/Types/queryParams.type"
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query"
import { adminAPI } from "src/Apis/admin.api"
import { SuccessResponse } from "src/Types/utils.type"
import { OrderItemType } from "src/Types/product.type"
import Skeleton from "src/Components/Skeleton"
import Pagination from "src/Components/Pagination"
import OrderItem from "./Components/OrderItem"
import { useCallback, useEffect, useState } from "react"
import { Collapse, CollapseProps, Select, Steps } from "antd"
import "./ManageOrders.css"
import { Controller, useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { schemaOrder, schemaOrderSearch, SchemaOrderSearchType, SchemaOrderType } from "src/Client/Utils/rule"
import { cleanObject, convertDateTime, formatCurrency } from "src/Helpers/common"
import { toast } from "react-toastify"
import { queryClient } from "src/main"
import DatePicker from "src/Admin/Components/DatePickerRange"
import useDownloadExcel from "src/Hook/useDownloadExcel"
import { useTheme } from "src/Admin/Components/Theme-provider/Theme-provider"

type FormDataUpdate = Pick<
  SchemaOrderType,
  "customer_info" | "id" | "note" | "products" | "created_at" | "updated_at" | "status" | "totalAmount"
>
const formDataUpdate = schemaOrder.pick([
  "id",
  "customer_info",
  "products",
  "note",
  "totalAmount",
  "status",
  "created_at",
  "updated_at"
])

type FormDataSearch = Pick<
  SchemaOrderSearchType,
  "created_at_start" | "created_at_end" | "status" | "name" | "address" | "phone" | "price_min" | "price_max"
>

const formDataSearch = schemaOrderSearch.pick([
  "created_at_start",
  "created_at_end",
  "status",
  "name",
  "address",
  "phone",
  "price_min",
  "price_max"
])

export default function ManageOrders() {
  const { theme } = useTheme()
  const isDark = theme === "dark" || theme === "system"
  const navigate = useNavigate()
  const { downloadExcel } = useDownloadExcel()
  const queryParams: queryParamConfigOrder = useQueryParams()
  const queryConfig: queryParamConfigOrder = omitBy(
    {
      page: queryParams.page || "1", // mặc định page = 1
      limit: queryParams.limit || "5", // mặc định limit = 5
      name: queryParams.name,
      address: queryParams.address,
      phone: queryParams.phone,
      status: queryParams.status,
      price_min: queryParams.price_min,
      price_max: queryParams.price_max,
      created_at_start: queryParams.created_at_start,
      created_at_end: queryParams.created_at_end,

      sortBy: queryParams.sortBy || "new" // mặc định sort mới nhất
    },
    isUndefined
  )

  const { data, isFetching, isLoading } = useQuery({
    queryKey: ["listOrder", queryConfig],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)
      return adminAPI.order.getOrderList(queryConfig as queryParamConfigOrder, controller.signal)
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 3 * 60 * 1000, // dưới 3 phút nó không gọi lại api
    placeholderData: keepPreviousData
  })

  const result = data?.data as SuccessResponse<{
    result: OrderItemType[]
    total: string
    page: string
    limit: string
    totalOfPage: string
  }>
  const listOrder = result?.result?.result
  const page_size = Math.ceil(Number(result?.result.total) / Number(result?.result.limit))

  // xử lý sort ds
  const handleChangeSortListOrder = (value: string) => {
    const body = {
      ...queryConfig,
      sortBy: value
    }
    navigate({
      pathname: `${path.AdminOrders}`,
      search: createSearchParams(body).toString()
    })
  }

  const [idOrder, setIdOrder] = useState<string | null>(null)

  const handleEditItem = useCallback((id: string) => {
    setIdOrder(id)
  }, [])

  const handleExitsEditItem = () => {
    setIdOrder(null)
  }

  const getInfoOrder = useQuery({
    queryKey: ["orderDetail", idOrder],
    queryFn: () => {
      return adminAPI.order.getOrderDetail(idOrder as string)
    },
    enabled: Boolean(idOrder)
  })

  const infoOrder = getInfoOrder.data?.data as SuccessResponse<OrderItemType>
  const order = infoOrder?.result

  const {
    register,
    formState: { errors },
    setValue,
    control,
    handleSubmit
  } = useForm<FormDataUpdate>({
    resolver: yupResolver(formDataUpdate),
    defaultValues: {
      id: "",
      customer_info: {
        name: "",
        address: "",
        phone: ""
      },
      products: [],
      status: "",
      totalAmount: 0,
      note: "",
      created_at: "",
      updated_at: ""
    } // giá trị khởi tạo
  })

  useEffect(() => {
    if (order) {
      setValue("id", order._id)
      setValue("customer_info.name", order.customer_info.name)
      setValue("customer_info.address", order.customer_info.address)
      setValue("customer_info.phone", order.customer_info.phone)
      setValue("totalAmount", order.totalAmount)
      setValue("status", order.status)
      setValue("created_at", convertDateTime(order.created_at))
      setValue("updated_at", convertDateTime(order.updated_at))
    }
  }, [order, setValue])

  const updateStatusOrderMutation = useMutation({
    mutationFn: (body: { id: string; status: string }) => {
      return adminAPI.order.updateOrderStatus(body.id, body.status)
    }
  })

  const handleUpdateOrder = handleSubmit((data) => {
    updateStatusOrderMutation.mutate(
      { id: data.id as string, status: data.status as string },
      {
        onSuccess: (res) => {
          setIdOrder(null)
          toast.success(res.data.message, { autoClose: 1500 })
          queryClient.invalidateQueries({ queryKey: ["listOrder", queryConfig] })
        }
      }
    )
  })

  const {
    register: registerFormSearch,
    control: controlFormSearch,
    trigger,
    handleSubmit: handleSubmitFormSearch,
    reset: resetFormSearch
  } = useForm<FormDataSearch>({
    resolver: yupResolver(formDataSearch)
  })

  const handleSubmitSearch = handleSubmitFormSearch(
    (data) => {
      console.log(data)
      const params = cleanObject({
        ...queryConfig,
        page: 1,
        sortBy: "new",
        name: encodeURIComponent(data.name as string),
        address: encodeURIComponent(data.address as string),
        phone: data.phone,
        status: data.status,
        created_at_start: data.created_at_start?.toISOString(),
        created_at_end: data.created_at_end?.toISOString()
      })

      navigate({
        pathname: path.AdminOrders,
        search: createSearchParams(params).toString()
      })
    },
    (error) => {
      if (error.price_min) {
        toast.error(error.price_min?.message, { autoClose: 1500 })
      }
      if (error.created_at_end) {
        toast.error(error.created_at_end?.message, { autoClose: 1500 })
      }
    }
  ) // nó điều hướng với query params truyền vào và nó render lại component || tren URL lấy queryConfig xuống và fetch lại api ra danh sách cần thiết

  const handleResetFormSearch = () => {
    const filteredSearch = omit(queryConfig, [
      "name",
      "address",
      "phone",
      "status",
      "created_at_start",
      "created_at_end"
    ])
    resetFormSearch()
    navigate({ pathname: `${path.AdminOrders}`, search: createSearchParams(filteredSearch).toString() })
  }

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: <h1 className="text-[16px] font-semibold tracking-wide text-black dark:text-white">Bộ lọc & Tìm kiếm</h1>,
      children: (
        <section className="bg-white dark:bg-darkPrimary mb-3 dark:border-darkBorder rounded-2xl">
          <form onSubmit={handleSubmitSearch}>
            <div className="mt-1 grid grid-cols-2">
              <div className="col-span-1 flex items-center h-14 px-2 bg-[#ececec] dark:bg-darkBorder border border-[#dadada] rounded-tl-xl">
                <span className="w-1/3 dark:text-white">Tên người nhận</span>
                <div className="w-2/3 relative h-full">
                  <div className="mt-2 w-full flex items-center gap-2">
                    <Input
                      name="name"
                      register={registerFormSearch}
                      placeholder="Nhập tên người nhận"
                      classNameInput="p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#fff] dark:bg-darkSecond focus:border-blue-500 focus:ring-1 outline-none rounded-md text-black dark:text-white"
                      className="relative flex-grow"
                      classNameError="hidden"
                    />
                  </div>
                  <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
                </div>
              </div>
              <div className="col-span-1 flex items-center h-14 px-2 bg-[#ececec] dark:bg-darkBorder border border-[#dadada] rounded-tr-xl">
                <span className="w-1/3 dark:text-white">Địa chỉ người nhận</span>
                <div className="w-2/3 relative h-full">
                  <div className="mt-2 w-full flex items-center gap-2">
                    <Input
                      name="address"
                      register={registerFormSearch}
                      placeholder="Nhập địa chỉ"
                      classNameInput="p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#fff] dark:bg-darkSecond focus:border-blue-500 focus:ring-1 outline-none rounded-md text-black dark:text-white"
                      className="relative flex-grow"
                      classNameError="hidden"
                    />
                  </div>
                  <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
                </div>
              </div>
              <div className="col-span-1 flex items-center h-14 px-2 bg-[#fff] dark:bg-darkBorder border border-[#dadada] border-t-0">
                <span className="w-1/3 dark:text-white">Số điện thoại</span>
                <div className="w-2/3 relative h-full">
                  <div className="mt-2 w-full flex items-center gap-2">
                    <Input
                      name="phone"
                      register={registerFormSearch}
                      placeholder="Nhập số điện thoại"
                      classNameInput="p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-1 outline-none rounded-md text-black dark:text-white"
                      className="relative flex-grow"
                      classNameError="hidden"
                    />
                  </div>
                  <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
                </div>
              </div>
              <div className="col-span-1 flex items-center h-14 px-2 bg-[#fff] dark:bg-darkBorder border border-[#dadada] border-t-0">
                <span className="w-1/3 dark:text-white">Trạng thái</span>
                <div className="w-2/3 relative h-full">
                  <Controller
                    name="status"
                    control={controlFormSearch}
                    render={({ field }) => {
                      return (
                        <select
                          // {...field}
                          value={field.value ?? ""} // ✅ Giá trị từ form
                          onChange={(e) => field.onChange(e.target.value ? e.target.value : undefined)} // ✅ Cập nhật vào form
                          className="p-2 border border-gray-300 dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond w-full mt-2 rounded-md dark:text-white"
                        >
                          <option value="" disabled>
                            -- Chọn thể loại --
                          </option>
                          {["Chờ xác nhận", "Đang xử lý", "Đang vận chuyển", "Đã giao hàng", "Đã hủy"]?.map(
                            (item, index) => {
                              return (
                                <option key={index} value={item}>
                                  {item}
                                </option>
                              )
                            }
                          )}
                        </select>
                      )
                    }}
                  />
                  <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
                </div>
              </div>
              <div className="col-span-1 flex items-center h-14 px-2 bg-[#ececec] dark:bg-darkBorder border border-[#dadada] border-t-0 rounded-bl-xl">
                <span className="w-1/3 dark:text-white">Ngày tạo</span>
                <div className="w-2/3 relative h-full">
                  <div className="mt-2 w-full flex items-center gap-2">
                    <Controller
                      name="created_at_start"
                      control={controlFormSearch}
                      render={({ field }) => {
                        return (
                          <DatePicker
                            value={field.value as Date}
                            onChange={(event) => {
                              field.onChange(event)
                              trigger("created_at_end")
                            }}
                          />
                        )
                      }}
                    />
                    <span>-</span>
                    <Controller
                      name="created_at_end"
                      control={controlFormSearch}
                      render={({ field }) => {
                        return (
                          <DatePicker
                            value={field.value as Date}
                            onChange={(event) => {
                              field.onChange(event)
                              trigger("created_at_start")
                            }}
                          />
                        )
                      }}
                    />
                  </div>
                  <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-4">
              <div className="flex items-center gap-2">
                <Link
                  to={path.AddReceipt}
                  className="py-2 px-3 bg-blue-500 w-full text-white font-medium rounded-3xl hover:bg-blue-500/80 duration-200 text-[13px] flex items-center gap-1"
                >
                  <Plus size={15} />
                  <span>Thêm mới</span>
                </Link>
                <Button
                  onClick={() => downloadExcel(listOrder)}
                  icon={<FolderUp size={15} />}
                  nameButton="Export"
                  classNameButton="py-2 px-3 border border-[#E2E7FF] bg-[#E2E7FF] w-full text-[#3A5BFF] font-medium rounded-3xl hover:bg-blue-500/40 duration-200 text-[13px] flex items-center gap-1"
                />
                <Select
                  defaultValue="Mới nhất"
                  className="select-sort"
                  onChange={handleChangeSortListOrder}
                  suffixIcon={<ArrowUpNarrowWide color={isDark ? "white" : "black"} />}
                  options={[
                    { value: "old", label: "Cũ nhất" },
                    { value: "new", label: "Mới nhất" }
                  ]}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleResetFormSearch}
                  type="button"
                  icon={<RotateCcw size={15} />}
                  nameButton="Xóa bộ lọc"
                  classNameButton="py-2 px-3 bg-[#f2f2f2] border border-[#dedede] w-full text-black font-medium hover:bg-[#dedede]/80 rounded-3xl duration-200 text-[13px] flex items-center gap-1 h-[35px]"
                />
                <Button
                  type="submit"
                  icon={<Search size={15} />}
                  nameButton="Tìm kiếm"
                  classNameButton="py-2 px-3 bg-blue-500 w-full text-white font-medium rounded-3xl hover:bg-blue-500/80 duration-200 text-[13px] flex items-center gap-1 h-[35px]"
                  className="flex-shrink-0"
                />
              </div>
            </div>
          </form>
        </section>
      )
    },
    {
      key: "2",
      label: <h2 className="text-[16px] font-semibold tracking-wide text-black dark:text-white">Danh sách Đơn hàng</h2>,
      children: (
        <section className="bg-white dark:bg-darkPrimary mb-3 dark:border-darkBorder rounded-2xl">
          {isLoading && <Skeleton />}
          {!isFetching && (
            <div>
              <div>
                <div className="bg-[#f2f2f2] dark:bg-darkPrimary grid grid-cols-12 items-center gap-2 py-3 border border-[#dedede] dark:border-darkBorder px-4 rounded-tl-xl rounded-tr-xl">
                  <div className="col-span-1 text-[14px] font-semibold tracking-wider uppercase sticky top-0 left-0 text-black dark:text-white">
                    Mã đơn hàng
                  </div>
                  <div className="col-span-2 text-[14px] font-semibold tracking-wider uppercase text-black dark:text-white">
                    Người nhận hàng
                  </div>
                  <div className="col-span-1 text-[14px] font-semibold tracking-wider uppercase  text-black dark:text-white">
                    Số điện thoại
                  </div>
                  <div className="col-span-2 text-[14px] text-center font-semibold tracking-wider uppercase text-black dark:text-white">
                    Địa chỉ
                  </div>
                  <div className="col-span-1 text-[14px] font-semibold tracking-wider uppercase text-black dark:text-white">
                    Tổng tiền
                  </div>
                  <div className="col-span-1 text-[14px] text-center font-semibold tracking-wider uppercase text-black dark:text-white">
                    Sản phẩm
                  </div>
                  <div className="col-span-2 text-[14px] text-center font-semibold tracking-wider uppercase text-black dark:text-white">
                    Trạng thái
                  </div>
                  <div className="col-span-1 text-[14px] font-semibold tracking-wider uppercase text-black dark:text-white">
                    Ngày tạo
                  </div>
                  <div className="col-span-1 text-[14px] text-center font-semibold tracking-wider uppercase text-black dark:text-white">
                    Hành động
                  </div>
                </div>
                <div>
                  {listOrder?.length > 0 ? (
                    listOrder?.map((item, index) => (
                      <motion.div
                        key={item._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <OrderItem
                          handleEditItem={handleEditItem}
                          item={item}
                          maxIndex={listOrder?.length}
                          index={index}
                        />
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center mt-4">Không tìm thấy kết quả</div>
                  )}
                </div>
              </div>
              <Pagination
                data={result}
                queryConfig={queryConfig}
                page_size={page_size}
                pathNavigate={path.AdminOrders}
              />

              <AnimatePresence>
                {idOrder && (
                  <motion.div
                    initial={{ opacity: 0 }} // khởi tạo là 0
                    animate={{ opacity: 1 }} // xuất hiện dần là 1
                    exit={{ opacity: 0 }} // biến mất là 0
                    className="fixed left-0 top-0 z-10 h-screen w-screen bg-black/60 flex items-center justify-center"
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative"
                    >
                      <button onClick={handleExitsEditItem} className="absolute z-30 right-3 top-2">
                        <X color="gray" size={22} />
                      </button>
                      <form
                        onSubmit={handleUpdateOrder}
                        className="bg-white dark:bg-darkPrimary rounded-md w-[1100px] overflow-hidden"
                      >
                        <div className="max-h-[600px] overflow-y-auto">
                          <h3 className="py-2 px-4 text-lg font-semibold tracking-wide rounded-md sticky top-0 left-0 bg-white dark:bg-darkPrimary z-20 text-black dark:text-white">
                            Thông tin đơn hàng
                          </h3>
                          <div className="p-4 pt-0 flex items-start justify-between gap-4">
                            <div className="w-2/3">
                              <div className="mt-4 flex items-center gap-4">
                                <Input
                                  name="id"
                                  register={register}
                                  placeholder="Nhập họ tên"
                                  messageErrorInput={errors.id?.message}
                                  classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
                                  className="relative flex-1"
                                  classNameLabel="text-black dark:text-white"
                                  nameInput="Mã đơn hàng"
                                  disabled
                                />
                                <Input
                                  name="customer_info.name"
                                  register={register}
                                  placeholder="Nhập họ tên"
                                  messageErrorInput={errors.customer_info?.name?.message}
                                  classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
                                  className="relative flex-1"
                                  classNameLabel="text-black dark:text-white"
                                  nameInput="Tên người nhận"
                                  disabled
                                />
                                <Input
                                  register={register}
                                  name="customer_info.phone"
                                  placeholder="Nhập số điện thoại"
                                  messageErrorInput={errors.customer_info?.phone?.message}
                                  classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond  focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
                                  className="relative flex-1"
                                  classNameLabel="text-black dark:text-white"
                                  nameInput="Số điện thoại"
                                  disabled
                                />
                              </div>
                              <div className="mt-2 flex items-center gap-4">
                                <Input
                                  name="customer_info.address"
                                  register={register}
                                  placeholder="Nhập địa chỉ"
                                  messageErrorInput={errors.customer_info?.address?.message}
                                  classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
                                  className="relative flex-1"
                                  classNameLabel="text-black dark:text-white"
                                  nameInput="Địa chỉ"
                                  disabled
                                />
                              </div>
                              <div className="mt-2 flex items-center gap-4">
                                <Input
                                  register={register}
                                  name="note"
                                  placeholder="Nhập ghi chú"
                                  messageErrorInput={errors.customer_info?.phone?.message}
                                  classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
                                  className="relative flex-1"
                                  nameInput="Ghi chú (Optional)"
                                  classNameLabel="text-black dark:text-white"
                                  disabled
                                />
                              </div>
                              <div className="mt-2 flex items-center gap-4">
                                <Input
                                  name="created_at"
                                  register={register}
                                  placeholder="Nhập ngày tạo"
                                  messageErrorInput={errors.created_at?.message}
                                  classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
                                  className="relative flex-1"
                                  classNameLabel="text-black dark:text-white"
                                  nameInput="Ngày tạo"
                                  disabled
                                />
                                <Input
                                  name="updated_at"
                                  register={register}
                                  placeholder="Nhập ngày tạo cập nhật"
                                  messageErrorInput={errors.updated_at?.message}
                                  classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond  focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
                                  className="relative flex-1"
                                  classNameLabel="text-black dark:text-white"
                                  nameInput="Ngày cập nhật"
                                  disabled
                                />
                              </div>
                              <div className="mt-1">
                                <span className="text-black dark:text-white">Trạng thái</span>
                                <Controller
                                  name="status"
                                  control={control}
                                  render={({ field }) => (
                                    <Select
                                      value={field.value}
                                      onChange={field.onChange}
                                      className="select-status"
                                      options={[
                                        { value: "Chờ xác nhận", label: "Chờ xác nhận" },
                                        { value: "Đang xử lý", label: "Đang xử lý" },
                                        { value: "Đang vận chuyển", label: "Đang vận chuyển" },
                                        { value: "Đã giao hàng", label: "Đã giao hàng" },
                                        { value: "Đã hủy", label: "Đã hủy" }
                                      ]}
                                    />
                                  )}
                                />
                              </div>
                              <div className="mt-2">
                                <div className="text-lg text-center font-semibold mb-2 tracking-wide text-black dark:text-white">
                                  Danh sách sản phẩm ({order?.products.length})
                                </div>
                                <div className="space-y-3">
                                  {order?.products.map((item) => {
                                    return (
                                      <div
                                        key={item.product_id}
                                        className="flex items-center justify-between p-3 border border-gray-200 rounded-md shadow-sm bg-white dark:bg-darkPrimary"
                                      >
                                        <div className="flex items-center gap-4">
                                          <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-16 h-16 object-cover rounded-md border"
                                          />
                                          <div>
                                            <p className="font-medium text-gray-800 dark:text-white">{item.name}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-300">
                                              Số lượng: {item.quantity}
                                            </p>
                                          </div>
                                        </div>

                                        {/* Giá tiền */}
                                        <div className="text-right">
                                          {item.discount !== 0 ? (
                                            <div>
                                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                                Đơn giá:{" "}
                                                {formatCurrency(item.price - item.price * (item.discount / 100))}đ
                                              </p>
                                              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                Thành tiền:{" "}
                                                {formatCurrency(
                                                  (item.price - item.price * (item.discount / 100)) * item.quantity
                                                )}
                                                đ
                                              </p>
                                            </div>
                                          ) : (
                                            <div>
                                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                                Đơn giá: {formatCurrency(item.price)} đ
                                              </p>
                                              <p className="text-sm font-semibold text-gray-700">
                                                Thành tiền: {formatCurrency(item.price * item.quantity)}đ
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                                <div className="mt-2 text-red-500 text-base font-semibold">
                                  Tổng tiền: {formatCurrency((order?.totalAmount as number) || 0)} đ
                                </div>
                              </div>
                              <div className="flex items-center justify-start">
                                <Button
                                  type="submit"
                                  icon={<ArrowUpFromLine size={18} />}
                                  nameButton="Cập nhật"
                                  classNameButton="w-[120px] p-4 py-2 bg-blue-500 mt-2 w-full text-white font-semibold rounded-3xl hover:bg-blue-500/80 duration-200 flex items-center gap-1"
                                />
                              </div>
                            </div>
                            <div className="w-1/3">
                              <div className="text-base font-semibold tracking-wide text-black dark:text-white">
                                Lịch sử đơn hàng
                              </div>
                              <div className="ml-2">
                                <Steps
                                  progressDot
                                  current={order?.status_history.length}
                                  direction="vertical"
                                  items={order?.status_history.map((item) => ({
                                    title: item.status,
                                    description: convertDateTime(item.updated_at)
                                  }))}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </form>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </section>
      )
    }
  ]

  return (
    <div>
      <Helmet>
        <title>Quản lý đơn hàng</title>
        <meta
          name="description"
          content="Đây là trang TECHZONE | Laptop, PC, Màn hình, điện thoại, linh kiện Chính Hãng"
        />
      </Helmet>
      <NavigateBack />
      <h1 className="text-2xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 my-2">
        Đơn hàng
      </h1>

      <Collapse items={items} defaultActiveKey={["2"]} className="bg-white dark:bg-darkPrimary dark:border-none" />
    </div>
  )
}
