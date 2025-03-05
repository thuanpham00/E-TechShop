interface Props {
  name: string
  icon: React.ReactNode
  value: string
  classNameCircle: string
}
export function Statistical({ classNameCircle, value, name, icon }: Props) {
  return (
    <div className="p-4 shadow-sm bg-white border border-[#dedede] rounded-md flex items-center gap-4">
      <div className={`flex items-center justify-center w-12 h-12 rounded-full ${classNameCircle}`}>{icon}</div>
      <div>
        <span className="text-[13px] block text-primaryBlue font-medium">{name}</span>
        <h1 className="text-2xl font-semibold">{value}</h1>
      </div>
    </div>
  )
}
