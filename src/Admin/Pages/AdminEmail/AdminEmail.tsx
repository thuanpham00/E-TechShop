import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { isUndefined, omitBy } from "lodash"
import { useContext } from "react"
import { emailAPI } from "src/Apis/email.api"
import Pagination from "src/Components/Pagination"
import Skeleton from "src/Components/Skeleton"
import { AppContext } from "src/Context/authContext"
import useQueryParams from "src/Hook/useQueryParams"
import { queryParamConfigEmail } from "src/Types/queryParams.type"
import { SuccessResponse } from "src/Types/utils.type"
import { motion } from "framer-motion"
import { Empty } from "antd"
import { path } from "src/Constants/path"
import { Helmet } from "react-helmet-async"
import NavigateBack from "src/Admin/Components/NavigateBack"
import { EmailLogItemType } from "src/Types/product.type"
import EmailLogItem from "./Components/EmailLogItem/EmailLogItem"

export default function AdminEmail() {
  const { userId } = useContext(AppContext)
  const getDomainResendQuery = useQuery({
    queryKey: ["domainResend", userId],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)
      return emailAPI.getDomains(controller.signal)
    },
    retry: 0,
    staleTime: 15 * 60 * 1000, // dưới 3 phút nó không gọi lại api
    placeholderData: keepPreviousData
  })

  const domainData = getDomainResendQuery.data?.data.data[0]

  const queryParams: queryParamConfigEmail = useQueryParams()
  const queryConfig: queryParamConfigEmail = omitBy(
    {
      page: queryParams.page || "1", // mặc định page = 1
      limit: queryParams.limit || "10" // mặc định limit =
    },
    isUndefined
  )

  const { data, isFetching, isLoading } = useQuery({
    queryKey: ["listEmailLog", queryConfig],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)
      return emailAPI.getEmails(controller.signal, queryConfig)
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 3 * 60 * 1000, // dưới 5 phút nó không gọi lại api
    placeholderData: keepPreviousData
    // chỉ chạy khi id có giá trị
  })

  const result = data?.data as SuccessResponse<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result: EmailLogItemType[]
    total: string
    page: string
    limit: string
    totalOfPage: string
    listTotalProduct: { brand: string; total: string }[]
  }>
  const listEmailLog = result?.result?.result
  const page_size = Math.ceil(Number(result?.result.total) / Number(result?.result.limit))

  return (
    <div>
      <Helmet>
        <title>Quản lý thông báo email</title>
        <meta
          name="description"
          content="Đây là trang TECHZONE | Laptop, PC, Màn hình, điện thoại, linh kiện Chính Hãng"
        />
      </Helmet>
      <NavigateBack />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          {getDomainResendQuery.isLoading && <Skeleton />}
          {!getDomainResendQuery.isFetching && (
            <div className="mt-2 p-4 bg-white dark:bg-darkPrimary dark:border-0 rounded-2xl shadow-md space-y-4 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Thông tin Domain</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-white">Name:</span>
                  <span className="text-gray-900 font-medium dark:text-gray-300">{domainData?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-white">Status:</span>
                  <span className="text-green-600 font-semibold capitalize dark:text-gray-300">
                    {domainData?.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-white">Region:</span>
                  <span className="text-gray-700 dark:text-gray-300">{domainData?.region}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-white">Created at:</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {new Date(domainData?.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-white">ID:</span>
                  <span className="text-gray-700 w-40 text-right dark:text-gray-300">{domainData?.id}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          {isLoading && <Skeleton />}
          {!isFetching && (
            <div>
              <div className="mt-4 shadow-lg">
                <div className="bg-[#fff] dark:bg-darkPrimary grid grid-cols-12 items-center gap-2 py-3 border border-[#dedede] dark:border-darkBorder px-4 rounded-tl-xl rounded-tr-xl ">
                  <div className="col-span-1 text-[14px] font-semibold tracking-wider uppercase">Mã resend</div>
                  <div className="col-span-2 text-[14px] font-semibold tracking-wider uppercase">Email gửi</div>
                  <div className="col-span-2 text-[14px] font-semibold tracking-wider uppercase">Email nhận</div>
                  <div className="col-span-3 text-[14px] font-semibold tracking-wider uppercase">Tiêu đề</div>
                  <div className="col-span-2 text-[14px] font-semibold tracking-wider uppercase">Loại email</div>
                  <div className="col-span-1 text-[14px] font-semibold tracking-wider uppercase">Trạng thái</div>
                  <div className="col-span-1 text-[14px] font-semibold tracking-wider uppercase">Ngày tạo</div>
                </div>
                <div>
                  {listEmailLog?.length > 0 ? (
                    listEmailLog.map((item, index) => (
                      <motion.div
                        key={item._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <EmailLogItem item={item} maxIndex={listEmailLog?.length} index={index} />
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center mt-4">
                      <Empty />
                    </div>
                  )}
                </div>
              </div>
              <Pagination
                data={result}
                queryConfig={queryConfig}
                page_size={page_size}
                pathNavigate={`${path.AdminEmail}`}
              />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
