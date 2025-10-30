import { yupResolver } from "@hookform/resolvers/yup"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Collapse, Empty, Image, Modal, Select, Space, Table, Tag, Button as ButtonAntd, Form } from "antd"
import { ColumnsType } from "antd/es/table/interface"
import { ArrowUpFromLine, Edit2, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { CategoryAPI } from "src/Apis/admin/category.api"
import { CategoryMenuAPI } from "src/Apis/admin/category_menu.api"
import { schemaAuth, SchemaAuthType } from "src/Client/Utils/rule"
import Button from "src/Components/Button"
import Input from "src/Components/Input"
import Skeleton from "src/Components/Skeleton"
import { convertDateTime } from "src/Helpers/common"
import { isError400 } from "src/Helpers/utils"
import { CategoryItemType, UpdateCategoryBodyReq } from "src/Types/product.type"
import { queryParamConfigCategory } from "src/Types/queryParams.type"
import { ErrorResponse, MessageResponse } from "src/Types/utils.type"
import ModalEditGroupName from "../ModalEditGroupName"
import ModalAddLinkCategory from "../ModalAddLinkCategory"
import { set } from "lodash"

type FormDataUpdate = Pick<SchemaAuthType, "name" | "id" | "created_at" | "updated_at"> & {
  is_active?: "active" | "inactive"
}

const formDataUpdate = schemaAuth.pick(["name", "id", "created_at", "updated_at"])

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
}

