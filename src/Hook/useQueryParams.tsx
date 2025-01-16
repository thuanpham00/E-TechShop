import { useSearchParams } from "react-router-dom"

export default function useQueryParams() {
  const [searchParams] = useSearchParams()
  return Object.fromEntries([...searchParams]) // thay đổi thành cặp key-value obj
}
