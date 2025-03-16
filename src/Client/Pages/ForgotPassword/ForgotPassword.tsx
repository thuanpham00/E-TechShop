import { Helmet } from "react-helmet-async"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { path } from "src/Constants/path"
import Input from "src/Components/Input"
import Button from "src/Components/Button"
import { useForm } from "react-hook-form"
import { schemaAuth, SchemaAuthType } from "src/Client/Utils/rule"
import { yupResolver } from "@hookform/resolvers/yup"
import { useMutation } from "@tanstack/react-query"
import { userAPI } from "src/Apis/user.api"
import { useEffect } from "react"
import { isError404 } from "src/Helpers/utils"
import { ErrorResponse } from "src/Types/utils.type"

const formData = schemaAuth.pick(["email"])
type FormData = Pick<SchemaAuthType, "email">

export default function ForgotPassword() {
  const navigate = useNavigate()
  const {
    handleSubmit,
    setError,
    register,
    formState: { errors }
  } = useForm<FormData>({ resolver: yupResolver(formData) })

  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => {
      return userAPI.forgotPassword(email)
    }
  })
  const handleSubmitForm = handleSubmit((data) => {
    forgotPasswordMutation.mutate(data.email, {
      onError: (error) => {
        // lỗi từ server trả về
        if (isError404<ErrorResponse<{ message: string }>>(error)) {
          setError("email", {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            message: error.response?.data.message // lỗi 422 từ server trả về
          })
        }
      }
    })
  })

  const [searchParams] = useSearchParams()
  const forgot_password_token = searchParams.get("token")

  const verifyForgotPasswordTokenMutation = useMutation({
    mutationFn: (token: string) => {
      return userAPI.verifyForgotPasswordToken(token)
    }
  })

  useEffect(() => {
    if (forgot_password_token) {
      verifyForgotPasswordTokenMutation.mutate(forgot_password_token, {
        onSuccess: () => {
          navigate(path.ResetPassword, { state: forgot_password_token })
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      <Helmet>
        <title>Quên mật khẩu</title>
        <meta name="description" content="Đây là trang quên mật khẩu người dùng của hệ thống" />
      </Helmet>
      <div className="p-6">
        <Link to={path.Home} className="text-center block">
          <span className="text-darkPrimary dark:text-white text-2xl font-semibold text-center pb-[1px] border-b-[3px] border-darkPrimary dark:border-white">
            TechZone
          </span>
        </Link>
        <h1 className="text-lg font-semibold text-center mt-2">Quên mật khẩu?</h1>
        <h2 className="mt-1 text-center">Đừng lo lắng, chúng tôi sẽ hướng dẫn bạn thiết lập lại</h2>
        <form onSubmit={handleSubmitForm} className="mt-2">
          <Input
            name="email"
            register={register}
            placeholder="Nhập email"
            messageErrorInput={errors.email?.message}
            nameInput="Email"
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
