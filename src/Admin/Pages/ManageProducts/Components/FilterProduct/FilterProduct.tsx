import { yupResolver } from "@hookform/resolvers/yup"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { omit } from "lodash"
import { FolderUp, Plus, RotateCcw, Search } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { createSearchParams, Link, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import DatePicker from "src/Admin/Components/DatePickerRange"
import { adminAPI } from "src/Apis/admin.api"
import { schemaProduct, SchemaProductType } from "src/Client/Utils/rule"
import Button from "src/Components/Button"
import Input from "src/Components/Input"
import InputNumber from "src/Components/InputNumber"
import { path } from "src/Constants/path"
import { cleanObject } from "src/Helpers/common"
import { queryParamConfigProduct } from "src/Types/queryParams.type"
import { SuccessResponse } from "src/Types/utils.type"

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
  | "status"
>

const formDataSearch = schemaProduct.pick([
  "name",
  "category",
  "brand",
  "price_max",
  "price_min",
  "created_at_start",
  "created_at_end",
  "updated_at_start",
  "updated_at_end",
  "status"
])
interface Props {
  queryConfig: queryParamConfigProduct
}

export default function FilterProduct({ queryConfig }: Props) {
  const navigate = useNavigate()

  const getNameCategory = useQuery({
    queryKey: ["nameCategory"],
    queryFn: () => {
      return adminAPI.category.getNameCategory()
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 10 * 60 * 1000, // dưới 1 phút nó không gọi lại api
    placeholderData: keepPreviousData // giữ data cũ trong 1p
  })

  const listNameCategory = getNameCategory.data?.data as SuccessResponse<{
    result: string[]
  }>

  const listNameCategoryResult = listNameCategory?.result.result

  const getNameBrand = useQuery({
    queryKey: ["nameBrand"],
    queryFn: () => {
      return adminAPI.category.getNameBrand()
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 10 * 60 * 1000, // dưới 1 phút nó không gọi lại api
    placeholderData: keepPreviousData // giữ data cũ trong 1p
  })

  const listNameBrand = getNameBrand.data?.data as SuccessResponse<{
    result: string[]
  }>

  const listNameBrandResult = listNameBrand?.result.result

  const {
    register: registerFormSearch,
    handleSubmit: handleSubmitFormSearch,
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
        name: data.name,
        category: data.category,
        brand: data.brand,
        created_at_start: data.created_at_start?.toISOString(),
        created_at_end: data.created_at_end?.toISOString(),
        updated_at_start: data.updated_at_start?.toISOString(),
        updated_at_end: data.updated_at_end?.toISOString(),
        price_min: data.price_min,
        price_max: data.price_max,
        status: data.status
      })

      navigate({
        pathname: path.AdminProducts,
        search: createSearchParams(params).toString()
      })
    },
    (error) => {
      if (error.price_min) {
        toast.error(error.price_min?.message, { autoClose: 1500 })
      }
      if (error.created_at_end) {
        toast.error(error.created_at_end?.message, { autoClose: 1500 })
      }
      if (error.updated_at_end) {
        toast.error(error.updated_at_end?.message, { autoClose: 1500 })
      }
    }
  ) // nó điều hướng với query params truyền vào và nó render lại component || tren URL lấy queryConfig xuống và fetch lại api ra danh sách cần thiết

  const handleResetFormSearch = () => {
    const filteredSearch = omit(queryConfig, [
      "name",
      "category",
      "brand",
      "created_at_start",
      "created_at_end",
      "updated_at_start",
      "updated_at_end",
      "price_min",
      "price_max",
      "status"
    ])
    resetFormSearch()
    navigate({ pathname: `${path.AdminProducts}`, search: createSearchParams(filteredSearch).toString() })
  }

  return (
    <div>
      <form onSubmit={handleSubmitSearch}>
        <div className="mt-1 grid grid-cols-2">
          <div className="col-span-1 flex items-center h-14 px-2 bg-[#ececec] dark:bg-darkBorder border border-[#dadada] rounded-tl-md">
            <span className="w-[30%]">Tên sản phẩm</span>
            <div className="w-[70%] relative h-full">
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
            <span className="w-[30%]">Thương hiệu</span>
            <div className="w-[70%] relative h-full">
              <Controller
                name="brand"
                control={controlFormSearch}
                render={({ field }) => {
                  return (
                    <select
                      // {...field}
                      value={field.value ?? ""} // ✅ Giá trị từ form
                      onChange={(e) => field.onChange(e.target.value ? e.target.value : undefined)} // ✅ Cập nhật vào form
                      className="p-2 border border-gray-300 dark:border-darkBorder bg-[#fff] dark:bg-black w-full mt-2 rounded-md "
                    >
                      <option value="" disabled selected>
                        -- Chọn thương hiệu --
                      </option>
                      {listNameBrandResult?.map((item, index) => {
                        return (
                          <option key={index} value={item}>
                            {item}
                          </option>
                        )
                      })}
                    </select>
                  )
                }}
              />
              <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
            </div>
          </div>
          <div className="col-span-1 flex items-center h-14 px-2 bg-[#fff] dark:bg-darkBorder border border-[#dadada]">
            <span className="w-[30%]">Thể loại</span>
            <div className="w-[70%] relative h-full">
              <Controller
                name="category"
                control={controlFormSearch}
                render={({ field }) => {
                  return (
                    <select
                      // {...field}
                      value={field.value ?? ""} // ✅ Giá trị từ form
                      onChange={(e) => field.onChange(e.target.value ? e.target.value : undefined)} // ✅ Cập nhật vào form
                      className="p-2 border border-gray-300 dark:border-darkBorder bg-[#f2f2f2] dark:bg-black w-full mt-2 rounded-md"
                    >
                      <option value="" disabled selected>
                        -- Chọn thể loại --
                      </option>
                      {listNameCategoryResult?.map((item, index) => {
                        return (
                          <option key={index} value={item}>
                            {item}
                          </option>
                        )
                      })}
                    </select>
                  )
                }}
              />
              <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
            </div>
          </div>
          <div className="col-span-1 flex items-center h-14 px-2 bg-[#fff] dark:bg-darkBorder border border-[#dadada] border-t-0 rounded-tr-md">
            <span className="w-[30%]">Lọc theo giá</span>
            <div className="w-[70%] relative h-full">
              <div className="flex items-center justify-between gap-2">
                <Controller
                  name="price_min"
                  control={controlFormSearch}
                  render={({ field }) => {
                    return (
                      <InputNumber
                        type="text"
                        placeholder="đ Từ"
                        autoComplete="on"
                        classNameInput="p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-black focus:border-blue-500 focus:ring-1 outline-none rounded-md h-[35px]"
                        className="relative mt-2 flex-grow"
                        value={field.value}
                        ref={field.ref}
                        onChange={(event) => {
                          field.onChange(event)
                          trigger("price_max")
                        }}
                        classNameError="hidden"
                      />
                      /**
                       * price_min và price_max có liên quan đến nhau (vì giá trị của price_max phụ thuộc vào price_min và ngược lại).
                       * Do đó, khi một trong hai thay đổi, bạn cần gọi trigger để kiểm tra lại cả hai field.
                       */
                    )
                  }}
                />
                <span>-</span>
                <Controller
                  name="price_max"
                  control={controlFormSearch}
                  render={({ field }) => {
                    return (
                      <InputNumber
                        type="text"
                        placeholder="đ Đến"
                        autoComplete="on"
                        classNameInput="p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-black focus:border-blue-500 focus:ring-1 outline-none rounded-md h-[35px]"
                        className="relative mt-2 flex-grow"
                        value={field.value}
                        ref={field.ref}
                        onChange={(event) => {
                          field.onChange(event)
                          trigger("price_min")
                        }}
                        classNameError="hidden"
                      />
                      /**
                       * price_min và price_max có liên quan đến nhau (vì giá trị của price_max phụ thuộc vào price_min và ngược lại).
                       * Do đó, khi một trong hai thay đổi, bạn cần gọi trigger để kiểm tra lại cả hai field.
                       */
                    )
                  }}
                />
              </div>
              <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
            </div>
          </div>
          <div className="col-span-1 flex items-center h-14 px-2 bg-[#ececec] dark:bg-darkBorder border border-[#dadada] rounded-bl-md border-t-0">
            <span className="w-[30%]">Ngày tạo</span>
            <div className="w-[70%] relative h-full">
              <div className="mt-2 w-full flex items-center gap-2">
                <Controller
                  name="created_at_start"
                  control={controlFormSearch}
                  render={({ field }) => {
                    return (
                      <DatePicker
                        value={field.value as Date}
                        onChange={(e) => {
                          field.onChange(e)
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
          <div className="col-span-1 flex items-center h-14 px-2 bg-[#ececec] dark:bg-darkBorder  border border-[#dadada] border-t-0 rounded-br-md">
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
          <div className="col-span-1 flex items-center h-14 px-2 bg-[#fff] dark:bg-darkBorder border border-[#dadada] border-t-0">
            <span className="w-[30%]">Trạng thái</span>
            <div className="w-[70%] relative h-full">
              <Controller
                name="status"
                control={controlFormSearch}
                render={({ field }) => {
                  return (
                    <select
                      // {...field}
                      value={field.value ?? ""} // ✅ Giá trị từ form
                      onChange={(e) => field.onChange(e.target.value ? e.target.value : undefined)} // ✅ Cập nhật vào form
                      className="p-2 border border-gray-300 dark:border-darkBorder bg-[#f2f2f2] dark:bg-black w-full mt-2 rounded-md"
                    >
                      <option value="" disabled selected>
                        -- Chọn trạng thái --
                      </option>
                      <option value="available">Còn hàng</option>
                      <option value="out_of_stock">Hết hàng</option>
                      <option value="discontinued">Ngừng kinh doanh</option>
                    </select>
                  )
                }}
              />
              <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
            </div>
          </div>
        </div>
        <div className="flex justify-between mt-4">
          <div className="flex gap-2">
            <div className="flex items-center justify-end gap-2">
              <Link
                to={path.AddProduct}
                className="p-2 bg-blue-500 w-full text-white font-medium rounded-md hover:bg-blue-500/80 duration-200 text-[13px] flex items-center gap-1"
              >
                <Plus size={15} />
                <span>Thêm mới</span>
              </Link>
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
