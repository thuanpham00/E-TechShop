import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { isUndefined, omit, omitBy } from "lodash"
import { FolderUp, Plus, Search, X } from "lucide-react"
import { Helmet } from "react-helmet-async"
import { Fragment } from "react/jsx-runtime"
import { adminAPI } from "src/Apis/admin.api"
import { path } from "src/Constants/path"
import useQueryParams from "src/Hook/useQueryParams"
import { ProductItemType } from "src/Types/product.type"
import { queryParamConfigCategory, queryParamConfigProduct } from "src/Types/queryParams.type"
import { SuccessResponse } from "src/Types/utils.type"
import NavigateBack from "src/Admin/Components/NavigateBack"
import Input from "src/Components/Input"
import Button from "src/Components/Button"
import Skeleton from "src/Components/Skeleton"
import Pagination from "src/Components/Pagination"
import ProductItem from "./Components"
import { useForm } from "react-hook-form"
import { createSearchParams, useNavigate } from "react-router-dom"
import { SchemaAuthType } from "src/Client/Utils/rule"
import { cleanObject } from "src/Helpers/common"
import { HttpStatusCode } from "src/Constants/httpStatus"

type FormDataSearch = Pick<SchemaAuthType, "name_product" | "category_product" | "brand_product">

export default function ManageProducts() {
  const navigate = useNavigate()
  const queryParams: queryParamConfigProduct = useQueryParams()
  const queryConfig: queryParamConfigProduct = omitBy(
    {
      page: queryParams.page || "1", // mặc định page = 1
      limit: queryParams.limit || "5", // mặc định limit =
      name_product: queryParams.name_product,
      brand_product: queryParams.brand_product,
      category_product: queryParams.category_product
    },
    isUndefined
  )

  const { data, isFetching, isLoading, error, isError } = useQuery({
    queryKey: ["listProduct", queryConfig],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)
      return adminAPI.product.getProducts(queryConfig as queryParamConfigCategory, controller.signal)
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 1 * 60 * 1000, // dưới 5 phút nó không gọi lại api
    placeholderData: keepPreviousData
  })

  const result = data?.data as SuccessResponse<{
    result: ProductItemType[]
    total: string
    page: string
    limit: string
    totalOfPage: string
  }>
  const listProduct = result?.result?.result

  const page_size = Math.ceil(Number(result?.result.total) / Number(result?.result.limit))

  // const [idBrand, setIdBrand] = useState<string | null>(null)

  // const handleEditItem = useCallback((id: string) => {
  //   setIdBrand(id)
  // }, [])

  // const handleExitsEditItem = () => {
  //   setIdBrand(null)
  // }

  const {
    register: registerFormSearch,
    handleSubmit: handleSubmitFormSearch,
    reset: resetFormSearch
  } = useForm<FormDataSearch>()

  const handleSubmitSearch = handleSubmitFormSearch((data) => {
    const params = cleanObject({
      ...queryConfig,
      name_product: data.name_product,
      category_product: data.category_product,
      brand_product: data.brand_product
    })
    navigate({
      pathname: path.AdminProducts,
      search: createSearchParams(params).toString()
    })
  }) // nó điều hướng với query params truyền vào và nó render lại component || tren URL lấy queryConfig xuống và fetch lại api ra danh sách cần thiết

  const handleResetFormSearch = () => {
    const filteredSearch = omit(queryConfig, ["name_product", "category_product", "brand_product"])
    resetFormSearch()
    navigate({ pathname: `${path.AdminProducts}`, search: createSearchParams(filteredSearch).toString() })
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
        <title>Quản lý sản phẩm</title>
        <meta
          name="description"
          content="Đây là trang TECHZONE | Laptop, PC, Màn hình, điện thoại, linh kiện Chính Hãng"
        />
      </Helmet>
      <NavigateBack />
      <div className="p-4 bg-white dark:bg-darkPrimary mb-3 border border-[#dedede] dark:border-darkBorder rounded-md">
        <h1 className="text-[15px] font-medium">Tìm kiếm</h1>
        <form onSubmit={handleSubmitSearch} className="mt-1">
          <div className="flex flex-wrap items-center gap-4">
            <Input
              name="name_product"
              register={registerFormSearch}
              placeholder="Nhập tên sản phẩm"
              classNameInput="p-2 w-full border border-[#dedede] bg-[#f2f2f2] focus:border-blue-500 focus:ring-2 outline-none rounded-md h-[35px]"
              className="relative flex-1"
              classNameError="hidden"
            />
            <Input
              name="brand_product"
              register={registerFormSearch}
              placeholder="Nhập thương hiệu"
              classNameInput="p-2 w-full border border-[#dedede] bg-[#f2f2f2] focus:border-blue-500 focus:ring-2 outline-none rounded-md h-[35px]"
              className="relative flex-1"
              classNameError="hidden"
            />
            <Input
              name="category_product"
              register={registerFormSearch}
              placeholder="Nhập thể loại"
              classNameInput="p-2 w-full border border-[#dedede] bg-[#f2f2f2] focus:border-blue-500 focus:ring-2 outline-none rounded-md h-[35px]"
              className="relative flex-1"
              classNameError="hidden"
            />
            <div className="flex items-center gap-2">
              <Button
                type="submit"
                icon={<Search size={15} />}
                nameButton="Tìm kiếm"
                classNameButton="p-2 bg-blue-500 w-full text-white font-medium rounded-md hover:bg-blue-500/80 duration-200 text-[13px] flex items-center gap-1 h-[35px]"
              />
              <Button
                type="button"
                onClick={handleResetFormSearch}
                icon={<X size={15} />}
                nameButton="Xóa"
                classNameButton="p-2 bg-white border border-[#dedede] w-full text-black font-medium rounded-md hover:bg-[#dedede]/80 duration-200 text-[13px] flex items-center gap-1 h-[35px]"
              />
            </div>
          </div>
        </form>
      </div>
      <div>
        <div className="bg-white dark:bg-darkPrimary border border-b-0 border-[#dedede] dark:border-darkBorder p-4 pb-2 flex items-center justify-between rounded-tl-md rounded-tr-md">
          <h2 className="text-[15px] font-medium">Danh mục thể loại sản phẩm</h2>
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
              <div className="bg-[#f2f2f2] dark:bg-darkPrimary grid grid-cols-12 items-center gap-2 py-3 border border-[#dedede] dark:border-darkBorder px-4">
                <div className="col-span-2 text-[14px] font-medium">ID</div>
                <div className="col-span-2 text-[14px] font-medium">Hình ảnh</div>
                <div className="col-span-1 text-[14px] font-medium">Tên sản phẩm</div>
                <div className="col-span-1 text-[14px] font-medium">Thương hiệu</div>
                <div className="col-span-1 text-[14px] font-medium">Thể loại</div>
                <div className="col-span-1 text-[14px] font-medium">Giá tiền</div>
                <div className="col-span-1 text-[14px] font-medium">Số lượng</div>
                <div className="col-span-1 text-[14px] font-medium">Ngày tạo</div>
                <div className="col-span-1 text-[14px] font-medium">Ngày cập nhật</div>
                <div className="col-span-1 text-[14px] font-medium">Hành động</div>
              </div>
              <div className="">
                {listProduct.length > 0 ? (
                  listProduct.map((item) => (
                    <Fragment key={item._id}>
                      <ProductItem
                        // onDelete={handleDeleteCategory}
                        // handleEditItem={handleEditItem}
                        item={item}
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
              pathNavigate={path.AdminProducts}
            />
            {/* {idCategory !== null ? (
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
            )} */}
          </div>
        )}
      </div>
    </div>
  )
}
