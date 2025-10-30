import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button, Form, FormInstance, Modal, Select } from "antd"
import { ArrowUpFromLine } from "lucide-react"
import { toast } from "react-toastify"
import { CategoryMenuAPI } from "src/Apis/admin/category_menu.api"
import Input from "src/Components/Input"

export default function ModalEditGroupName({
  showModalEditGroup,
  setShowModalEditGroup,
  idCategoryMenu,
  idCategory,
  formEditGroupName
}: {
  showModalEditGroup: boolean
  setShowModalEditGroup: (value: boolean) => void
  idCategoryMenu: string
  idCategory: string
  formEditGroupName: FormInstance
}) {
  const queryClient = useQueryClient()

  const updateGroupNameMenuCategory = useMutation({
    mutationFn: (data: { idMenuCategory: string; body: { id_section: string; name: string; is_active: boolean } }) => {
      return CategoryMenuAPI.updateGroupNameMenu(data.idMenuCategory, data.body)
    }
  })

  const handleUpdateGroupName = (values: { id_section: string; name: string; is_active: boolean }) => {
    updateGroupNameMenuCategory.mutate(
      { idMenuCategory: idCategoryMenu as string, body: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["menuCategory", idCategory] })
          setShowModalEditGroup(false)
          toast.success("Cập nhật tên nhóm thành công", { autoClose: 1500 })
        }
      }
    )
  }

  return (
    <Modal title="Sửa nhóm menu" open={showModalEditGroup} onCancel={() => setShowModalEditGroup(false)} footer={null}>
      <Form layout="vertical" form={formEditGroupName} onFinish={handleUpdateGroupName}>
        <Form.Item label="id_section" name="id_section" hidden>
          <Input
            classNameInput="hidden p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#fff] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
            className="relative flex-1"
            classNameLabel="text-black dark:text-white"
            classNameError="hidden"
          />
        </Form.Item>
        <Form.Item
          label="Tên nhóm menu"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên nhóm menu" }]}
        >
          <Input
            placeholder="Nhập tên nhóm menu"
            classNameInput="p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#fff] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
            className="relative flex-1"
            classNameLabel="text-black dark:text-white"
            classNameError="hidden"
          />
        </Form.Item>
        <Form.Item
          label="Trạng thái"
          name="is_active"
          rules={[{ required: true, message: "Vui lòng nhập tên nhóm menu" }]}
        >
          <Select>
            <Select.Option value={true}>Hiển thị</Select.Option>
            <Select.Option value={false}>Đang ẩn</Select.Option>
          </Select>
        </Form.Item>
        <div className="flex items-center justify-end">
          <Button type="primary" htmlType="submit" icon={<ArrowUpFromLine size={16} />}>
            Lưu thay đổi
          </Button>
        </div>
      </Form>
    </Modal>
  )
}
