import { ButtonHTMLAttributes } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  nameButton: string
  classNameInput?: string
  className?: string
}

export default function Button({
  nameButton,
  className,
  classNameInput = "p-4 bg-blue-500 mt-2 w-full text-white font-semibold rounded-sm hover:bg-blue-500/80 duration-200",
  ...rest
}: ButtonProps) {
  return (
    <div className={className}>
      <button type="submit" className={classNameInput} {...rest}>
        {nameButton}
      </button>
    </div>
  )
}
