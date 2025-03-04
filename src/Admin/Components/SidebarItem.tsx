import { Link } from "react-router-dom"

interface Props {
  icon: React.ReactNode
  nameSideBar: string
  path: string
  className?: string
}

export function SidebarItem({
  icon,
  nameSideBar,
  path,
  className = "text-[14px] text-black font-medium hover:text-[#495057] duration-200 ease-in"
}: Props) {
  return (
    <Link to={path} className={`flex items-center gap-2 cursor-pointer mb-6`}>
      {icon}
      <span className={className}>{nameSideBar}</span>
    </Link>
  )
}
