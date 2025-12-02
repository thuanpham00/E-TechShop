/* eslint-disable @typescript-eslint/no-explicit-any */
import { Helmet } from "react-helmet-async"
import NavigateBack from "src/Admin/Components/NavigateBack"
import Input from "src/Components/Input"
import { useMutation, useQuery } from "@tanstack/react-query"
import { ErrorResponse, SuccessResponse } from "src/Types/utils.type"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { useContext, useEffect, useRef, useState } from "react"
import Button from "src/Components/Button"
import { schemaAddProduct, SchemaAddProductType } from "src/Client/Utils/rule"
import { yupResolver } from "@hookform/resolvers/yup"
import TextEditor from "src/Admin/Components/TextEditor"
import { toast } from "react-toastify"
import { CreateProductBodyReq, ProductItemType } from "src/Types/product.type"
import { isError422 } from "src/Helpers/utils"
import { motion } from "framer-motion"
import { CategoryAPI } from "src/Apis/admin/category.api"
import { BrandAPI } from "src/Apis/admin/brand.api"
import { ProductAPI } from "src/Apis/admin/product.api"
import { Alert, Modal, Select } from "antd"
import { LoadingOutlined } from "@ant-design/icons"
import { useLocation, useNavigate } from "react-router-dom"
import InputBanner from "./Components/InputBanner/InputBanner"
import InputGallery from "./Components/InputGallery"
import { path } from "src/Constants/path"
import { listSpecificationForCategory } from "src/Constants/product"
import { formatCurrency } from "src/Helpers/common"
import { AppContext } from "src/Context/authContext"
import { useCheckPermission } from "src/Hook/useRolePermissions"

type CategoryType = keyof typeof listSpecificationForCategory

const formData = schemaAddProduct.pick([
  "name",
  "brand",
  "category",
  "price",
  "discount",
  "isFeatured",
  "description",
  "specifications",
  "banner",
  "medias",
  "priceAfterDiscount"
]) // validate field

type FormData = Pick<
  SchemaAddProductType,
  | "name"
  | "brand"
  | "category"
  | "price"
  | "discount"
  | "stock"
  | "sold"
  | "status"
  | "viewCount"
  | "isFeatured"
  | "description"
  | "specifications"
  | "banner"
  | "medias"
  | "priceAfterDiscount"
> // field trong form

export type GalleryFileItem = {
  file: File | null
  existingUrl: string | null
  id: string | null
}

