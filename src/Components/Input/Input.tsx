/* eslint-disable @typescript-eslint/no-explicit-any */
import { Eye, EyeOff } from "lucide-react"
import { InputHTMLAttributes, useState } from "react"
import { UseFormRegister } from "react-hook-form"
import { Link, useLocation } from "react-router-dom"
import { path } from "src/Constants/path"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  // kế thừa những thuộc tính có sẵn từ thẻ Input
  className?: string
  classNameInput?: string
  classNameError?: string
  classNameEye?: string
  classNameLabel?: string
  nameInput?: string
  name?: string
  messageErrorInput?: string
  register?: UseFormRegister<any>
}

export default function Input({
  className = "mt-1 relative",
  classNameInput = "p-2 w-full border border-black/60 rounded-sm focus:border-blue-500 focus:ring-2 outline-none text-black dark:text-black",
  classNameError = "text-red-500 text-[13px] font-semibold min-h-[1.25rem] block",
  classNameEye = "absolute right-2 top-1/2 -translate-y-1/2",
  classNameLabel,
  nameInput,
  messageErrorInput,
  name,
  register,
  ...rest
}: InputProps) {
  const { pathname } = useLocation()
  const registerInput = name && register ? { ...register(name) } : {}
  const [openEye, setOpenEye] = useState(false)

  const toggle = () => {
    setOpenEye((prev) => !prev)
  }

  const handleType = () => {
    if (rest.type === "password") {
      return openEye ? "text" : "password"
    }
    return rest.type
  }

  return (
    <div className={className}>
      <span className={classNameLabel}>{nameInput}</span>
      <input className={classNameInput} {...registerInput} {...rest} type={handleType()} />
      {rest.type === "password" && !openEye ? (
        <button onClick={toggle} className={classNameEye}>
          <EyeOff color="#393636" size={22} />
        </button>
      ) : (
        ""
      )}
      {rest.type === "password" && openEye ? (
        <button onClick={toggle} className={classNameEye}>
          <Eye color="#393636" size={22} />
        </button>
      ) : (
        ""
      )}
      {rest.type === "password" && pathname === "/login" ? (
        <div className="mt-1 flex justify-between">
          <span className={classNameError + " w-[70%]"}>{messageErrorInput}</span>
          <Link
            to={path.ForgotPassword}
            className="w-[30%] cursor-pointer underline hover:text-blue-500 text-right block duration-200 font-medium text-[13px]"
          >
            Quên mật khẩu?
          </Link>
        </div>
      ) : (
        <span className={classNameError}>{messageErrorInput}</span>
      )}
    </div>
  )
}
