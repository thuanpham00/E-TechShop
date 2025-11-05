/* eslint-disable @typescript-eslint/no-explicit-any */
import { PencilLine } from "lucide-react"
import { Helmet } from "react-helmet-async"
import NavigateBack from "src/Admin/Components/NavigateBack"
import Input from "src/Components/Input"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ErrorResponse, SuccessResponse } from "src/Types/utils.type"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { useEffect, useRef, useState } from "react"
import Button from "src/Components/Button"
import { schemaAddProduct, SchemaAddProductType } from "src/Client/Utils/rule"
import { yupResolver } from "@hookform/resolvers/yup"
import TextEditor from "src/Admin/Components/TextEditor"
import { toast } from "react-toastify"
import { CreateProductBodyReq, ProductItemType } from "src/Types/product.type"
import { isError400 } from "src/Helpers/utils"
import { motion } from "framer-motion"
import { CategoryAPI } from "src/Apis/admin/category.api"
import { BrandAPI } from "src/Apis/admin/brand.api"
import { ProductAPI } from "src/Apis/admin/product.api"
import { Select } from "antd"
import { LoadingOutlined } from "@ant-design/icons"
import { useLocation } from "react-router-dom"
import InputBanner from "./Components/InputBanner/InputBanner"
import InputGallery from "./Components/InputGallery"
import { queryParamConfigProduct } from "src/Types/queryParams.type"

const listSpecificationForCategory = {
  Laptop: [
    "Cpu",
    "Ram",
    "Ổ cứng",
    "Card đồ họa",
    "Màn hình",
    "Bàn phím",
    "Webcam",
    "Hệ điều hành",
    "Pin",
    "Trọng lượng",
    "Màu sắc",
    "Bảo hành"
  ],
  "Laptop Gaming": [
    "Cpu",
    "Ram",
    "Ổ cứng",
    "Card đồ họa",
    "Màn hình",
    "Bàn phím",
    "Webcam",
    "Hệ điều hành",
    "Pin",
    "Trọng lượng",
    "Màu sắc",
    "Bảo hành"
  ],
  "PC GVN": ["Mainboard", "Cpu", "Ram", "Vga", "Ssd", "Hhd", "Psu", "Case", "Tản nhiệt"],
  "Màn hình": [
    "Thời gian phản hồi",
    "Độ phân giải",
    "Tần số quét",
    "Kiểu màn hình",
    "Tấm nền",
    "Kích thước",
    "Bảo hành"
  ],
  "Bàn phím": ["Layout", "Cấu trúc", "Switch", "Pin", "Kết nối", "Led", "Key-cap", "Trọng lượng", "Bảo hành"]
} as const

type CategoryType = keyof typeof listSpecificationForCategory

const formData = schemaAddProduct.pick([
  "name",
  "brand",
  "category",
  "price",
  "discount",
  "stock",
  "isFeatured",
  "description",
  "specifications",
  "banner",
  "medias"
])

type FormData = Pick<
  SchemaAddProductType,
  | "name"
  | "brand"
  | "category"
  | "price"
  | "discount"
  | "stock"
  | "isFeatured"
  | "description"
  | "specifications"
  | "banner"
  | "medias"
>

