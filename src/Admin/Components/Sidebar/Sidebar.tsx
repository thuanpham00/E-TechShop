import logo from "src/Assets/img/logo_cut.png"
export default function Sidebar() {
  return (
    <div className="sticky top-0 left-0 p-4 pt-2 bg-[#404e67] h-screen">
      <div>
        <img src={logo} alt="logo" className="w-[75%] mx-auto" />
      </div>
    </div>
  )
}
