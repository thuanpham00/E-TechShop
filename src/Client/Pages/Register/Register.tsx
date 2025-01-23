import { yupResolver } from "@hookform/resolvers/yup"
import { Helmet } from "react-helmet-async"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { schemaAuth, SchemaAuthType } from "src/Client/Utils/rule"
import Button from "src/Components/Button"
import Input from "src/Components/Input"
import { path } from "src/Constants/path"
import logo from "src/Assets/img/logo_techzone.png"

type FormData = Pick<SchemaAuthType, "email" | "password" | "confirm_password">
const formData = schemaAuth.pick(["email", "password", "confirm_password"])

export default function Register() {
  const navigate = useNavigate()
  const {
    formState: { errors },
    setError,
    register,
    handleSubmit
  } = useForm<FormData>({ resolver: yupResolver(formData) })

  const handleSubmitForm = handleSubmit((data) => {
    console.log(data)
  })

  return (
    <div>
      <Helmet>
        <title>Đăng ký tài khoản</title>
        <meta name="description" content="Đây là trang đăng ký người dùng của hệ thống" />
      </Helmet>

      <div className="bg-white rounded-sm p-6 w-[400px] shadow-md">
        <img src={logo} alt="logo" className="mx-auto" />
        <h1 className="text-xl font-semibold text-center">Đăng ký</h1>
        <form onSubmit={handleSubmitForm} className="mt-2">
          <Input
            name="name"
            register={register}
            placeholder="Nhập tên"
            messageErrorInput={errors.email?.message}
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
            value="Thuan123@"
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
            value="Thuan123@"
          />
          <Button nameButton="Đăng ký" type="submit" disabled={true} />
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
