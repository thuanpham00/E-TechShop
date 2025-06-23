import { Minus, Plus } from "lucide-react"

export default function InputNumberQuantity({
  value,
  max,
  onChangeValue,
  onDecrease,
  onIncrease
}: {
  value: number
  max: number
  onChangeValue: (value: number) => void
  onDecrease: (value: number) => void
  onIncrease: (value: number) => void
}) {
  const handleTypeValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    let _value = Number(event.target.value)
    if (_value > max) {
      _value = max
    } else if (_value < 1) {
      _value = 1
    }
    onChangeValue(_value)
  }

  const handleValueDecrease = () => {
    let _value = Number(value) - 1
    if (_value < 1) {
      _value = 1
    }
    onDecrease(_value)
  }

  const handleValueIncrease = () => {
    let _value = Number(value) + 1
    if (_value > max) {
      _value = max
    }
    onIncrease(_value)
  }

  return (
    <div className="flex items-center">
      <button
        onClick={handleValueDecrease}
        type="button"
        className="border border-gray-200 p-2 h-[30px] bg-gray-100 rounded-tl-sm rounded-bl-sm hover:bg-gray-300 duration-200"
      >
        <Minus size={14} />
      </button>
      <input
        type="text"
        value={value}
        className="w-12 h-[30px] text-center border border-gray-300 outline-0 border-r-0 border-l-0"
        onChange={handleTypeValue}
      />
      <button
        onClick={handleValueIncrease}
        type="button"
        className="border border-gray-200 p-2 h-[30px] bg-gray-100 rounded-tr-sm rounded-br-sm hover:bg-gray-300 duration-200"
      >
        <Plus size={14} />
      </button>
    </div>
  )
}
