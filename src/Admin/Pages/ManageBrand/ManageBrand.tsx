/* eslint-disable @typescript-eslint/no-explicit-any */
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { FolderUp, Plus, Search, X } from "lucide-react"
import { Helmet } from "react-helmet-async"
import { createSearchParams, useLocation, useNavigate, useParams } from "react-router-dom"
import { Fragment } from "react/jsx-runtime"
import { adminAPI } from "src/Apis/admin.api"
import { BrandItemType, UpdateCategoryBodyReq } from "src/Types/product.type"
import { ErrorResponse, MessageResponse, SuccessResponse } from "src/Types/utils.type"
import { useForm } from "react-hook-form"
import { schemaAuth, SchemaAuthType } from "src/Client/Utils/rule"
import useQueryParams from "src/Hook/useQueryParams"
import { isUndefined, omit, omitBy } from "lodash"
import { queryParamConfigBrand } from "src/Types/queryParams.type"
import { path } from "src/Constants/path"
import { useCallback, useEffect, useState } from "react"
import { yupResolver } from "@hookform/resolvers/yup"
import { cleanObject, convertDateTime } from "src/Helpers/common"
import { toast } from "react-toastify"
import { isError400 } from "src/Helpers/utils"
import { HttpStatusCode } from "src/Constants/httpStatus"
import NavigateBack from "src/Admin/Components/NavigateBack"
import BrandItem from "./Components/BrandItem"
import Input from "src/Components/Input"
import Button from "src/Components/Button"
import Skeleton from "src/Components/Skeleton"
import Pagination from "src/Components/Pagination"
import AddBrand from "./Components/AddBrand"

type FormDataUpdate = Pick<SchemaAuthType, "name" | "id" | "created_at" | "updated_at">
const formDataUpdate = schemaAuth.pick(["name", "id", "created_at", "updated_at"])

type FormDataSearch = Pick<SchemaAuthType, "name">

