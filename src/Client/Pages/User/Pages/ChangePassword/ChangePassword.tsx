/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from "@tanstack/react-query"
import { Button, Col, Form, Input, Row } from "antd"
import { Helmet } from "react-helmet-async"
import { toast } from "react-toastify"
import { userAPI } from "src/Apis/user.api"
import { isError400, isError422 } from "src/Helpers/utils"
import { ErrorResponse } from "src/Types/utils.type"
import { motion } from "framer-motion"

export default function ChangePassword() {
  const [form] = Form.useForm()

  const changePasswordMutation = useMutation({
    mutationFn: (body: { old_password: string; password: string; confirm_password: string }) => {
      return userAPI.changePassword(body)
    }
  })

  const onFinish = (values: { old_password: string; password: string; confirm_password: string }) => {
    changePasswordMutation.mutate(values, {
      onSuccess: () => {
        toast.success("Cập nhật thành công!", { autoClose: 1500 })
        form.resetFields()
      },
      onError: (error) => {
        if (isError422<ErrorResponse<{ old_password: string; password: string; confirm_password: string }>>(error)) {
          const formError = error.response?.data.errors
          const errorFields = []
          if (formError?.old_password) {
            errorFields.push({
              name: "old_password",
              errors: [(formError.old_password as any).msg]
            })
          }
          if (formError?.password) {
            errorFields.push({
              name: "password",
              errors: [(formError.password as any).msg]
            })
          }
          if (formError?.confirm_password) {
            errorFields.push({
              name: "confirm_password",
              errors: [(formError.confirm_password as any).msg]
            })
          }
          // Set lỗi vào form
          form.setFields(errorFields)
        }
        if (isError400<{ message: string }>(error)) {
          const formError = error.response?.data.message
          console.log(formError)
          const errorFields = []
          errorFields.push({
            name: "old_password",
            errors: [formError as string]
          })
          // // Set lỗi vào form
          form.setFields(errorFields)
        }
      }
    })
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

        <div className="mt-4 py-4 px-8">
          <Form
            form={form}
            onFinish={onFinish}
            labelCol={{
              span: 8
            }}
            labelAlign="left"
            layout="horizontal"
          >
            <Row gutter={16}>
              <Col span={16}>
                <Form.Item
                  label="Mật khẩu hiện tại"
                  name="old_password"
                  rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại" }]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item
                  label="Mật khẩu mới"
                  name="password"
                  hasFeedback
                  rules={[
                    { required: true, message: "Vui lòng nhập mật khẩu mới" },
                    { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" }
                  ]}
                >
                  <Input.Password />
                </Form.Item>

                <Form.Item
                  label="Xác nhận mật khẩu mới"
                  name="confirm_password"
                  dependencies={["password"]}
                  hasFeedback
                  rules={[
                    { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve()
                        }
                        return Promise.reject(new Error("Mật khẩu xác nhận không khớp"))
                      }
                    })
                  ]}
                >
                  <Input.Password />
                </Form.Item>

                <Form.Item>
                  <div className="flex justify-end">
                    <Button
                      htmlType="submit"
                      type="primary"
                      className="p-2 px-4 bg-blue-500 w-[100px] text-white font-semibold rounded-sm hover:bg-blue-500/80 duration-200"
                    >
                      Cập nhật
                    </Button>
                  </div>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </motion.div>
    </div>
  )
}
