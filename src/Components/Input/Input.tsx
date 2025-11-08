/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Eye, EyeOff } from "lucide-react"
import { InputHTMLAttributes, useEffect, useState } from "react"
import { Control, UseFormRegister, useWatch } from "react-hook-form"
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
  control?: Control<any>
  isCurrency?: boolean // ✅ Thêm prop format currency
  currencySuffix?: string // ✅ Thêm prop suffix (đ, VNĐ, etc)
}

export default function Input({
  className = "mt-1 relative",
  classNameInput = "p-2 w-full border border-black/60 rounded-lg mt-1 focus:border-blue-500 focus:ring-2 outline-none text-black dark:text-black",
  classNameError = "text-red-500 text-[13px] font-semibold min-h-[1.25rem] block",
  classNameEye = "absolute right-2 top-1/2 -translate-y-1/2",
  classNameLabel,
  nameInput,
  messageErrorInput,
  name,
  register,
  control,
  isCurrency = false, // ✅ Default false
  currencySuffix, // ✅ Default "đ"
  ...rest
}: InputProps) {
  const { pathname } = useLocation()
  const [displayValue, setDisplayValue] = useState("")
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

  const formatCurrencyInput = (value: string) => {
    // Loại bỏ tất cả ký tự không phải số
    const numericValue = value.replace(/\D/g, "")

    if (!numericValue) return ""

    // Format thêm dấu chấm phân cách hàng nghìn
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  // ✅ Parse currency về số thuần (1.000 -> 1000)
  const parseCurrencyToNumber = (value: string) => {
    return value.replace(/\./g, "")
  }

  const registerInput = name && register ? { ...register(name) } : null
  /**
   * const registerInput = register("price")
    // registerInput = {
    //   name: "price",
    //   ref: (element) =>  lưu DOM reference
    //   onChange: (e) =>  setValue("price", e.target.value) },
    //   onBlur: (e) =>  trigger validation }
    // }

    <input {...registerInput} />

    // ↓ Spread operator chuyển thành:

    <input
      name="price"
      ref={callbackRef}
      onChange={handleChange}
      onBlur={handleBlur}
    />
   */
  // à vậy nên tôi dùng ... (spread operator) để lấy hết các thuộc tính object của register truyền vào input đúng ko, nên đó là lí do vì sao register(name) có thể theo dõi được value của 1 field

  // ✅ Handle onChange cho currency input
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const numericValue = parseCurrencyToNumber(inputValue)
    const formattedValue = formatCurrencyInput(numericValue)

    setDisplayValue(formattedValue) // hiển thị thì "1.000"

    if (registerInput?.onChange) {
      registerInput.onChange({
        target: {
          name: e.target.name,
          value: numericValue // Gửi số thuần về form
        }
      })
    }
  }

  const formValue = control && name ? useWatch({ control, name }) : undefined

  useEffect(() => {
    if (!isCurrency) return

    // ✅ Xử lý tất cả trường hợp "empty"
    if (formValue === undefined || formValue === null || formValue === "") {
      setDisplayValue("")
      return
    }

    // ✅ Format giá trị hợp lệ
    const strValue = String(formValue)
    const cleaned = parseCurrencyToNumber(strValue)
    setDisplayValue(formatCurrencyInput(cleaned))
  }, [formValue, isCurrency])

  return (
    <div className={className}>
      <span className={classNameLabel}>{nameInput}</span>

      {isCurrency ? (
        <div className="relative">
          <input
            className={classNameInput}
            {...registerInput}
            {...rest}
            type="text"
            value={displayValue}
            onChange={handleCurrencyChange}
            placeholder={rest.placeholder}
          />
          {currencySuffix && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
              {currencySuffix}
            </span>
          )}
        </div>
      ) : (
        <div className="relative">
          <input className={classNameInput} {...registerInput} {...rest} type={handleType()} />

          {rest.type === "password" && !openEye && (
            <button onClick={toggle} className={classNameEye} type="button">
              <EyeOff color="#393636" size={22} />
            </button>
          )}

          {rest.type === "password" && openEye && (
            <button onClick={toggle} className={classNameEye} type="button">
              <Eye color="#393636" size={22} />
            </button>
          )}

          {/* ✅ Hiển thị suffix cho input thường (nếu có) */}
          {currencySuffix && rest.type !== "password" && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
              {currencySuffix}
            </span>
          )}
        </div>
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
