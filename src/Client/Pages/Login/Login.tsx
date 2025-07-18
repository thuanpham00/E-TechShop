/* eslint-disable @typescript-eslint/no-explicit-any */
import { yupResolver } from "@hookform/resolvers/yup"
import { useMutation } from "@tanstack/react-query"
import { useContext } from "react"
import { Helmet } from "react-helmet-async"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import { userAPI } from "src/Apis/user.api"
import { path } from "src/Constants/path"
import { schemaAuth, SchemaAuthType } from "src/Client/Utils/rule"
import { isError422 } from "src/Helpers/utils"
import { ErrorResponse } from "src/Types/utils.type"
import { AppContext } from "src/Context/authContext"
import Button from "src/Components/Button"
import Input from "src/Components/Input"
import { Cpu } from "lucide-react"

const getGoogleAuthUrl = () => {
  const { VITE_GOOGLE_CLIENT_ID, VITE_GOOGLE_AUTHORIZED_REDIRECT_URI } = import.meta.env
  const url = `https://accounts.google.com/o/oauth2/v2/auth`
  const query = {
    redirect_uri: VITE_GOOGLE_AUTHORIZED_REDIRECT_URI, // sau khi chọn tài khoản và redirect về server be
    client_id: VITE_GOOGLE_CLIENT_ID,
    response_type: "code",
    scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"].join(
      " "
    ), // 2 quyền khi đăng ký google cloud
    prompt: "consent",
    access_type: "offline" // để trả về RT
  }
  const queryString = new URLSearchParams(query) // tạo ra query "?"
  return `${url}?${queryString}`
}
const googleAuth = getGoogleAuthUrl()

type FormData = Pick<SchemaAuthType, "email" | "password"> // kiểu dữ liệu của form
const formData = schemaAuth.pick(["email", "password"]) // validate ở client

export default function Login() {
  const { setIsAuthenticated, setNameUser, setRole, setAvatar, setUserId } = useContext(AppContext)
  const {
    formState: { errors },
    setError,
    register,
    handleSubmit
  } = useForm<FormData>({ resolver: yupResolver(formData) })

  const loginMutation = useMutation({
    mutationFn: (body: FormData) => {
      return userAPI.loginUser(body)
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
        // nếu không set state tại đây thì nó chỉ set LS và không re-render app
        // -> dẫn đến UI không cập nhật (mới nhất sau khi login) -> cần set state
        // để app re-render lại và đặt giá trị mới cho state global
        // và giá trị khởi tạo cho state global (LS) - set trong response
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
    <div>
      <Helmet>
        <title>Đăng nhập tài khoản</title>
        <meta name="description" content="Đây là trang đăng nhập người dùng của hệ thống" />
      </Helmet>
      <div className="p-6">
        <Link to={path.Home} className="flex items-center justify-center">
          <Cpu />
          <span className="text-darkPrimary dark:text-white text-2xl font-bold text-center pb-[1px] border-b-[3px] border-darkPrimary dark:border-white">
            TechZone
          </span>
        </Link>
        <h1 className="text-lg font-semibold text-center mt-2 text-[#000] dark:text-[#fff]">Đăng nhập</h1>
        <Link
          to={googleAuth}
          className="mt-4 border border-black/80 dark:border-white rounded-full w-[80%] mx-auto p-2 flex items-center justify-center gap-2"
        >
          <div
            className="w-5 h-5"
            style={{
              backgroundImage: `url("https://accounts.scdn.co/sso/images/new-google-icon.72fd940a229bc94cf9484a3320b3dccb.svg")`,
              backgroundPosition: "center center",
              backgroundRepeat: "no-repeat"
            }}
          ></div>
          <span className="text-sm font-semibold">Đăng nhập với Google</span>
        </Link>
        <div className="flex items-center justify-center mt-2">
          <div className="w-[40%] h-[1px] bg-gray-500"></div>
          <span className="w-[10%] text-center block text-gray-400">or</span>
          <div className="w-[40%] h-[1px] bg-gray-500"></div>
        </div>
        <form onSubmit={handleSubmitForm} className="mt-2">
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
            classNameButton="mt-1 p-4 bg-blue-500 w-full text-white font-semibold rounded-sm hover:bg-blue-500/80 duration-200"
            nameButton="Đăng nhập"
            type="submit"
            disabled={loginMutation.isPending}
          />
        </form>
        <div className="bg-gray-500 w-full h-[1px] mt-4"></div>
        <div className="mt-2 flex items-center justify-center gap-1 ">
          <span className="text-sm font-semibold">Bạn chưa có tài khoản?</span>
          <Link to={path.Register} className="font-bold underline underline-offset-2">
            Đăng ký
          </Link>
        </div>
      </div>
    </div>
  )
}
