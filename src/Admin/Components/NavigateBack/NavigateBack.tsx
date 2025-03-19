import { ChevronLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"

interface NavigateBackProps {
  queryKey?: string[] // Prop truyền vào để xác định query cần invalidate
}

export default function NavigateBack({ queryKey }: NavigateBackProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const handleGoBack = () => {
    navigate(-1)
    if (queryKey) {
      queryClient.invalidateQueries({ queryKey: queryKey }) // Làm mới query nếu có truyền vào
    }
  }

  return (
    <button onClick={handleGoBack} className="flex items-center gap-[2px] cursor-pointer">
      <ChevronLeft size={16} />
      <span className="text-[14px] font-medium">Trở lại</span>
    </button>
  )
}
