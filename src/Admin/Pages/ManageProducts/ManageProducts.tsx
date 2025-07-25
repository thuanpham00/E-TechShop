import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { isUndefined, omitBy } from "lodash"
import { Helmet } from "react-helmet-async"
import { adminAPI } from "src/Apis/admin.api"
import { path } from "src/Constants/path"
import useQueryParams from "src/Hook/useQueryParams"
import { ProductItemType } from "src/Types/product.type"
import { queryParamConfigCategory, queryParamConfigProduct } from "src/Types/queryParams.type"
import { SuccessResponse } from "src/Types/utils.type"
import NavigateBack from "src/Admin/Components/NavigateBack"
import Skeleton from "src/Components/Skeleton"
import Pagination from "src/Components/Pagination"
import ProductItem from "./Components/ProductItem"
import { useNavigate } from "react-router-dom"
import { HttpStatusCode } from "src/Constants/httpStatus"
import FilterProduct from "./Components/FilterProduct"
import { motion } from "framer-motion"
import { Empty } from "antd"

export default function ManageProducts() {
  const navigate = useNavigate()
  const queryParams: queryParamConfigProduct = useQueryParams()
  const queryConfig: queryParamConfigProduct = omitBy(
    {
      page: queryParams.page || "1", // mặc định page = 1
      limit: queryParams.limit || "5", // mặc định limit = 10
      name: queryParams.name,
      brand: queryParams.brand,
      category: queryParams.category,
      price_min: queryParams.price_min,
      price_max: queryParams.price_max,
      created_at_start: queryParams.created_at_start,
      created_at_end: queryParams.created_at_end,
      updated_at_start: queryParams.updated_at_start,
      updated_at_end: queryParams.updated_at_end,
      status: queryParams.status
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
    staleTime: 3 * 60 * 1000, // dưới 5 phút nó không gọi lại api
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
      <h1 className="text-2xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 my-2">
        Sản phẩm
      </h1>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="p-4 bg-white dark:bg-darkPrimary mb-3 border border-gray-300 dark:border-darkBorder rounded-2xl shadow-xl">
          <h1 className="text-[16px] font-semibold tracking-wide">Bộ lọc & Tìm kiếm</h1>
          <FilterProduct queryConfig={queryConfig} listProduct={listProduct} />
          <div>
            {isLoading && <Skeleton />}
            {!isFetching && (
              <div>
                <div className="mt-4">
                  <div className="bg-[#f2f2f2] dark:bg-darkPrimary grid grid-cols-12 items-center gap-2 py-3 border border-[#dedede] dark:border-darkBorder px-4 rounded-tl-xl rounded-tr-xl">
                    <div className="col-span-2 text-[14px] font-semibold tracking-wider uppercase">Mã sản phẩm</div>
                    <div className="col-span-1 text-[14px] font-semibold tracking-wider uppercase">Hình ảnh</div>
                    <div className="col-span-2 text-[14px] font-semibold tracking-wider uppercase">Tên sản phẩm</div>
                    <div className="col-span-1 text-[14px] font-semibold tracking-wider uppercase">Thương hiệu</div>
                    <div className="col-span-1 text-[14px] font-semibold tracking-wider uppercase">Thể loại</div>
                    <div className="col-span-1 text-[14px] font-semibold tracking-wider uppercase">Giá gốc</div>
                    <div className="col-span-1 text-[14px] text-center font-semibold tracking-wider uppercase">
                      Trạng thái
                    </div>
                    <div className="col-span-1 text-[14px] text-center font-semibold tracking-wider uppercase">
                      Ngày tạo
                    </div>
                    <div className="col-span-1 text-[14px] text-center font-semibold tracking-wider uppercase">
                      Ngày cập nhật
                    </div>
                    <div className="col-span-1 text-[14px] text-center font-semibold tracking-wider uppercase">
                      Hành động
                    </div>
                  </div>
                  <div>
                    {listProduct?.length > 0 ? (
                      listProduct?.map((item, index) => (
                        <motion.div
                          key={item._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <ProductItem
                            // onDelete={handleDeleteCategory}
                            // handleEditItem={handleEditItem}
                            item={item}
                            maxIndex={listProduct?.length}
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
      </motion.div>
    </div>
  )
}
