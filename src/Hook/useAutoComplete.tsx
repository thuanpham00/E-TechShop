import { useEffect, useRef, useState } from "react"

// custom hook Là để tái sử dụng logic (không phải giao diện) giữa các component.
export default function useAutoComplete(listItem: string[], value?: string) {
  const [inputValue, setInputValue] = useState(value || "") // lưu giá trị input nhập
  const [activeField, setActiveField] = useState<boolean>(false) // check input đang focus
  const [filterList, setFilterList] = useState<string[]>([]) // lưu danh sách filter
  const inputRef = useRef<HTMLDivElement>(null)

  const handleClickItemList = (item: string) => {
    setInputValue(item)
    setActiveField(false)
    setFilterList([])
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      const filtered = listItem?.filter((item) => item.toLowerCase().includes(inputValue.toLowerCase()))
      setFilterList(filtered || [])
    }, 500)

    return () => clearTimeout(handler)
  }, [activeField, inputValue, listItem])

  useEffect(() => {
    const clickOutHideList = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        // nơi được click nằm ngoài vùng phần tử
        setActiveField(false)
        setFilterList([])
      }
    }

    document.addEventListener("mousedown", clickOutHideList)
    return () => document.removeEventListener("mousedown", clickOutHideList)
  }, [])

  useEffect(() => {
    if (value !== undefined) {
      setInputValue(value)
    }
  }, [value])

  return {
    inputValue,
    setInputValue,
    activeField,
    setActiveField,
    filterList,
    inputRef,
    handleClickItemList
  }
}
