import { House } from "lucide-react"
import { getNameParams } from "src/Helpers/common"

export default function Breadcrumb({ slug_1, slug_2 }: { slug_1: string; slug_2?: string }) {
  return (
    <div className="my-3 flex items-center flex-wrap gap-1">
      <span className="text-[14px] flex items-center gap-1 text-[#1982F9] font-semibold">
        <House size={15} color="#1982F9" />
        Trang chủ
      </span>
      <span className="text-[16px] text-[#6D6E72]">/</span>
      {slug_1 && (
        <span className={`text-[14px] ${slug_2 ? "text-[#1982F9] font-semibold" : "text-[#6D6E72]"}`}>
          {getNameParams(slug_1)}
        </span>
      )}
      {slug_2 && (
        <>
          <span className="text-[16px] text-[#6D6E72]">/</span>
          <span className="text-[14px] text-[#6D6E72]">{slug_2}</span>
        </>
      )}
    </div>
  )
}
