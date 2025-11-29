/* eslint-disable @typescript-eslint/no-explicit-any */
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Button, Col, Form, Input, Row, Select } from "antd"
import { useContext, useEffect, useState } from "react"
import { Helmet } from "react-helmet-async"
import { userAPI } from "src/Apis/user.api"
import InputFileImage from "src/Components/InputFileImage"
import { AppContext } from "src/Context/authContext"
import "./Profile.css"
import { UpdateBodyReq } from "src/Types/product.type"
import { MediaAPI } from "src/Apis/media.api"
import { toast } from "react-toastify"
import { isError422 } from "src/Helpers/utils"
import { ErrorResponse } from "src/Types/utils.type"
import { motion } from "framer-motion"
import { setAvatarImageToLS, setNameUserToLS } from "src/Helpers/auth"
import { FileAvatarType } from "src/Admin/Pages/ManageCustomers/ManageCustomers"

const days = Array.from({ length: 31 }, (_, i) => i + 1)
const months = Array.from({ length: 12 }, (_, i) => i + 1)
const years = Array.from({ length: 100 }, (_, i) => 2024 - i) // 1924 - 2024

const { Option } = Select

export default function Profile() {
  const { avatar, userId, setAvatar, setNameUser } = useContext(AppContext)
  const queryClient = useQueryClient()
  const [day, setDay] = useState<number | null>(null)
  const [month, setMonth] = useState<number | null>(null)
  const [year, setYear] = useState<number | null>(null)
  const [form] = Form.useForm()

  const getMeQuery = useQuery({
    queryKey: ["getMe", userId],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort()
      }, 10000)
      return userAPI.getMe(controller.signal)
    },
    staleTime: 3 * 60 * 1000, // dưới 3 phút nó không gọi lại api
    placeholderData: keepPreviousData // giữ data cũ trong 3p
  })

  const userData = getMeQuery.data?.data.result

  useEffect(() => {
    if (userData) {
      form.setFieldsValue({
        email: userData.email,
        name: userData.name,
        verify: userData.verify === 1 ? "Verified" : "Unverified",
        numberPhone: userData.numberPhone
      })
      setFile({
        file: null,
        existingUrl: userData.avatar
      })
    }
  }, [form, userData])

  useEffect(() => {
    if (userData) {
      const day = new Date(userData.date_of_birth).getDate()
      const month = new Date(userData.date_of_birth).getMonth() + 1
      const year = new Date(userData.date_of_birth).getFullYear()
      setMonth(month)
      setYear(year)
      setDay(day)
    }
  }, [userData])

  const [file, setFile] = useState<FileAvatarType>({
    file: null, // ảnh mới
    existingUrl: null // ảnh từ server
  })

  const updateProfileMutation = useMutation({
    mutationFn: (body: UpdateBodyReq) => {
      return userAPI.updateMe(body)
    }
  })

  const updateImageProfileMutation = useMutation({
    mutationFn: (body: { file: File; userId: string }) => {
      return MediaAPI.uploadImageProfile(body.file, body.userId)
    }
  })

  // cập nhật form
  const onFinish = async (values: any) => {
    try {
      let avatarName = avatar
      if (file.file) {
        const avatar = await updateImageProfileMutation.mutateAsync({
          file: file.file as File,
          userId: userId as string
        })
        avatarName = avatar.data.result.url
      }
      const updatedData: UpdateBodyReq = {
        avatar: avatarName as string,
        name: values.name,
        date_of_birth: new Date(year as number, (month as number) - 1, day as number)
      }
      const res = await updateProfileMutation.mutateAsync(
        {
          ...updatedData,
          numberPhone: values.numberPhone !== undefined ? values.numberPhone : undefined
        },
        {
          onSuccess: () => {
            toast.success("Cập nhật thành công!", { autoClose: 1500 })
            queryClient.invalidateQueries({ queryKey: ["getMe", userId] })
          },
          onError: (error) => {
            if (isError422<ErrorResponse<{ name: string; numberPhone: string }>>(error)) {
              const formError = error.response?.data.errors
              const errorFields = []
              if (formError?.name) {
                errorFields.push({
                  name: "name",
                  errors: [(formError.name as any).msg]
                })
              }
              if (formError?.numberPhone) {
                errorFields.push({
                  name: "numberPhone",
                  errors: [(formError.numberPhone as any).msg]
                })
              }
              // Set lỗi vào form
              form.setFields(errorFields)
            }
          }
        }
      )
      setAvatar(res?.data?.result?.avatar)
      setAvatarImageToLS(res?.data?.result?.avatar)
      setNameUser(res?.data?.result?.name)
      setNameUserToLS(res?.data?.result?.name)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div>
      <Helmet>
        <title>Hồ sơ của tôi - TechZone</title>
        <meta
          name="description"
          content="Xem và chỉnh sửa thông tin tài khoản, cập nhật mật khẩu để bảo mật tài khoản của bạn tại TechZone."
        />
      </Helmet>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="border-b border-b-gray-200 pb-6">
          <h1 className={`text-black text-lg font-semibold capitalize`}>Hồ sơ của tôi</h1>
          <span className="text-sm">Quản lý thông tin hồ sơ để bảo mật tài khoản</span>
        </div>

        <div className="mt-4 py-2 px-4">
          <Form
            form={form}
            onFinish={onFinish}
            labelCol={{
              span: 6
            }}
            labelAlign="left"
            layout="horizontal"
          >
            <Row gutter={16} className="flex items-center">
              <Col span={24} md={14}>
                <Form.Item label="Email" name="email">
                  <Input disabled />
                </Form.Item>
                <Form.Item label="Tên" name="name">
                  <Input />
                </Form.Item>
                <Form.Item label="Trạng thái" name="verify">
                  <Input disabled />
                </Form.Item>
                <Form.Item label="Số điện thoại" name="numberPhone">
                  <Input />
                </Form.Item>
                <Form.Item label="Ngày sinh" className="w-full">
                  {/* Ngày */}
                  <div className="flex gap-2 ">
                    <Select placeholder="Ngày" style={{ flex: 1 }} onChange={(value) => setDay(value)} value={day}>
                      {days.map((d) => (
                        <Option key={d} value={d}>
                          {d}
                        </Option>
                      ))}
                    </Select>

                    {/* Tháng */}
                    <Select placeholder="Tháng" style={{ flex: 1 }} onChange={(value) => setMonth(value)} value={month}>
                      {months.map((m, index) => (
                        <Option key={index} value={m}>
                          {m}
                        </Option>
                      ))}
                    </Select>

                    {/* Năm */}
                    <Select placeholder="Năm" style={{ flex: 1 }} onChange={(value) => setYear(value)} value={year}>
                      {years.map((y) => (
                        <Option key={y} value={y}>
                          {y}
                        </Option>
                      ))}
                    </Select>
                  </div>
                </Form.Item>
              </Col>
              <Col span={24} md={10}>
                <div className="text-center">
                  <div className="mb-2">Ảnh đại diện</div>

                  <InputFileImage
                    file={file}
                    setFile={setFile}
                    classNameWrapper="text-center absolute z-30 top-[80%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%]"
                  />
                </div>
              </Col>
            </Row>

            <Form.Item>
              <div className="flex justify-end mt-4">
                <Button
                  htmlType="submit"
                  type="primary"
                  className="p-2 px-4 pb-3 bg-blue-500 w-[100px] text-white font-semibold rounded-sm hover:bg-blue-500/80 duration-200"
                >
                  Cập nhật
                </Button>
              </div>
            </Form.Item>
          </Form>
        </div>
      </motion.div>
    </div>
  )
}