export default function ManageCategorySubLink({
  dataCategory,
  queryConfig
}: {
  dataCategory: CategoryItemType
  queryConfig: queryParamConfigCategory
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const {
    register,
    formState: { errors },
    setValue,
    setError,
    control,
    handleSubmit
  } = useForm<FormDataUpdate>({
    resolver: yupResolver(formDataUpdate),
    defaultValues: {
      id: "",
      name: "",
      created_at: "",
      updated_at: ""
    } // giá trị khởi tạo
  })

  useEffect(() => {
    if (dataCategory) {
      setValue("id", dataCategory._id)
      setValue("name", dataCategory.name)
      setValue("is_active", dataCategory.is_active ? "active" : "inactive")
      setValue("created_at", convertDateTime(dataCategory.created_at))
      setValue("updated_at", convertDateTime(dataCategory.updated_at))
    }
  }, [dataCategory, setValue])

  const updateCategoryMutation = useMutation({
    mutationFn: (body: { id: string; body: UpdateCategoryBodyReq }) => {
      return CategoryAPI.updateCategoryDetail(body.id, body.body)
    }
  })

  const handleSubmitUpdate = handleSubmit((data) => {
    const payload = {
      name: data.name,
      is_active: data.is_active === "active" ? true : false
    }
    updateCategoryMutation.mutate(
      { id: dataCategory._id as string, body: payload },
      {
        onSuccess: () => {
          toast.success("Cập nhật thành công", { autoClose: 1500 })
          queryClient.invalidateQueries({ queryKey: ["listCategory", queryConfig] })
        },
        onError: (error) => {
          if (isError400<ErrorResponse<MessageResponse>>(error)) {
            const msg = error.response?.data as ErrorResponse<{ message: string }>
            const msg2 = msg.message
            setError("name", {
              message: msg2
            })
          }
        }
      }
    )
  })

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => {
      return CategoryAPI.deleteCategory(id)
    }
  })

  const handleDeleteCategory = (id: string) => {
    deleteCategoryMutation.mutate(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["listCategory"] })
        navigate({
          pathname: "/admin/categories"
        })
        toast.success("Xóa thành công!", { autoClose: 1500 })
      },
      onError: (error) => {
        if (isError400<ErrorResponse<MessageResponse>>(error)) {
          toast.error(error.response?.data.message, {
            autoClose: 1500
          })
        }
      }
    })
  }

  // xử lý gọi danh sách menu con
  const { data, isFetching, isLoading } = useQuery({
    queryKey: ["menuCategory", dataCategory._id],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort()
      }, 10000)
      return CategoryMenuAPI.getMenuCategoryById(dataCategory._id as string)
    },
    enabled: Boolean(dataCategory._id),
    retry: 0, // số lần retry lại khi hủy request (dùng abort signal)
    staleTime: 3 * 60 * 1000, // dưới 5 phút nó không gọi lại api
    placeholderData: keepPreviousData
  })

  const menuData = (data?.data?.result?.sections || []) as SectionMenuItemType[]
  const categoryMenuId = data?.data?.result?._id as string

  // render cột bảng cho từng nhóm (truyền sIdx để xử lý action theo nhóm)
  const getItemColumns = (sIdx: number): ColumnsType<SectionMenuItemType["items"][number]> => [
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
          <ButtonAntd size="small" onClick={() => setEditItem(record)}>
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

  const [showModal, setShowModal] = useState(false)
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

  const [editItem, setEditItem] = useState<boolean | MenuItemType | null>(null)

  return (
    <div>
      <form
        onSubmit={handleSubmitUpdate}
        className="bg-white dark:bg-darkPrimary rounded-md border border-gray-200 dark:border-darkBorder shadow-md"
      >
        <h3 className="py-2 px-4 text-lg font-semibold tracking-wide rounded-md text-black dark:text-white">
          Thông tin danh mục
        </h3>
        <div className="p-4 pt-0">
          <div className="mt-4 flex items-center gap-4">
            <Input
              name="id"
              register={register}
              placeholder="Nhập họ tên"
              messageErrorInput={errors.id?.message}
              classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
              className="relative flex-1"
              classNameLabel="text-black dark:text-white"
              nameInput="Mã danh mục"
              disabled
            />
            <Input
              name="name"
              register={register}
              placeholder="Nhập họ tên"
              messageErrorInput={errors.name?.message}
              classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
              className="relative flex-1"
              classNameLabel="text-black dark:text-white"
              nameInput="Tên danh mục"
            />
          </div>
          <div className="mt-2 flex items-center gap-4">
            <Input
              name="created_at"
              register={register}
              placeholder="Nhập ngày tạo"
              messageErrorInput={errors.created_at?.message}
              classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
              className="relative flex-1"
              classNameLabel="text-black dark:text-white"
              nameInput="Ngày tạo"
              disabled
            />
            <Input
              name="updated_at"
              register={register}
              placeholder="Nhập ngày tạo cập nhật"
              messageErrorInput={errors.updated_at?.message}
              classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md text-black dark:text-white"
              className="relative flex-1"
              classNameLabel="text-black dark:text-white"
              nameInput="Ngày cập nhật"
              disabled
            />
          </div>
          <div className="w-full">
            <div className="text-black dark:text-white block mb-1">Trạng thái</div>
            <Controller
              control={control}
              name="is_active"
              render={({ field }) => (
                <Select
                  {...field}
                  value={field.value}
                  onChange={(val) => field.onChange(val)}
                  className="mt-1 w-full"
                  options={[
                    { label: "Hiển thị", value: "active" },
                    { label: "Tắt", value: "inactive" }
                  ]}
                />
              )}
            />
          </div>
          <div className="flex items-center justify-end mt-4 gap-2">
            <Button
              onClick={() =>
                Modal.confirm({
                  title: "Bạn có chắc chắn muốn xóa?",
                  content: "Không thể hoàn tác hành động này. Thao tác này sẽ xóa vĩnh viễn dữ liệu của bạn.",
                  okText: "Xóa",
                  okButtonProps: { danger: true },
                  cancelText: "Hủy",
                  onOk: () => handleDeleteCategory(dataCategory._id)
                })
              }
              icon={<Trash2 size={18} />}
              nameButton="Xóa"
              type="button"
              classNameButton="w-[120px] p-4 py-2 bg-red-500 w-full text-white font-semibold rounded-md hover:bg-red-500/80 duration-200 flex items-center gap-1 text-[12px]"
            />
            <Button
              type="submit"
              icon={<ArrowUpFromLine size={18} />}
              nameButton="Lưu thay đổi"
              classNameButton="w-[120px] p-4 py-2 bg-blue-500 w-full text-white font-semibold rounded-md hover:bg-blue-500/80 duration-200 flex items-center gap-1 text-[12px]"
            />
          </div>
        </div>
      </form>

      <h1 className="text-xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 my-2">
        Danh sách menu danh mục
      </h1>

      {isLoading && <Skeleton />}
      {!isFetching ? (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-2">
            <div className="text-black dark:text-white font-medium">Tổng nhóm: {menuData?.length || 0}</div>
            <ButtonAntd type="primary" onClick={() => setShowModal(true)}>
              Thêm nhóm
            </ButtonAntd>
          </div>

          {menuData && menuData.length > 0 ? (
            <Collapse className="bg-white dark:bg-darkPrimary rounded-md" bordered>
              {menuData.map((section, sIdx) => (
                <Collapse.Panel
                  key={`${section.name}-${sIdx}`}
                  header={
                    <div className="flex items-center gap-2">
                      <span className="text-black dark:text-white font-semibold">{section.name}</span>
                      <Tag color="geekblue">{section.items?.length} link</Tag>
                    </div>
                  }
                  extra={
                    <Space onClick={(e) => e.stopPropagation()}>
                      <ButtonAntd
                        size="small"
                        onClick={() => {
                          setShowModalEditGroup(true)
                          formEditGroupName.setFieldValue("id_section", section.id_section)
                          formEditGroupName.setFieldValue("name", section.name)
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
                            onOk: () => console.log("delete section", sIdx)
                          })
                        }
                      >
                        <Trash2 size={16} />
                      </ButtonAntd>
                    </Space>
                  }
                >
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
                    columns={getItemColumns(sIdx)}
                    pagination={false}
                    size="middle"
                    scroll={{ x: "max-content" }}
                    rowClassName={(_, index) => (index % 2 === 0 ? "bg-[#f7f8fa]" : "bg-white")}
                  />
                </Collapse.Panel>
              ))}
            </Collapse>
          ) : (
            <div className="py-6">
              <Empty />
            </div>
          )}
        </div>
      ) : (
        <Skeleton />
      )}

      <Modal title="Thêm nhóm menu" open={showModal} onCancel={() => setShowModal(false)} footer={null}>
        <Form layout="vertical">
          <Form.Item
            label="Tên nhóm menu"
            name="groupName"
            rules={[{ required: true, message: "Vui lòng nhập tên nhóm menu" }]}
          >
            <Input placeholder="Nhập tên nhóm menu" />
          </Form.Item>
          <Form.Item>
            <ButtonAntd type="primary" htmlType="submit">
              Thêm nhóm
            </ButtonAntd>
          </Form.Item>
        </Form>
      </Modal>

      <ModalEditGroupName
        showModalEditGroup={showModalEditGroup}
        setShowModalEditGroup={setShowModalEditGroup}
        idCategoryMenu={categoryMenuId}
        idCategory={dataCategory._id as string}
        formEditGroupName={formEditGroupName}
      />

      <ModalAddLinkCategory
        showModalAddLinkCategory={showModalAddLinkCategory}
        setShowModalAddLinkCategory={setShowModalAddLinkCategory}
        formAddLinkCategory={formAddLinkCategory}
        idCategoryMenu={categoryMenuId}
        idCategory={dataCategory._id as string}
        editItem={editItem}
        setEditItem={setEditItem}
      />
    </div>
  )
}
