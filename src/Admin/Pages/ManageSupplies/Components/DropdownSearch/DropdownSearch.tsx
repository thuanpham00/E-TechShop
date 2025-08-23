import { UseFormRegister } from "react-hook-form"
import Input from "src/Components/Input"
import useAutoComplete from "src/Hook/useAutoComplete"

interface DropDownListType {
  name: string
  namePlaceholder: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>
  listItem: string[]
  onSelect: (item: string) => void
  value?: string
  onChangeValue: React.Dispatch<React.SetStateAction<string>>
}

export default function DropdownSearch({
  name,
  namePlaceholder,
  register,
  listItem,
  onSelect,
  value,
  onChangeValue
}: DropDownListType) {
  const { activeField, setActiveField, inputValue, setInputValue, filterList, inputRef, handleClickItemList } =
    useAutoComplete(listItem, value)

  const handleClickSelect = (item: string) => {
    handleClickItemList(item)
    onSelect(item) // mong đợi 1 tham số với kiểu string truyền vào và return về void // dùng để setValue
    onChangeValue(item)
  }

  return (
    <div className="mt-2 w-full relative">
      <Input
        name={name}
        register={register}
        placeholder={namePlaceholder}
        classNameInput="p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-1 outline-none rounded-md text-black dark:text-white"
        className="relative flex-grow"
        classNameError="hidden"
        value={inputValue}
        onFocus={() => setActiveField(true)}
        onChange={(event) => {
          setInputValue(event.target.value)
          onChangeValue(event.target.value)
        }}
      />
      {activeField && filterList.length > 0 && (
        <div
          ref={inputRef}
          className={`absolute top-9 left-0 bg-[#fff] z-20 rounded-md max-h-60 w-full overflow-y-auto shadow-md`}
        >
          {filterList.map((item) => (
            <button
              type="button"
              key={item}
              className="p-2 border border-[#f2f2f2] w-full text-left text-[13px] first:rounded-tl-md first:rounded-tr-md last:rounded-bl-md last:rounded-br-md hover:bg-[#dadada] duration-200"
              onClick={() => handleClickSelect(item)}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
