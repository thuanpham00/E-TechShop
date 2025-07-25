import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query"
import { isUndefined, omit, omitBy } from "lodash"
import { useCallback, useState } from "react"
import { Helmet } from "react-helmet-async"
import { createSearchParams, useNavigate } from "react-router-dom"
import NavigateBack from "src/Admin/Components/NavigateBack"
import { adminAPI } from "src/Apis/admin.api"
import Button from "src/Components/Button"
import Pagination from "src/Components/Pagination"
import Skeleton from "src/Components/Skeleton"
import { path } from "src/Constants/path"
import useDownloadExcel from "src/Hook/useDownloadExcel"
import useQueryParams from "src/Hook/useQueryParams"
import { SupplyItemType } from "src/Types/product.type"
import { queryParamConfigSupply } from "src/Types/queryParams.type"
import { SuccessResponse } from "src/Types/utils.type"
import SupplyItem from "./Components/SupplyItem"
import { FolderUp, Plus, RotateCcw, Search } from "lucide-react"
import { toast } from "react-toastify"
import { Controller, useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { schemaSupply, SchemaSupplyType } from "src/Client/Utils/rule"
import { cleanObject } from "src/Helpers/common"
import DatePicker from "src/Admin/Components/DatePickerRange"
import AddSupply from "./Components/AddSupply/AddSupply"
import { HttpStatusCode } from "src/Constants/httpStatus"
import SupplyDetail from "./Components/SupplyDetail"
import { queryClient } from "src/main"
import DropdownSearch from "./Components/DropdownSearch"
import { motion } from "framer-motion"
import { Empty } from "antd"

type FormDataSearch = Pick<
  SchemaSupplyType,
  "name_product" | "name_supplier" | "created_at_start" | "created_at_end" | "updated_at_start" | "updated_at_end"
>

const formDataSearch = schemaSupply.pick([
  "name_product",
  "name_supplier",
  "created_at_start",
  "created_at_end",
  "updated_at_start",
  "updated_at_end"
])

export default function ManageSupplies() {
  const navigate = useNavigate()
  const { downloadExcel } = useDownloadExcel()

  const queryParams: queryParamConfigSupply = useQueryParams()
  const queryConfig: queryParamConfigSupply = omitBy(
    {
      page: queryParams.page || "1", // mặc định page = 1
      limit: queryParams.limit || "5", // mặc định limit = 5
      name_product: queryParams.name_product,
      name_supplier: queryParams.name_supplier,
      created_at_start: queryParams.created_at_start,
      created_at_end: queryParams.created_at_end,
      updated_at_start: queryParams.updated_at_start,
      updated_at_end: queryParams.updated_at_end
    },
    isUndefined
  )

  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: ["listSupply", queryConfig],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)
      return adminAPI.supply.getSupplies(queryConfig as queryParamConfigSupply, controller.signal)
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 3 * 60 * 1000, // dưới 3 phút nó không gọi lại api
    placeholderData: keepPreviousData
  })

  const result = data?.data as SuccessResponse<{
    result: SupplyItemType[]
    total: string
    page: string
    limit: string
    totalOfPage: string
  }>
  const listSupplier = result?.result?.result
  const page_size = Math.ceil(Number(result?.result.total) / Number(result?.result.limit))

  const [idSupply, setIdSupply] = useState<string | null>(null)

  const handleEditItem = useCallback((id: string) => {
    setIdSupply(id)
  }, [])

  // xử lý tìm kiếm
  const getNameProducts = useQuery({
    queryKey: ["nameProduct"],
    queryFn: () => {
      return adminAPI.product.getNameProducts()
    },
    retry: 0,
    staleTime: 15 * 60 * 1000,
    placeholderData: keepPreviousData
  })
  const listNameProduct = getNameProducts.data?.data as SuccessResponse<{
    result: string[]
  }>
  const listNameProductResult = listNameProduct?.result.result

  const getNameSuppliers = useQuery({
    queryKey: ["nameSupplier"],
    queryFn: () => {
      return adminAPI.supplier.getNameSuppliers()
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 15 * 60 * 1000, // dưới 1 phút nó không gọi lại api
    placeholderData: keepPreviousData // giữ data cũ trong 1p
  })
  const listNameSupplier = getNameSuppliers.data?.data as SuccessResponse<{
    result: string[]
  }>
  const listNameSupplierResult = listNameSupplier?.result.result

  const {
    register: registerFormSearch,
    handleSubmit: handleSubmitFormSearch,
    reset: resetFormSearch,
    control: controlFormSearch,
    setValue: setValueSearch,
    trigger
  } = useForm<FormDataSearch>({
    resolver: yupResolver(formDataSearch)
  })

  // component cha này sẽ quản lý giá trị này
  const [inputProductValue, setInputProductValue] = useState("")
  const [inputSupplierValue, setInputSupplierValue] = useState("")

  const handleSubmitSearch = handleSubmitFormSearch(
    (data) => {
      const params = cleanObject({
        ...queryConfig,
        page: 1,
        name_product: data.name_product,
        name_supplier: data.name_supplier,
        created_at_start: data.created_at_start?.toISOString(),
        created_at_end: data.created_at_end?.toISOString(),
        updated_at_start: data.updated_at_start?.toISOString(),
        updated_at_end: data.updated_at_end?.toISOString()
      })
      navigate({
        pathname: path.AdminSupplies,
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
      "name_product",
      "name_supplier",
      "created_at_start",
      "created_at_end",
      "updated_at_start",
      "updated_at_end"
    ])
    resetFormSearch()
    setInputProductValue("")
    setInputSupplierValue("")
    navigate({ pathname: path.AdminSupplies, search: createSearchParams(filteredSearch).toString() })
  }

  const deleteSupplyMutation = useMutation({
    mutationFn: (id: string) => {
      return adminAPI.supply.deleteSupplyDetail(id)
    }
  })

  const handleDeleteSupply = (id: string) => {
    deleteSupplyMutation.mutate(id, {
      onSuccess: () => {
        const data = queryClient.getQueryData(["listSupply", queryConfig])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data_2 = (data as any).data as SuccessResponse<{
          result: SupplyItemType[]
          total: string
          page: string
          limit: string
          totalOfPage: string
        }>
        if (data && data_2.result.result.length === 1 && Number(queryConfig.page) > 1) {
          navigate({
            pathname: path.AdminSupplies,
            search: createSearchParams({
              ...queryConfig,
              page: (Number(queryConfig.page) - 1).toString()
            }).toString()
          })
        }
        queryClient.invalidateQueries({ queryKey: ["listSupply"] })
        toast.success("Xóa thành công!", { autoClose: 1500 })
      }
    })
  }

  const [addItem, setAddItem] = useState(false)

  if (isError) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.response?.status === HttpStatusCode.NotFound) {
      navigate(path.AdminNotFound, { replace: true })
    }
  }

  return (
    <div>
      <Helmet>
        <title>Quản lý cung ứng</title>
        <meta
          name="description"
          content="Đây là trang TECHZONE | Laptop, PC, Màn hình, điện thoại, linh kiện Chính Hãng"
        />
      </Helmet>
      <NavigateBack />
      <h1 className="text-2xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 my-2">
        Cung ứng sản phẩm
      </h1>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="p-4 bg-white dark:bg-darkPrimary mb-3 border border-gray-300 dark:border-darkBorder rounded-2xl shadow-xl">
          <h1 className="text-[16px] font-semibold tracking-wide">Bộ lọc & Tìm kiếm</h1>
          <div>
            <form onSubmit={handleSubmitSearch}>
              <div className="mt-1 grid grid-cols-2">
                <div className="col-span-1 flex items-center h-14 px-2 bg-[#fff] dark:bg-darkBorder border border-[#dadada] rounded-tl-xl">
                  <span className="w-1/3">Tên sản phẩm</span>
                  <div className="w-2/3 relative h-full">
                    <DropdownSearch
                      name="name_product"
                      namePlaceholder="Nhập tên sản phẩm"
                      register={registerFormSearch}
                      listItem={listNameProductResult}
                      onSelect={(item) => setValueSearch("name_product", item)}
                      value={inputProductValue}
                      onChangeValue={setInputProductValue}
                    />
                    <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
                  </div>
                </div>
                <div className="col-span-1 flex items-center h-14 px-2 bg-[#fff] dark:bg-darkBorder border border-[#dadada] rounded-tr-xl">
                  <span className="w-1/3">Tên nhà cung cấp</span>
                  <div className="w-2/3 relative h-full">
                    <DropdownSearch
                      name="name_supplier"
                      namePlaceholder="Nhập tên nhà cung cấp"
                      register={registerFormSearch}
                      listItem={listNameSupplierResult}
                      onSelect={(item) => setValueSearch("name_supplier", item)}
                      value={inputSupplierValue}
                      onChangeValue={setInputSupplierValue}
                    />
                    <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
                  </div>
                </div>
                <div className="col-span-1 flex items-center h-14 px-2 bg-[#fff] dark:bg-darkBorder border border-[#dadada] border-t-0 rounded-bl-xl">
                  <span className="w-1/3">Ngày tạo</span>
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
                <div className="col-span-1 flex items-center h-14 px-2 bg-[#fff] dark:bg-darkBorder border border-[#dadada] border-t-0 rounded-br-xl">
                  <span className="w-1/3">Ngày cập nhật</span>
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
              <div className="flex justify-between mt-4">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setAddItem(true)}
                    icon={<Plus size={15} />}
                    nameButton="Thêm mới"
                    classNameButton="py-2 px-3 bg-blue-500 w-full text-white font-medium rounded-3xl hover:bg-blue-500/80 duration-200 text-[13px] flex items-center gap-1"
                  />
                  <Button
                    onClick={() => downloadExcel(listSupplier)}
                    icon={<FolderUp size={15} />}
                    nameButton="Export"
                    classNameButton="py-2 px-3 border border-[#E2E7FF] bg-[#E2E7FF] w-full text-[#3A5BFF] font-medium rounded-3xl hover:bg-blue-500/40 duration-200 text-[13px] flex items-center gap-1"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleResetFormSearch}
                    type="button"
                    icon={<RotateCcw size={15} />}
                    nameButton="Xóa bộ lọc tìm kiếm"
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
          </div>
          {isLoading && <Skeleton />}
          {!isFetching && (
            <div>
              <div className="mt-4">
                <div className="bg-[#f2f2f2] dark:bg-darkPrimary grid grid-cols-12 items-center gap-2 py-3 border border-[#dedede] dark:border-darkBorder px-4 rounded-tl-xl rounded-tr-xl">
                  <div className="col-span-2 text-[14px] font-semibold tracking-wider uppercase">Mã cung ứng</div>
                  <div className="col-span-3 text-[14px] font-semibold tracking-wider uppercase">Tên sản phẩm</div>
                  <div className="col-span-2 text-[14px] font-semibold tracking-wider uppercase">Tên nhà cung cấp</div>
                  <div className="col-span-1 text-[14px] font-semibold tracking-wider uppercase">Giá nhập</div>
                  <div className="col-span-1 text-[14px] font-semibold tracking-wider uppercase">
                    Thời gian cung ứng
                  </div>
                  <div className="col-span-1 text-[14px] font-semibold tracking-wider uppercase">Ngày tạo</div>
                  <div className="col-span-1 text-[14px] font-semibold tracking-wider uppercase">Ngày cập nhật</div>
                  <div className="col-span-1 text-[14px] text-center font-semibold tracking-wider uppercase">
                    Hành động
                  </div>
                </div>
                <div>
                  {listSupplier.length > 0 ? (
                    listSupplier.map((item, index) => (
                      <motion.div
                        key={item._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <SupplyItem
                          onDelete={handleDeleteSupply}
                          handleEditItem={handleEditItem}
                          item={item}
                          maxIndex={listSupplier?.length}
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
                pathNavigate={path.AdminSupplies}
              />

              <SupplyDetail idSupply={idSupply} setIdSupply={setIdSupply} queryConfig={queryConfig} />

              <AddSupply setAddItem={setAddItem} addItem={addItem} />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
