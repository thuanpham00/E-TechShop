import { ChevronLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function NavigateBack() {
  const navigate = useNavigate()

  const handleGoBack = () => {
    navigate(-1)
  }

  return (
    <button onClick={handleGoBack} className="flex items-center gap-[2px] cursor-pointer">
      <ChevronLeft size={16} />
      <span className="text-[14px] font-medium">Trở lại</span>
    </button>
  )
}
