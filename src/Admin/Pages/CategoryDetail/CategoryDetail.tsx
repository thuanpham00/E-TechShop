import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { FolderUp, Plus, Search, X } from "lucide-react"
import { Helmet } from "react-helmet-async"
import { createSearchParams, useLocation, useNavigate, useParams } from "react-router-dom"
import { Fragment } from "react/jsx-runtime"
import { adminAPI } from "src/Apis/admin.api"
import Button from "src/Components/Button"
import Skeleton from "src/Components/Skeleton"
import { BrandItemType, UpdateCategoryBodyReq } from "src/Types/product.type"
import { ErrorResponse, MessageResponse, SuccessResponse } from "src/Types/utils.type"
import BrandItem from "./Components/BrandItem"
import NavigateBack from "src/Admin/Components/NavigateBack"
import Input from "src/Components/Input"
import { useForm } from "react-hook-form"
import { schemaAuth, SchemaAuthType } from "src/Client/Utils/rule"
import useQueryParams from "src/Hook/useQueryParams"
import { isUndefined, omit, omitBy } from "lodash"
import { queryParamConfigBrand } from "src/Types/queryParams.type"
import { path } from "src/Constants/path"
import Pagination from "src/Components/Pagination"
import { useCallback, useEffect, useState } from "react"
import { yupResolver } from "@hookform/resolvers/yup"
import { convertDateTime } from "src/Helpers/common"
import { toast } from "react-toastify"
import { isError400 } from "src/Helpers/utils"

type FormDataUpdate = Pick<SchemaAuthType, "name" | "id" | "created_at" | "updated_at">
const formDataUpdate = schemaAuth.pick(["name", "id", "created_at", "updated_at"])

type FormDataSearch = Pick<SchemaAuthType, "name">

export default function CategoryDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const queryClient = useQueryClient()
  const queryParams: queryParamConfigBrand = useQueryParams()
  const queryConfig: queryParamConfigBrand = omitBy(
    {
      page: queryParams.page || "1", // mặc định page = 1
      limit: queryParams.limit || "5", // mặc định limit =
      name: queryParams.name,
      id: id
    },
    isUndefined
  )

  const { state } = useLocation()
  const { data, isFetching, isLoading } = useQuery({
    queryKey: ["listBrand", queryConfig],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)
      return adminAPI.category.getBrands(queryConfig, controller.signal)
    },
    enabled: Boolean(id)
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

  const {
    register: registerFormSearch,
    handleSubmit: handleSubmitFormSearch,
    reset: resetFormSearch
  } = useForm<FormDataSearch>()

  const handleSubmitSearch = handleSubmitFormSearch((data) => {
    let bodySendSubmit = { ...queryConfig }
    if (data.name) {
      bodySendSubmit = {
        ...queryConfig,
        name: data.name
      }
    }
    navigate(
      {
        pathname: `${path.AdminCategories}/${id}`,
        search: createSearchParams(bodySendSubmit).toString()
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
      <div className="p-4 bg-white mb-3 border border-[#dedede] rounded-md">
        <h1 className="text-[15px] font-medium">Tìm kiếm</h1>
        <form onSubmit={handleSubmitSearch} className="mt-1">
          <div className="flex items-center gap-4">
            <Input
              name="name"
              register={registerFormSearch}
              placeholder="Nhập tên thể loại"
              classNameInput="mt-1 p-2 w-full border border-[#dedede] bg-[#f2f2f2] focus:border-blue-500 focus:ring-2 outline-none rounded-md"
              className="relative flex-1"
              nameInput="Tên thể loại"
            />
            <div className="flex items-center gap-2">
              <Button
                type="submit"
                icon={<Search size={15} />}
                nameButton="Tìm kiếm"
                classNameButton="p-2 bg-blue-500 w-full text-white font-medium rounded-md hover:bg-blue-500/80 duration-200 text-[13px] flex items-center gap-1"
              />
              <Button
                type="button"
                onClick={handleResetFormSearch}
                icon={<X size={15} />}
                nameButton="Xóa"
                classNameButton="p-2 bg-white border border-[#dedede] w-full text-black font-medium rounded-md hover:bg-[#dedede]/80 duration-200 text-[13px] flex items-center gap-1"
              />
            </div>
          </div>
        </form>
      </div>
      <div>
        <div className="bg-white border border-b-0 border-[#dedede] p-4 pb-2 flex items-center justify-between rounded-tl-md rounded-tr-md">
          <h2 className="text-[15px] font-medium">Các Thương hiệu của {state}</h2>
          <div className="flex items-center gap-2">
            <Button
              icon={<FolderUp size={15} />}
              nameButton="Export"
              classNameButton="p-2 bg-blue-500 w-full text-white font-medium rounded-md hover:bg-blue-500/80 duration-200 text-[13px] flex items-center gap-1"
            />
            <Button
              icon={<Plus size={15} />}
              nameButton="Thêm mới"
              classNameButton="p-2 bg-blue-500 w-full text-white font-medium rounded-md hover:bg-blue-500/80 duration-200 text-[13px] flex items-center gap-1"
            />
          </div>
        </div>
        {isLoading && <Skeleton />}
        {!isFetching && (
          <div>
            <div>
              <div className="bg-[#f2f2f2] grid grid-cols-12 items-center gap-2 py-3 border border-[#dedede] px-4">
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
                      <BrandItem listTotalProduct={listTotalProduct} handleEditItem={handleEditItem} item={item} />
                    </Fragment>
                  ))
                ) : (
                  <div className="text-center mt-4">Không tìm thấy kết quả</div>
                )}
              </div>
            </div>
            {listBrandOfCategory.length > 0 && (
              <Pagination
                data={result}
                queryConfig={queryConfig}
                page_size={page_size}
                pathNavigate={`${path.AdminCategories}/${id}`}
              />
            )}
            {idBrand !== null ? (
              <Fragment>
                <div className="fixed left-0 top-0 z-10 h-screen w-screen bg-black/60 "></div>
                <div className="z-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <button onClick={handleExitsEditItem} className="absolute right-2 top-1">
                    <X color="gray" size={22} />
                  </button>
                  <form onSubmit={handleSubmitUpdate} className="p-4 bg-white rounded-md">
                    <h3 className="text-[15px] font-medium">Thông tin thể loại</h3>
                    <div className="mt-4 flex items-center gap-4">
                      <Input
                        name="id"
                        register={register}
                        placeholder="Nhập họ tên"
                        messageErrorInput={errors.id?.message}
                        classNameInput="mt-1 p-2 w-full border border-[#dedede] bg-[#f2f2f2] focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                        className="relative flex-1"
                        nameInput="Id"
                        disabled
                      />
                      <Input
                        name="name"
                        register={register}
                        placeholder="Nhập họ tên"
                        messageErrorInput={errors.name?.message}
                        classNameInput="mt-1 p-2 w-full border border-[#dedede] bg-white focus:border-blue-500 focus:ring-2 outline-none rounded-md"
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
                        classNameInput="mt-1 p-2 w-full border border-[#dedede] bg-[#f2f2f2] focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                        className="relative flex-1"
                        nameInput="Ngày tạo"
                        disabled
                      />
                      <Input
                        name="updated_at"
                        register={register}
                        placeholder="Nhập ngày tạo cập nhật"
                        messageErrorInput={errors.updated_at?.message}
                        classNameInput="mt-1 p-2 w-full border border-[#dedede] bg-[#f2f2f2] focus:border-blue-500 focus:ring-2 outline-none rounded-md"
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
          </div>
        )}
      </div>
    </div>
  )
}
