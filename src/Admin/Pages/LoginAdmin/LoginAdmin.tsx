/* eslint-disable @typescript-eslint/no-explicit-any */
import { yupResolver } from "@hookform/resolvers/yup"
import { useMutation } from "@tanstack/react-query"
import { Cpu } from "lucide-react"
import { useContext } from "react"
import { Helmet } from "react-helmet-async"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import { adminAPI } from "src/Apis/admin.api"
import { schemaAuth, SchemaAuthType } from "src/Client/Utils/rule"
import Button from "src/Components/Button"
import Input from "src/Components/Input"
import { path } from "src/Constants/path"
import { AppContext } from "src/Context/authContext"
import { isError422 } from "src/Helpers/utils"
import { ErrorResponse } from "src/Types/utils.type"

type FormData = Pick<SchemaAuthType, "email" | "password"> // kiểu dữ liệu của form
const formData = schemaAuth.pick(["email", "password"]) // validate ở client

export default function LoginAdmin() {
  const { setIsAuthenticated, setNameUser, setRole, setAvatar, setUserId } = useContext(AppContext)
  const {
    formState: { errors },
    setError,
    register,
    handleSubmit
  } = useForm<FormData>({ resolver: yupResolver(formData) })

  const loginMutation = useMutation({
    mutationFn: (body: FormData) => {
      return adminAPI.auth.loginAdmin(body)
    }
  })

  // submit đi nó sẽ kiểm tra validation form ở fe -> ok -> gửi req tới server
  const handleSubmitForm = handleSubmit((data) => {
    loginMutation.mutate(data, {
      onSuccess: (response) => {
        toast.success(response.data.message, {
          autoClose: 1000
        })
        setIsAuthenticated(true)
        setNameUser(response.data.result.userInfo.name)
        setRole(response.data.result.userInfo.role)
        setAvatar(response.data.result.userInfo.avatar)
        setUserId(response.data.result.userInfo._id)
      },
      onError: (error) => {
        // lỗi từ server trả về
        if (isError422<ErrorResponse<FormData>>(error)) {
          const formError = error.response?.data.errors
          if (formError?.email)
            setError("email", {
              message: (formError.email as any).msg // lỗi 422 từ server trả về
            })
          if (formError?.password) {
            setError("password", {
              message: (formError.password as any).msg
            })
          }
        }
      }
    })
  })
  return (
    <div className="h-full">
      <Helmet>
        <title>Đăng nhập tài khoản - TechZone</title>
        <meta
          name="description"
          content="Đăng nhập tài khoản TechZone để mua sắm nhanh chóng, quản lý đơn hàng và nhận nhiều ưu đãi dành riêng cho bạn."
        />
      </Helmet>

      <div className="p-6 h-full bg-white/90 dark:bg-darkBorder flex items-center flex-col justify-center rounded-lg">
        <h1 className="text-xl my-2 font-semibold text-center text-[#000] dark:text-[#fff]">Hệ thống quản lý</h1>
        <div className="flex items-center justify-center">
          <Cpu />
          <span className="text-darkPrimary dark:text-white text-2xl font-bold text-center pb-[1px] border-b-[3px] border-darkPrimary dark:border-white">
            TechZone
          </span>
        </div>
        <h1 className="text-base text-center mt-2 text-[#000] dark:text-[#fff]">Đăng nhập</h1>
        <form onSubmit={handleSubmitForm} className="mt-2 w-full">
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
          <Button
            classNameButton="p-2 bg-blue-500 w-full text-white font-semibold rounded-sm hover:bg-blue-500/80 duration-200"
            nameButton="Đăng nhập"
            type="submit"
            disabled={loginMutation.isPending}
          />
        </form>
        <div className="px-4 w-full mt-4">
          <div className="h-[2px] bg-gray-300 w-full flex justify-center"></div>
        </div>
        <div className="w-full flex justify-center">
          <Link
            to={path.Home}
            className="mt-4 text-white text-sm bg-red-500 w-full text-center rounded-lg p-2 hover:bg-red-400 duration-200 transition-all"
          >
            Trang mua sắm
          </Link>
        </div>
      </div>
    </div>
  )
}
