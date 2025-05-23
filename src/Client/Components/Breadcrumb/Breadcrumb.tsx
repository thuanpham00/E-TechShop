import { House } from "lucide-react"
import { getNameParams } from "src/Helpers/common"

export default function Breadcrumb({ slug_1, slug_2 }: { slug_1: string; slug_2?: string }) {
  return (
    <div className="my-3 flex items-center gap-2">
      <span className="text-[14px] flex items-center gap-1 text-[#1982F9] font-semibold">
        <House size={15} color="#1982F9" />
        Trang chủ
      </span>
      <span className="text-[16px] text-[#6D6E72]">/</span>
      {slug_1 !== "" && slug_2 === undefined && (
        <span className="text-[14px] text-[#6D6E72]">{getNameParams(slug_1 as string)}</span>
      )}
      {slug_1 !== "" && slug_2 !== undefined && (
        <div className="flex items-center gap-2">
          <span className="text-[14px] text-[#1982F9] font-semibold">{slug_1 as string}</span>
          <span className="text-[16px] text-[#6D6E72]"> / </span>
          <span className="text-[14px] text-[#6D6E72]">{slug_2 as string}</span>
        </div>
      )}
    </div>
  )
}
