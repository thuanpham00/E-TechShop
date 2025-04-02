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

    created_at_start: yup.date(),
    created_at_end: yup.date(),
    updated_at_start: yup.date(),
    updated_at_end: yup.date()
  })
  .required()

export const schemaProduct = yup.object({
  name: yup.string(),
  category: yup.string(),
  brand: yup.string(),
  price_min: yup.string().test({
    name: "price-not-allowed",
    message: "Giá không phù hợp",
    test: function (value) {
      const price_min = value
      const { price_max } = this.parent
      if (price_max !== "" && price_min !== "") {
        return Number(price_max) >= Number(price_min)
      }
      return price_max !== "" || price_min !== ""
    }
  }),

  price_max: yup.string().test({
    name: "price-not-allowed",
    message: "Giá không phù hợp",
    test: function (value) {
      const price_max = value
      const { price_min } = this.parent
      if (price_max !== "" && price_min !== "") {
        return Number(price_max) >= Number(price_min)
      }
      return price_max !== "" || price_min !== ""
    }
  })
})

export type SchemaAuthType = yup.InferType<typeof schemaAuth>
export type SchemaProductType = SchemaAuthType & yup.InferType<typeof schemaProduct>
