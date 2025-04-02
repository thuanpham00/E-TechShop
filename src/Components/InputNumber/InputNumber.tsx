import { forwardRef, InputHTMLAttributes } from "react"

interface InputNumberProps extends InputHTMLAttributes<HTMLInputElement> {
  messageInputError?: string
  classNameInput?: string // ko nhất thiết phải truyền vào props
  classNameError?: string
}

const InputNumber = forwardRef<HTMLInputElement, InputNumberProps>(function InputNumberRef(
  {
    className,
    classNameInput = "p-2 w-full border border-black/60 rounded-sm focus:border-blue-500 focus:ring-2 outline-none text-black dark:text-black",
    classNameError = "text-red-500 text-[13px] font-semibold min-h-[1.25rem] block",
    messageInputError,
    ...rest
  },
  ref
) {
  return (
    <div className={className}>
      <input className={classNameInput} {...rest} ref={ref} />
      <div className={classNameError}>{messageInputError}</div>
    </div>
  )
})

export default InputNumber
/**
 * forwardRef có một mục đích chính:
Cho phép component cha truy cập trực tiếp vào một phần tử DOM (hoặc component con) bên trong component con.
 */
