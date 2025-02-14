import { Link } from "react-router-dom"

interface Props {
  icon: React.ReactNode
  nameSideBar: string
  path: string
}

export default function SidebarItem({ icon, nameSideBar, path }: Props) {
  return (
    <Link to={path} className="flex items-center gap-2 cursor-pointer mb-6">
      {icon}
      <span className="text-[14px] text-black font-medium hover:text-[#495057] duration-200 ease-in">
        {nameSideBar}
      </span>
    </Link>
  )
}
