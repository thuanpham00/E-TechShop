/* eslint-disable @typescript-eslint/no-explicit-any */
import { PencilLine, Trash2, Upload } from "lucide-react"
import { Helmet } from "react-helmet-async"
import NavigateBack from "src/Admin/Components/NavigateBack"
import no_img from "src/Assets/img/no_image_1.jpg"
import no_img_1 from "src/Assets/img/no_image.png"
import Input from "src/Components/Input"
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query"
import { ErrorResponse, SuccessResponse } from "src/Types/utils.type"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { useEffect, useMemo, useRef, useState } from "react"
import Button from "src/Components/Button"
import { schemaAddProduct, SchemaAddProductType } from "src/Client/Utils/rule"
import { yupResolver } from "@hookform/resolvers/yup"
import TextEditor from "src/Admin/Components/TextEditor"
import { config } from "src/Constants/config"
import { toast } from "react-toastify"
import { CreateProductBodyReq } from "src/Types/product.type"
import { isError400 } from "src/Helpers/utils"
import { motion } from "framer-motion"
import { CategoryAPI } from "src/Apis/admin/category.api"
import { BrandAPI } from "src/Apis/admin/brand.api"
import { ProductAPI } from "src/Apis/admin/product.api"

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
  "banner",
  "isFeatured",
  "description",
  "medias",
  "specifications"
])

type FormData = Pick<
  SchemaAddProductType,
  | "name"
  | "brand"
  | "category"
  | "price"
  | "discount"
  | "stock"
  | "banner"
  | "isFeatured"
  | "description"
  | "medias"
  | "specifications"
>

