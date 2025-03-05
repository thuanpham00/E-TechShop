import { ChevronLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function NavigateBack() {
  const navigate = useNavigate()
  return (
    <button onClick={() => navigate(-1)} className="flex items-center gap-[2px] py-1 mb-1 cursor-pointer">
      <ChevronLeft size={16} />
      <span className="text-[14px] font-medium">Trở lại</span>
    </button>
  )
}