export default function AddProduct() {
  const { permissions } = useContext(AppContext)
  const { hasPermission } = useCheckPermission(permissions)

  const { state } = useLocation()
  const editItem = state?.editItem as boolean | ProductItemType

  // lấy danh sách tên category
  const getNameCategory = useQuery({
    queryKey: ["nameCategory"],
    queryFn: () => {
      return CategoryAPI.getNameCategory()
    }
  })
  const listNameCategory = getNameCategory.data?.data as SuccessResponse<{
    result: string[]
  }>
  const listNameCategoryResult = listNameCategory?.result.result

  // lấy danh sách tên brand
  const getNameBrand = useQuery({
    queryKey: ["nameBrand"],
    queryFn: () => {
      return BrandAPI.getNameBrand()
    }
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
    watch,
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

  const [banner, setBanner] = useState<GalleryFileItem>({
    file: null,
    existingUrl: null,
    id: null
  })

  const [galleryFiles, setGalleryFiles] = useState<GalleryFileItem[]>([
    {
      file: null,
      existingUrl: null,
      id: null
    },
    {
      file: null,
      existingUrl: null,
      id: null
    },
    {
      file: null,
      existingUrl: null,
      id: null
    },
    {
      file: null,
      existingUrl: null,
      id: null
    }
  ])

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
      setValue("priceAfterDiscount", editItem.priceAfterDiscount)
      setValue("stock", editItem.stock)
      setValue("sold", editItem.sold)
      setValue("viewCount", editItem.viewCount)
      setValue(
        "status",
        editItem.status === "out_of_stock"
          ? "Hết hàng"
          : editItem.status === "available"
            ? "Còn hàng"
            : "Ngừng kinh doanh"
      )

      if (editItem.banner) {
        setBanner({
          id: editItem.banner.id,
          existingUrl: editItem.banner.url,
          file: null
        })
      }

      if (editItem.medias?.length > 0) {
        setGalleryFiles((prev) =>
          prev.map((file, index) => ({
            ...file,
            existingUrl: editItem.medias[index]?.url || null,
            id: editItem.medias[index]?.id || null
          }))
        )
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
    })) // kiểu dữ liệu của 'specifications' là mảng các object với 'name' và 'value'

    replace(array)
    bootstrappedRef.current = true
  }, [selectedCategory, replace, getValues])

  useEffect(() => {
    if (banner.file) {
      // Case 1: Thêm mới → setValue file name
      setValue("banner", banner.file.name)
    } else if (typeof editItem === "object" && banner.existingUrl) {
      // Case 2: Edit → setValue URL để pass validation
      setValue("banner", banner.existingUrl)
    }
  }, [setValue, banner, editItem])

  useEffect(() => {
    const mediaNames = galleryFiles.filter((file) => file !== null).map((item) => item.file?.name)
    setValue("medias", mediaNames)
  }, [setValue, galleryFiles])

  // xử lý thêm sản phẩm
  const saveProductMutation = useMutation({
    mutationFn: (payload: { body: CreateProductBodyReq; id?: string }) => {
      return payload.id ? ProductAPI.updateProduct(payload.body, payload.id) : ProductAPI.addProduct(payload.body)
    }
  })

  const price = watch("price")
  const discount = watch("discount")

  useEffect(() => {
    if (!price || price === 0) {
      setValue("priceAfterDiscount", 0)
      return
    }

    const numericPrice = typeof price === "string" ? Number((price as any).replace(/\./g, "")) : Number(price)

    const numericDiscount = discount || 0

    const calculatedPrice = Math.round(numericPrice * (1 - numericDiscount / 100))

    setValue("priceAfterDiscount", calculatedPrice)
  }, [price, discount, setValue])

  const navigate = useNavigate()
  const handleSubmitAddProduct = handleSubmit(
    (data) => {
      const isEdit = !!(editItem && typeof editItem === "object")
      const body: CreateProductBodyReq = {
        name: data.name,
        category: data.category,
        brand: data.brand,
        price: data.price,
        discount: data.discount,
        priceAfterDiscount: data.priceAfterDiscount as number,
        isFeatured: data.isFeatured as string,
        description: data.description,
        banner: banner.file as File,
        medias: galleryFiles.map((item) => item.file) as File[],
        specifications: data.specifications,
        id_url_gallery_update: isEdit
          ? galleryFiles
              .filter((item) => {
                // case 1: Có file mới thay thế ảnh cũ
                if (item.file !== null && item.id !== null) return true
                // case 2: Không có file mới nhưng xóa ảnh cũ
                if (item.file === null && item.existingUrl === null && item.id !== null) return true
                return false
              })
              .map((item) => item.id as string)
          : undefined
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

            setTimeout(() => {
              navigate(path.AdminProducts)
            }, 1500)

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
              setBanner({
                id: null,
                file: null,
                existingUrl: null
              })
              setGalleryFiles([
                {
                  file: null,
                  existingUrl: null,
                  id: null
                },
                {
                  file: null,
                  existingUrl: null,
                  id: null
                },
                {
                  file: null,
                  existingUrl: null,
                  id: null
                },
                {
                  file: null,
                  existingUrl: null,
                  id: null
                }
              ])
              setSelectedCategory(null)
            }
          },
          onError: (error) => {
            if (isError422<ErrorResponse<FormData>>(error)) {
              const formError = error.response?.data.errors
              if (formError?.name) {
                setError("name", {
                  message: (formError?.name as any).msg
                })
              }
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

  const [isModalOpen, setIsModalOpen] = useState(false)

  const deleteProductMutation = useMutation({
    mutationFn: (idProduct: string) => {
      return ProductAPI.deleteProduct(idProduct)
    }
  })

  const handleDeleteProduct = (idProduct: string) => {
    if (editItem && typeof editItem === "object") {
      deleteProductMutation.mutate(idProduct, {
        onSuccess: () => {
          toast.success("Xóa sản phẩm thành công!", { autoClose: 1500 })
          navigate(path.AdminProducts)
        },
        onError: (error) => {
          toast.error((error as any).response?.data.message || "", { autoClose: 1500 })
        }
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Helmet>
        <title>Quản lý sản phẩm</title>
        <meta
          name="description"
          content="Đây là trang TECHZONE | Laptop, PC, Màn hình, điện thoại, linh kiện Chính Hãng"
        />
      </Helmet>

      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-6">
        <NavigateBack />
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
            <span className="inline-block w-1 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></span>
            {editItem && typeof editItem === "object" ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
            {editItem && typeof editItem === "object"
              ? "Chỉnh sửa thông tin sản phẩm của bạn"
              : "Điền đầy đủ thông tin để thêm sản phẩm mới"}
          </p>
        </motion.div>
      </div>

      {/* Form Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="max-w-7xl mx-auto"
      >
        <form onSubmit={handleSubmitAddProduct} className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          {/* Left Column - Images */}
          <div className="lg:col-span-3 space-y-6">
            {/* Banner Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-750 p-5 border-b border-gray-200 dark:border-gray-600">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Ảnh sản phẩm
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Tải lên ảnh chất lượng cao để thu hút khách hàng
                </p>
              </div>
              <div className="p-6">
                <InputBanner errors={errors.banner?.message} banner={banner} setBanner={setBanner} />
                <InputGallery
                  errors={errors.medias?.message}
                  galleryFiles={galleryFiles}
                  setGalleryFiles={setGalleryFiles}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="lg:col-span-4 space-y-6">
            {/* Basic Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-750 p-5 border-b border-gray-200 dark:border-gray-600">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Thông tin cơ bản
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {typeof editItem === "object" && editItem !== null && (
                  <div className="group">
                    <Input
                      name="id"
                      value={editItem._id}
                      classNameLabel="font-semibold text-gray-700 dark:text-gray-300 mb-2 block"
                      nameInput="Mã sản phẩm"
                      classNameInput="mt-1 p-3 w-full border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all duration-200 text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400 bg-gray-200"
                    />
                  </div>
                )}
                {/* Product Name */}
                <div className="group">
                  <Input
                    name="name"
                    classNameLabel="font-semibold text-gray-700 dark:text-gray-300 mb-2 block"
                    register={register}
                    placeholder="VD: Laptop ASUS ROG Strix G15"
                    messageErrorInput={errors.name?.message}
                    nameInput="Tên sản phẩm"
                    classNameInput="mt-1 p-3 w-full border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all duration-200 text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400"
                  />
                </div>

                {/* Category & Brand */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Category */}
                  <div className="space-y-2">
                    <div className="font-semibold text-gray-700 dark:text-gray-300 block">Danh mục</div>
                    <Controller
                      name="category"
                      control={control}
                      render={({ field }) => (
                        <Select
                          size="large"
                          style={{ width: "100%" }}
                          value={field.value ?? ""}
                          onChange={(value) => {
                            const selected = value || undefined
                            field.onChange(selected)
                            setSelectedCategory(selected as CategoryType)
                          }}
                          className="custom-select"
                          placeholder="Chọn danh mục"
                          suffixIcon={
                            <svg
                              className="w-4 h-4 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          }
                        >
                          <Select.Option value="" disabled>
                            -- Chọn danh mục --
                          </Select.Option>
                          {listNameCategoryResult?.map((item, index) => (
                            <Select.Option key={index} value={item}>
                              <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                {item}
                              </span>
                            </Select.Option>
                          ))}
                        </Select>
                      )}
                    />
                    {errors.category?.message && (
                      <motion.span
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-xs font-medium block mt-1"
                      >
                        {errors.category.message}
                      </motion.span>
                    )}
                  </div>

                  {/* Brand */}
                  <div className="space-y-2">
                    <div className="font-semibold text-gray-700 dark:text-gray-300 block">Thương hiệu</div>
                    <Controller
                      name="brand"
                      control={control}
                      render={({ field }) => (
                        <Select
                          size="large"
                          style={{ width: "100%" }}
                          value={field.value ?? ""}
                          onChange={(value) => field.onChange(value || undefined)}
                          className="custom-select"
                          placeholder="Chọn thương hiệu"
                          suffixIcon={
                            <svg
                              className="w-4 h-4 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          }
                        >
                          <Select.Option value="" disabled>
                            -- Chọn thương hiệu --
                          </Select.Option>
                          {listNameBrandResult?.map((item, index) => (
                            <Select.Option key={index} value={item}>
                              <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                {item}
                              </span>
                            </Select.Option>
                          ))}
                        </Select>
                      )}
                    />
                    {errors.brand?.message && (
                      <motion.span
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-xs font-medium block mt-1"
                      >
                        {errors.brand.message}
                      </motion.span>
                    )}
                  </div>
                </div>

                {/* Price & Discount */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="relative">
                    <Input
                      name="price"
                      classNameLabel="font-semibold text-gray-700 dark:text-gray-300 mb-2 block"
                      register={register}
                      placeholder="0"
                      messageErrorInput={errors.price?.message}
                      nameInput="Giá sản phẩm"
                      classNameInput="mt-1 p-3 w-full border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-green-500 focus:ring-4 focus:ring-green-100 dark:focus:ring-green-900 outline-none transition-all duration-200 text-gray-900 dark:text-white dark:bg-gray-700"
                      control={control}
                      isCurrency={true}
                      currencySuffix="đ"
                    />
                  </div>
                  <div className="relative">
                    <Input
                      name="discount"
                      classNameLabel="font-semibold text-gray-700 dark:text-gray-300 mb-2 block"
                      register={register}
                      placeholder="0"
                      messageErrorInput={errors.discount?.message}
                      nameInput="Giảm giá (%)"
                      classNameInput="mt-1 p-3 w-full border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-orange-500 focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900 outline-none transition-all duration-200 text-gray-900 dark:text-white dark:bg-gray-700"
                    />
                    <div className="absolute right-3 top-[50px] text-gray-400 pointer-events-none">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="group">
                  <Input
                    name="priceAfterDiscount"
                    classNameLabel="font-semibold text-gray-700 dark:text-gray-300 mb-2 block"
                    register={register}
                    nameInput="Giá sau khi giảm"
                    classNameInput="mt-1 p-3 w-full border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all duration-200 text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400 bg-gray-200"
                    control={control}
                    isCurrency={true}
                    currencySuffix="đ"
                    value={formatCurrency(watch("priceAfterDiscount") || 0)}
                  />
                </div>

                {/* Hidden Stock Field */}
                <div className={`${typeof editItem === "object" ? "block" : "hidden"}`}>
                  <div className="grid grid-cols-2 gap-5">
                    <Input
                      name="stock"
                      classNameLabel="font-semibold text-gray-700 dark:text-gray-300 mb-2 block"
                      register={register}
                      placeholder="0"
                      nameInput="Số lượng trong kho"
                      classNameInput="mt-1 p-3 w-full border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all duration-200 text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400 bg-gray-200"
                      disabled
                    />
                    <Input
                      name="sold"
                      classNameLabel="font-semibold text-gray-700 dark:text-gray-300 mb-2 block"
                      register={register}
                      placeholder="0"
                      nameInput="Số lượng đã bán"
                      classNameInput="mt-1 p-3 w-full border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all duration-200 text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400 bg-gray-200"
                      disabled
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <Input
                      name="viewCount"
                      classNameLabel="font-semibold text-gray-700 dark:text-gray-300 mb-2 block"
                      register={register}
                      placeholder="0"
                      nameInput="Lượt xem sản phẩm"
                      classNameInput="mt-1 p-3 w-full border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all duration-200 text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400 bg-gray-200"
                      disabled
                    />
                    <div className="relative">
                      <Input
                        name="status"
                        register={register}
                        placeholder="Trạng thái"
                        nameInput="Trạng thái sản phẩm"
                        classNameLabel="font-semibold text-gray-700 dark:text-gray-300 mb-2 block"
                        classNameInput={`mt-1 p-3 w-full rounded-lg outline-none transition-all duration-200 font-semibold text-center ${
                          typeof editItem === "object" && editItem.status === "out_of_stock"
                            ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-2 border-red-300 dark:border-red-700"
                            : typeof editItem === "object" && editItem.status === "available"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-2 border-green-300 dark:border-green-700"
                              : "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-2 border-orange-300 dark:border-orange-700"
                        }`}
                        disabled
                      />

                      {/* Icon overlay */}
                      <div className="absolute left-3 top-[60%] -translate-y-1/2 pointer-events-none">
                        {typeof editItem === "object" && editItem.status === "out_of_stock" && (
                          <svg
                            className="w-5 h-5 text-red-600 dark:text-red-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                        {typeof editItem === "object" && editItem.status === "available" && (
                          <svg
                            className="w-5 h-5 text-green-600 dark:text-green-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                        {typeof editItem === "object" && editItem.status === "discontinued" && (
                          <svg
                            className="w-5 h-5 text-orange-600 dark:text-orange-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Featured Product Toggle */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-gray-700 dark:to-gray-750 rounded-xl border-2 border-amber-200 dark:border-amber-900">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                      <svg
                        className="w-5 h-5 text-amber-600 dark:text-amber-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">Sản phẩm nổi bật</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Hiển thị trong trang chủ</p>
                    </div>
                  </div>
                  <Controller
                    name="isFeatured"
                    control={control}
                    render={({ field }) => (
                      // eslint-disable-next-line jsx-a11y/label-has-associated-control
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={field.value === "true"}
                          onChange={(e) => field.onChange(e.target.checked ? "true" : "false")}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-600"></div>
                      </label>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-750 p-5 border-b border-gray-200 dark:border-gray-600">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Thông số kỹ thuật
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {selectedCategory ? `Thông số cho ${selectedCategory}` : "Chọn danh mục để hiển thị thông số"}
                </p>
              </div>
              <div className="p-6">
                {fields.length > 0 ? (
                  <div className="space-y-3">
                    {fields.map((spec, index) => (
                      <motion.div
                        key={spec.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="grid grid-cols-3 gap-3 group"
                      >
                        <div className="col-span-1 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-750 p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg border-l-4 border-l-blue-500 font-medium text-gray-700 dark:text-gray-300 flex items-center text-sm group-hover:border-l-blue-600 transition-colors">
                          {spec.name}
                        </div>
                        <input
                          type="text"
                          className="col-span-2 p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all duration-200 text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400"
                          placeholder={`Nhập ${spec.name.toLowerCase()}`}
                          {...register(`specifications.${index}.value`)}
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Chưa có thông số kỹ thuật</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Chọn danh mục để hiển thị</p>
                    {errors.specifications?.message && (
                      <motion.span
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-xs font-medium block mt-3"
                      >
                        {errors.specifications.message}
                      </motion.span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-gray-700 dark:to-gray-750 p-5 border-b border-gray-200 dark:border-gray-600">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  Mô tả sản phẩm
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Mô tả chi tiết về sản phẩm</p>
              </div>
              <div className="p-6">
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => <TextEditor value={field.value} setValue={field.onChange} />}
                />
                {errors.description?.message && (
                  <motion.span
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-xs font-medium block mt-3"
                  >
                    {errors.description.message}
                  </motion.span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 sticky bottom-4 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
              {editItem && typeof editItem === "object" && (
                <Button
                  classNameButton="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2 "
                  nameButton="Xóa sản phẩm"
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  disabled={!hasPermission("product:delete")}
                />
              )}
              <Button
                icon={isSubmitting ? <LoadingOutlined spin /> : undefined}
                classNameButton="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                nameButton={
                  isSubmitting
                    ? "Đang xử lý..."
                    : editItem && typeof editItem === "object"
                      ? "Cập nhật sản phẩm"
                      : "Thêm sản phẩm"
                }
                type="submit"
                disabled={isSubmitting || (!hasPermission("product:update") && !hasPermission("product:create"))}
              />
            </div>
          </div>
        </form>
      </motion.div>

      <Modal
        title="Xóa sản phẩm"
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpen}
        onOk={() => handleDeleteProduct((editItem as ProductItemType)._id as string)}
        onCancel={() => setIsModalOpen(false)}
        okText="Xác nhận xóa"
        cancelText="Hủy bỏ"
      >
        <Alert
          message="Cảnh báo"
          description="Bạn sắp xóa sản phẩm này. Hành động này không thể hoàn tác!"
          type="warning"
          showIcon
        />
      </Modal>
    </div>
  )
}
