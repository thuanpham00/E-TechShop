import { omit } from "lodash"
import { FolderUp, Plus, RotateCcw, Search } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { createSearchParams, useNavigate } from "react-router-dom"
import DatePicker from "src/Admin/Components/DatePickerRange"
import { SchemaProductType } from "src/Client/Utils/rule"
import Button from "src/Components/Button"
import Input from "src/Components/Input"
import InputNumber from "src/Components/InputNumber"
import { path } from "src/Constants/path"
import { cleanObject } from "src/Helpers/common"
import { queryParamConfigProduct } from "src/Types/queryParams.type"

type FormDataSearch = Pick<
  SchemaProductType,
  | "name"
  | "category"
  | "brand"
  | "price_max"
  | "price_min"
  | "created_at_start"
  | "created_at_end"
  | "updated_at_start"
  | "updated_at_end"
>

interface Props {
  queryConfig: queryParamConfigProduct
}

export default function FilterProduct({ queryConfig }: Props) {
  const navigate = useNavigate()

  const {
    register: registerFormSearch,
    handleSubmit: handleSubmitFormSearch,
    reset: resetFormSearch,
    control: controlFormSearch,
    formState: { errors }
  } = useForm<FormDataSearch>()

  const handleSubmitSearch = handleSubmitFormSearch(
    (data) => {
      const params = cleanObject({
        ...queryConfig,
        name: data.name,
        category: data.category,
        brand: data.brand,
        created_at_start: data.created_at_start?.toISOString(),
        created_at_end: data.created_at_end?.toISOString()
      })
      navigate({
        pathname: path.AdminProducts,
        search: createSearchParams(params).toString()
      })
    },
    (errors) => {
      // Nếu có lỗi, in ra console và không submit
      if (errors.created_at_end) {
        console.error("❌ Lỗi:", errors.created_at_end.message)
      }
    }
  ) // nó điều hướng với query params truyền vào và nó render lại component || tren URL lấy queryConfig xuống và fetch lại api ra danh sách cần thiết
  console.log("Errors:", errors)
  const handleResetFormSearch = () => {
    const filteredSearch = omit(queryConfig, ["name", "category", "brand", "created_at_start", "created_at_end"])
    resetFormSearch()
    navigate({ pathname: `${path.AdminProducts}`, search: createSearchParams(filteredSearch).toString() })
  }

  return (
    <div>
      <form onSubmit={handleSubmitSearch}>
        <div className="mt-1 grid grid-cols-2">
          <div className="col-span-1 flex items-center h-14 px-2 bg-[#ececec] dark:bg-darkBorder border border-[#dadada] rounded-tl-md">
            <span className="w-1/3">Tên sản phẩm</span>
            <div className="w-2/3 relative h-full">
              <Input
                name="name"
                register={registerFormSearch}
                placeholder="Nhập tên sản phẩm"
                classNameInput="p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#fff] dark:bg-black focus:border-blue-500 focus:ring-1 outline-none rounded-md h-[35px]"
                className="relative mt-2"
                classNameError="hidden"
              />
              <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
            </div>
          </div>
          <div className="col-span-1 flex items-center h-14 px-2 bg-[#ececec] dark:bg-darkBorder border border-[#dadada] rounded-tr-md">
            <span className="w-1/3">Thương hiệu</span>
            <div className="w-2/3 relative h-full">
              <Input
                name="brand"
                register={registerFormSearch}
                placeholder="Nhập thương hiệu"
                classNameInput="p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#fff] dark:bg-black focus:border-blue-500 focus:ring-1 outline-none rounded-md h-[35px]"
                className="relative mt-2"
                classNameError="hidden"
              />
              <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
            </div>
          </div>
          <div className="col-span-1 flex items-center h-14 px-2 bg-[#fff] dark:bg-darkBorder border border-[#dadada] border-t-0">
            <span className="w-1/3">Thể loại</span>
            <div className="w-2/3 relative h-full">
              <Input
                name="category"
                register={registerFormSearch}
                placeholder="Nhập tên thể loại"
                classNameInput="p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-black focus:border-blue-500 focus:ring-1 outline-none rounded-md h-[35px]"
                className="relative mt-2"
                classNameError="hidden"
              />
              <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
            </div>
          </div>
          <div className="col-span-1 flex items-center h-14 px-2 bg-[#fff] dark:bg-darkBorder border border-[#dadada] border-t-0 rounded-tr-md">
            <span className="w-1/3">Lọc theo giá</span>
            <div className="w-2/3 relative h-full ">
              <div className="flex items-center justify-between">
                <Controller
                  name="price_min"
                  control={controlFormSearch}
                  render={({ field }) => {
                    return (
                      <InputNumber
                        type="text"
                        name="price_min"
                        placeholder="Nhập giá tối thiểu"
                        classNameInput="p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-black focus:border-blue-500 focus:ring-1 outline-none rounded-md h-[35px]"
                        className="relative mt-2"
                        value={field.value}
                        ref={field.ref}
                        onChange={(event) => field.onChange(event)}
                      />
                      /**
                       * price_min và price_max có liên quan đến nhau (vì giá trị của price_max phụ thuộc vào price_min và ngược lại).
                       * Do đó, khi một trong hai thay đổi, bạn cần gọi trigger để kiểm tra lại cả hai field.
                       */
                    )
                  }}
                />
                <span>-</span>
                <Input
                  name="price_max"
                  register={registerFormSearch}
                  placeholder="Nhập giá tối đa"
                  classNameInput="p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-black focus:border-blue-500 focus:ring-1 outline-none rounded-md h-[35px]"
                  className="relative mt-2"
                  classNameError="hidden"
                />
              </div>
              <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
            </div>
          </div>
          <div className="col-span-1 flex items-center h-14 px-2 bg-[#ececec] dark:bg-darkBorder border border-[#dadada] rounded-bl-md border-t-0">
            <span className="w-1/3">Ngày đăng</span>
            <div className="w-2/3 relative h-full">
              <div className="mt-2 w-full flex items-center gap-2">
                <Controller
                  name="created_at_start"
                  control={controlFormSearch}
                  render={({ field }) => {
                    return <DatePicker value={field.value as Date} onChange={field.onChange} />
                  }}
                />
                <span>-</span>
                <Controller
                  name="created_at_end"
                  control={controlFormSearch}
                  render={({ field }) => {
                    return <DatePicker value={field.value as Date} onChange={field.onChange} />
                  }}
                />
              </div>
              <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
            </div>
          </div>
          <div className="col-span-1 flex items-center h-14 px-2 bg-[#ececec] dark:bg-darkBorder  border border-[#dadada] border-t-0 rounded-br-md">
            <span className="w-1/3">Ngày cập nhật</span>
            <div className="w-2/3 relative h-full">
              <div className="mt-2 w-full flex items-center gap-2">
                <Controller
                  name="updated_at_start"
                  control={controlFormSearch}
                  render={({ field }) => {
                    return <DatePicker value={field.value as Date} onChange={field.onChange} />
                  }}
                />
                <span>-</span>
                <Controller
                  name="updated_at_end"
                  control={controlFormSearch}
                  render={({ field }) => {
                    return <DatePicker value={field.value as Date} onChange={field.onChange} />
                  }}
                />
              </div>
              <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
            </div>
          </div>
        </div>
        <div className="flex justify-between mt-4">
          <div className="flex gap-2">
            <div className="flex items-center justify-end gap-2">
              <Button
                icon={<Plus size={15} />}
                nameButton="Thêm mới"
                classNameButton="p-2 bg-blue-500 w-full text-white font-medium rounded-md hover:bg-blue-500/80 duration-200 text-[13px] flex items-center gap-1"
              />
              <Button
                icon={<FolderUp size={15} />}
                nameButton="Export"
                classNameButton="p-2 border border-[#E2E7FF] bg-[#E2E7FF] w-full text-[#3A5BFF] font-medium rounded-md hover:bg-blue-500/40 duration-200 text-[13px] flex items-center gap-1"
              />
            </div>
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
              classNameButton="py-2 px-3 bg-blue-500 w-full text-white font-medium hover:bg-blue-500/80 rounded-md duration-200 text-[13px] flex items-center gap-1 h-[35px]"
            />
          </div>
        </div>
      </form>
    </div>
  )
}
