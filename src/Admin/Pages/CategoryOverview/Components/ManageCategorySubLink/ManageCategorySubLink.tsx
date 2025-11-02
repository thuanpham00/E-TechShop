import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Collapse, Empty, Image, Modal, Space, Table, Tag, Button as ButtonAntd, Form } from "antd"
import { ColumnsType } from "antd/es/table/interface"
import { Edit2, Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "react-toastify"
import { CategoryMenuAPI } from "src/Apis/admin/category_menu.api"
import Skeleton from "src/Components/Skeleton"
import { CategoryItemType } from "src/Types/product.type"
import ModalEditGroupName from "../ModalEditGroupName"
import ModalAddGroupLinkCategory from "../ModalAddGroupLinkCategory/ModalAddGroupLinkCategory"
import ModalCategoryLink from "../ModalCategoryLink/ModalCategoryLink"

export type MenuItemType = {
  id_item: string
  name: string
  slug: string
  type_filter: string
  banner: string
}

type SectionMenuItemType = {
  id_section: string
  items: MenuItemType[]
  name: string
  is_active: boolean
}

export default function ManageCategorySubLink({ dataCategory }: { dataCategory: CategoryItemType }) {
  const queryClient = useQueryClient()

  // xử lý gọi danh sách menu con
  const { data, isFetching, isLoading } = useQuery({
    queryKey: ["menuCategory", dataCategory?._id],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort()
      }, 10000)
      return CategoryMenuAPI.getMenuCategoryById(dataCategory._id as string)
    },
    enabled: Boolean(dataCategory?._id),
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 3 * 60 * 1000, // dưới 5 phút nó không gọi lại api
    placeholderData: keepPreviousData
  })

  const menuData = (data?.data?.result?.sections || []) as SectionMenuItemType[]
  const categoryMenuId = data?.data?.result?._id as string

  // render cột bảng cho từng nhóm (truyền sIdx để xử lý action theo nhóm)
  const getItemColumns: ColumnsType<SectionMenuItemType["items"][number]> = [
    {
      title: "Tên hiển thị",
      dataIndex: "name",
      key: "name",
      width: 150,
      render: (v: string) => <div className="text-black dark:text-white break-words">{v}</div>
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      width: 350,
      render: (v: string) => <code className="text-blue-600 break-all">{v}</code>
    },
    {
      title: "Kiểu lọc",
      dataIndex: "type_filter",
      key: "type_filter",
      width: 140,
      render: (v: string) => (v ? <Tag color="blue">{v}</Tag> : <span>-</span>)
    },
    {
      title: "Banner",
      dataIndex: "banner",
      key: "banner",
      width: 250,
      render: (url: string) => (url ? <Image src={url} alt="banner" width={200} height={60} preview /> : <span>-</span>)
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      width: 160,
      render: (_, record) => (
        <Space>
          <ButtonAntd
            size="small"
            onClick={() => {
              setShowModalAddLinkCategory(true)
              setEditItem(record)
            }}
          >
            Sửa
          </ButtonAntd>
          <ButtonAntd
            size="small"
            danger
            onClick={() =>
              Modal.confirm({
                title: "Xóa liên kết?",
                content: `Bạn có chắc muốn xóa "${record.name}"?`,
                okText: "Xóa",
                okButtonProps: { danger: true },
                cancelText: "Hủy",
                onOk: () => {
                  deleteCategoryLinkMutation.mutate(record.id_item)
                }
              })
            }
          >
            Xóa
          </ButtonAntd>
        </Space>
      )
    }
  ]

  const [showModalAddGroupCategory, setShowModalAddGroupCategory] = useState(false)
  const [showModalEditGroup, setShowModalEditGroup] = useState(false)
  const [showModalAddLinkCategory, setShowModalAddLinkCategory] = useState(false)

  const [formAddLinkCategory] = Form.useForm()
  const [formEditGroupName] = Form.useForm()

  const deleteCategoryLinkMutation = useMutation({
    mutationFn: (idLink: string) => {
      return CategoryMenuAPI.deleteCategoryLink(idLink)
    },
    onSuccess: () => {
      toast.success("Xóa liên kết thành công", { autoClose: 1500 })
      queryClient.invalidateQueries({ queryKey: ["menuCategory", dataCategory._id] })
    }
  })

  const deleteGroupCategoryMutation = useMutation({
    mutationFn: (idGroup: string) => {
      return CategoryMenuAPI.deleteGroupCategoryMenu(idGroup)
    },
    onSuccess: () => {
      toast.success("Xóa nhóm thành công", { autoClose: 1500 })
      queryClient.invalidateQueries({ queryKey: ["menuCategory", dataCategory._id] })
    }
  })

  const [editItem, setEditItem] = useState<boolean | MenuItemType | null>(null)

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
        Danh sách menu danh mục {dataCategory?.name}
      </h1>

      {isLoading && <Skeleton />}
      {!isFetching ? (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-2">
            <div className="text-black dark:text-white font-medium">Tổng nhóm: {menuData?.length || 0}</div>
            <ButtonAntd type="primary" onClick={() => setShowModalAddGroupCategory(true)}>
              Thêm nhóm
            </ButtonAntd>
          </div>

          {menuData && menuData.length > 0 ? (
            <Collapse
              className="bg-white dark:bg-darkPrimary rounded-md"
              bordered
              items={menuData.map((section, sIdx) => ({
                key: `${section.name}-${sIdx}`,
                label: (
                  <div className="flex items-center gap-2">
                    <span className="text-black dark:text-white font-semibold">{section.name}</span>
                    <Tag color="geekblue">{section.items?.length} link</Tag>
                    {section.is_active ? <Tag color="green">Hiển thị</Tag> : <Tag color="red">Đang ẩn</Tag>}
                  </div>
                ),
                extra: (
                  <Space onClick={(e) => e.stopPropagation()}>
                    <ButtonAntd
                      size="small"
                      onClick={() => {
                        setShowModalEditGroup(true)
                        formEditGroupName.setFieldValue("id_section", section.id_section)
                        formEditGroupName.setFieldValue("name", section.name)
                        formEditGroupName.setFieldValue("is_active", section.is_active)
                      }}
                    >
                      <Edit2 size={16} />
                    </ButtonAntd>
                    <ButtonAntd
                      size="small"
                      danger
                      onClick={() =>
                        Modal.confirm({
                          title: "Xóa nhóm?",
                          content: `Bạn có chắc muốn xóa nhóm "${section.name}"?`,
                          okText: "Xóa",
                          okButtonProps: { danger: true },
                          cancelText: "Hủy",
                          onOk: () => deleteGroupCategoryMutation.mutate(section.id_section)
                        })
                      }
                    >
                      <Trash2 size={16} />
                    </ButtonAntd>
                  </Space>
                ),
                children: (
                  <>
                    <div className="flex items-center justify-end mb-2">
                      <ButtonAntd
                        type="dashed"
                        size="small"
                        onClick={() => {
                          setShowModalAddLinkCategory(true)
                          setEditItem(true)
                          formAddLinkCategory.setFieldValue("id_section", section.id_section)
                        }}
                      >
                        Thêm liên kết
                      </ButtonAntd>
                    </div>
                    <Table
                      rowKey={(r) => r.slug}
                      dataSource={section.items}
                      columns={getItemColumns}
                      pagination={false}
                      size="middle"
                      scroll={{ x: "max-content" }}
                      rowClassName={(_, index) => (index % 2 === 0 ? "bg-[#f7f8fa]" : "bg-white")}
                    />
                  </>
                )
              }))}
            />
          ) : (
            <div className="py-6">
              <Empty />
            </div>
          )}
        </div>
      ) : (
        <Skeleton />
      )}

      <ModalAddGroupLinkCategory
        showModalAddGroupCategory={showModalAddGroupCategory}
        setShowModalAddGroupCategory={setShowModalAddGroupCategory}
        idCategory={dataCategory?._id as string}
      />

      <ModalEditGroupName
        showModalEditGroup={showModalEditGroup}
        setShowModalEditGroup={setShowModalEditGroup}
        idCategoryMenu={categoryMenuId}
        idCategory={dataCategory?._id as string}
        formEditGroupName={formEditGroupName}
      />

      <ModalCategoryLink
        showModalAddLinkCategory={showModalAddLinkCategory}
        setShowModalAddLinkCategory={setShowModalAddLinkCategory}
        formAddLinkCategory={formAddLinkCategory}
        idCategoryMenu={categoryMenuId}
        idCategory={dataCategory?._id as string}
        editItem={editItem}
        setEditItem={setEditItem}
      />
    </div>
  )
}
