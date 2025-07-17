import { Helmet } from "react-helmet-async"
import NavigateBack from "src/Admin/Components/NavigateBack"
import { FolderUp, Plus, RotateCcw, Search } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import Button from "src/Components/Button"
import { motion } from "framer-motion"
import Input from "src/Components/Input"
import { path } from "src/Constants/path"
import useDownloadExcel from "src/Hook/useDownloadExcel"
import useQueryParams from "src/Hook/useQueryParams"
import { isUndefined, omitBy } from "lodash"
import { queryParamConfigOrder } from "src/Types/queryParams.type"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { adminAPI } from "src/Apis/admin.api"
import { SuccessResponse } from "src/Types/utils.type"
import { OrderItemType } from "src/Types/product.type"

export default function ManageOrders() {
  const navigate = useNavigate()
  const { downloadExcel } = useDownloadExcel()

  const queryParams: queryParamConfigOrder = useQueryParams()
  const queryConfig: queryParamConfigOrder = omitBy(
    {
      page: queryParams.page || "1", // mặc định page = 1
      limit: queryParams.limit || "5", // mặc định limit = 5
      name_product: queryParams.name_product,
      name_supplier: queryParams.name_supplier,
      quantity: queryParams.quantity,
      price_min: queryParams.price_min,
      price_max: queryParams.price_max,
      created_at_start: queryParams.created_at_start,
      created_at_end: queryParams.created_at_end,
      updated_at_start: queryParams.updated_at_start,
      updated_at_end: queryParams.updated_at_end
    },
    isUndefined
  )

  const { data, isFetching, isLoading } = useQuery({
    queryKey: ["listReceipt", queryConfig],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)
      return adminAPI.order.getOrder(queryConfig as queryParamConfigOrder, controller.signal)
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

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="p-4 bg-white dark:bg-darkPrimary mb-3 border border-gray-300 dark:border-darkBorder rounded-2xl shadow-xl">
          <h1 className="text-[15px] font-medium">Tìm kiếm</h1>
          <form>
            <div className="mt-1 grid grid-cols-2">
              <div className="col-span-1 flex items-center h-14 px-2 bg-[#ececec] dark:bg-darkBorder border border-[#dadada] rounded-tl-xl">
                <span className="w-1/3">Tên sản phẩm</span>
                <div className="w-2/3 relative h-full">
                  {/* <DropdownSearch
                    name="name_product"
                    namePlaceholder="Nhập tên sản phẩm"
                    // register={registerFormSearch}
                    // listItem={listNameProductResult}
                    onSelect={(item) => setValueSearch("name_product", item)}
                    value={inputProductValue}
                    onChangeValue={setInputProductValue}
                  /> */}
                  <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
                </div>
              </div>
              <div className="col-span-1 flex items-center h-14 px-2 bg-[#ececec] dark:bg-darkBorder border border-[#dadada] rounded-tr-xl">
                <span className="w-1/3">Tên nhà cung cấp</span>
                <div className="w-2/3 relative h-full">
                  {/* <DropdownSearch
                    name="name_supplier"
                    namePlaceholder="Nhập tên nhà cung cấp"
                    register={registerFormSearch}
                    listItem={listNameSupplierResult}
                    onSelect={(item) => setValueSearch("name_supplier", item)}
                    value={inputSupplierValue}
                    onChangeValue={setInputSupplierValue}
                  /> */}
                  <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
                </div>
              </div>
              <div className="col-span-1 flex items-center h-14 px-2 bg-[#fff] dark:bg-darkBorder border border-[#dadada] border-t-0">
                <span className="w-1/3">Số lượng sản phẩm</span>
                <div className="w-2/3 relative h-full">
                  <div className="mt-2 w-full flex items-center gap-2">
                    <Input
                      name="quantity"
                      // register={registerFormSearch}
                      placeholder="Nhập số lượng"
                      classNameInput="p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-black focus:border-blue-500 focus:ring-1 outline-none rounded-md h-[35px]"
                      className="relative flex-grow"
                      classNameError="hidden"
                    />
                  </div>
                  <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
                </div>
              </div>
              <div className="col-span-1 flex items-center h-14 px-2 bg-[#fff] dark:bg-darkBorder border border-[#dadada] border-t-0 ">
                <span className="w-1/3">Ngày tạo</span>
                <div className="w-2/3 relative h-full">
                  <div className="mt-2 w-full flex items-center gap-2">
                    {/* <Controller
                      name="created_at_start"
                      // control={controlFormSearch}
                      render={({ field }) => {
                        return (
                          <DatePicker
                            value={field.value as Date}
                            onChange={(event) => {
                              field.onChange(event)
                              // trigger("created_at_end")
                            }}
                          />
                        )
                      }}
                    /> */}
                    <span>-</span>
                    {/* <Controller
                      name="created_at_end"
                      // control={controlFormSearch}
                      render={({ field }) => {
                        return (
                          <DatePicker
                            value={field.value as Date}
                            onChange={(event) => {
                              field.onChange(event)
                              // trigger("created_at_start")
                            }}
                          />
                        )
                      }}
                    /> */}
                  </div>
                  <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
                </div>
              </div>
              <div className="col-span-1 flex items-center h-14 px-2 bg-[#fff] dark:bg-darkBorder border border-[#dadada] border-t-0 rounded-bl-xl">
                <span className="w-1/3">Ngày cập nhật</span>
                <div className="w-2/3 relative h-full">
                  <div className="mt-2 w-full flex items-center gap-2">
                    {/* <Controller
                      name="updated_at_start"
                      // control={controlFormSearch}
                      render={({ field }) => {
                        return (
                          <DatePicker
                            value={field.value as Date}
                            onChange={(event) => {
                              field.onChange(event)
                              // trigger("updated_at_end")
                            }}
                          />
                        )
                      }}
                    /> */}
                    <span>-</span>
                    {/* <Controller
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
                    /> */}
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
                  // onClick={() => downloadExcel(listReceipt)}
                  icon={<FolderUp size={15} />}
                  nameButton="Export"
                  classNameButton="py-2 px-3 border border-[#E2E7FF] bg-[#E2E7FF] w-full text-[#3A5BFF] font-medium rounded-3xl hover:bg-blue-500/40 duration-200 text-[13px] flex items-center gap-1"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  // onClick={handleResetFormSearch}
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
        {/* {isLoading && <Skeleton />}
        {!isFetching && (
          <div>
            {listReceipt.length > 0 ? (
              listReceipt.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ReceiptItem item={item} />
                </motion.div>
              ))
            ) : (
              <div className="text-center mt-4">Không tìm thấy kết quả</div>
            )} */}
        {/* <Pagination
              data={result}
              queryConfig={queryConfig}
              page_size={page_size}
              pathNavigate={path.AdminReceipts}
            /> */}
        {/* {idSupply !== null ? (
              <SupplyDetail idSupply={idSupply} setIdSupply={setIdSupply} queryConfig={queryConfig} />
            ) : (
              ""
            )} */}
        {/* {addItem ? <AddSupply setAddItem={setAddItem} /> : ""} */}
        {/* </div> */}
        {/* // )} */}
      </motion.div>
    </div>
  )
}
