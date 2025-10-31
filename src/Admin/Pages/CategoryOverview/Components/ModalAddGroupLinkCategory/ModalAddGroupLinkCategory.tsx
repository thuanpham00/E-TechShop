import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button, Form, Image, message, Modal, Select, Space, Table, Input as InputAntd } from "antd"
import { ColumnsType } from "antd/es/table"
import { Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "react-toastify"
import { CategoryMenuAPI } from "src/Apis/admin/category_menu.api"
import Input from "src/Components/Input"

type LinkItem = {
  id_item: string
  name: string
  slug: string
  type_filter: string
  banner?: File
  previewUrl?: string
}

export default function ModalAddGroupLinkCategory({
  showModalAddGroupCategory,
  setShowModalAddGroupCategory,
  idCategory
}: {
  showModalAddGroupCategory: boolean
  setShowModalAddGroupCategory: React.Dispatch<React.SetStateAction<boolean>>
  idCategory: string
}) {
  const queryClient = useQueryClient()
  const [formAddGroupCategory] = Form.useForm()
  const [links, setLinks] = useState<LinkItem[]>([])
  const [editingKey, setEditingKey] = useState<string>("")

  const isEditing = (record: LinkItem) => record.id_item === editingKey

  const addNewLink = () => {
    const newKey = Date.now().toString()
    const newLink: LinkItem = {
      id_item: newKey,
      name: "",
      slug: "",
      type_filter: "",
      banner: undefined,
      previewUrl: undefined
    }
    setLinks([...links, newLink])
    setEditingKey(newKey)
  }

  const deleteLink = (key: string) => {
    setLinks(links.filter((item) => item.id_item !== key))
    if (editingKey === key) setEditingKey("")
  }

  const handleFileChange = (key: string, file: File) => {
    const isImage = file.type.startsWith("image/")
    if (!isImage) {
      message.error("Vui lòng chọn file ảnh")
      return
    }
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      message.error("Ảnh phải nhỏ hơn 2MB")
      return
    }

    const previewUrl = URL.createObjectURL(file)
    setLinks(
      links.map((item) =>
        item.id_item === key
          ? {
              ...item,
              banner: file,
              previewUrl
            }
          : item
      )
    )
  }

  const columns: ColumnsType<LinkItem> = [
    {
      title: "Tên hiển thị",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (_, record) => {
        const editable = isEditing(record)
        return editable ? (
          <InputAntd
            placeholder="Nhập tên"
            value={record.name}
            onChange={(e) =>
              setLinks(
                links.map((item) => (item.id_item === record.id_item ? { ...item, name: e.target.value } : item))
              )
            }
          />
        ) : (
          <span>{record.name || "-"}</span>
        )
      }
    },
    {
      title: "Đường dẫn (slug)",
      dataIndex: "slug",
      key: "slug",
      width: 200,
      render: (_, record) => {
        const editable = isEditing(record)
        return editable ? (
          <InputAntd
            placeholder="vd: laptop-gaming"
            value={record.slug}
            onChange={(e) =>
              setLinks(
                links.map((item) => (item.id_item === record.id_item ? { ...item, slug: e.target.value } : item))
              )
            }
          />
        ) : (
          <code className="text-blue-600">{record.slug || "-"}</code>
        )
      }
    },
    {
      title: "Kiểu lọc",
      dataIndex: "type_filter",
      key: "type_filter",
      width: 180,
      render: (_, record) => {
        const editable = isEditing(record)
        return editable ? (
          <InputAntd
            placeholder="Nhập kiểu lọc"
            value={record.type_filter}
            onChange={(e) =>
              setLinks(
                links.map((item) => (item.id_item === record.id_item ? { ...item, type_filter: e.target.value } : item))
              )
            }
          />
        ) : (
          <span>{record.type_filter || "-"}</span>
        )
      }
    },
    {
      title: "Banner",
      dataIndex: "banner",
      key: "banner",
      width: 200,
      render: (_, record) => {
        const editable = isEditing(record)
        return editable ? (
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileChange(record.id_item, file)
              }}
              className="text-sm"
            />
            {record.previewUrl && <Image src={record.previewUrl} width={100} className="mt-2" />}
          </div>
        ) : record.previewUrl ? (
          <Image src={record.previewUrl} width={100} />
        ) : (
          <span>-</span>
        )
      }
    },
    {
      title: "Hành động",
      key: "action",
      width: 120,
      align: "center",
      render: (_, record) => {
        const editable = isEditing(record)
        return (
          <Space>
            {editable ? (
              <Button size="small" type="primary" onClick={() => setEditingKey("")}>
                Lưu
              </Button>
            ) : (
              <Button size="small" onClick={() => setEditingKey(record.id_item)}>
                Sửa
              </Button>
            )}
            <Button size="small" danger icon={<Trash2 size={14} />} onClick={() => deleteLink(record.id_item)} />
          </Space>
        )
      }
    }
  ]

  const createGroupMutation = useMutation({
    mutationFn: async (data: { id_category: string; name: string; is_active: boolean; links: LinkItem[] }) => {
      const formData = new FormData()
      formData.append("id_category", idCategory)
      formData.append("name", data.name)
      formData.append("is_active", String(data.is_active))

      // Append từng link với banner (nếu có)
      data.links.forEach((link, index) => {
        formData.append(`items[${index}][name]`, link.name)
        formData.append(`items[${index}][slug]`, link.slug)
        formData.append(`items[${index}][type_filter]`, link.type_filter)

        // Chỉ gửi banner nếu là File (không phải string URL)
        if (link.banner && link.banner instanceof File) {
          formData.append(`image`, link.banner)
        }
      })

      return CategoryMenuAPI.addGroupCategoryMenu(formData)
    }
  })

  const handleSubmit = () => {
    formAddGroupCategory.validateFields().then((values) => {
      if (links.length === 0) {
        message.warning("Vui lòng thêm ít nhất 1 liên kết")
        return
      }
      const invalidLinks = links.filter((l) => !l.name || !l.slug || !l.type_filter)
      if (invalidLinks.length > 0) {
        message.error("Vui lòng điền đầy đủ thông tin cho tất cả liên kết")
        return
      }

      createGroupMutation.mutate(
        { id_category: idCategory, name: values.name, is_active: values.is_active, links },
        {
          onSuccess: () => {
            toast.success("Thêm nhóm thành công", { autoClose: 1500 })
            queryClient.invalidateQueries({ queryKey: ["menuCategory", idCategory] })
            setShowModalAddGroupCategory(false)
            formAddGroupCategory.resetFields()
            setLinks([])
          }
        }
      )
    })
  }

  return (
    <Modal
      maskClosable={false}
      title="Thêm nhóm liên kết danh mục"
      open={showModalAddGroupCategory}
      onCancel={() => {
        formAddGroupCategory.resetFields()
        setShowModalAddGroupCategory(false)
      }}
      footer={null}
      width={1200}
    >
      <Form layout="vertical" form={formAddGroupCategory}>
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

        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-black dark:text-white font-semibold">Danh sách liên kết</h3>
          <Button type="dashed" icon={<Plus size={16} />} onClick={addNewLink}>
            Thêm liên kết
          </Button>
        </div>

        <Table
          dataSource={links}
          columns={columns}
          pagination={false}
          size="small"
          scroll={{ x: "max-content" }}
          locale={{ emptyText: "Chưa có liên kết nào" }}
        />

        <div className="flex items-center justify-end mt-4 gap-2">
          <Button onClick={() => setShowModalAddGroupCategory(false)}>Hủy</Button>
          <Button type="primary" onClick={handleSubmit} loading={createGroupMutation.isPending}>
            Lưu nhóm
          </Button>
        </div>
      </Form>
    </Modal>
  )
}