export default function AddProduct() {
  const getNameCategory = useQuery({
    queryKey: ["nameCategory"],
    queryFn: () => {
      return CategoryAPI.getNameCategory()
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
      return BrandAPI.getNameBrand()
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 10 * 60 * 1000, // dưới 1 phút nó không gọi lại api
    placeholderData: keepPreviousData // giữ data cũ trong 1p
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
    formState: { errors }
  } = useForm<FormData>({ resolver: yupResolver(formData) })

  // xử lý specifications
  const { fields, replace } = useFieldArray({
    control, // Liên kết với form.
    name: "specifications" // Quản lý trường specifications trong form.
  }) // thiết kế để quản lý các trường dạng mảng trong form. Nó giúp bạn dễ dàng thêm, xóa, cập nhật, hoặc thay thế các phần tử trong mảng mà không cần dùng useState thủ công.

  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null)
  // const [specifications, setSpecifications] = useState<{ name: string; value: string }[]>([])

  useEffect(() => {
    if (selectedCategory) {
      // const array: { name: string; value: string }[] = []
      // listSpecificationForCategory[selectedCategory].map((item) => {
      //   array.push({
      //     name: item,
      //     value: ""
      //   })
      // })
      // setSpecifications(array)
      const array = listSpecificationForCategory[selectedCategory].map((item) => ({
        name: item,
        value: ""
      }))
      replace(array)
    } else {
      replace([])
    }
  }, [selectedCategory, replace])

  // const handleChangeInput = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const newSpecifications = [...specifications]
  //   newSpecifications[index] = {
  //     name: newSpecifications[index].name,
  //     value: event.target.value
  //   }
  //   setSpecifications(newSpecifications)
  // }

  // xử lý banner
  const [file, setFile] = useState<File | null>()
  const previewImage = useMemo(() => {
    if (file) {
      return file ? URL.createObjectURL(file) : ""
    }
  }, [file])

  const refBanner = useRef<HTMLInputElement>(null)
  const handleChangeBanner = () => {
    if (refBanner) {
      refBanner.current?.click()
    }
  }

  const onChangeImageBanner = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileFormLocal = event.target.files?.[0]

    if (fileFormLocal && (fileFormLocal.size >= config.maxSizeUploadImage || !fileFormLocal.type.includes("image"))) {
      toast.error("File vượt quá kích thước và không đúng định dạng ", {
        autoClose: 1500
      })
    } else {
      toast.success("File upload thành công", {
        autoClose: 1500
      })
    }

    setFile(fileFormLocal)
  }

  useEffect(() => {
    if (file) {
      setValue("banner", file.name) // tên ảnh
    }
  }, [setValue, file])

  // xử lý danh mục ảnh
  const refGallery = useRef<(HTMLInputElement | null)[]>([])
  useEffect(() => {
    refGallery.current = galleryFiles.map((_, index) => refGallery.current[index] || null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refGallery])
  /**
   * đảm bảo rằng refGallery.current luôn có cùng độ dài với galleryFiles, và các phần tử trong refGallery.current được giữ nguyên nếu đã tồn tại, hoặc được gán null nếu chưa có.
   */

  const [galleryFiles, setGalleryFiles] = useState<(File | null)[]>([null, null, null, null])
  const previewGallery = useMemo(() => {
    return galleryFiles.map((file) => (file ? URL.createObjectURL(file) : null))
  }, [galleryFiles])

  useEffect(() => {
    return () => {
      previewGallery.forEach((preview) => {
        if (preview) {
          return URL.revokeObjectURL(preview) // useEffect giúp bạn quản lý việc giải phóng bộ nhớ bằng URL.revokeObjectURL() một cách tự động và an toàn.
        }
      })
    }
  }, [previewGallery])

  const onChangeImageGallery = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileFormLocal = event.target.files?.[0]

    if (!fileFormLocal) {
      toast.error("Không có file nào được chọn", { autoClose: 1500 })
      return
    }

    if (fileFormLocal.size >= config.maxSizeUploadImage || !fileFormLocal.type.includes("image")) {
      toast.error("File vượt quá kích thước hoặc không đúng định dạng", { autoClose: 1500 })
      return
    }

    const newGalleryFiles = [...galleryFiles]
    newGalleryFiles[index] = fileFormLocal
    setGalleryFiles(newGalleryFiles)
  }

  useEffect(() => {
    const mediaNames = galleryFiles.filter((file) => file !== null).map((item) => item.name)
    setValue("medias", mediaNames)
    // khi mảng này có item nào đó khác null (là có ảnh) thì lấy setValue nếu mảng [] thì nó vi phạm yup min (1) 0 yc có ít nhất là 1 ảnh
  }, [setValue, galleryFiles])

  // xử lý thêm sản phẩm
  const addProductMutation = useMutation({
    mutationFn: (data: CreateProductBodyReq) => {
      return ProductAPI.addProduct(data)
    }
  })

  const handleSubmitAddProduct = handleSubmit((data) => {
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
    addProductMutation.mutate(body, {
      onSuccess: () => {
        toast.success("Thêm sản phẩm thành công!", {
          autoClose: 1500
        })
        reset()
        setFile(null)
        setGalleryFiles([null, null, null, null])

        setSelectedCategory(null)
      },
      onError: (error) => {
        if (isError400<ErrorResponse<FormData>>(error)) {
          const formError = error.response?.data
          setError("name", {
            message: (formError as any).message
          })
        }
      }
    })
  })

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
        Thêm sản phẩm
      </h1>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <form onSubmit={handleSubmitAddProduct} className="grid grid-cols-7 gap-4">
          <div className="col-span-3 bg-white dark:bg-darkPrimary border border-[#dedede] dark:border-darkBorder rounded-2xl shadow-xl">
            <div className="p-4 text-base font-semibold">Ảnh sản phẩm</div>
            <div className="h-[2px] w-full bg-[#f2f2f2]"></div>
            <div className="p-4 pt-2">
              <h2 className="font-medium">Ảnh đại diện</h2>
              <div className="relative">
                <img
                  src={previewImage || no_img}
                  alt="ảnh đại diện"
                  className={`rounded-md mt-2 ${previewImage ? "object-contain" : "object-cover"}  h-[400px] w-full`}
                />
                <input
                  className="hidden"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  ref={refBanner}
                  onChange={onChangeImageBanner}
                />
                {file ? (
                  <button onClick={() => setFile(null)} className="p-1 absolute top-2 right-2 bg-[#f1f1f1] rounded-sm">
                    <Trash2 color="red" size={18} />
                  </button>
                ) : (
                  ""
                )}
              </div>
              <button
                type="button"
                onClick={handleChangeBanner}
                className="mt-2 bg-[#f2f2f2] border border-[#dadada] py-2 px-4 rounded-md text-black text-[13px] shadow-sm hover:bg-[#dedede] duration-200 flex items-center gap-1"
              >
                <Upload size={14} />
                Thêm ảnh
              </button>
              <span className="mt-1 text-red-500 text-[13px] font-semibold min-h-[1.25rem] block">
                {errors.banner?.message}
              </span>
              <h2 className="mt-2 font-medium">Danh mục ảnh</h2>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {galleryFiles.map((file, index) => {
                  const handleChangeGalleryImage = () => {
                    refGallery.current[index]?.click()
                  }

                  const handleRemoveImage = () => {
                    const newGalleryFiles = [...galleryFiles]
                    newGalleryFiles[index] = null
                    setGalleryFiles(newGalleryFiles)
                  }

                  return (
                    <div key={index} className="relative col-span-2">
                      <img
                        className="rounded-md w-full object-cover"
                        src={previewGallery[index] || no_img_1}
                        alt={`ảnh sản phẩm ${index + 1}`}
                      />
                      <input
                        className="hidden"
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        ref={(el) => (refGallery.current[index] = el)}
                        onChange={onChangeImageGallery(index)}
                      />
                      {file ? (
                        <button
                          onClick={handleRemoveImage}
                          className="absolute top-0 right-0 bg-[#f2f2f2] p-1 rounded-sm"
                        >
                          <Trash2 color="red" size={18} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleChangeGalleryImage}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#fff] p-1 rounded-md text-black text-[13px] shadow-sm hover:bg-[#dedede] duration-200 flex items-center gap-1"
                        >
                          <Upload size={14} />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
              <span className="mt-1 text-red-500 text-[13px] font-semibold min-h-[1.25rem] block">
                {errors.medias?.message}
              </span>
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
                          <select
                            // {...field}
                            value={field.value ?? ""} // ✅ Giá trị từ form
                            onChange={(e) => {
                              const selected = e.target.value || undefined
                              field.onChange(selected)
                              setSelectedCategory(selected as "Laptop" | "Laptop Gaming" | "PC GVN" | "Màn hình") // set state danh mục đã chọn
                            }} // ✅ Cập nhật vào form
                            className="p-2 border border-gray-300 dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond w-full mt-2 rounded-md"
                          >
                            <option value="" disabled>
                              -- Chọn danh mục --
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
                          <select
                            // {...field}
                            value={field.value ?? ""} // ✅ Giá trị từ form
                            onChange={(e) => field.onChange(e.target.value ? e.target.value : undefined)} // ✅ Cập nhật vào form
                            className="p-2 border border-gray-300 dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond w-full mt-2 rounded-md"
                          >
                            <option value="" disabled>
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

              <div className="mt-2 flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    name="price"
                    classNameLabel="font-semibold"
                    register={register}
                    placeholder="Nhập giá sản phẩm (đ)"
                    messageErrorInput={errors.price?.message}
                    nameInput="Giá sản phẩm (đ)"
                    classNameInput="mt-1 p-2 w-full border border-[#dedede] rounded-sm focus:border-blue-500 focus:ring-2 outline-none text-black dark:text-white dark:bg-darkSecond dark:border-0"
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
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">Sản phẩm nổi bật</h2>
                <input type="checkbox" className="w-4 h-4" {...register("isFeatured")} />
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
                            // onChange={handleChangeInput(index)}
                          />
                          {/* <div className="mt-2">
                          <span>{errors.specifications[index]?.value?.message}</span>
                        </div> */}
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
                  type="submit"
                />
                <Button
                  classNameButton="mt-1 p-2 px-3 bg-blue-500 text-white font-semibold rounded-sm hover:bg-blue-500/80 duration-200"
                  nameButton="Thêm sản phẩm"
                  type="submit"
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
