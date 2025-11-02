import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { collectionAPI } from "src/Apis/client/collections.api"

export default function useCollectionTopSold(slug: string, queryKey: string) {
  return useQuery({
    queryKey: [queryKey],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)

      return collectionAPI
        .getCollections({
          slug,
          params: {},
          signal: controller.signal
        })
        .then((res) => res)
        .catch((err) => Promise.reject(err))
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 15 * 60 * 1000, // dưới 5 phút nó không gọi lại api
    placeholderData: keepPreviousData
  })
}
