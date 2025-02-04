import { House } from "lucide-react"
import { getNameParams } from "src/Helpers/common"

export default function Breadcrumb({ slug }: { slug: string }) {
  return (
    <div className="my-4 flex gap-2">
      <span className="text-[14px] flex items-center gap-1 text-[#1982F9] font-semibold">
        <House size={15} color="#1982F9" />
        Trang chủ
      </span>
      <span className="text-[16px] text-[#6D6E72]">/</span>
      <span className="text-[14px] text-[#6D6E72]">{getNameParams(slug as string)}</span>
    </div>
  )
}
