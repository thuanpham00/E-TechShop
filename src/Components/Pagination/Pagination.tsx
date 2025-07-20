import { createSearchParams, Link } from "react-router-dom"
import classNames from "classnames"
import { queryParamConfig } from "src/Types/queryParams.type"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { SuccessResponse } from "src/Types/utils.type"
import { UserType } from "src/Types/user.type"
import {
  BrandItemType,
  CategoryItemType,
  OrderItemType,
  ProductItemType,
  ReceiptItemType,
  SupplierItemType,
  SupplyItemType
} from "src/Types/product.type"

interface Props {
  queryConfig: queryParamConfig
  page_size: number
  pathNavigate: string
  data: SuccessResponse<{
    result:
      | UserType[]
      | CategoryItemType[]
      | BrandItemType[]
      | ProductItemType[]
      | SupplierItemType[]
      | SupplyItemType[]
      | ReceiptItemType[]
      | OrderItemType[]
    total: string
    page: string
    limit: string
    totalOfPage: string
  }>
  scroll?: () => void
}

const range = 2

export default function Pagination({ queryConfig, page_size, pathNavigate, scroll, data }: Props) {
  const page = Number(queryConfig.page) // lấy từ url xuống và url nhận vào các params
  const renderPagination = () => {
    let dotAfter = false
    let dotBefore = true

    const renderDotBefore = (index: number) => {
      if (!dotBefore) {
        dotBefore = true
        return (
          <span key={index} className="hover:bg-slate-200 duration-300 rounded px-3 py-2 shadow-sm mx-2 cursor-pointer">
            ...
          </span>
        )
      }
      return null
    }

    const renderDotAfter = (index: number) => {
      if (!dotAfter) {
        dotAfter = true
        return (
          <span key={index} className="hover:bg-slate-200 duration-300 rounded px-3 py-2 shadow-sm mx-2 cursor-pointer">
            ...
          </span>
        )
      }
      return null
    }

    return Array(page_size || 0)
      .fill(0)
      .map((_, index) => {
        const pageNumber = index + 1
        const isActive = pageNumber === page
        if (page <= range * 2 + 1 && pageNumber > page + range && pageNumber < page_size - range + 1) {
          return renderDotAfter(index)
        } else if (page > range * 2 + 1 && page < page_size - range * 2) {
          if (pageNumber < page - range && pageNumber > range) {
            return renderDotBefore(index)
          } else if (pageNumber > page + range && pageNumber < page_size - range + 1) {
            return renderDotAfter(index)
          }
        } else if (pageNumber < page - range && pageNumber > range && page >= page_size - range * 2) {
          return renderDotBefore(index)
        }
        return (
          <Link
            onClick={scroll}
            key={index}
            to={{
              pathname: pathNavigate,
              search: createSearchParams({
                ...queryConfig,
                page: pageNumber.toString()
              }).toString()
            }}
            className={classNames(
              "text-xs md:test-base py-2 px-3 flex items-center justify-center border border-primaryColor rounded-md hover:bg-gray-300",
              {
                "border border-[#0077b6] text-[#0077b6]": isActive,
                "border border-[#dedede]": !isActive
              }
            )}
          >
            {pageNumber}
          </Link>
        )
      })
  }
  return (
    <div className="mt-4 flex gap-2 items-center justify-end">
      <div>
        {queryConfig.page !== "1" ? Number(queryConfig.limit) * (Number(queryConfig.page) - 1) + 1 : 1} -{" "}
        {Number(data?.result?.limit) * (Number(data?.result?.page) - 1) + Number(data?.result?.totalOfPage)} trên{" "}
        {data?.result?.total} dòng
      </div>
      <div className="flex items-center justify-center gap-2">
        {page === 1 ? (
          <span
            className={`cursor-not-allowed text-xs md:test-base p-2 border border-[#dedede] rounded-md hover:bg-gray-300 duration-200`}
          >
            <ChevronLeft size={15} />
          </span>
        ) : (
          <Link
            to={{
              pathname: pathNavigate,
              search: createSearchParams({
                ...queryConfig,
                page: (page - 1).toString()
              }).toString()
            }}
            className={`text-xs md:test-base p-2  border border-[#dedede] rounded-md hover:bg-gray-300 duration-200`}
          >
            <ChevronLeft size={15} />
          </Link>
        )}

        {renderPagination()}

        {page === page_size ? (
          <span
            className={`cursor-not-allowed text-xs md:test-base p-2 border border-[#dedede] rounded-md hover:bg-gray-300 duration-200`}
          >
            <ChevronRight size={15} />
          </span>
        ) : (
          <Link
            to={{
              pathname: pathNavigate,
              search: createSearchParams({
                ...queryConfig,
                page: (page + 1).toString()
              }).toString()
            }}
            className={`text-xs md:test-base p-2 border border-[#dedede]  rounded-md hover:bg-gray-300 duration-200`}
          >
            <ChevronRight size={15} />
          </Link>
        )}
      </div>
    </div>
  )
}
