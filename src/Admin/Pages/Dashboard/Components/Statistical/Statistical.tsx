interface Props {
  name: string
  icon: React.ReactNode
  value: string
  classNameCircle: string
}
export default function Statistical({ classNameCircle, value, name, icon }: Props) {
  return (
    <div className="p-4 shadow-sm bg-white border border-[#dedede] rounded-md">
      <div className="flex items-center justify-between">
        <span className="text-[13px] block text-primaryBlue font-medium">{name}</span>
        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${classNameCircle}`}>{icon}</div>
      </div>
      <h1 className="text-2xl font-semibold">{value}</h1>
    </div>
  )
}
