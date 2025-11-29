import { memo } from "react"
import { Outlet } from "react-router-dom"
import UserSideNav from "../../Components/UserSideNav"

function UserLayoutInner() {
  return (
    <div className="bg-gray-100 text-black py-4 duration-200">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="md:col-span-1 lg:col-span-2">
            <UserSideNav />
          </div>
          <div className="lg:mt-2 md:col-span-1 lg:col-span-10 rounded-sm bg-[#fff] duration-200 shadow px-6 py-3">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}

const UserLayout = memo(UserLayoutInner)
export default UserLayout
