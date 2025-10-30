import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button, Col, Form, FormInstance, Modal, Row } from "antd"
import { ArrowUpFromLine } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "react-toastify"
import { CategoryMenuAPI } from "src/Apis/admin/category_menu.api"
import Input from "src/Components/Input"
import InputFileImage from "src/Components/InputFileImage"
import { MenuItemType } from "../CategoryMenuConfig/CategoryMenuConfig"

export default function ModalAddLinkCategory({
  showModalAddLinkCategory,
  setShowModalAddLinkCategory,
  formAddLinkCategory,
  idCategoryMenu,
  idCategory,
  editItem,
  setEditItem
}: {
  showModalAddLinkCategory: boolean
  setShowModalAddLinkCategory: (value: boolean) => void
  formAddLinkCategory: FormInstance
  idCategoryMenu: string
  idCategory: string
  editItem: boolean | MenuItemType | null
  setEditItem: React.Dispatch<React.SetStateAction<boolean | MenuItemType | null>>
}) {
  const queryClient = useQueryClient()

  console.log(editItem)

  const [file, setFile] = useState<File>()

  const previewImage = useMemo(() => {
    return file ? URL.createObjectURL(file) : ""
  }, [file])

  const handleChangeImage = (file?: File) => {
    setFile(file)
  }

  useEffect(() => {
    if (editItem && typeof editItem === "object") {
      console.log("hihi")
      formAddLinkCategory.setFieldsValue({
        id_section: "1",
        name: editItem.name,
        slug: editItem.slug,
        type_filter: editItem.type_filter
      })
      setFile(undefined)
    }
  }, [editItem, formAddLinkCategory])

  const createLinkCategoryMutation = useMutation({
    mutationFn: (data: {
      id_category: string
      id_section: string
      name: string
      slug: string
      type_filter: string
      image?: File
    }) => {
      return CategoryMenuAPI.addLinkCategoryMenu(idCategoryMenu, data)
    }
  })

  const handleCreateLinkMenuCategory = () => {
    formAddLinkCategory.validateFields().then((values) => {
      const payload: {
        id_category: string
        id_section: string
        name: string
        slug: string
        type_filter: string
        image?: File
      } = {
        id_category: idCategory,
        id_section: values.id_section,
        name: values.name,
        slug: values.slug,
        type_filter: values.type_filter
      }
      if (file) payload.image = file
      createLinkCategoryMutation.mutate(payload, {
        onSuccess: () => {
          setShowModalAddLinkCategory(false)
          formAddLinkCategory.resetFields()
          setFile(undefined)
          queryClient.invalidateQueries({ queryKey: ["menuCategory", idCategory] })
          toast.success("Thêm liên kết thành công", { autoClose: 1500 })
        }
      })
    })
  }

  return (
    <Modal
      title="Thêm liên kết vào nhóm"
      open={showModalAddLinkCategory}
      onCancel={() => setShowModalAddLinkCategory(false)}
      footer={null}
      width={900}
    >
      <Form layout="vertical" form={formAddLinkCategory} onFinish={handleCreateLinkMenuCategory}>
        <Row gutter={12}>
          <Form.Item label="Id section" name="id_section" hidden>
            <Input
              classNameInput="p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#fff] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
              className="relative flex-1"
              classNameLabel="text-black dark:text-white"
              classNameError="hidden"
            />
          </Form.Item>
          <Col span={12}>
            <Form.Item
              label="Tên hiển thị"
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập tên hiển thị" }]}
            >
              <Input
                placeholder="Nhập tên nhóm menu"
                classNameInput="p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#fff] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
                className="relative flex-1"
                classNameLabel="text-black dark:text-white"
                classNameError="hidden"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Đường dẫn" name="slug" rules={[{ required: true, message: "Vui lòng nhập đường dẫn" }]}>
              <Input
                placeholder="Nhập đường dẫn"
                classNameInput="p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#fff] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
                className="relative flex-1"
                classNameLabel="text-black dark:text-white"
                classNameError="hidden"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Bộ lọc hiển thị"
          name="type_filter"
          rules={[{ required: true, message: "Vui lòng nhập bộ lọc hiển thị" }]}
        >
          <Input
            placeholder="Nhập kiểu lọc hiển thị (dành cho bộ lọc client)"
            classNameInput="p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#fff] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
            className="relative flex-1"
            classNameLabel="text-black dark:text-white"
            classNameError="hidden"
          />
        </Form.Item>
        <div className="flex items-center justify-center flex-col rounded-sm shadow-sm">
          <div className="mb-2 text-black dark:text-white">Banner</div>
          {previewImage !== "" ? (
            <img src={previewImage} className="h-40 w-full rounded-md" alt="avatar default" />
          ) : (
            <div className="h-40 w-full rounded-md bg-white flex items-center justify-center text-gray-400">
              Chưa chọn banner
            </div>
          )}

          <InputFileImage onChange={handleChangeImage} />
        </div>
        <div className="flex items-center justify-end">
          <Button type="primary" htmlType="submit" icon={<ArrowUpFromLine size={16} />}>
            Lưu thay đổi
          </Button>
        </div>
      </Form>
    </Modal>
  )
}
