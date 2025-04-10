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
    avatar: yup.string().max(1000, "Độ dài tối đa 1000 kí tự"),
    date_of_birth: yup.date().max(new Date(), "Hãy chọn một ngày trong quá khứ"),
    verify: yup.number(),

    id: yup.string(),
    created_at: yup.string(),
    updated_at: yup.string(),

    created_at_start: yup.date().test({
      name: "Invalid Date",
      message: "Ngày không phù hợp",
      test: function (value) {
        if (!value) {
          return true
        }
        const created_at_start = value
        const { created_at_end } = this.parent
        return new Date(created_at_end) > new Date(created_at_start)
      }
    }),
    created_at_end: yup.date().test({
      name: "Invalid Date",
      message: "Ngày không phù hợp",
      test: function (value) {
        if (!value) {
          return true
        }
        const created_at_end = value
        const { created_at_start } = this.parent
        return new Date(created_at_end) > new Date(created_at_start)
      }
    }),
    updated_at_start: yup.date().test({
      name: "Invalid Date",
      message: "Ngày không phù hợp",
      test: function (value) {
        if (!value) {
          return true // nếu true thì ko xét nữa
        }
        const updated_at_start = value
        const { updated_at_end } = this.parent
        return new Date(updated_at_end) > new Date(updated_at_start)
      }
    }),
    updated_at_end: yup.date().test({
      name: "Invalid Date",
      message: "Ngày không phù hợp",
      test: function (value) {
        if (!value) {
          return true // nếu true thì ko xét nữa
        }
        const updated_at_end = value
        const { updated_at_start } = this.parent
        return new Date(updated_at_end) > new Date(updated_at_start)
      }
    })
  })
  .required()

// dùng .shape() để mở rộng schema schemaAuth mà không làm mất các trường đã có:
export const schemaProduct = schemaAuth
  .pick(["created_at_start", "created_at_end", "updated_at_start", "updated_at_end"])
  .shape({
    name: yup.string().default(""),
    category: yup.string(),
    brand: yup.string(),
    price_min: yup.string().test({
      name: "price-not-allowed",
      message: "Giá không phù hợp",
      test: function (value) {
        if (!value) return true // Không nhập thì bỏ qua
        const price_min = Number(value)
        const price_max = this.parent?.price_max ? Number(this.parent.price_max) : null
        return price_max === null || price_max >= price_min
      }
    }),

    price_max: yup.string().test({
      name: "price-not-allowed",
      message: "Giá không phù hợp",
      test: function (value) {
        if (!value) return true
        const price_max = Number(value)
        const price_min = this.parent?.price_min ? Number(this.parent.price_min) : null
        return price_min === null || price_max >= price_min
      }
    }),
    status: yup.string()
  })

export const schemaCustomer = schemaAuth
  .pick(["created_at_start", "created_at_end", "updated_at_start", "updated_at_end"])
  .shape({
    name: yup.string(),
    email: yup.string(),
    numberPhone: yup.string(),
    verify: yup.number()
  })

export type SchemaAuthType = yup.InferType<typeof schemaAuth>
export type SchemaProductType = SchemaAuthType & yup.InferType<typeof schemaProduct>

export type SchemaCustomerType = yup.InferType<typeof schemaCustomer>
