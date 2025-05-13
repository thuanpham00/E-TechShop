import { yupResolver } from "@hookform/resolvers/yup"
import { FolderUp, Plus, RotateCcw, Search } from "lucide-react"
import { Helmet } from "react-helmet-async"
import { Controller, useForm } from "react-hook-form"
import DatePicker from "src/Admin/Components/DatePickerRange"
import NavigateBack from "src/Admin/Components/NavigateBack"
import { schemaSupply, SchemaSupplyType } from "src/Client/Utils/rule"
import Button from "src/Components/Button"

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

export default function ManageReceipt() {
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
      <div className="p-4 bg-white dark:bg-darkPrimary mb-3 border border-gray-300 dark:border-darkBorder rounded-2xl shadow-xl">
        <h1 className="text-[15px] font-medium">Tìm kiếm</h1>
        <div>
          <form>
            <div className="mt-1 grid grid-cols-2">
              {/* <div className="col-span-1 flex items-center h-14 px-2 bg-[#fff] dark:bg-darkBorder border border-[#dadada] rounded-tl-xl">
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
              </div> */}
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
                  // onClick={() => setAddItem(true)}
                  icon={<Plus size={15} />}
                  nameButton="Thêm mới"
                  classNameButton="p-2 bg-blue-500 w-full text-white font-medium rounded-md hover:bg-blue-500/80 duration-200 text-[13px] flex items-center gap-1"
                />
                <Button
                  // onClick={() => downloadExcel(listSupplier)}
                  icon={<FolderUp size={15} />}
                  nameButton="Export"
                  classNameButton="p-2 border border-[#E2E7FF] bg-[#E2E7FF] w-full text-[#3A5BFF] font-medium rounded-md hover:bg-blue-500/40 duration-200 text-[13px] flex items-center gap-1"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  // onClick={handleResetFormSearch}
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
        {/* {isLoading && <Skeleton />}
        {!isFetching && (
          <div>
            <div className="mt-4">
              <div className="bg-[#f2f2f2] dark:bg-darkPrimary grid grid-cols-12 items-center gap-2 py-3 border border-[#dedede] dark:border-darkBorder px-4 rounded-tl-xl rounded-tr-xl">
                <div className="col-span-2 text-[14px] font-semibold">Mã cung ứng</div>
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
                      <SupplyItem onDelete={handleDeleteSupply} handleEditItem={handleEditItem} item={item} />
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
              <SupplyDetail idSupply={idSupply} setIdSupply={setIdSupply} queryConfig={queryConfig} />
            ) : (
              ""
            )}
            {addItem ? <AddSupply setAddItem={setAddItem} /> : ""}
          </div>
        )} */}
      </div>
    </div>
  )
}
