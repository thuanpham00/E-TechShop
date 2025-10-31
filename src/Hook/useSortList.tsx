/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSearchParams, useNavigate } from "react-router-dom"

export default function useSortList() {
  const navigate = useNavigate()

  const handleSort = (value: string, queryConfig: Record<string, any>, pathname: string) => {
    const body = {
      ...queryConfig,
      sortBy: value
    }
    navigate({
      pathname,
      search: createSearchParams(body).toString()
    })
  }

  return { handleSort }
}
