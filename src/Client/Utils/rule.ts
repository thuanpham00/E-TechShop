import * as yup from "yup"

export const schemaAuth = yup
  .object({
    email: yup
      .string()
      .required("Email bắt buộc!")
      .email("Email không đúng định dạng!")
      .min(5, "Độ dài 5-160 kí tự!")
      .max(160, "Độ dài 5-160 kí tự!"),
    password: yup.string().required("Mật khẩu bắt buộc!").min(6, "Độ dài 6-50 kí tự!").max(50, "Độ dài 6-50 kí tự!"),
    confirm_password: yup
      .string()
      .required("Xác nhận mật khẩu bắt buộc!")
      .min(6, "Độ dài 6-50 kí tự!")
      .max(50, "Độ dài 6-50 kí tự!")
      .oneOf([yup.ref("password")], "Nhập lại mật khẩu không khớp!"),
    name: yup
      .string()
      .required("Tên bắt buộc!")
      .matches(/^[^\d]+$/, "Tên không được chứa số!"),
    phone: yup.string().required("Số điện thoại bắt buộc!"),
    numberPhone: yup.string(),
    avatar: yup.string().max(1000, "Độ dài tối đa 1000 kí tự!"),
    date_of_birth: yup.date().max(new Date(), "Hãy chọn một ngày trong quá khứ!"),
    verify: yup.number(),

    id: yup.string(),
    department: yup.string().required("Phòng ban bắt buộc!"),
    contract_type: yup.string().required("Loại hợp đồng bắt buộc!"),
    status: yup.string().required("Trạng thái bắt buộc!"),
    hire_date: yup
      .date()
      .required("Ngày vào làm là bắt buộc!")
      .test("min-today", "Hãy chọn ngày từ hôm nay trở đi!", function (value) {
        const today = new Date(new Date().setHours(0, 0, 0, 0))
        const initial = this.options.context?.initialHireDate

        // Nếu có giá trị ban đầu và user không đổi -> bỏ qua check
        if (initial && new Date(initial).getTime() === new Date(value).getTime()) {
          return true
        }

        return value >= today
      }),
    salary: yup
      .number()
      .required("Lương bắt buộc!")
      .transform((value, originalValue) => (originalValue === "" ? undefined : value))
      .min(0, "Lương không được nhỏ hơn 0"),
    created_at: yup.string(),
    updated_at: yup.string(),

    role: yup.string(),
    roleInStaff: yup.string().required("Vị trí làm việc bắt buộc")
  })
  .required()

export const schemaSearchFilter = yup.object({
  name: yup.string(),

  created_at_start: yup.date().test({
    name: "Invalid Date",
    message: "Ngày không phù hợp!",
    test: function (value) {
      const { created_at_end } = this.parent
      if (!value || !created_at_end) {
        return true
      }
      const created_at_start = value
      return new Date(created_at_end) > new Date(created_at_start)
    }
  }),
  created_at_end: yup.date().test({
    name: "Invalid Date",
    message: "Ngày không phù hợp!",
    test: function (value) {
      const { created_at_start } = this.parent
      if (!value || !created_at_start) {
        return true
      }
      const created_at_end = value
      return new Date(created_at_end) > new Date(created_at_start)
    }
  }),
  updated_at_start: yup.date().test({
    name: "Invalid Date",
    message: "Ngày không phù hợp!",
    test: function (value) {
      const { updated_at_end } = this.parent
      if (!value || !updated_at_end) {
        return true // nếu true thì ko xét nữa
      }
      const updated_at_start = value
      return new Date(updated_at_end) > new Date(updated_at_start)
    }
  }),
  updated_at_end: yup.date().test({
    name: "Invalid Date",
    message: "Ngày không phù hợp!",
    test: function (value) {
      const { updated_at_start } = this.parent
      if (!value || !updated_at_start) {
        return true // nếu true thì ko xét nữa
      }
      const updated_at_end = value
      return new Date(updated_at_end) > new Date(updated_at_start)
    }
  })
})

// dùng .shape() để mở rộng schema schemaAuth mà không làm mất các trường đã có:
export const schemaProduct = schemaSearchFilter
  .pick(["created_at_start", "created_at_end", "updated_at_start", "updated_at_end"])
  .shape({
    name: yup.string().default(""),
    category: yup.string(),
    brand: yup.string(),
    price_min: yup.string().test({
      name: "price-not-allowed",
      message: "Giá không phù hợp!",
      test: function (value) {
        if (!value) return true // Không nhập thì bỏ qua
        const price_min = Number(value)
        const price_max = this.parent?.price_max ? Number(this.parent.price_max) : null
        return price_max === null || price_max >= price_min
      }
    }),

    price_max: yup.string().test({
      name: "price-not-allowed",
      message: "Giá không phù hợp!",
      test: function (value) {
        if (!value) return true
        const price_max = Number(value)
        const price_min = this.parent?.price_min ? Number(this.parent.price_min) : null
        return price_min === null || price_max >= price_min
      }
    }),
    status: yup.string()
  })

