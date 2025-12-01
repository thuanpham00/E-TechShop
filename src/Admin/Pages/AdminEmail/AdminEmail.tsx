import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { isUndefined, omitBy } from "lodash"
import { useContext } from "react"
import { useNavigate, createSearchParams } from "react-router-dom"
import { emailAPI } from "src/Apis/email.api"
import Skeleton from "src/Components/Skeleton"
import { AppContext } from "src/Context/authContext"
import useQueryParams from "src/Hook/useQueryParams"
import { queryParamConfigEmail } from "src/Types/queryParams.type"
import { SuccessResponse } from "src/Types/utils.type"
import { motion } from "framer-motion"
import { Empty, Table, Tag, Card, Row, Col, Statistic } from "antd"
import type { ColumnsType } from "antd/es/table"
import { path } from "src/Constants/path"
import { Helmet } from "react-helmet-async"
import NavigateBack from "src/Admin/Components/NavigateBack"
import { EmailLogItemType } from "src/Types/product.type"
import {
  MailOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  CalendarOutlined
} from "@ant-design/icons"
import { useTheme } from "src/Admin/Components/Theme-provider/Theme-provider"

export default function AdminEmail() {
  const { theme } = useTheme()
  const isDark = theme === "dark" || theme === "system"
  const navigate = useNavigate()
  const { userId } = useContext(AppContext)

  const getDomainResendQuery = useQuery({
    queryKey: ["domainResend", userId],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort()
      }, 10000)
      return emailAPI.getDomains(controller.signal)
    },
    retry: 0,
    staleTime: 15 * 60 * 1000,
    placeholderData: keepPreviousData
  })

  const domainData = getDomainResendQuery.data?.data.data[0]

  const queryParams: queryParamConfigEmail = useQueryParams()
  const queryConfig: queryParamConfigEmail = omitBy(
    {
      page: queryParams.page || "1",
      limit: queryParams.limit || "10"
    },
    isUndefined
  )

  const { data, isFetching, isLoading } = useQuery({
    queryKey: ["listEmailLog", queryConfig],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort()
      }, 10000)
      return emailAPI.getEmails(controller.signal, queryConfig)
    },
    retry: 0,
    staleTime: 3 * 60 * 1000,
    placeholderData: keepPreviousData
  })

  const result = data?.data as SuccessResponse<{
    result: EmailLogItemType[]
    total: string
    page: string
    limit: string
    totalOfPage: string
  }>

  const listEmailLog = result?.result?.result

  // ✅ Ant Design Table Columns
  const columns: ColumnsType<EmailLogItemType> = [
    {
      title: "Mã Resend",
      dataIndex: "resend_id",
      key: "resend_id",
      width: 150,
      render: (text: string) => (
        <span className="font-mono text-xs text-gray-600 dark:text-gray-400">{text?.substring(0, 8)}...</span>
      )
    },
    {
      title: "Email gửi",
      dataIndex: "from",
      key: "from",
      width: 200,
      render: (text: string) => (
        <div className="flex items-center gap-2">
          <MailOutlined className="text-blue-500" />
          <span className="text-sm">{text}</span>
        </div>
      )
    },
    {
      title: "Email nhận",
      dataIndex: "to",
      key: "to",
      width: 200,
      render: (email: string) => <span className="text-sm text-gray-700 dark:text-gray-300">{email}</span>
    },
    {
      title: "Tiêu đề",
      dataIndex: "subject",
      key: "subject",
      ellipsis: true,
      render: (text: string) => <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{text}</span>
    },
    {
      title: "Loại email",
      dataIndex: "type",
      key: "type",
      width: 150,
      render: (type: string) => {
        const typeConfig: Record<string, { color: string; text: string }> = {
          "Xác thực email": { color: "blue", text: "Xác thực email" },
          "Xác nhận đơn hàng": { color: "orange", text: "Xác nhận đơn hàng" },
          "Quên mật khẩu": { color: "green", text: "Quên mật khẩu" },
          "Gửi lại email xác thực": { color: "purple", text: "Gửi lại email xác thực" }
        }
        const config = typeConfig[type] || { color: "default", text: type }
        return <Tag color={config.color}>{config.text}</Tag>
      }
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      align: "center",
      render: (status: string) => {
        const statusConfig: Record<string, { icon: JSX.Element; color: string; text: string }> = {
          "Đã gửi": {
            icon: <CheckCircleOutlined />,
            color: "success",
            text: "Đã gửi"
          },
          Lỗi: {
            icon: <CloseCircleOutlined />,
            color: "error",
            text: "Thất bại"
          }
        }
        const config = statusConfig[status] || statusConfig.pending
        return (
          <Tag icon={config.icon} color={config.color}>
            {config.text}
          </Tag>
        )
      }
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      width: 180,
      render: (date: string) => (
        <div className="flex items-center gap-2">
          <CalendarOutlined className="text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">{new Date(date).toLocaleString("vi-VN")}</span>
        </div>
      )
    }
  ]

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

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {getDomainResendQuery.isLoading ? (
          <Skeleton />
        ) : (
          <Card
            className="mt-2 shadow-lg dark:bg-darkPrimary dark:border-darkBorder"
            title={
              <div className="flex items-center gap-2">
                <GlobalOutlined className="text-blue-500" />
                <span className="text-lg font-semibold dark:text-white">Thông tin Domain</span>
              </div>
            }
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Statistic
                  title={<div className="dark:text-white">Domain Name</div>}
                  value={domainData?.name}
                  valueStyle={{ fontSize: "16px", fontWeight: 500, color: isDark ? "#f1f5f9" : "#1f1f1f" }}
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Statistic
                  title={<div className="dark:text-white">Trạng thái</div>}
                  value={domainData?.status}
                  valueStyle={{
                    color: domainData?.status === "verified" ? "#52c41a" : "#faad14",
                    textTransform: "capitalize"
                  }}
                  prefix={domainData?.status === "verified" ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Statistic
                  title={<div className="dark:text-white">khu vực</div>}
                  value={domainData?.region}
                  valueStyle={{ fontSize: "16px", color: isDark ? "#f1f5f9" : "#1f1f1f" }}
                />
              </Col>
              <Col xs={24} sm={12}>
                <div className="text-sm">
                  <span className="text-gray-500 dark:text-white">Created at: </span>
                  <span className="font-medium text-gray-700 dark:text-white">
                    {domainData?.created_at ? new Date(domainData.created_at).toLocaleString("vi-VN") : "N/A"}
                  </span>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div className="text-sm">
                  <span className="text-gray-500 dark:text-white">Domain ID: </span>
                  <span className="font-mono text-xs text-gray-600 dark:text-white">{domainData?.id}</span>
                </div>
              </Col>
            </Row>
          </Card>
        )}

        {isLoading ? (
          <Skeleton />
        ) : (
          <Card
            className="shadow-lg dark:bg-darkPrimary dark:border-darkBorder"
            title={
              <div className="flex items-center gap-2">
                <MailOutlined className="text-blue-500" />
                <span className="text-lg font-semibold dark:text-white">Lịch sử gửi email</span>
              </div>
            }
          >
            <Table
              rowKey={(record) => record._id}
              dataSource={listEmailLog}
              columns={columns}
              loading={isFetching}
              pagination={{
                current: Number(queryConfig.page),
                pageSize: Number(queryConfig.limit),
                total: Number(result?.result.total || 0),
                showSizeChanger: true,
                pageSizeOptions: ["5", "10", "20", "50"],
                onChange: (page, pageSize) => {
                  navigate({
                    pathname: path.AdminEmail,
                    search: createSearchParams({
                      ...queryConfig,
                      page: page.toString(),
                      limit: pageSize.toString()
                    }).toString()
                  })
                }
              }}
              locale={{
                emptyText: <Empty description="Chưa có email nào" />
              }}
              scroll={{ x: 1400 }}
              rowClassName={(_, index) =>
                index % 2 === 0 ? "dark:bg-darkSecond bg-[#f2f2f2]" : "dark:bg-darkPrimary bg-white"
              }
            />
          </Card>
        )}
      </motion.div>
    </div>
  )
}
