import { Helmet } from "react-helmet-async"
import { Link, useLocation } from "react-router-dom"
import { path } from "src/Constants/path"
import logo from "src/Assets/img/logo_techzone_white.png"
import Input from "src/Components/Input"
import Button from "src/Components/Button"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { schemaAuth, SchemaAuthType } from "src/Client/Utils/rule"
import { useMutation } from "@tanstack/react-query"
import { userAPI } from "src/Apis/user.api"
import { isError401, isError404 } from "src/Helpers/utils"
import { ErrorResponse } from "src/Types/utils.type"
import { toast } from "react-toastify"

const formData = schemaAuth.pick(["password", "confirm_password"])
type FormData = Pick<SchemaAuthType, "password" | "confirm_password">

export default function ResetPassword() {
  const { state } = useLocation()
  const {
    reset,
    handleSubmit,
    setError,
    register,
    formState: { errors }
  } = useForm<FormData>({ resolver: yupResolver(formData) })

  const resetPasswordMutation = useMutation({
    mutationFn: (body: { forgot_password_token: string; password: string; confirm_password: string }) => {
      return userAPI.resetPassword(body.forgot_password_token, body.password, body.confirm_password)
    }
  })

  const handleSubmitForm = handleSubmit((data) => {
    resetPasswordMutation.mutate(
      {
        forgot_password_token: state,
        password: data.password,
        confirm_password: data.confirm_password
      },
      {
        onSuccess: () => {
          reset()
          toast.success("Đặt lại mật khẩu thành công!", { autoClose: 1500 })
        },
        onError: (error) => {
          // lỗi từ server trả về
          if (isError404<ErrorResponse<{ message: string }>>(error)) {
            setError("password", {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              message: error.response?.data.message // lỗi 422 từ server trả về
            })
          }
          if (isError401<ErrorResponse<{ message: string }>>(error)) {
            setError("password", {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              message: error.response?.data.message // lỗi 422 từ server trả về
            })
          }
        }
      }
    )
  })

  return (
    <div>
      <Helmet>
        <title>Quên mật khẩu</title>
        <meta name="description" content="Đây là trang quên mật khẩu người dùng của hệ thống" />
      </Helmet>
      <div className="p-6">
        <Link to={path.Home}>
          <img src={logo} alt="logo" className="mx-auto w-[50%] object-contain" />
        </Link>
        <h1 className="text-xl font-semibold text-center mt-2">Quên mật khẩu?</h1>
        <h2 className="mt-1 text-center">Đừng lo lắng, chúng tôi sẽ hướng dẫn bạn thiết lập lại</h2>
        <form onSubmit={handleSubmitForm} className="mt-2">
          <Input
            name="password"
            register={register}
            placeholder="Nhập mới khẩu mới"
            messageErrorInput={errors.password?.message}
            nameInput="Mật khẩu"
            type="password"
          />
          <Input
            name="confirm_password"
            register={register}
            placeholder="Nhập xác nhận mật khẩu mới"
            messageErrorInput={errors.confirm_password?.message}
            nameInput="Xác nhận mật khẩu"
            type="password"
          />
          <Button
            classNameButton="p-4 bg-blue-500 w-full text-white font-semibold rounded-sm hover:bg-blue-500/80 duration-200"
            nameButton="Đặt mật khẩu mới"
            type="submit"
            // disabled={loginMutation.isPending}
          />
        </form>
        <div className="bg-gray-500 w-full h-[1px] mt-4"></div>
        <div className="mt-2 flex items-center justify-center gap-1 ">
          <Link to={path.Login} className="font-bold underline underline-offset-2 flex items-center gap-[2px]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Trở lại Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  )
}
