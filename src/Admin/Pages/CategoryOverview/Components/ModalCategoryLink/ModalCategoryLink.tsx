import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button, Col, Form, FormInstance, Modal, Row } from "antd"
import { ArrowUpFromLine } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "react-toastify"
import { CategoryMenuAPI } from "src/Apis/admin/category_menu.api"
import Input from "src/Components/Input"
import InputFileImage from "src/Components/InputFileImage"
import { MenuItemType } from "../ManageCategorySubLink/ManageCategorySubLink"

export default function ModalCategoryLink({
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

  const [file, setFile] = useState<File>()
  const [bannerUrl, setBannerUrl] = useState<string>("")

  const previewImage = useMemo(() => {
    return file ? URL.createObjectURL(file) : ""
  }, [file])

  useEffect(() => {
    return () => {
      if (previewImage) URL.revokeObjectURL(previewImage)
    }
  }, [previewImage])

  const handleChangeImage = (file?: File) => {
    setFile(file)
  }

  useEffect(() => {
    if (editItem && typeof editItem === "object") {
      formAddLinkCategory.setFieldsValue({
        name: editItem.name,
        slug: editItem.slug,
        type_filter: editItem.type_filter
      })
      setFile(undefined)
      setBannerUrl(editItem.banner || "")
    } else {
      setFile(undefined)
      setBannerUrl("")
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

  const updateLinkCategoryMutation = useMutation({
    mutationFn: (data: {
      id_link: string
      id_category: string
      name: string
      slug: string
      type_filter: string
      image?: File
    }) => {
      return CategoryMenuAPI.updateCategoryLink(data.id_link, data)
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

  const handleUpdateLinkMenuCategory = () => {
    formAddLinkCategory.validateFields().then((values) => {
      if (editItem && typeof editItem === "object") {
        const payload: {
          id_link: string
          id_category: string
          name: string
          slug: string
          type_filter: string
          image?: File
        } = {
          id_link: editItem.id_item,
          id_category: idCategory,
          name: values.name,
          slug: values.slug,
          type_filter: values.type_filter
        }
        if (file) payload.image = file

        updateLinkCategoryMutation.mutate(payload, {
          onSuccess: () => {
            setShowModalAddLinkCategory(false)
            formAddLinkCategory.resetFields()
            setFile(undefined)
            queryClient.invalidateQueries({ queryKey: ["menuCategory", idCategory] })
            toast.success("Cập nhật liên kết thành công", { autoClose: 1500 })
          }
        })
      }
    })
  }

  return (
    <Modal
      maskClosable={false}
      title="Thêm liên kết vào nhóm"
      open={showModalAddLinkCategory}
      onCancel={() => {
        setEditItem(null)
        formAddLinkCategory.resetFields()
        setShowModalAddLinkCategory(false)
      }}
      footer={null}
      width={900}
    >
      <Form
        layout="vertical"
        form={formAddLinkCategory}
        onFinish={typeof editItem === "object" ? handleUpdateLinkMenuCategory : handleCreateLinkMenuCategory}
      >
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
            <Form.Item
              label="Đường dẫn"
              name="slug"
              rules={[
                { required: true, message: "Vui lòng nhập đường dẫn" },
                {
                  pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                  message:
                    "Đường dẫn chỉ chứa chữ thường, số và dấu gạch ngang, không có khoảng trắng hoặc ký tự đặc biệt"
                }
              ]}
            >
              <Input
                placeholder="Nhập đường dẫn (vd: laptop-gaming)"
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
          {previewImage || bannerUrl ? (
            <img src={previewImage || bannerUrl} className="h-40 w-full rounded-md object-cover" alt="banner" />
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