export default function ManageBrand() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { state } = useLocation()
  const queryClient = useQueryClient()
  const queryParams: queryParamConfigBrand = useQueryParams()
  const queryConfig: queryParamConfigBrand = omitBy(
    {
      page: queryParams.page || "1", // mặc định page = 1
      limit: queryParams.limit || "10", // mặc định limit =
      name: queryParams.name,
      id: id
    },
    isUndefined
  )

  const { data, isFetching, isLoading, error, isError } = useQuery({
    queryKey: ["listBrand", queryConfig],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)
      return adminAPI.category.getBrands(queryConfig, controller.signal)
    },
    enabled: Boolean(id),
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 3 * 60 * 1000, // dưới 5 phút nó không gọi lại api
    placeholderData: keepPreviousData
    // chỉ chạy khi id có giá trị
  })

  const result = data?.data as SuccessResponse<{
    result: BrandItemType[]
    total: string
    page: string
    limit: string
    totalOfPage: string
    listTotalProduct: { brand: string; total: string }[]
  }>
  const listBrandOfCategory = result?.result?.result
  const listTotalProduct = result?.result?.listTotalProduct
  const page_size = Math.ceil(Number(result?.result.total) / Number(result?.result.limit))

  const [idBrand, setIdBrand] = useState<string | null>(null)

  const handleEditItem = useCallback((id: string) => {
    setIdBrand(id)
  }, [])

  const handleExitsEditItem = () => {
    setIdBrand(null)
  }

  const getInfoBrand = useQuery({
    queryKey: ["category", idBrand],
    queryFn: () => {
      return adminAPI.category.getBrandDetail(idBrand as string)
    },
    enabled: Boolean(idBrand) // chỉ chạy khi idCustomer có giá trị
  })

  const infoCategory = getInfoBrand.data?.data as SuccessResponse<{ result: BrandItemType }>
  const brand = infoCategory?.result?.result

  const {
    register,
    formState: { errors },
    setValue,
    setError,
    handleSubmit
  } = useForm<FormDataUpdate>({
    resolver: yupResolver(formDataUpdate),
    defaultValues: {
      id: "",
      name: "",
      created_at: "",
      updated_at: ""
    } // giá trị khởi tạo
  })

  useEffect(() => {
    if (brand) {
      setValue("id", brand._id)
      setValue("name", brand.name)
      setValue("created_at", convertDateTime(brand.created_at))
      setValue("updated_at", convertDateTime(brand.updated_at))
    }
  }, [brand, setValue])

  const updateCategoryMutation = useMutation({
    mutationFn: (body: { id: string; body: UpdateCategoryBodyReq }) => {
      return adminAPI.category.updateBrandDetail(body.id, body.body)
    }
  })

  const handleSubmitUpdate = handleSubmit((data) => {
    updateCategoryMutation.mutate(
      { id: idBrand as string, body: data },
      {
        onSuccess: () => {
          setIdBrand(null)
          toast.success("Cập nhật thành công", { autoClose: 1500 })
          queryClient.invalidateQueries({ queryKey: ["listBrand", queryConfig] })
        },
        onError: (error) => {
          if (isError400<ErrorResponse<MessageResponse>>(error)) {
            const msg = error.response?.data as ErrorResponse<{ message: string }>
            const msg2 = msg.message
            setError("name", {
              message: msg2
            })
          }
        }
      }
    )
  })

  const deleteBrandMutation = useMutation({
    mutationFn: (body: { id: string; categoryId: string }) => {
      return adminAPI.category.deleteBrand(body.id, body.categoryId)
    }
  })

  const handleDeleteBrand = (brandId: string) => {
    deleteBrandMutation.mutate(
      { id: brandId, categoryId: id as string },
      {
        onSuccess: () => {
          // lấy ra query của trang hiện tại (có queryConfig)
          const data = queryClient.getQueryData(["listBrand", queryConfig])
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const data_2 = (data as any).data as SuccessResponse<{
            result: BrandItemType[]
            total: string
            page: string
            limit: string
            totalOfPage: string
            listTotalProduct: { brand: string; total: string }[]
          }>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (data && data_2.result.result.length === 1 && Number(queryConfig.page) > 1) {
            navigate({
              pathname: `${path.AdminCategories}/${id}`,
              search: createSearchParams({
                ...queryConfig,
                page: (Number(queryConfig.page) - 1).toString()
              }).toString()
            })
          }

          queryClient.invalidateQueries({ queryKey: ["listBrand"] })
          toast.success("Xóa thành công!", { autoClose: 1500 })
        },
        onError: (error) => {
          if (isError400<ErrorResponse<MessageResponse>>(error)) {
            toast.error(error.response?.data.message, {
              autoClose: 1500
            })
          }
        }
      }
    )
  }

  const {
    register: registerFormSearch,
    handleSubmit: handleSubmitFormSearch,
    reset: resetFormSearch
  } = useForm<FormDataSearch>()

  const handleSubmitSearch = handleSubmitFormSearch((data) => {
    const params = cleanObject({ ...queryConfig, name: data.name })
    navigate(
      {
        pathname: `${path.AdminCategories}/${id}`,
        search: createSearchParams(params).toString()
      },
      {
        state: state
      }
    )
  })

  const handleResetFormSearch = () => {
    const filteredSearch = omit(queryConfig, ["name"])
    resetFormSearch()
    navigate(
      { pathname: `${path.AdminCategories}/${id}`, search: createSearchParams(filteredSearch).toString() },
      {
        state: state
      }
    )
  }

  if (isError) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.response?.status === HttpStatusCode.NotFound) {
      navigate(path.AdminNotFound, { replace: true })
    }
  }

  const [addItem, setAddItem] = useState(false)

  return (
    <div>
      <Helmet>
        <title>Chi tiết danh mục</title>
        <meta
          name="description"
          content="Đây là trang TECHZONE | Laptop, PC, Màn hình, điện thoại, linh kiện Chính Hãng"
        />
      </Helmet>
      <NavigateBack />
      <div className="text-lg font-bold py-2 text-[#3A5BFF]">Thương hiệu</div>
      <div className="p-4 bg-white dark:bg-darkPrimary mb-3 border border-[#dedede] dark:border-darkBorder rounded-md">
        <h1 className="text-[15px] font-medium">Tìm kiếm</h1>
        <div className="flex items-center w-full mt-1">
          <form onSubmit={handleSubmitSearch} className="w-[50%] relative flex items-center">
            <Input
              name="name"
              register={registerFormSearch}
              placeholder="Nhập tên thương hiệu"
              classNameInput="p-2 w-full border border-[#dedede] bg-[#f2f2f2] focus:border-blue-500 focus:ring-1 outline-none rounded-tl-md rounded-bl-md h-[35px]"
              className="relative flex-grow"
              classNameError="hidden"
            />
            <Button
              type="button"
              onClick={handleResetFormSearch}
              icon={<X size={15} color="#adb5bd" />}
              classNameButton="p-2 w-full text-black font-medium flex items-center gap-1 h-[35px] "
              className="absolute right-10 top-0"
            />
            <Button
              type="submit"
              icon={<Search size={15} />}
              classNameButton="p-2 px-3 bg-blue-500 w-full text-white font-medium rounded-tr-md rounded-br-md hover:bg-blue-500/80 duration-200 text-[13px] flex items-center gap-1 h-[35px]"
              className="flex-shrink-0"
            />
          </form>
          <div className="flex items-center justify-end gap-2 w-[50%]">
            <Button
              icon={<FolderUp size={15} />}
              nameButton="Export"
              classNameButton="p-2 border border-[#E2E7FF] bg-[#E2E7FF] w-full text-[#3A5BFF] font-medium rounded-md hover:bg-blue-500/40 duration-200 text-[13px] flex items-center gap-1"
            />
            <Button
              onClick={() => setAddItem(true)}
              icon={<Plus size={15} />}
              nameButton="Thêm mới"
              classNameButton="p-2 bg-blue-500 w-full text-white font-medium rounded-md hover:bg-blue-500/80 duration-200 text-[13px] flex items-center gap-1"
            />
          </div>
        </div>
        {isLoading && <Skeleton />}
        {!isFetching && (
          <div>
            <div className="mt-4">
              <div className="bg-[#f2f2f2] dark:bg-darkPrimary grid grid-cols-12 items-center gap-2 py-3 border border-[#dedede] dark:border-darkBorder px-4 rounded-tl-md rounded-tr-md">
                <div className="col-span-2 text-[14px] font-medium">ID</div>
                <div className="col-span-2 text-[14px] font-medium">Tên thương hiệu</div>
                <div className="col-span-2 text-[14px] font-medium">Ngày tạo</div>
                <div className="col-span-2 text-[14px] font-medium">Ngày cập nhật</div>
                <div className="col-span-2 text-[14px] text-center font-medium">Hành động</div>
                <div className="col-span-2 text-[14px] text-center font-medium">Sản phẩm</div>
              </div>
              <div>
                {listBrandOfCategory.length > 0 ? (
                  listBrandOfCategory.map((item) => (
                    <Fragment key={item._id}>
                      <BrandItem
                        onDelete={handleDeleteBrand}
                        listTotalProduct={listTotalProduct}
                        handleEditItem={handleEditItem}
                        item={item}
                        nameCategory={state}
                      />
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
              pathNavigate={`${path.AdminCategories}/${id}`}
            />
            {idBrand !== null ? (
              <Fragment>
                <div className="fixed left-0 top-0 z-10 h-screen w-screen bg-black/60 "></div>
                <div className="z-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <button onClick={handleExitsEditItem} className="absolute right-2 top-1">
                    <X color="gray" size={22} />
                  </button>
                  <form onSubmit={handleSubmitUpdate} className="p-4 bg-white dark:bg-darkPrimary rounded-md">
                    <h3 className="text-[15px] font-medium">Thông tin thể loại</h3>
                    <div className="mt-4 flex items-center gap-4">
                      <Input
                        name="id"
                        register={register}
                        placeholder="Nhập họ tên"
                        messageErrorInput={errors.id?.message}
                        classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                        className="relative flex-1"
                        nameInput="Id"
                        disabled
                      />
                      <Input
                        name="name"
                        register={register}
                        placeholder="Nhập họ tên"
                        messageErrorInput={errors.name?.message}
                        classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkPrimary focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                        className="relative flex-1"
                        nameInput="Tên thể loại"
                      />
                    </div>
                    <div className="mt-2 flex items-center gap-4">
                      <Input
                        name="created_at"
                        register={register}
                        placeholder="Nhập ngày tạo"
                        messageErrorInput={errors.created_at?.message}
                        classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                        className="relative flex-1"
                        nameInput="Ngày tạo"
                        disabled
                      />
                      <Input
                        name="updated_at"
                        register={register}
                        placeholder="Nhập ngày tạo cập nhật"
                        messageErrorInput={errors.updated_at?.message}
                        classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond  focus:border-blue-500 focus:ring-2 outline-none rounded-md"
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
                  </form>
                </div>
              </Fragment>
            ) : (
              ""
            )}

            {addItem ? <AddBrand setAddItem={setAddItem} categoryId={id} /> : ""}
          </div>
        )}
      </div>
    </div>
  )
}
