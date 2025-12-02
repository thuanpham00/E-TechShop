/* eslint-disable @typescript-eslint/no-explicit-any */
import { yupResolver } from "@hookform/resolvers/yup"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Button, Collapse, CollapseProps, Empty, Image, Modal, Rate, Table } from "antd"
import { ColumnsType } from "antd/es/table"
import { isUndefined, omit, omitBy } from "lodash"
import { useEffect, useState } from "react"
import { Helmet } from "react-helmet-async"
import { Controller, useForm } from "react-hook-form"
import { createSearchParams, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import DatePicker from "src/Admin/Components/DatePickerRange"
import NavigateBack from "src/Admin/Components/NavigateBack"
import { ReviewAPI } from "src/Apis/admin/review.api"
import { SchemaReviewType, schemaSearchFilterReview } from "src/Client/Utils/rule"
import Skeleton from "src/Components/Skeleton"
import { HttpStatusCode } from "src/Constants/httpStatus"
import { path } from "src/Constants/path"
import { cleanObject } from "src/Helpers/common"
import useQueryParams from "src/Hook/useQueryParams"
import { ReviewItemType } from "src/Types/product.type"
import { queryParamConfigReview } from "src/Types/queryParams.type"
import { SuccessResponse } from "src/Types/utils.type"
import ButtonBase from "src/Components/Button"
import { RotateCcw, Search } from "lucide-react"
import Input from "src/Components/Input"

const formDataSearch = schemaSearchFilterReview.pick([
  "created_at_start",
  "created_at_end",
  "updated_at_start",
  "updated_at_end",
  "name",
  "rating"
])

type FormDataSearch = Pick<
  SchemaReviewType,
  "created_at_start" | "created_at_end" | "updated_at_start" | "updated_at_end" | "name" | "rating"
>

export default function ManageReview() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const queryParams: queryParamConfigReview = useQueryParams()
  const queryConfig: queryParamConfigReview = omitBy(
    {
      page: queryParams.page || "1", // mặc định page = 1
      limit: queryParams.limit || "5", // mặc định limit = 5
      created_at_start: queryParams.created_at_start,
      created_at_end: queryParams.created_at_end,
      updated_at_start: queryParams.updated_at_start,
      updated_at_end: queryParams.updated_at_end,
      name: queryParams.name,
      rating: queryParams.rating,

      sortBy: queryParams.sortBy || "new" // mặc định sort mới nhất
    },
    isUndefined
  )

  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: ["listReview", queryConfig],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort() // hủy request khi chờ quá lâu // 10 giây sau cho nó hủy // làm tự động
      }, 10000)
      return ReviewAPI.getReviews(queryConfig as queryParamConfigReview, controller.signal)
    },
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 3 * 60 * 1000, // dưới 3 phút nó không gọi lại api

    placeholderData: keepPreviousData
  })

  const result = data?.data as SuccessResponse<{
    result: ReviewItemType[]
    total: string
    page: string
    limit: string
    totalOfPage: string
  }>
  const listCategory = result?.result?.result

  const columns: ColumnsType<ReviewItemType> = [
    {
      title: "Sản phẩm",
      dataIndex: "productId",
      key: "product",
      render: (_: any, record: ReviewItemType) => (
        <div className="flex items-center gap-2">
          <Image
            src={record.productId.banner.url}
            alt={record.productId.name}
            width={120}
            height={120}
            style={{ objectFit: "contain", borderRadius: 6 }}
            preview={false}
          />
          <span className="font-medium">{record.productId.name}</span>
        </div>
      ),
      width: 180,
      fixed: "left"
    },
    {
      title: "Đơn hàng",
      dataIndex: "orderId",
      key: "orderId",
      render: (orderId: string) => <span className="font-mono">{orderId}</span>,
      width: 120
    },
    {
      title: "Người đánh giá",
      dataIndex: "userId",
      key: "user",
      render: (_: any, record: ReviewItemType) => (
        <div className="flex items-center gap-2">
          <Image
            src={record.userId.avatar}
            alt={record.userId.name}
            width={32}
            height={32}
            style={{ borderRadius: "50%" }}
            preview={false}
          />
          <span>{record.userId.name}</span>
        </div>
      ),
      width: 150
    },
    {
      title: "Số sao",
      dataIndex: "rating",
      key: "rating",
      render: (rating: number) => <Rate disabled value={rating} />,
      width: 100,
      align: "center"
    },
    {
      title: "Nội dung",
      dataIndex: "comment",
      key: "comment",
      render: (comment: string) => <span className="line-clamp-2 text-gray-700 dark:text-white">{comment}</span>,
      width: 180
    },
    {
      title: "Thời gian",
      dataIndex: "created_at",
      key: "created_at",
      render: (created_at: string) => new Date(created_at).toLocaleString("vi-VN"),
      width: 140
    },
    {
      title: "Phản hồi",
      key: "replies",
      render: (_: any, record: ReviewItemType) => (
        <button
          className="text-blue-500"
          onClick={() => {
            setShowModalReview(record)
          }}
        >
          Xem chi tiết
        </button>
      ),
      width: 100,
      align: "center"
    }
  ]

  const {
    register: registerFormSearch,
    handleSubmit: handleSubmitFormSearch,
    reset: resetFormSearch,
    control: controlFormSearch,
    trigger
  } = useForm<FormDataSearch>({
    resolver: yupResolver(formDataSearch),
    defaultValues: {}
  })

  const handleSubmitSearch = handleSubmitFormSearch(
    (data) => {
      const params = cleanObject({
        ...queryConfig,
        page: 1,
        sortBy: "new",
        created_at_start: data.created_at_start?.toISOString(),
        created_at_end: data.created_at_end?.toISOString(),
        updated_at_start: data.updated_at_start?.toISOString(),
        updated_at_end: data.updated_at_end?.toISOString(),
        name: data.name?.trim(),
        rating: data.rating
      })
      navigate({
        pathname: path.AdminReview,
        search: createSearchParams(params).toString()
      })
    },
    (error) => {
      if (error.created_at_end) {
        toast.error(error.created_at_end?.message, { autoClose: 1500 })
      }
      if (error.updated_at_end) {
        toast.error(error.updated_at_end?.message, { autoClose: 1500 })
      }
      console.log(error)
    }
  )

  const handleResetFormSearch = () => {
    const filteredSearch = omit(queryConfig, [
      "created_at_start",
      "created_at_end",
      "updated_at_start",
      "updated_at_end",
      "name",
      "rating"
    ])
    resetFormSearch()
    navigate({ pathname: path.AdminReview, search: createSearchParams(filteredSearch).toString() })
  }

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: <h1 className="text-[16px] font-semibold tracking-wide text-black dark:text-white">Bộ lọc & Tìm kiếm</h1>,
      children: (
        <section className="bg-white dark:bg-darkPrimary mb-3 dark:border-darkBorder rounded-2xl">
          <form onSubmit={handleSubmitSearch}>
            <div className="mt-1 grid grid-cols-2">
              <div className="col-span-1 flex items-center h-14 px-2 bg-[#ececec] dark:bg-darkPrimary border border-[#dadada] rounded-tl-md">
                <span className="w-[25%] dark:text-white">Ngày tạo</span>
                <div className="w-[75%] relative h-full">
                  <div className="mt-2 w-full flex items-center gap-2">
                    <Controller
                      name="created_at_start"
                      control={controlFormSearch}
                      render={({ field }) => {
                        return (
                          <DatePicker
                            value={field.value as Date}
                            onChange={(event) => {
                              field.onChange(event)
                              trigger("created_at_end")
                            }}
                          />
                        )
                      }}
                    />
                    <span className="text-black dark:text-white">-</span>
                    <Controller
                      name="created_at_end"
                      control={controlFormSearch}
                      render={({ field }) => {
                        return (
                          <DatePicker
                            value={field.value as Date}
                            onChange={(event) => {
                              field.onChange(event)
                              trigger("created_at_start")
                            }}
                          />
                        )
                      }}
                    />
                  </div>
                  <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
                </div>
              </div>
              <div className="col-span-1 flex items-center h-14 px-2 bg-[#ececec] dark:bg-darkPrimary border border-[#dadada] rounded-tr-md">
                <span className="w-[25%] dark:text-white">Ngày cập nhật</span>
                <div className="w-[75%] relative h-full">
                  <div className="mt-2 w-full flex items-center gap-2">
                    <Controller
                      name="updated_at_start"
                      control={controlFormSearch}
                      render={({ field }) => {
                        return (
                          <DatePicker
                            value={field.value as Date}
                            onChange={(event) => {
                              field.onChange(event)
                              trigger("updated_at_end")
                            }}
                          />
                        )
                      }}
                    />
                    <span className="text-black dark:text-white">-</span>
                    <Controller
                      name="updated_at_end"
                      control={controlFormSearch}
                      render={({ field }) => {
                        return (
                          <DatePicker
                            value={field.value as Date}
                            onChange={(event) => {
                              field.onChange(event)
                              trigger("updated_at_start")
                            }}
                          />
                        )
                      }}
                    />
                  </div>
                  <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
                </div>
              </div>
              <div className="col-span-1 flex items-center h-14 px-2 bg-[#fff] dark:bg-darkPrimary border border-t-0 border-[#dadada] rounded-bl-md">
                <span className="w-[25%] dark:text-white">Sản phẩm</span>
                <div className="w-[75%] relative h-full">
                  <Input
                    name="name"
                    register={registerFormSearch}
                    placeholder="Nhập sản phẩm"
                    classNameInput="p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#fff] dark:bg-darkSecond focus:border-blue-500 focus:ring-1 outline-none rounded-md text-black dark:text-white"
                    className="relative mt-2"
                    classNameError="hidden"
                  />
                  <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
                </div>
              </div>
              <div className="col-span-1 flex items-center h-14 px-2 bg-[#fff] dark:bg-darkPrimary border border-t-0 border-[#dadada] rounded-br-md">
                <span className="w-[25%] dark:text-white">Rating</span>
                <div className="w-[75%] relative h-full">
                  <Input
                    name="rating"
                    register={registerFormSearch}
                    placeholder="Nhập rating"
                    classNameInput="p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#fff] dark:bg-darkSecond focus:border-blue-500 focus:ring-1 outline-none rounded-md text-black dark:text-white"
                    className="relative mt-2"
                    classNameError="hidden"
                  />
                  <span className="absolute inset-y-0 left-[-5%] w-[1px] bg-[#dadada] h-full"></span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <ButtonBase
                onClick={handleResetFormSearch}
                type="button"
                icon={<RotateCcw size={15} />}
                nameButton="Xóa bộ lọc"
                classNameButton="py-2 px-3 bg-[#f2f2f2] border border-[#dedede] w-full text-black font-medium hover:bg-[#dedede]/80 rounded-md duration-200 text-[13px] flex items-center gap-1 h-[35px]"
              />
              <ButtonBase
                type="submit"
                icon={<Search size={15} />}
                nameButton="Tìm kiếm"
                classNameButton="py-2 px-3 bg-blue-500 w-full text-white font-medium rounded-md hover:bg-blue-500/80 duration-200 text-[13px] flex items-center gap-1 h-[35px]"
                className="flex-shrink-0"
              />
            </div>
          </form>
        </section>
      )
    }
  ]

  const [showModalReview, setShowModalReview] = useState<null | ReviewItemType>(null)

  // xử lý xóa đánh giá
  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: string) => ReviewAPI.deleteReview(reviewId),
    onSuccess: () => {
      toast.success("Xóa đánh giá thành công", { autoClose: 1500 })
    }
  })

  useEffect(() => {
    if (isError) {
      const status = (error as any)?.response?.status
      if (status === HttpStatusCode.NotFound) {
        navigate(path.AdminNotFound, { replace: true })
      }
    }
  }, [isError, error, navigate])

  return (
    <div>
      <Helmet>
        <title>Quản lý đánh giá</title>
        <meta
          name="description"
          content="Đây là trang TECHZONE | Laptop, PC, Màn hình, điện thoại, linh kiện Chính Hãng"
        />
      </Helmet>
      <NavigateBack />
      <h1 className="text-2xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 my-2">
        Đánh giá
      </h1>
      <Collapse items={items} defaultActiveKey={["2"]} className="bg-white dark:bg-darkPrimary dark:border-none" />
      <section className="bg-white dark:bg-darkPrimary mb-3 dark:border-darkBorder mt-4">
        {isLoading ? (
          <Skeleton />
        ) : listCategory && listCategory.length > 0 ? (
          <Table
            rowKey={(record) => record._id}
            dataSource={listCategory}
            columns={columns}
            loading={isFetching}
            scroll={{ x: "max-content" }}
            pagination={{
              current: Number(queryConfig.page),
              pageSize: Number(queryConfig.limit),
              total: Number(result?.result.total || 0),
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20", "50"],
              onChange: (page, pageSize) => {
                navigate({
                  pathname: path.AdminReview,
                  search: createSearchParams({
                    ...queryConfig,
                    page: page.toString(),
                    limit: pageSize.toString()
                  }).toString()
                })
              }
            }}
            rowClassName={(_, index) =>
              index % 2 === 0 ? "bg-[#f2f2f2] dark:bg-darkSecond" : "bg-white dark:bg-darkPrimary"
            }
          />
        ) : (
          !isFetching && (
            <div className="text-center mt-4">
              <Empty description="Chưa có danh mục nào" />
            </div>
          )
        )}
      </section>

      <Modal
        title={<span className="dark:text-white">Chi tiết đánh giá</span>}
        open={Boolean(showModalReview)}
        onCancel={() => setShowModalReview(null)}
        footer={null}
        width={700}
        className="dark:[&_.ant-modal-content]:bg-darkPrimary dark:[&_.ant-modal-content]:border dark:[&_.ant-modal-content]:border-darkBorder dark:[&_.ant-modal-header]:bg-darkPrimary dark:[&_.ant-modal-header]:border-b dark:[&_.ant-modal-header]:border-darkBorder dark:[&_.ant-modal-title]:text-white dark:[&_.ant-modal-body]:bg-darkPrimary dark:[&_.ant-modal-body]:text-white"
      >
        {showModalReview && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Image
                src={showModalReview.productId.banner.url}
                alt={showModalReview.productId.name}
                width={60}
                height={60}
                style={{ objectFit: "contain", borderRadius: 8 }}
                preview={false}
              />
              <div>
                <div className="font-semibold dark:text-white">{showModalReview.productId.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-300">Đơn hàng: {showModalReview.orderId}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Image
                src={showModalReview.userId.avatar}
                alt={showModalReview.userId.name}
                width={32}
                height={32}
                style={{ borderRadius: "50%" }}
                preview={false}
              />
              <span className="font-medium dark:text-white">{showModalReview.userId.name}</span>
              <Rate disabled value={showModalReview.rating} />
            </div>
            <div>
              <div className="font-semibold mb-1 dark:text-white">Tiêu đề:</div>
              <div className="dark:text-white">{showModalReview.title}</div>
            </div>
            <div>
              <div className="font-semibold mb-1 dark:text-white">Nội dung:</div>
              <div className="dark:text-white">{showModalReview.comment}</div>
            </div>
            <div>
              <div className="font-semibold mb-1 dark:text-white">Ảnh:</div>
              {showModalReview.images && showModalReview.images.length > 0 ? (
                <div className="flex gap-2">
                  {showModalReview.images.map((img: any) => (
                    <Image key={img.id} src={img.url} width={60} height={60} style={{ borderRadius: 6 }} />
                  ))}
                </div>
              ) : (
                <span className="text-gray-400 dark:text-gray-300">Không có ảnh</span>
              )}
            </div>
            <div>
              <div className="font-semibold mb-1 dark:text-white">Thời gian:</div>
              <div className="dark:text-white">{new Date(showModalReview.created_at).toLocaleString("vi-VN")}</div>
            </div>
            <Button
              type="primary"
              className="!bg-red-500 !hover:bg-red-300 !ml-auto block"
              typeof="button"
              loading={deleteReviewMutation.isPending}
              onClick={() =>
                Modal.confirm({
                  title: "Bạn có chắc chắn muốn xóa?",
                  content: "Không thể hoàn tác hành động này. Thao tác này sẽ xóa vĩnh viễn dữ liệu của bạn.",
                  okText: "Xóa",
                  okButtonProps: { danger: true },
                  cancelText: "Hủy",
                  className:
                    "dark:[&_.ant-modal-content]:bg-darkPrimary dark:[&_.ant-modal-content]:border dark:[&_.ant-modal-content]:border-darkBorder dark:[&_.ant-modal-header]:bg-darkPrimary dark:[&_.ant-modal-header]:border-b dark:[&_.ant-modal-header]:border-darkBorder dark:[&_.ant-modal-title]:text-white dark:[&_.ant-modal-body]:bg-darkPrimary dark:[&_.ant-modal-body]:text-white",
                  onOk: () => {
                    if (showModalReview) {
                      deleteReviewMutation.mutate(showModalReview._id)
                      queryClient.invalidateQueries({ queryKey: ["listReview", queryConfig] })
                      setShowModalReview(null)
                    }
                  }
                })
              }
            >
              Xóa đánh giá
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
