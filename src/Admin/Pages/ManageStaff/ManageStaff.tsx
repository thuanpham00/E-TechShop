/* eslint-disable @typescript-eslint/no-explicit-any */
import { yupResolver } from "@hookform/resolvers/yup"
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query"
import { Collapse, CollapseProps, Empty, Image, Modal, Select, Table } from "antd"
import { isUndefined, omit, omitBy } from "lodash"
import { ArrowUpNarrowWide, ClipboardCheck, FolderUp, Pencil, Plus, RotateCcw, Search, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { createSearchParams, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import DatePicker from "src/Admin/Components/DatePickerRange"
import { useTheme } from "src/Admin/Components/Theme-provider/Theme-provider"
import { adminAPI } from "src/Apis/admin.api"
import { schemaCustomer, SchemaCustomerType } from "src/Client/Utils/rule"
import Input from "src/Components/Input"
import Skeleton from "src/Components/Skeleton"
import { path } from "src/Constants/path"
import { cleanObject, convertDateTime, formatCurrency } from "src/Helpers/common"
import useDownloadExcel from "src/Hook/useDownloadExcel"
import useQueryParams from "src/Hook/useQueryParams"
import { queryParamConfigCustomer } from "src/Types/queryParams.type"
import { UserType } from "src/Types/user.type"
import { SuccessResponse } from "src/Types/utils.type"
import { HttpStatusCode } from "src/Constants/httpStatus"
import { Helmet } from "react-helmet-async"
import NavigateBack from "src/Admin/Components/NavigateBack"
import AddStaff from "./Components/AddStaff/AddStaff"
import { AnimatePresence } from "framer-motion"
import Button from "src/Components/Button"
import "../ManageOrders/ManageOrders.css"
import StaffDetail from "./Components/StaffDetail"
import { ColumnsType } from "antd/es/table"

const formDataSearch = schemaCustomer.pick([
  "email",
  "name",
  "numberPhone",
  "verify",
  "created_at_start",
  "created_at_end",
  "updated_at_start",
  "updated_at_end"
])

type FormDataSearch = Pick<
  SchemaCustomerType,
  | "email"
  | "name"
  | "numberPhone"
  | "verify"
  | "created_at_start"
  | "created_at_end"
  | "updated_at_start"
  | "updated_at_end"
>

export default function ManageStaff() {
  const { theme } = useTheme()

  const isDark = theme === "dark" || theme === "system"
  const { downloadExcel } = useDownloadExcel()
  const navigate = useNavigate()

  // xử lý lấy query-params
  const queryParams: queryParamConfigCustomer = useQueryParams()
  const queryConfig: queryParamConfigCustomer = omitBy(
    {
      page: queryParams.page || "1", // mặc định page = 1
      limit: queryParams.limit || "5", // mặc định limit = 5
      sortBy: queryParams.sortBy || "new" // mặc định sort mới nhất
    },
    isUndefined
  )

  // Gọi api danh sách + query-params và xử lý phân trang
  const { data, isFetching, isLoading, error, isError } = useQuery({
    queryKey: ["listStaffs", queryConfig],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)
      return adminAPI.staff.getStaffs(queryConfig as queryParamConfigCustomer, controller.signal)
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 3 * 60 * 1000, // dưới 3 phút nó không gọi lại api
    placeholderData: keepPreviousData // giữ data cũ trong 3p
  })

  const result = data?.data as SuccessResponse<{
    result: UserType[]
    total: string
    page: string
    limit: string
    totalOfPage: string
  }>
  const listStaffs = result?.result?.result

  // Xử lý bộ lọc tìm kiếm và fetch lại api
  const {
    register: registerFormSearch,
    handleSubmit: handleSubmitFormSearch,
    formState: { errors: formErrors },
    reset: resetFormSearch,
    control: controlFormSearch,
    trigger
  } = useForm<FormDataSearch>({
    resolver: yupResolver(formDataSearch)
  })

  const handleSubmitSearch = handleSubmitFormSearch(
    (data) => {
      const params = cleanObject({
        ...queryConfig,
        page: 1,
        sortBy: "new",
        email: data.email,
        name: data.name,
        phone: data.numberPhone,
        verify: data.verify,
        created_at_start: data.created_at_start?.toISOString(),
        created_at_end: data.created_at_end?.toISOString(),
        updated_at_start: data.updated_at_start?.toISOString(),
        updated_at_end: data.updated_at_end?.toISOString()
      })
      navigate({
        pathname: path.AdminEmployees,
        search: createSearchParams(params).toString()
      })
    },
    (error) => {
      if (error.created_at_end) {
        toast.error(error.created_at_end?.message, { autoClose: 1500 })
      }
      if (error.updated_at_end) {
        toast.error(error.updated_at_end?.message, { autoClose: 1500 })
      }
    }
  )

  const handleResetFormSearch = () => {
    const filteredSearch = omit(queryConfig, [
      "email",
      "name",
      "phone",
      "verify",
      "created_at_start",
      "created_at_end",
      "updated_at_start",
      "updated_at_end"
    ])
    resetFormSearch({
      name: "",
      email: "",
      verify: undefined,
      numberPhone: "",
      created_at_start: undefined,
      created_at_end: undefined,
      updated_at_start: undefined,
      updated_at_end: undefined
    })
    navigate({ pathname: path.AdminEmployees, search: createSearchParams(filteredSearch).toString() })
  }

  const [addItem, setAddItem] = useState<null | UserType | boolean>(null)

  // xử lý sort ds
  const handleChangeSortListOrder = (value: string) => {
    const body = {
      ...queryConfig,
      sortBy: value
    }
    navigate({
      pathname: `${path.AdminEmployees}`,
      search: createSearchParams(body).toString()
    })
  }

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: <h1 className="text-[16px] font-semibold tracking-wide text-black dark:text-white">Bộ lọc & Tìm kiếm</h1>,
      children: (
        <section className="bg-white dark:bg-darkPrimary mb-3 dark:border-darkBorder rounded-2xl">
          <form onSubmit={handleSubmitSearch}>
            <div className="mt-1 grid grid-cols-2">
              <div className="col-span-1 flex items-center h-14 px-2 bg-[#ececec] dark:bg-darkPrimary border border-[#dadada] rounded-tl-xl">
                <span className="w-1/3 dark:text-white">Email</span>
                <div className="w-2/3 relative h-full">
                  <Input
                    name="email"
                    register={registerFormSearch}
                    placeholder="Nhập email"
                    messageErrorInput={formErrors.email?.message}
                    classNameInput="p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#fff] dark:bg-darkSecond focus:border-blue-500 focus:ring-1 outline-none rounded-md text-black dark:text-white"
                    className="relative mt-2"
                    classNameError="hidden"
                  />
                  <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
                </div>
              </div>
              <div className="col-span-1 flex items-center h-14 px-2 bg-[#ececec] dark:bg-darkPrimary  border border-[#dadada] rounded-tr-xl">
                <span className="w-1/3 dark:text-white">Họ tên</span>
                <div className="w-2/3 relative h-full">
                  <Input
                    name="name"
                    register={registerFormSearch}
                    placeholder="Nhập họ tên"
                    messageErrorInput={formErrors.name?.message}
                    classNameInput="p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#fff] dark:bg-darkSecond focus:border-blue-500 focus:ring-1 outline-none rounded-md text-black dark:text-white"
                    className="relative mt-2"
                    classNameError="hidden"
                  />
                  <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
                </div>
              </div>
              <div className="col-span-1 flex items-center h-14 px-2 bg-[#fff] dark:bg-darkPrimary border border-[#dadada] border-t-0">
                <span className="w-1/3 dark:text-white">Số điện thoại</span>
                <div className="w-2/3 relative h-full">
                  <Input
                    name="numberPhone"
                    register={registerFormSearch}
                    placeholder="Nhập số điện thoại"
                    messageErrorInput={formErrors.numberPhone?.message}
                    classNameInput="p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-1 outline-none rounded-md text-black dark:text-white"
                    className="relative mt-2"
                    classNameError="hidden"
                  />
                  <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
                </div>
              </div>
              <div className="col-span-1 flex items-center h-14 px-2 bg-[#fff] dark:bg-darkPrimary border border-[#dadada] border-t-0">
                <span className="w-1/3 dark:text-white">Trạng thái</span>
                <div className="w-2/3 relative h-full">
                  <Controller
                    name="verify"
                    control={controlFormSearch}
                    render={({ field }) => {
                      return (
                        <select
                          // {...field}
                          value={field.value ?? ""} // ✅ Giá trị từ form
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} // ✅ Cập nhật vào form
                          className="p-2 border border-gray-300 dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond w-full mt-2 rounded-md dark:text-white"
                        >
                          <option value="" disabled>
                            -- Chọn trạng thái --
                          </option>
                          <option value="1">Verify</option>
                          <option value="0">Unverified</option>
                        </select>
                      )
                    }}
                  />
                  <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
                </div>
              </div>
              <div className="col-span-1 flex items-center h-14 px-2 bg-[#ececec] dark:bg-darkPrimary border border-[#dadada] rounded-bl-xl border-t-0">
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
                    <span className="text-black dark:text-white">-</span>
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
              <div className="col-span-1 flex items-center h-14 px-2 bg-[#ececec] dark:bg-darkPrimary  border border-[#dadada] border-t-0 rounded-br-xl">
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
                    <span className="text-black dark:text-white">-</span>
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
            <div className="flex justify-end gap-2 mt-4">
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
                classNameButton="py-2 px-3 bg-blue-500 w-full text-white font-medium hover:bg-blue-500/80 rounded-3xl duration-200 text-[13px] flex items-center gap-1 h-[35px]"
              />
            </div>
          </form>
        </section>
      )
    }
  ]

  // Gọi api xóa và fetch lại api
  const deleteStaffMutation = useMutation({
    mutationFn: (id: string) => {
      return adminAPI.staff.deleteProfileStaff(id)
    }
  })

  const handleDeleteCustomer = (id: string) => {
    deleteStaffMutation.mutate(id, {
      onSuccess: () => {
        // lấy ra query của trang hiện tại (có queryConfig)
        // const data = queryClient.getQueryData(["listCustomer", queryConfig])
        // // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // const data_2 = (data as any).data as SuccessResponse<{
        //   result: UserType[]
        //   total: string
        //   page: string
        //   limit: string
        //   totalOfPage: string
        //   listTotalProduct: { brand: string; total: string }[]
        // }>
        // // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // if (data && data_2.result.result.length === 1 && Number(queryConfig.page) > 1) {
        //   navigate({
        //     pathname: path.AdminCustomers,
        //     search: createSearchParams({
        //       ...queryConfig,
        //       page: (Number(queryConfig.page) - 1).toString()
        //     }).toString()
        //   })
        // }
        // queryClient.invalidateQueries({ queryKey: ["listCustomer"] })
        // toast.success("Xóa thành công!", { autoClose: 1500 })
      }
    })
  }

  const copyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id)
      toast.success("Đã sao chép ID", { autoClose: 1200 })
    } catch {
      toast.error("Sao chép thất bại", { autoClose: 1200 })
    }
  }

  const columns: ColumnsType<UserType> = [
    {
      title: "Mã nhân viên",
      dataIndex: "_id",
      key: "_id",
      width: 220,
      render: (id: string) => (
        <div className="flex items-center justify-between">
          <div className="text-blue-500 break-all max-w-[85%]">{id}</div>
          <button onClick={() => copyId(id)} className="p-1 ml-2">
            <ClipboardCheck color="#8d99ae" size={14} />
          </button>
        </div>
      )
    },
    {
      title: "Họ Tên",
      dataIndex: "name",
      key: "name",
      width: 260,
      render: (_, record) => (
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-[48px] h-[48px] rounded overflow-hidden">
            <Image
              src={record.avatar || "/images/avatar-default.png"}
              alt={record.name}
              width={48}
              height={48}
              preview={false}
            />
          </div>
          <div className="min-w-0">
            <div className="font-medium text-black dark:text-white break-words whitespace-normal">{record.name}</div>
            <div className="text-xs text-gray-500 break-all whitespace-normal">{record.email}</div>
          </div>
        </div>
      )
    },
    {
      title: "Chức vụ",
      dataIndex: "role",
      key: "role",
      width: 140,
      render: (v: string) => <div className="break-words text-black dark:text-white">{v || ""}</div>
    },
    {
      title: "Phòng ban",
      dataIndex: ["employeeInfo", "department"],
      key: "department",
      width: 160,
      render: (_, record) => (
        <div className="break-words text-black dark:text-white">{record.employeeInfo?.department || ""}</div>
      )
    },
    {
      title: "Trạng thái",
      dataIndex: ["employeeInfo", "status"],
      key: "status",
      width: 140,
      align: "center",
      render: (_, record) => {
        const s = record.employeeInfo?.status
        if (!s) return null
        const isActive = s === "Active"
        const bg = isActive
          ? "bg-[#b2ffb4] border-[#b2ffb4] text-[#04710c]"
          : "bg-[#ffdcdc] border-[#ffdcdc] text-[#f00]"
        return <div className={`text-[13px] font-medium py-1 px-2 border ${bg} text-center rounded-full`}>{s}</div>
      }
    },
    {
      title: "Lương",
      dataIndex: ["employeeInfo", "salary"],
      key: "salary",
      width: 140,
      align: "center",
      render: (_, record) =>
        record.employeeInfo?.salary ? (
          <div className="text-red-500 font-semibold">{formatCurrency(record.employeeInfo.salary)}đ</div>
        ) : (
          ""
        )
    },
    {
      title: "Loại hợp đồng",
      dataIndex: ["employeeInfo", "contract_type"],
      key: "contract_type",
      width: 160,
      render: (_, record) => <div>{record.employeeInfo?.contract_type || ""}</div>
    },
    {
      title: "Ngày vào làm",
      dataIndex: ["employeeInfo", "hire_date"],
      key: "hire_date",
      width: 160,
      render: (_, record) => <div>{convertDateTime((record.employeeInfo?.hire_date as Date).toString())}</div>
    },
    {
      title: "Hành động",
      key: "action",
      width: 120,
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setAddItem(record)} className="p-1">
            <Pencil color="orange" size={18} />
          </button>
          <button
            onClick={() =>
              Modal.confirm({
                title: "Bạn có chắc chắn muốn xóa?",
                content: "Không thể hoàn tác hành động này.",
                okText: "Xóa",
                okButtonProps: { danger: true },
                cancelText: "Hủy",
                onOk: () => handleDeleteCustomer(record._id)
              })
            }
            className="p-1"
          >
            <Trash2 color="red" size={18} />
          </button>
        </div>
      )
    }
  ]

  useEffect(() => {
    if (isError) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        <title>Quản lý nhân viên</title>
        <meta
          name="description"
          content="Đây là trang TECHZONE | Laptop, PC, Màn hình, điện thoại, linh kiện Chính Hãng"
        />
      </Helmet>
      <NavigateBack />
      <h1 className="text-2xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 my-2">
        Nhân viên
      </h1>

      <Collapse items={items} defaultActiveKey={["2"]} className="bg-white dark:bg-darkPrimary dark:border-none" />

      <section className="bg-white dark:bg-darkPrimary mb-3 dark:border-darkBorder rounded-2xl mt-4">
        <div>
          {isLoading && <Skeleton />}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => downloadExcel(listStaffs)}
                icon={<FolderUp size={15} />}
                nameButton="Export"
                classNameButton="py-2 px-3 border border-[#E2E7FF] bg-[#E2E7FF] w-full text-[#3A5BFF] font-medium rounded-md hover:bg-blue-500/40 duration-200 text-[13px] flex items-center gap-1"
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
            <div>
              <Button
                onClick={() => setAddItem(true)}
                icon={<Plus size={15} />}
                nameButton="Thêm mới"
                classNameButton="py-2 px-3 bg-blue-500 w-full text-white font-medium rounded-md hover:bg-blue-500/80 duration-200 text-[13px] flex items-center gap-1 text-[13px]"
              />
            </div>
          </div>
          {!isFetching ? (
            <div>
              <div>
                {listStaffs?.length > 0 ? (
                  <Table
                    rowKey={(r) => r._id}
                    dataSource={listStaffs}
                    columns={columns}
                    loading={isLoading}
                    pagination={{
                      current: Number(queryConfig.page),
                      pageSize: Number(queryConfig.limit),
                      total: Number(result?.result.total || 0),
                      showSizeChanger: true,
                      pageSizeOptions: ["5", "10", "20", "50"],
                      onChange: (page, pageSize) =>
                        navigate({
                          pathname: path.AdminEmployees,
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
                  <div className="text-center mt-4">
                    <Empty />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Skeleton />
          )}

          <AnimatePresence>
            {addItem !== null && typeof addItem === "object" && (
              <StaffDetail addItem={addItem} setAddItem={setAddItem} queryConfig={queryConfig} />
            )}
          </AnimatePresence>

          <AnimatePresence>{addItem === true && <AddStaff setAddItem={setAddItem} />}</AnimatePresence>
        </div>
      </section>
    </div>
  )
}
