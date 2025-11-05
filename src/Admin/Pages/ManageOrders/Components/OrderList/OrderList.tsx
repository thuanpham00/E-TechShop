/* eslint-disable @typescript-eslint/no-explicit-any */
import { yupResolver } from "@hookform/resolvers/yup"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { Select, Tag, Table, Collapse, CollapseProps, DatePicker, Empty } from "antd"
import { ColumnsType } from "antd/es/table"
import { isUndefined, omit, omitBy } from "lodash"
import { ArrowUpNarrowWide, ClipboardCheck, FolderUp, RotateCcw, Search } from "lucide-react"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { createSearchParams, Link, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { useTheme } from "src/Admin/Components/Theme-provider/Theme-provider"
import { OrderAPI } from "src/Apis/admin/order.api"
import { schemaSearchFilterOrder, SchemaSearchFilterOrderType } from "src/Client/Utils/rule"
import Button from "src/Components/Button"
import Input from "src/Components/Input"
import Skeleton from "src/Components/Skeleton"
import { path } from "src/Constants/path"
import { cleanObject, convertDateTime, formatCurrency } from "src/Helpers/common"
import useDownloadExcel from "src/Hook/useDownloadExcel"
import useQueryParams from "src/Hook/useQueryParams"
import useSortList from "src/Hook/useSortList"
import { OrderItemType } from "src/Types/product.type"
import { queryParamConfigOrder } from "src/Types/queryParams.type"
import { SuccessResponse } from "src/Types/utils.type"

type FormDataSearch = Pick<
  SchemaSearchFilterOrderType,
  | "created_at_start"
  | "created_at_end"
  | "updated_at_start"
  | "updated_at_end"
  | "status"
  | "name"
  | "address"
  | "phone"
  // | "price_min"
  // | "price_max"
>

const formDataSearch = schemaSearchFilterOrder.pick([
  "created_at_start",
  "created_at_end",
  "created_at_start",
  "created_at_end",
  "status",
  "name",
  "address",
  "phone"
  // "price_min",
  // "price_max"
])

export default function OrderList({ type }: { type: "process" | "completed" | "canceled" }) {
  const { theme } = useTheme()
  const isDark = theme === "dark" || theme === "system"
  const navigate = useNavigate()
  const { downloadExcel } = useDownloadExcel()
  const { handleSort } = useSortList()

  const queryParams: queryParamConfigOrder = useQueryParams()
  const queryConfig: queryParamConfigOrder = omitBy(
    {
      page: queryParams.page || "1", // mặc định page = 1
      limit: queryParams.limit || "5", // mặc định limit = 5
      name: queryParams.name,
      address: queryParams.address,
      phone: queryParams.phone,
      status: queryParams.status,
      // price_min: queryParams.price_min,
      // price_max: queryParams.price_max,
      created_at_start: queryParams.created_at_start,
      created_at_end: queryParams.created_at_end,
      updated_at_start: queryParams.updated_at_start,
      updated_at_end: queryParams.updated_at_end,

      sortBy: queryParams.sortBy || "new" // mặc định sort mới nhất
    },
    isUndefined
  )

  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: ["listOrder", queryConfig, type],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)
      return type === "process"
        ? OrderAPI.getOrderListInProcess(queryConfig as queryParamConfigOrder, controller.signal)
        : type === "canceled"
          ? OrderAPI.getOrderListCancelled(queryConfig as queryParamConfigOrder, controller.signal)
          : OrderAPI.getOrderListCompleted(queryConfig as queryParamConfigOrder, controller.signal)
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

  const copyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id)
      toast.success("Đã sao chép ID", { autoClose: 1200 })
    } catch {
      toast.error("Sao chép thất bại", { autoClose: 1200 })
    }
  }

  const columns: ColumnsType<OrderItemType> = [
    {
      title: "Mã đơn hàng",
      dataIndex: "_id",
      key: "_id",
      width: 220,
      render: (id: string) => (
        <div className="flex items-center justify-between">
          <div className="truncate w-[80%] text-blue-500">{id}</div>
          <button onClick={() => copyId(id)} className="p-1 border rounded ml-2">
            <ClipboardCheck color="#8d99ae" size={14} />
          </button>
        </div>
      )
    },
    {
      title: "Người nhận hàng",
      dataIndex: ["customer_info", "name"],
      key: "customer_name",
      width: 160,
      render: (_, record) => <div className="text-black dark:text-white">{record.customer_info?.name || ""}</div>
    },
    {
      title: "Số điện thoại",
      dataIndex: ["customer_info", "phone"],
      key: "phone",
      width: 140,
      render: (_, record) => <div className="break-words">{record.customer_info?.phone || ""}</div>
    },
    {
      title: "Địa chỉ",
      dataIndex: ["customer_info", "address"],
      key: "address",
      width: 300,
      render: (_, record) => (
        <div className="text-left break-words max-w-[420px]">{record.customer_info?.address || ""}</div>
      )
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 140,
      render: (v: number) => <div className="text-red-500 font-semibold">{v ? formatCurrency(v) + "đ" : ""}</div>
    },
    {
      title: "Sản phẩm",
      dataIndex: "products",
      key: "products_count",
      width: 100,
      align: "center",
      render: (_, record) => {
        const count = record.products?.reduce((t, p) => t + (p.quantity || 0), 0) ?? 0
        return <div className="text-red-500 font-semibold">({count})</div>
      }
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      width: 160,
      render: (v: string) => <div>{convertDateTime(v)}</div>
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "updated_at",
      key: "updated_at",
      width: 160,
      render: (v: string) => <div>{convertDateTime(v)}</div>
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 180,
      fixed: "right",
      align: "center",
      render: (status: string) => {
        let color = "default"
        switch (status) {
          case "Chờ xác nhận":
            color = "orange"
            break
          case "Đang xử lý":
            color = "blue"
            break
          case "Đang vận chuyển":
            color = "cyan"
            break
          case "Đã giao hàng":
            color = "green"
            break
          case "Đã hủy":
            color = "red"
            break
          default:
            color = "default"
        }
        return (
          <Tag color={color} className="text-sm break-words whitespace-normal max-w-full">
            {status}
          </Tag>
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
        <div className="flex items-center justify-center">
          <Link
            className="text-blue-500"
            to={`/admin/orders/${record._id}`}
            state={{
              orderData: record,
              type: type
            }}
          >
            Xem chi tiết
          </Link>
        </div>
      )
    }
  ]

  // xử lý bộ lọc
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
      const params = cleanObject({
        ...queryConfig,
        page: 1,
        sortBy: "new",
        name: encodeURIComponent(data.name as string),
        address: encodeURIComponent(data.address as string),
        phone: data.phone,
        status: data.status,
        created_at_start: data.created_at_start?.toISOString(),
        created_at_end: data.created_at_end?.toISOString(),
        updated_at_start: data.updated_at_start?.toISOString(),
        updated_at_end: data.updated_at_end?.toISOString()
      })

      navigate({
        pathname: path.AdminOrders,
        search: createSearchParams(params).toString()
      })
    },
    (error) => {
      // if (error.price_min) {
      //   toast.error(error.price_min?.message, { autoClose: 1500 })
      // }
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
      "created_at_end",
      "updated_at_start",
      "updated_at_end"
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
              <div className="col-span-1 flex items-center h-14 px-2 bg-[#ececec] dark:bg-darkPrimary border border-[#dadada] rounded-tl-md">
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
              <div className="col-span-1 flex items-center h-14 px-2 bg-[#ececec] dark:bg-darkPrimary border border-[#dadada] rounded-tr-md">
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
              <div className="col-span-1 flex items-center h-14 px-2 bg-[#fff] dark:bg-darkPrimary border border-[#dadada] border-t-0">
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
              <div className="col-span-1 flex items-center h-14 px-2 bg-[#fff] dark:bg-darkPrimary border border-[#dadada] border-t-0">
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
              <div className="col-span-1 flex items-center h-14 px-2 bg-[#ececec] dark:bg-darkPrimary border border-[#dadada] border-t-0 rounded-bl-md">
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
              <div className="col-span-1 flex items-center h-14 px-2 bg-[#ececec] dark:bg-darkPrimary border border-[#dadada] border-t-0 rounded-br-md">
                <span className="w-1/3 dark:text-white">Ngày cập nhật</span>
                <div className="w-2/3 relative h-full">
                  <div className="mt-2 w-full flex items-center gap-2">
                    <Controller
                      name="updated_at_start"
                      control={controlFormSearch}
                      render={({ field }) => {
                        return (
                          <DatePicker
                            value={field.value as Date}
                            onChange={(event) => {
                              field.onChange(event)
                              trigger("updated_at_end")
                            }}
                          />
                        )
                      }}
                    />
                    <span>-</span>
                    <Controller
                      name="updated_at_end"
                      control={controlFormSearch}
                      render={({ field }) => {
                        return (
                          <DatePicker
                            value={field.value as Date}
                            onChange={(event) => {
                              field.onChange(event)
                              trigger("updated_at_start")
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

            <div className="flex items-center justify-end gap-2 my-2">
              <Button
                onClick={handleResetFormSearch}
                type="button"
                icon={<RotateCcw size={15} />}
                nameButton="Xóa bộ lọc"
                classNameButton="py-2 px-3 bg-[#f2f2f2] border border-[#dedede] w-full text-black font-medium hover:bg-[#dedede]/80 rounded-md duration-200 text-[13px] flex items-center gap-1 h-[35px]"
              />
              <Button
                type="submit"
                icon={<Search size={15} />}
                nameButton="Tìm kiếm"
                classNameButton="py-2 px-3 bg-blue-500 w-full text-white font-medium rounded-md hover:bg-blue-500/80 duration-200 text-[13px] flex items-center gap-1 h-[35px]"
                className="flex-shrink-0"
              />
            </div>
          </form>
        </section>
      )
    }
  ]

  useEffect(() => {
    if (isError) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toast.error((error as any).response?.data?.message, { autoClose: 1500 })
    }
  }, [isError, error])

  return (
    <div>
      <Collapse items={items} defaultActiveKey={["2"]} className="bg-white dark:bg-darkPrimary dark:border-none" />

      <section className="bg-white dark:bg-darkPrimary mb-3 dark:border-darkBorder mt-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => downloadExcel(listOrder)}
            icon={<FolderUp size={15} />}
            nameButton="Export"
            classNameButton="py-2 px-3 border border-[#E2E7FF] bg-[#E2E7FF] w-full text-[#3A5BFF] font-medium rounded-md hover:bg-blue-500/40 duration-200 text-[13px] flex items-center gap-1 text-[13px]"
          />
          <Select
            defaultValue="Mới nhất"
            className="select-sort"
            onChange={(value) => handleSort(value, queryConfig, path.AdminOrders)}
            suffixIcon={<ArrowUpNarrowWide color={isDark ? "white" : "black"} />}
            options={[
              { value: "old", label: "Cũ nhất" },
              { value: "new", label: "Mới nhất" }
            ]}
          />
        </div>

        {isLoading ? (
          <Skeleton />
        ) : listOrder && listOrder.length > 0 ? (
          <Table
            rowKey={(r) => r._id}
            dataSource={listOrder}
            columns={columns}
            loading={isFetching}
            pagination={{
              current: Number(queryConfig.page),
              pageSize: Number(queryConfig.limit),
              total: Number(result?.result.total || 0),
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20", "50"],
              onChange: (page, pageSize) =>
                navigate({
                  pathname: path.AdminOrders,
                  search: createSearchParams({
                    ...queryConfig,
                    page: page.toString(),
                    limit: pageSize.toString()
                  }).toString()
                })
            }}
            rowClassName={(_, index) => (index % 2 === 0 ? "bg-[#f2f2f2]" : "bg-white")}
            scroll={{ x: "max-content" }}
          />
        ) : (
          !isFetching && (
            <div className="text-center mt-4">
              <Empty description="Chưa có đơn hàng nào" />
            </div>
          )
        )}
      </section>
    </div>
  )
}
