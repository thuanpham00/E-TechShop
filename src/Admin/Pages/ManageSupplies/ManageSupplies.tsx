import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query"
import { isUndefined, omit, omitBy } from "lodash"
import { useCallback, useEffect, useRef, useState } from "react"
import { Helmet } from "react-helmet-async"
import { createSearchParams, useNavigate } from "react-router-dom"
import { Fragment } from "react/jsx-runtime"
import NavigateBack from "src/Admin/Components/NavigateBack"
import { adminAPI } from "src/Apis/admin.api"
import Button from "src/Components/Button"
import Input from "src/Components/Input"
import Pagination from "src/Components/Pagination"
import Skeleton from "src/Components/Skeleton"
import { path } from "src/Constants/path"
import useDownloadExcel from "src/Hook/useDowloadExcel"
import useQueryParams from "src/Hook/useQueryParams"
import { SupplyItemType } from "src/Types/product.type"
import { queryParamConfigSupplier, queryParamConfigSupply } from "src/Types/queryParams.type"
import { SuccessResponse } from "src/Types/utils.type"
import SupplyItem from "./Components/SupplyItem"
import { FolderUp, Plus, RotateCcw, Search, X } from "lucide-react"
import { queryClient } from "src/main"
import { toast } from "react-toastify"
import { Controller, useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { schemaSupply, SchemaSupplyType } from "src/Client/Utils/rule"
import { cleanObject } from "src/Helpers/common"
import DatePicker from "src/Admin/Components/DatePickerRange"
import AddSupply from "./Components/AddSupply/AddSupply"
import { HttpStatusCode } from "src/Constants/httpStatus"

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

  // const queryClient = useQueryClient()
  const queryParams: queryParamConfigSupply = useQueryParams()
  const queryConfig: queryParamConfigSupply = omitBy(
    {
      page: queryParams.page || "1", // mặc định page = 1
      limit: queryParams.limit || "5", // mặc định limit =
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
      return adminAPI.supply.getSupplies(queryConfig as queryParamConfigSupplier, controller.signal)
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

  const getNameProducts = useQuery({
    queryKey: ["nameProduct"],
    queryFn: () => {
      return adminAPI.product.getNameProducts()
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 15 * 60 * 1000, // dưới 1 phút nó không gọi lại api
    placeholderData: keepPreviousData // giữ data cũ trong 1p
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

  const handleEditItem = useCallback((id: string) => {
    setIdSupply(id)
  }, [])

  const handleExitsEditItem = () => {
    setIdSupply(null)
  }

  const deleteSupplierMutation = useMutation({
    mutationFn: (id: string) => {
      return adminAPI.supplier.deleteSupplierDetail(id)
    }
  })

  const handleDeleteSupplier = (id: string) => {
    deleteSupplierMutation.mutate(id, {
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
            pathname: path.AdminSuppliers,
            search: createSearchParams({
              ...queryConfig,
              page: (Number(queryConfig.page) - 1).toString()
            }).toString()
          })
        }
        queryClient.invalidateQueries({ queryKey: ["listSupplier"] })
        toast.success("Xóa thành công!", { autoClose: 1500 })
      }
      // onError: (error) => {
      //   if (isError400<ErrorResponse<MessageResponse>>(error)) {
      //     toast.error(error.response?.data.message, {
      //       autoClose: 1500
      //     })
      //   }
      // }
    })
  }

  const {
    register: registerFormSearch,
    handleSubmit: handleSubmitFormSearch,
    reset: resetFormSearch,
    control: controlFormSearch,
    setValue,
    trigger
  } = useForm<FormDataSearch>({
    resolver: yupResolver(formDataSearch)
  })

  const handleSubmitSearch = handleSubmitFormSearch(
    (data) => {
      console.log(data)
      const params = cleanObject({
        ...queryConfig,
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
    setInputValueProduct("")
    setInputValueSupplier("")
    navigate({ pathname: path.AdminSupplies, search: createSearchParams(filteredSearch).toString() })
  }

  const [addItem, setAddItem] = useState(false)

  const [activeField, setActiveField] = useState<"name_product" | "name_supplier" | null>(null) // check coi input nào đang focus
  const [inputValueProduct, setInputValueProduct] = useState("")
  const [inputValueSupplier, setInputValueSupplier] = useState("")
  const [filterList, setFilterList] = useState<string[]>([])
  const inputRef_1 = useRef<HTMLDivElement>(null)
  const inputRef_2 = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = setTimeout(() => {
      if (activeField === "name_product") {
        const filtered = listNameProductResult?.filter((item) =>
          item.toLowerCase().includes(inputValueProduct.toLowerCase())
        )
        setFilterList(filtered || [])
      } else if (activeField === "name_supplier") {
        const filtered = listNameSupplierResult?.filter((item) =>
          item.toLowerCase().includes(inputValueSupplier.toLowerCase())
        )
        setFilterList(filtered || [])
      }
    }, 300)

    return () => clearTimeout(handler)
  }, [inputValueProduct, inputValueSupplier, activeField, listNameProductResult, listNameSupplierResult])

  useEffect(() => {
    const clickOutHideList = (event: MouseEvent) => {
      if (
        (inputRef_1.current && !inputRef_1.current.contains(event.target as Node)) ||
        (inputRef_2.current && !inputRef_2.current.contains(event.target as Node))
      ) {
        // nơi được click nằm ngoài vùng phần tử
        setActiveField(null)
        setFilterList([])
      }
    }

    document.addEventListener("mousedown", clickOutHideList)

    return () => document.removeEventListener("mousedown", clickOutHideList)
  }, [])

  const handleClickItemList = (item: string) => {
    if (activeField === "name_product") {
      setValue("name_product", item)
      setInputValueProduct(item)
    } else if (activeField === "name_supplier") {
      setValue("name_supplier", item)
      setInputValueSupplier(item)
    }
    setActiveField(null)
    setFilterList([])
  }

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
      <div className="text-lg font-bold py-2 text-[#3A5BFF]">Cung ứng sản phẩm</div>
      <div className="p-4 bg-white dark:bg-darkPrimary mb-3 border border-[#dedede] dark:border-darkBorder rounded-md">
        <h1 className="text-[15px] font-medium">Tìm kiếm</h1>
        <div>
          <form onSubmit={handleSubmitSearch}>
            <div className="mt-1 grid grid-cols-2">
              <div className="col-span-1 flex items-center h-14 px-2 bg-[#fff] dark:bg-darkBorder border border-[#dadada] rounded-tl-md">
                <span className="w-1/3">Tên sản phẩm</span>
                <div className="w-2/3 relative h-full">
                  <div className="mt-2 w-full flex items-center gap-2 relative">
                    <Input
                      name="name_product"
                      register={registerFormSearch}
                      placeholder="Nhập tên sản phẩm"
                      classNameInput="p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-black focus:border-blue-500 focus:ring-1 outline-none rounded-md h-[35px]"
                      className="relative flex-grow"
                      classNameError="hidden"
                      value={inputValueProduct}
                      onFocus={() => setActiveField("name_product")}
                      onChange={(event) => setInputValueProduct(event.target.value)}
                    />
                    {activeField === "name_product" && filterList.length > 0 && (
                      <div
                        ref={inputRef_1}
                        className={`absolute top-9 left-0 bg-[#fff] z-20 rounded-md max-h-60 w-full overflow-y-auto shadow-md`}
                      >
                        {filterList.map((item) => (
                          <button
                            type="button"
                            key={item}
                            className="p-2 border border-[#f2f2f2] w-full text-left text-[13px] first:rounded-tl-md first:rounded-tr-md last:rounded-bl-md last:rounded-br-md hover:bg-[#dadada] duration-200"
                            onClick={() => handleClickItemList(item)}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
                </div>
              </div>
              <div className="col-span-1 flex items-center h-14 px-2 bg-[#fff] dark:bg-darkBorder border border-[#dadada] rounded-tr-md">
                <span className="w-1/3">Tên nhà cung cấp</span>
                <div className="w-2/3 relative h-full">
                  <div className="mt-2 w-full flex items-center gap-2">
                    <Input
                      name="name_supplier"
                      register={registerFormSearch}
                      placeholder="Nhập tên nhà cung cấp"
                      classNameInput="p-2 w-full border border-[#dadadad] dark:border-darkBorder bg-[#f2f2f2] dark:bg-black focus:border-blue-500 focus:ring-1 outline-none rounded-md h-[35px]"
                      className="relative flex-grow"
                      classNameError="hidden"
                      value={inputValueSupplier}
                      onFocus={() => setActiveField("name_supplier")}
                      onChange={(event) => setInputValueSupplier(event.target.value)}
                    />
                    {activeField === "name_supplier" && filterList.length > 0 && (
                      <div
                        ref={inputRef_2}
                        className="absolute top-11 left-0 bg-[#fff] z-20 rounded-md max-h-60 overflow-y-auto shadow-md"
                      >
                        {filterList.map((item) => (
                          <button
                            key={item}
                            className="p-2 border border-[#f2f2f2] w-full text-left text-[13px] first:rounded-tl-md first:rounded-tr-md last:rounded-bl-md last:rounded-br-md hover:bg-[#dadada] duration-200"
                            onClick={() => handleClickItemList(item)}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
                </div>
              </div>
              <div className="col-span-1 flex items-center h-14 px-2 bg-[#fff] dark:bg-darkBorder border border-[#dadada] border-t-0 rounded-bl-md">
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
              <div className="col-span-1 flex items-center h-14 px-2 bg-[#fff] dark:bg-darkBorder border border-[#dadada] border-t-0 rounded-br-md">
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
                  classNameButton="p-2 bg-blue-500 w-full text-white font-medium rounded-md hover:bg-blue-500/80 duration-200 text-[13px] flex items-center gap-1"
                />
                <Button
                  onClick={() => downloadExcel(listSupplier)}
                  icon={<FolderUp size={15} />}
                  nameButton="Export"
                  classNameButton="p-2 border border-[#E2E7FF] bg-[#E2E7FF] w-full text-[#3A5BFF] font-medium rounded-md hover:bg-blue-500/40 duration-200 text-[13px] flex items-center gap-1"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleResetFormSearch}
                  type="button"
                  icon={<RotateCcw size={15} />}
                  nameButton="Xóa bộ lọc tìm kiếm"
                  classNameButton="p-2 bg-[#f2f2f2] border border-[#dedede] w-full text-black font-medium hover:bg-[#dedede]/80 rounded-md duration-200 text-[13px] flex items-center gap-1 h-[35px]"
                />
                <Button
                  type="submit"
                  icon={<Search size={15} />}
                  nameButton="Tìm kiếm"
                  classNameButton="p-2 px-3 bg-blue-500 w-full text-white font-medium rounded-md hover:bg-blue-500/80 duration-200 text-[13px] flex items-center gap-1 h-[35px]"
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
              <div className="bg-[#f2f2f2] dark:bg-darkPrimary grid grid-cols-12 items-center gap-2 py-3 border border-[#dedede] dark:border-darkBorder px-4 rounded-tl-md rounded-tr-md">
                <div className="col-span-2 text-[14px] font-semibold">ID</div>
                <div className="col-span-3 text-[14px] font-semibold">Tên sản phẩm</div>
                <div className="col-span-2 text-[14px] font-semibold">Tên nhà cung cấp</div>
                <div className="col-span-1 text-[14px] font-semibold">Giá nhập</div>
                <div className="col-span-1 text-[14px] font-semibold">Thời gian cung ứng</div>
                <div className="col-span-1 text-[14px] font-semibold">Ngày tạo</div>
                <div className="col-span-1 text-[14px] font-semibold">Ngày cập nhật</div>
                <div className="col-span-1 text-[14px] text-center font-semibold">Hành động</div>
              </div>
              <div>
                {listSupplier.length > 0 ? (
                  listSupplier.map((item) => (
                    <Fragment key={item._id}>
                      <SupplyItem onDelete={handleDeleteSupplier} handleEditItem={handleEditItem} item={item} />
                    </Fragment>
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
              pathNavigate={path.AdminSupplies}
            />
            {idSupply !== null ? (
              <Fragment>
                <div className="fixed left-0 top-0 z-10 h-screen w-screen bg-black/60"></div>
                <div className="z-20 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <button onClick={handleExitsEditItem} className="absolute right-2 top-1">
                    <X color="gray" size={22} />
                  </button>
                  <form className="bg-white dark:bg-darkPrimary rounded-md w-[900px]">
                    <h3 className="py-2 px-4 text-[15px] font-medium bg-[#f2f2f2] rounded-md">
                      Thông tin nhà cung cấp
                    </h3>
                    <div className="w-full h-[1px] bg-[#dadada]"></div>
                    <div className="p-4 pt-0">
                      <div className="mt-4 flex items-center gap-4">
                        <Input
                          name="id"
                          // register={register}
                          placeholder="Nhập id"
                          // messageErrorInput={errors.id?.message}
                          classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                          className="relative flex-1"
                          nameInput="Id"
                          disabled
                        />
                        <Input
                          name="taxCode"
                          // register={register}
                          placeholder="Nhập tax-code"
                          // messageErrorInput={errors.taxCode?.message}
                          classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                          className="relative flex-1"
                          nameInput="Mã số thuế"
                          disabled
                        />
                      </div>
                      <div className="mt-4 flex items-center gap-4">
                        <Input
                          name="name"
                          // register={register}
                          placeholder="Nhập tên nhà cung cấp"
                          // messageErrorInput={errors.name?.message}
                          classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkPrimary focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                          className="relative flex-1"
                          nameInput="Tên nhà cung cấp"
                        />
                        <Input
                          name="contactName"
                          // register={register}
                          placeholder="Nhập họ tên"
                          // messageErrorInput={errors.contactName?.message}
                          classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#fff] dark:bg-darkPrimary focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                          className="relative flex-1"
                          nameInput="Tên người đại diện"
                        />
                      </div>
                      <div className="mt-4 flex items-center gap-4">
                        <Input
                          name="email"
                          // register={register}
                          placeholder="Nhập email"
                          // messageErrorInput={errors.email?.message}
                          classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#fff] dark:bg-darkPrimary focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                          className="relative flex-1"
                          nameInput="Email"
                        />
                        <Input
                          name="phone"
                          // register={register}
                          placeholder="Nhập số điện thoại"
                          // messageErrorInput={errors.phone?.message}
                          classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkPrimary focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                          className="relative flex-1"
                          nameInput="Số điện thoại"
                        />
                      </div>
                      <div className="mt-4 flex items-center gap-4">
                        <Input
                          name="address"
                          // register={register}
                          placeholder="Nhập địa chỉ"
                          // messageErrorInput={errors.address?.message}
                          classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkPrimary focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                          className="relative flex-1"
                          nameInput="Địa chỉ"
                        />
                        <Input
                          name="description"
                          // register={register}
                          placeholder="Nhập mô tả"
                          // messageErrorInput={errors.description?.message}
                          classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkPrimary focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                          className="relative flex-1"
                          nameInput="Mô tả"
                        />
                      </div>
                      <div className="mt-2 flex items-center gap-4">
                        <Input
                          name="created_at"
                          // register={register}
                          placeholder="Nhập ngày tạo"
                          // messageErrorInput={errors.created_at?.message}
                          classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                          className="relative flex-1"
                          nameInput="Ngày tạo"
                          disabled
                        />
                        <Input
                          name="updated_at"
                          // register={register}
                          placeholder="Nhập ngày tạo cập nhật"
                          // messageErrorInput={errors.updated_at?.message}
                          classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                          className="relative flex-1"
                          nameInput="Ngày cập nhật"
                          disabled
                        />
                      </div>
                      <div className="flex items-center justify-end">
                        <Button
                          type="submit"
                          nameButton="Cập nhật"
                          classNameButton="w-[120px] p-4 py-2 bg-blue-500 mt-2 w-full text-white font-semibold rounded-sm hover:bg-blue-500/80 duration-200"
                        />
                      </div>
                    </div>
                  </form>
                </div>
              </Fragment>
            ) : (
              ""
            )}
            {addItem ? <AddSupply setAddItem={setAddItem} /> : ""}
          </div>
        )}
      </div>
    </div>
  )
}