export default function AddProduct() {
  const { state } = useLocation()
  const queryClient = useQueryClient()
  const editItem = state?.editItem as boolean | ProductItemType
  const queryConfig = state?.queryConfig as queryParamConfigProduct

  const getNameCategory = useQuery({
    queryKey: ["nameCategory"],
    queryFn: () => {
      return CategoryAPI.getNameCategory()
    },
    retry: 0,
    staleTime: 10 * 60 * 1000,
    placeholderData: keepPreviousData
  })

  const listNameCategory = getNameCategory.data?.data as SuccessResponse<{
    result: string[]
  }>

  const listNameCategoryResult = listNameCategory?.result.result

  const getNameBrand = useQuery({
    queryKey: ["nameBrand"],
    queryFn: () => {
      return BrandAPI.getNameBrand()
    },
    retry: 0,
    staleTime: 10 * 60 * 1000,
    placeholderData: keepPreviousData
  })

  const listNameBrand = getNameBrand.data?.data as SuccessResponse<{
    result: string[]
  }>

  const listNameBrandResult = listNameBrand?.result.result

  // xử lý form
  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    setError,
    getValues,
    formState: { errors }
  } = useForm<FormData>({ resolver: yupResolver(formData) })

  // xử lý specifications
  const { fields, replace } = useFieldArray({
    control, // Liên kết với form.
    name: "specifications" // Quản lý trường specifications trong form.
  }) // thiết kế để quản lý các trường dạng mảng trong form. Nó giúp bạn dễ dàng thêm, xóa, cập nhật, hoặc thay thế các phần tử trong mảng mà không cần dùng useState thủ công.

  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null)
  const initialSpecsRef = useRef<{ name: string; value: string }[]>([])
  const bootstrappedRef = useRef(false)
  const [existingBannerUrl, setExistingBannerUrl] = useState<string>("")
  const [existingGalleryUrls, setExistingGalleryUrls] = useState<string[]>([])

  useEffect(() => {
    if (editItem && typeof editItem === "object") {
      const category = editItem.category.name
      setSelectedCategory(category as CategoryType)
      setValue("name", editItem.name)
      setValue("brand", editItem.brand.name)
      setValue("category", editItem.category.name)
      setValue("price", editItem.price)
      setValue("discount", editItem.discount)
      setValue("isFeatured", editItem.isFeatured.toString())
      setValue("description", editItem.description)
      setValue("banner", editItem.banner.url)

      if (editItem.banner.url) {
        setExistingBannerUrl(editItem.banner.url)
      }

      if (editItem.medias?.length > 0) {
        const urls = editItem.medias.map((item) => item.url)
        setExistingGalleryUrls(urls)
      }

      const mapped = (editItem as ProductItemType).specifications.map((item) => ({
        name: item.name,
        value: item.value
      }))

      initialSpecsRef.current = mapped
      replace(mapped)
      bootstrappedRef.current = false
    }
  }, [editItem, setValue, replace])

  useEffect(() => {
    if (!selectedCategory) {
      replace([])
      return
    }

    const source = !bootstrappedRef.current ? initialSpecsRef.current || [] : getValues("specifications")

    const dict = new Map(source.map((item) => [item.name, item.value]))
    const array = listSpecificationForCategory[selectedCategory].map((name) => ({
      name,
      value: dict.get(name) ?? ""
    }))

    replace(array)
    bootstrappedRef.current = true
  }, [selectedCategory, replace, getValues])

  // xử lý banner
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    if (file) {
      setValue("banner", file.name) // tên ảnh
    }
  }, [setValue, file])

  const [galleryFiles, setGalleryFiles] = useState<(File | null)[]>([null, null, null, null])

  useEffect(() => {
    const mediaNames = galleryFiles.filter((file) => file !== null).map((item) => item.name)
    setValue("medias", mediaNames)
  }, [setValue, galleryFiles])

  // xử lý thêm sản phẩm
  const saveProductMutation = useMutation({
    mutationFn: (payload: { body: CreateProductBodyReq; id?: string }) => {
      return payload.id ? ProductAPI.updateProduct(payload.body, payload.id) : ProductAPI.addProduct(payload.body)
    }
  })

  const handleSubmitAddProduct = handleSubmit(
    (data) => {
      const isEdit = !!(editItem && typeof editItem === "object")
      const body: CreateProductBodyReq = {
        name: data.name,
        category: data.category,
        brand: data.brand,
        price: data.price,
        discount: data.discount,
        stock: data.stock,
        isFeatured: data.isFeatured as string,
        description: data.description,
        banner: file as File,
        medias: galleryFiles as File[],
        specifications: data.specifications
      }
      saveProductMutation.mutate(
        {
          body,
          id: isEdit ? (editItem as ProductItemType)._id : undefined
        },
        {
          onSuccess: () => {
            toast.success(isEdit ? "Cập nhật sản phẩm thành công!" : "Thêm sản phẩm thành công!", {
              autoClose: 1500
            })
            queryClient.invalidateQueries({ queryKey: ["listProduct", queryConfig] })
            if (!isEdit) {
              reset({
                name: "",
                brand: "",
                category: "",
                price: "" as any,
                discount: "" as any,
                stock: undefined,
                banner: "",
                isFeatured: "false",
                description: "",
                medias: [],
                specifications: []
              })
              setFile(null)
              setGalleryFiles([null, null, null, null])
              setSelectedCategory(null)
            }
          },
          onError: (error) => {
            if (isError400<ErrorResponse<FormData>>(error)) {
              const formError = error.response?.data
              setError("name", {
                message: (formError as any).message
              })
            }
          }
        }
      )
    },
    (error) => {
      console.log(error)
    }
  )

  const isSubmitting = saveProductMutation.isPending

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
        {editItem && typeof editItem === "object" ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
      </h1>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <form onSubmit={handleSubmitAddProduct} className="grid grid-cols-7 gap-4">
          <div className="col-span-3 bg-white dark:bg-darkPrimary border border-[#dedede] dark:border-darkBorder rounded-2xl shadow-xl">
            <div className="p-4 text-base font-semibold">Ảnh sản phẩm</div>
            <div className="h-[2px] w-full bg-[#f2f2f2]"></div>
            <div className="p-4 pt-2">
              <InputBanner
                errors={errors.banner?.message}
                file={file}
                setFile={setFile}
                existingBannerUrl={existingBannerUrl}
              />
              <InputGallery
                errors={errors.medias?.message}
                galleryFiles={galleryFiles}
                setGalleryFiles={setGalleryFiles}
                existingGalleryUrls={existingGalleryUrls}
              />
            </div>
          </div>
          <div className="col-span-4 bg-white dark:bg-darkPrimary border border-[#dedede] dark:border-darkBorder rounded-2xl shadow-xl">
            <div className="p-4 text-base font-semibold">Thông tin sản phẩm</div>
            <div className="h-[2px] w-full bg-[#f2f2f2]"></div>
            <div className="p-4 pt-2">
              <Input
                name="name"
                classNameLabel="font-semibold"
                register={register}
                placeholder="Nhập tên sản phẩm"
                messageErrorInput={errors.name?.message}
                nameInput="Tên sản phẩm"
                classNameInput="mt-1 p-2 w-full border border-[#dedede] rounded-sm focus:border-blue-500 focus:ring-2 outline-none text-black dark:text-white dark:bg-darkSecond dark:border-0"
              />
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <span className="font-semibold">Danh mục</span>
                  <div className="relative h-full">
                    <Controller
                      name="category"
                      control={control}
                      render={({ field }) => {
                        return (
                          <Select
                            // {...field}
                            style={{ width: "100%" }}
                            value={field.value ?? ""} // ✅ Giá trị từ form
                            onChange={(value) => {
                              const selected = value || undefined
                              field.onChange(selected)
                              setSelectedCategory(selected as "Laptop" | "Laptop Gaming" | "PC GVN" | "Màn hình") // set state danh mục đã chọn
                            }} // ✅ Cập nhật vào form
                          >
                            <Select.Option value="" disabled>
                              -- Chọn danh mục --
                            </Select.Option>
                            {listNameCategoryResult?.map((item, index) => {
                              return (
                                <Select.Option key={index} value={item}>
                                  {item}
                                </Select.Option>
                              )
                            })}
                          </Select>
                        )
                      }}
                    />
                  </div>
                  <button className="mt-1 flex items-center gap-1">
                    <span className="text-[13px] text-blue-500">Thêm thể loại</span>
                    <PencilLine size={14} color="blue" />
                  </button>
                  <span className="text-red-500 text-[13px] font-semibold min-h-[1.25rem] block">
                    {errors.category?.message}
                  </span>
                </div>
                <div className="flex-1">
                  <span className="font-semibold">Thương hiệu</span>
                  <div className="relative h-full">
                    <Controller
                      name="brand"
                      control={control}
                      render={({ field }) => {
                        return (
                          <Select
                            // {...field}
                            style={{ width: "100%" }}
                            value={field.value ?? ""} // ✅ Giá trị từ form
                            onChange={(value) => field.onChange(value ? value : undefined)} // ✅ Cập nhật vào form
                          >
                            <Select.Option value="" disabled>
                              -- Chọn thương hiệu --
                            </Select.Option>
                            {listNameBrandResult?.map((item, index) => {
                              return (
                                <Select.Option key={index} value={item}>
                                  {item}
                                </Select.Option>
                              )
                            })}
                          </Select>
                        )
                      }}
                    />
                  </div>
                  <button className="mt-1 flex items-center gap-1">
                    <span className="text-[13px] text-blue-500">Thêm thương hiệu</span>
                    <PencilLine size={14} color="blue" />
                  </button>
                  <span className="text-red-500 text-[13px] font-semibold min-h-[1.25rem] block">
                    {errors.brand?.message}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    name="price"
                    classNameLabel="font-semibold"
                    register={register}
                    placeholder="Nhập giá sản phẩm (đ)"
                    messageErrorInput={errors.price?.message}
                    nameInput="Giá sản phẩm (đ)"
                    classNameInput="mt-1 p-2 w-full border border-[#dedede] rounded-sm focus:border-blue-500 focus:ring-2 outline-none text-black dark:text-white dark:bg-darkSecond dark:border-0"
                    control={control}
                    isCurrency={true}
                    currencySuffix="đ"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    name="discount"
                    classNameLabel="font-semibold"
                    register={register}
                    placeholder="Nhập % khuyến mãi (nếu có)"
                    messageErrorInput={errors.discount?.message}
                    nameInput="Giảm giá (%)"
                    classNameInput="mt-1 p-2 w-full border border-[#dedede] rounded-sm focus:border-blue-500 focus:ring-2 outline-none text-black dark:text-white dark:bg-darkSecond dark:border-0"
                  />
                </div>
              </div>
              <div className="hidden">
                <Input
                  name="stock"
                  classNameLabel="font-semibold"
                  register={register}
                  placeholder="Nhập số lượng sản phẩm"
                  nameInput="Số lượng"
                  classNameInput="mt-1 p-2 w-full border border-[#dedede] rounded-sm focus:border-blue-500 focus:ring-2 outline-none text-black dark:text-white bg-[#f2f2f2] dark:bg-darkSecond dark:border-0"
                  value="0"
                  disabled
                />
              </div>

              <div className="flex items-center gap-2">
                <h2 className="font-semibold">Sản phẩm nổi bật</h2>
                <Controller
                  name="isFeatured"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      checked={field.value === "true"} // ✅ So sánh string
                      onChange={(e) => field.onChange(e.target.checked ? "true" : "false")} // ✅ Gán string
                    />
                  )}
                />
              </div>

              <div className="mt-4">
                <h2 className="font-semibold">Thông số kỹ thuật sản phẩm</h2>
                <div className="mt-2">
                  {fields.length > 0 ? (
                    fields?.map((spec, index) => {
                      return (
                        <div key={index} className="mb-2 flex items-stretch">
                          <span className="w-1/3 bg-[#f2f2f2] dark:bg-darkPrimary p-2 border border-[#dadada] rounded-tl-md rounded-bl-md border-l-4 border-l-gray-400">
                            {spec.name}
                          </span>
                          <input
                            type="text"
                            className="w-2/3 p-2 border border-gray-300 dark:bg-darkPrimary rounded-tr-md rounded-br-md border-l-0"
                            placeholder={`Nhập ${spec.name.toLowerCase()}`}
                            {...register(`specifications.${index}.value`)}
                          />
                        </div>
                      )
                    })
                  ) : (
                    <div className="w-full py-16 bg-[#e6e6e6] dark:bg-darkSecond rounded-md flex justify-center font-medium">
                      Danh sách thông số kĩ thuật
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <h2 className="font-semibold">Mô tả sản phẩm</h2>
                <div className="mt-2">
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => {
                      return (
                        <TextEditor
                          value={field.value} // truyền giá trị từ form
                          setValue={field.onChange}
                        />
                      )
                    }}
                  />
                </div>
                <div className="mt-2">
                  <span className="text-red-500 text-[13px] font-semibold min-h-[1.25rem] block">
                    {errors.description?.message}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button
                  classNameButton="mt-1 p-2 px-3 bg-red-500 text-white font-semibold rounded-sm hover:bg-red-500/80 duration-200"
                  nameButton="Xóa"
                  type="button"
                  onClick={() => {
                    reset({
                      name: "",
                      brand: "",
                      category: "",
                      price: "" as any,
                      discount: "" as any,
                      stock: undefined,
                      banner: "",
                      isFeatured: "false",
                      description: "",
                      medias: [],
                      specifications: []
                    })
                    setFile(null)
                    setGalleryFiles([null, null, null, null])

                    setSelectedCategory(null)
                  }}
                />
                <Button
                  icon={isSubmitting ? <LoadingOutlined spin /> : undefined}
                  classNameButton="mt-1 p-2 px-3 bg-blue-500 text-white font-semibold rounded-sm hover:bg-blue-500/80 duration-200"
                  nameButton={editItem && typeof editItem === "object" ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
                  type="submit"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

/**
 * interface Product {
name: string, // tên sản phẩm -> đã có
category: ObjectId, // thể loại -> đã có
brand: ObjectId, // thương hiệu -> đã có
price: number, // giá sản phẩm -> đã có
discount: number, // % giảm giá (nếu có) -> đã có
stock: number // số lượng tồn kho
description: string, // Mô tả sản phẩm chi tiết -> đã có
isFeatured: boolean, // Sản phẩm nổi bật -> đã có
specifications: ObjectId[] -> đã có
banner: Media, -> đã có
medias: Media[], // hình ảnh -> đã có

gifts: ObjectId[] -> 
_id: ObjectId, -> sinh ra trong lúc thêm

created_at: Date, -> sinh ra trong lúc thêm (thời gian hiện tại)

updated_at: Date, -> sinh ra trong lúc thêm (thời gian hiện tại)

status: ProductStatus -> sinh ra trong lúc thêm (nếu stock = 0 thì hết hàng còn nếu stock > 0 thì còn hàng)

viewCount: number,         // Số lượt xem -> sinh ra trong lúc thêm (=0)
sold: number, // số lượng đã bán -> sinh ra trong lúc thêm (=0)

averageRating: number // trung bình đánh giá -> rỗng

reviews: ObjectId[] -> rỗng
}
 */
