import { ChevronRight } from "lucide-react"

interface Props {
  nameCategory: string
  iconCategory: React.ReactNode
}

export default function CategoryItem({ nameCategory, iconCategory }: Props) {
  return (
    <div className="flex items-center gap-2 mb-3 cursor-pointer hover:text-primaryRed duration-200">
      {iconCategory}
      <div className="w-full flex justify-between items-center">
        <span className="text-[13px] font-medium">{nameCategory}</span>
        <ChevronRight size={16} />
      </div>
    </div>
  )
}
