/* eslint-disable @typescript-eslint/no-explicit-any */
import { yupResolver } from "@hookform/resolvers/yup"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { Collapse, CollapseProps, Empty, Select } from "antd"
import { isUndefined, omit, omitBy } from "lodash"
import { ArrowUpNarrowWide, FolderUp, Plus, RotateCcw, Search } from "lucide-react"
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
import { cleanObject } from "src/Helpers/common"
import useDownloadExcel from "src/Hook/useDownloadExcel"
import useQueryParams from "src/Hook/useQueryParams"
import { queryParamConfigCustomer } from "src/Types/queryParams.type"
import { UserType } from "src/Types/user.type"
import { SuccessResponse } from "src/Types/utils.type"
import Pagination from "src/Components/Pagination"
import { HttpStatusCode } from "src/Constants/httpStatus"
import { Helmet } from "react-helmet-async"
import NavigateBack from "src/Admin/Components/NavigateBack"
import AddStaff from "./Components/AddStaff/AddStaff"
import { AnimatePresence, motion } from "framer-motion"
import StaffItem from "./Components/StaffItem"
import Button from "src/Components/Button"
import "../ManageOrders/ManageOrders.css"
import StaffDetail from "./Components/StaffDetail"
// const formDataUpdate = schemaAuth.pick([
//   "id",
//   "name",
//   "email",
//   "verify",
//   "numberPhone",
//   "date_of_birth",
//   "created_at",
//   "updated_at",
//   "avatar"
// ]) // giúp validate các field trong form

// type FormDataUpdate = Pick<
//   SchemaAuthType,
//   "id" | "name" | "email" | "verify" | "numberPhone" | "date_of_birth" | "created_at" | "updated_at" | "avatar"
// > // các field (type) trong 1 form

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
  const page_size = Math.ceil(Number(result?.result.total) / Number(result?.result.limit))

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
    },
    {
      key: "2",
      label: (
        <h2 className="text-[16px] font-semibold tracking-wide text-black dark:text-white">
          Danh sách Nhân viên hệ thống
        </h2>
      ),
      children: (
        <section className="bg-white dark:bg-darkPrimary mb-3 dark:border-darkBorder rounded-2xl">
          <div>
            {isLoading && <Skeleton />}
            {!isFetching && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => downloadExcel(listStaffs)}
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
                  <div>
                    <Button
                      onClick={() => setAddItem(true)}
                      icon={<Plus size={15} />}
                      nameButton="Thêm mới"
                      classNameButton="py-2 px-3 bg-blue-500 w-full text-white font-medium rounded-3xl hover:bg-blue-500/80 duration-200 text-[13px] flex items-center gap-1"
                    />
                  </div>
                </div>
                <div>
                  <div className="bg-[#f2f2f2] dark:bg-darkPrimary grid grid-cols-10 items-center gap-2 py-3 border border-[#dedede] dark:border-darkBorder px-4 rounded-tl-xl rounded-tr-xl">
                    <div className="col-span-2 text-[14px] font-semibold tracking-wider uppercase text-black dark:text-white">
                      Mã nhân viên
                    </div>
                    <div className="col-span-1 text-[14px] font-semibold tracking-wider uppercase text-black dark:text-white">
                      Họ Tên
                    </div>
                    <div className="col-span-1 text-[14px] font-semibold tracking-wider uppercase text-black dark:text-white">
                      Chức vụ
                    </div>
                    <div className="col-span-1 text-[14px] font-semibold tracking-wider uppercase text-black dark:text-white">
                      Phòng ban
                    </div>
                    <div className="col-span-1 text-[14px] text-center font-semibold tracking-wider uppercase text-black dark:text-white">
                      Lương
                    </div>
                    <div className="col-span-1 text-[14px] font-semibold tracking-wider uppercase text-black dark:text-white">
                      Loại hợp đồng
                    </div>
                    <div className="col-span-1 text-[14px] text-center font-semibold tracking-wider uppercase text-black dark:text-white">
                      Trạng thái
                    </div>
                    <div className="col-span-1 text-[14px] font-semibold tracking-wider uppercase text-black dark:text-white">
                      Ngày vào làm
                    </div>
                    <div className="col-span-1 text-[14px] text-center font-semibold tracking-wider uppercase text-black dark:text-white">
                      Hành động
                    </div>
                  </div>
                  <div>
                    {listStaffs?.length > 0 ? (
                      listStaffs?.map((item, index) => (
                        <motion.div
                          key={item._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <StaffItem
                            onDelete={() => {}}
                            handleEditItem={() => setAddItem(item)}
                            item={item}
                            maxIndex={listStaffs?.length}
                            index={index}
                          />
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center mt-4">
                        <Empty />
                      </div>
                    )}
                  </div>
                </div>
                <Pagination
                  data={result}
                  queryConfig={queryConfig}
                  page_size={page_size}
                  pathNavigate={path.AdminEmployees}
                />

                <AnimatePresence>
                  {addItem !== null && typeof addItem === "object" && (
                    <StaffDetail addItem={addItem} setAddItem={setAddItem} queryConfig={queryConfig} />
                  )}
                </AnimatePresence>

                <AnimatePresence>{addItem === true && <AddStaff setAddItem={setAddItem} />}</AnimatePresence>
              </div>
            )}
          </div>
        </section>
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
    </div>
  )
}
