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
    name: yup.string().required("Tên bắt buộc!"),
    phone: yup.string().min(10, "Độ dài 10-11 kí tự!").max(11, "Độ dài 10-11 kí tự!")
  })
  .required()

export type SchemaAuthType = yup.InferType<typeof schemaAuth>
