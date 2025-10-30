import { ChevronDown } from "lucide-react"

interface Props {
  nameCategory: string
  onHover: () => void
  showCategoryDetail: string
  idCategory: string
}

export default function MenuCategoryItem({ nameCategory, onHover, showCategoryDetail, idCategory }: Props) {
  return (
    <div
      onMouseEnter={onHover}
      className={`px-3 pt-2 pb-[10px] flex items-center gap-2 cursor-pointer duration-200 rounded-tl-[12px] rounded-tr-[12px] last:pb-2  ${showCategoryDetail === idCategory ? "bg-primaryBlue text-white" : "text-gray-600"}`}
    >
      <div className="relative z-10 w-full h-full flex justify-between items-center">
        <span className="text-sm font-medium">{nameCategory}</span>
        <ChevronDown size={16} />
      </div>
    </div>
  )
}