export const schemaSearchFilterCustomer = schemaSearchFilter
  .pick(["created_at_start", "created_at_end", "updated_at_start", "updated_at_end"])
  .shape({
    name: yup.string(),
    email: yup.string(),
    numberPhone: yup.string(),
    verify: yup.number()
  })

export const schemaAddProduct = yup.object({
  name: yup.string().required("Tên sản phẩm bắt buộc!"),
  category: yup.string().required("Danh mục bắt buộc!"),
  brand: yup.string().required("Thương hiệu bắt buộc!"),
  price: yup
    .number()
    .transform((value, originalValue) => {
      if (typeof originalValue === "string") {
        const cleaned = originalValue.replace(/\./g, "") // "6599999"
        return cleaned ? Number(cleaned) : undefined
      }
      return value
    })
    .required("Giá bắt buộc!")
    .typeError("Giá phải là số!")
    .min(0, "Giá không được nhỏ hơn 0!"),
  discount: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? undefined : value)) // ví dụ input là "" thì trả về undefined để trigger required
    .required("Giảm giá bắt buộc!")
    .typeError("Giảm giá phải là số!")
    .min(0, "Giảm giá không được nhỏ hơn 0!"),
  priceAfterDiscount: yup
    .number()
    .transform((value, originalValue) => {
      if (typeof originalValue === "string") {
        const cleaned = originalValue.replace(/\./g, "") // "6599999"
        return cleaned ? Number(cleaned) : undefined
      }
      return value
    })
    .typeError("Giá phải là số!")
    .min(0, "Giá không được nhỏ hơn 0!"),
  stock: yup.number(),
  sold: yup.number(),
  viewCount: yup.number(),
  isFeatured: yup.string(),
  status: yup.string(),
  description: yup.string().required("Mô tả sản phẩm bắt buộc!"),
  banner: yup.string().max(1000, "Độ dài tối đa 1000 kí tự!").required("Ảnh đại diện sản phẩm bắt buộc!"),
  medias: yup.array(),
  specifications: yup.array().required("Thông số kỹ thuật bắt buộc!").min(1, "Thông số kỹ thuật bắt buộc!")
})

export const schemaSupplier = schemaSearchFilter
  .pick(["created_at_start", "created_at_end", "updated_at_start", "updated_at_end"])
  .shape({
    name: yup.string(),
    contactName: yup.string(),
    email: yup.string(),
    phone: yup.string()
  })

export const schemaSupplierUpdate = schemaAuth.pick(["created_at", "updated_at", "id"]).shape({
  name: yup.string().required("Tên nhà cung cấp bắt buộc!"),
  contactName: yup
    .string()
    .required("Tên người đại diện bắt buộc!")
    .matches(/^[^\d]+$/, "Tên nhà cung cấp không được chứa số"),
  email: yup.string().required("Email bắt buộc!"),
  phone: yup
    .string()
    .required("Số điện thoại bắt buộc!")
    .min(10, "Độ dài 10-11 kí tự")
    .max(11, "Độ dài 10-11 kí tự")
    .matches(/^\d+$/, "Số điện thoại chỉ được chứa ký tự số"),
  address: yup.string().required("Địa chỉ bắt buộc!"),
  description: yup.string().default(""),
  taxCode: yup.string().required("Mã số thuế bắt buộc!")
})

export const schemaSupply = schemaSearchFilter
  .pick(["created_at_start", "created_at_end", "updated_at_start", "updated_at_end"])
  .shape({
    name_product: yup.string(),
    name_supplier: yup.string(),
    importPrice: yup.string(),
    quantity: yup.string(),
    price_min: yup.string().test({
      name: "price-not-allowed",
      message: "Giá không phù hợp!",
      test: function (value) {
        if (!value) return true // Không nhập thì bỏ qua
        const price_min = Number(value)
        const price_max = this.parent?.price_max ? Number(this.parent.price_max) : null
        return price_max === null || price_max >= price_min
      }
    }),

    price_max: yup.string().test({
      name: "price-not-allowed",
      message: "Giá không phù hợp!",
      test: function (value) {
        if (!value) return true
        const price_max = Number(value)
        const price_min = this.parent?.price_min ? Number(this.parent.price_min) : null
        return price_min === null || price_max >= price_min
      }
    })
  })

