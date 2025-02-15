/* eslint-disable @typescript-eslint/no-explicit-any */
import { yupResolver } from "@hookform/resolvers/yup"
import { Helmet } from "react-helmet-async"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { schemaAuth, SchemaAuthType } from "src/Client/Utils/rule"
import Button from "src/Components/Button"
import Input from "src/Components/Input"
import { path } from "src/Constants/path"
import logo from "src/Assets/img/logo_techzone_white.png"
import { useMutation } from "@tanstack/react-query"
import { userAPI } from "src/Apis/user.api"
import { toast } from "react-toastify"
import { isError422 } from "src/Helpers/utils"
import { ErrorResponse } from "src/Types/utils.type"

type FormData = Pick<SchemaAuthType, "email" | "password" | "confirm_password" | "name">
const formData = schemaAuth.pick(["email", "password", "confirm_password", "name"])

export default function Register() {
  const navigate = useNavigate()
  const {
    formState: { errors },
    register,
    setError,
    handleSubmit
  } = useForm<FormData>({ resolver: yupResolver(formData) })

  const registerMutation = useMutation({
    mutationFn: (body: FormData) => {
      return userAPI.registerUser(body)
    }
  })

  const handleSubmitForm = handleSubmit((data) => {
    registerMutation.mutate(data, {
      onSuccess: (response) => {
        toast.success(response.data.message, { autoClose: 1000 })
        navigate(path.Login)
      },
      onError: (error) => {
        // lỗi từ server trả về
        if (isError422<ErrorResponse<FormData>>(error)) {
          const formError = error.response?.data.errors
          if (formError?.email) {
            setError("email", {
              message: (formError.email as any).msg
            })
          }
          if (formError?.name) {
            setError("name", {
              message: (formError.name as any).msg
            })
          }
          if (formError?.password) {
            setError("password", {
              message: (formError.password as any).msg
            })
          }
          if (formError?.confirm_password) {
            setError("confirm_password", {
              message: (formError.confirm_password as any).msg
            })
          }
        }
      }
    })
  })

  return (
    <div>
      <Helmet>
        <title>Đăng ký tài khoản</title>
        <meta name="description" content="Đây là trang đăng ký người dùng của hệ thống" />
      </Helmet>

      <div className="bg-white rounded-sm p-6 w-[400px] shadow-md">
        <Link to={path.Home}>
          <img src={logo} alt="logo" className="mx-auto w-[50%] object-contain" />
        </Link>
        <h1 className="text-xl font-semibold text-center mt-2">Đăng ký</h1>
        <form onSubmit={handleSubmitForm} className="mt-2">
          <Input
            name="name"
            register={register}
            placeholder="Nhập tên"
            messageErrorInput={errors.name?.message}
            nameInput="Tên"
          />
          <Input
            name="email"
            register={register}
            placeholder="Nhập email"
            messageErrorInput={errors.email?.message}
            nameInput="Email"
          />
          <Input
            name="password"
            register={register}
            placeholder="Nhập mật khẩu"
            messageErrorInput={errors.password?.message}
            nameInput="Mật khẩu"
            type="password"
            classNameError="text-red-500 text-[13px] font-semibold min-h-[2.25rem] block"
            classNameEye="absolute right-2 top-[40%] -translate-y-1/2"
          />
          <Input
            name="confirm_password"
            register={register}
            placeholder="Nhập lại mật khẩu"
            messageErrorInput={errors.confirm_password?.message}
            nameInput="Xác nhận mật khẩu"
            type="password"
            classNameError="text-red-500 text-[13px] font-semibold min-h-[2.25rem] block"
            classNameEye="absolute right-2 top-[40%] -translate-y-1/2"
          />
          <Button nameButton="Đăng ký" type="submit" disabled={registerMutation.isPending} />
        </form>
        <div className="bg-gray-500 w-full h-[1px] mt-4"></div>

        <div className="mt-2 flex items-center justify-center gap-1">
          <span className="text-sm font-semibold">Bạn đã có tài khoản chưa?</span>
          <Link to={path.Login} className="font-bold underline underline-offset-2">
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  )
}
