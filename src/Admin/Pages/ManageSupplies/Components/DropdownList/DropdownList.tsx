import { UseFormRegister } from "react-hook-form"
import Input from "src/Components/Input"
import useAutoComplete from "src/Hook/useAutoComplete"

interface DropDownListType {
  name: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>
  listItem: string[]
  onSelect: (item: string) => void
  nameInput?: string
  setInputValueProductCPNFather?: React.Dispatch<React.SetStateAction<string>>
  setInputValueProductCPNFather_2?: (value: string, index: number) => void
  isAddItem: boolean
  value?: string
  classNameWrapper?: string
  index?: number
  placeholderName?: string
}

export default function DropdownList({
  name,
  register,
  listItem,
  onSelect,
  isAddItem,
  nameInput,
  setInputValueProductCPNFather,
  setInputValueProductCPNFather_2,
  value,
  classNameWrapper = "mt-2 w-full relative",
  index,
  placeholderName = "Nhập tên sản phẩm"
}: DropDownListType) {
  const { activeField, setActiveField, inputValue, setInputValue, filterList, inputRef, handleClickItemList } =
    useAutoComplete(listItem, value)

  const handleClickSelect = (item: string) => {
    handleClickItemList(item)
    onSelect(item) // mong đợi 1 tham số với kiểu string truyền vào và return về void // dùng để setValue
    if (name == "productId" && setInputValueProductCPNFather) {
      setInputValueProductCPNFather(item)
    }

    if (name == "productId" && setInputValueProductCPNFather_2 && typeof index === "number") {
      setInputValueProductCPNFather_2(item, index)
    }
  }

  return (
    <div className={classNameWrapper}>
      {isAddItem ? (
        <Input
          name={name}
          register={register}
          placeholder={placeholderName}
          classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-black focus:border-blue-500 focus:ring-1 outline-none rounded-md h-[35px]"
          className="relative flex-grow"
          classNameError="hidden"
          nameInput={nameInput}
          value={inputValue}
          onFocus={() => setActiveField(true)}
          onChange={(event) => {
            setInputValue(event.target.value)
          }}
        />
      ) : (
        <Input
          name={name}
          register={register}
          placeholder="Nhập tên sản phẩm"
          classNameInput="p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-black focus:border-blue-500 focus:ring-1 outline-none rounded-md h-[35px]"
          className="relative flex-grow"
          classNameError="hidden"
          value={inputValue}
          onFocus={() => setActiveField(true)}
          onChange={(event) => setInputValue(event.target.value)}
        />
      )}
      {activeField && filterList.length > 0 && (
        <div
          ref={inputRef}
          className={`absolute ${isAddItem ? "top-16" : "top-9"} left-0 bg-[#fff] z-20 rounded-md max-h-60 w-full overflow-y-auto shadow-md`}
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