export const schemaSupplyUpdate = schemaAuth.pick(["created_at", "updated_at", "id"]).shape({
  productId: yup.string().required("Tên sản phẩm bắt buộc!"),
  supplierId: yup.string().required("Nhà cung cấp bắt buộc!"),
  importPrice: yup
    .number()
    .required("Giá nhập bắt buộc!")
    .transform((value, originalValue) => {
      // value: giá trị sau khi đã parse (có thể là NaN)
      // originalValue: giá trị gốc từ input (string "6.599.999")

      if (typeof originalValue === "string") {
        const cleaned = originalValue.replace(/\./g, "") // "6599999"
        return cleaned ? Number(cleaned) : undefined
      }
      return value
    }),
  warrantyMonths: yup
    .number()
    .transform((value, originalValue) => {
      // ✅ Nếu empty string -> return undefined để trigger required
      return originalValue === "" ? undefined : value
    })
    .required("Thời gian bảo hành bắt buộc!")
    .min(0, "Thời gian bảo hành phải >= 0")
    .typeError("Thời gian bảo hành phải là số"),
  leadTimeDays: yup
    .number()
    .transform((value, originalValue) => {
      // ✅ Nếu empty string -> return undefined để trigger required
      return originalValue === "" ? undefined : value
    })
    .required("Thời gian cung ứng bắt buộc!")
    .min(0, "Thời gian cung ứng phải >= 0")
    .typeError("Thời gian cung ứng phải là số"),
  description: yup.string().default("")
})

export const schemaAddReceipt = yup.object({
  items: yup
    .array()
    .min(1, "Sản phẩm bắt buộc!") // đảm bảo có ít nhất 1 item
    .required("Sản phẩm bắt buộc!")
    .of(
      yup.object({
        productId: yup.string().required("Sản phẩm bắt buộc!"),
        supplierId: yup.string().required("Nhà cung cấp bắt buộc!"),
        quantity: yup.string().required("Số lượng bắt buộc!"),
        pricePerUnit: yup.string().required("Giá nhập bắt buộc!"),
        totalPrice: yup.string().required("Tổng giá tiền bắt buộc!")
      })
    ),
  importDate: yup.string().required(),
  totalItem: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? undefined : value))
    .moreThan(0, "Số lượng sản phẩm phải lớn hơn 0"),

  totalAmount: yup.string()
})

export const schemaOrder = schemaAuth.pick(["created_at", "updated_at", "id"]).shape({
  note: yup.string(),
  status: yup.string(),
  totalAmount: yup.number(),
  customer_info: yup.object({
    name: yup.string(),
    phone: yup.string(),
    address: yup.string()
  }),
  products: yup.array().of(
    yup.object({
      product_id: yup.string(),
      name: yup.string(),
      price: yup.number(),
      quantity: yup.number(),
      image: yup.string()
    })
  )
})

export const schemaSearchFilterOrder = schemaSupply
  .pick(["created_at_start", "created_at_end", "updated_at_start", "updated_at_end", "price_max", "price_min"])
  .shape({
    status: yup.string(),
    name: yup.string(),
    address: yup.string(),
    phone: yup.string()
  })

export const schemaRole = schemaAuth.pick(["updated_at", "created_at"]).shape({
  _id: yup.string(),
  name: yup.string().required("Tên vai trò bắt buộc!"),
  description: yup.string().required("Mô tả vai trò bắt buộc!")
})

export const schemaSearchFilterReview = schemaSupply
  .pick(["created_at_start", "created_at_end", "updated_at_start", "updated_at_end"])
  .shape({
    name: yup.string(),
    rating: yup
      .number()
      .transform((value, originalValue) => (originalValue === "" ? undefined : value))
      .notRequired()
  })

export type SchemaAuthType = yup.InferType<typeof schemaAuth>

export type SchemaSearchFilterType = yup.InferType<typeof schemaSearchFilter>

export type SchemaSearchFilterCustomerType = yup.InferType<typeof schemaSearchFilterCustomer>

export type SchemaProductType = SchemaAuthType & yup.InferType<typeof schemaProduct>

export type SchemaAddProductType = yup.InferType<typeof schemaAddProduct>

export type SchemaSupplierType = yup.InferType<typeof schemaSupplier>

export type SchemaSupplierUpdateType = yup.InferType<typeof schemaSupplierUpdate>

export type SchemaSupplyType = yup.InferType<typeof schemaSupply>

export type SchemaSupplyUpdateType = yup.InferType<typeof schemaSupplyUpdate>

export type SchemaAddReceiptType = yup.InferType<typeof schemaAddReceipt>

export type SchemaOrderType = yup.InferType<typeof schemaOrder>

export type SchemaSearchFilterOrderType = yup.InferType<typeof schemaSearchFilterOrder>

export type SchemaRoleType = yup.InferType<typeof schemaRole>

export type SchemaReviewType = yup.InferType<typeof schemaSearchFilterReview>
