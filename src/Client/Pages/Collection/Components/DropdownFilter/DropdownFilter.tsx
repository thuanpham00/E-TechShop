/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Dropdown, Space } from "antd"
import { DownOutlined } from "@ant-design/icons"
import { queryParamsCollection } from "src/Types/queryParams.type"

export default function DropdownFilter({
  handleChangeQuery,
  queryConfig_field,
  keyQuery,
  data,
  name_dropdown
}: {
  handleChangeQuery: (key: string, value: string) => void
  queryConfig_field: string | undefined
  keyQuery: keyof queryParamsCollection
  data: any
  name_dropdown: string
}) {
  return (
    <Dropdown trigger={["click"]} menu={{ items: data, onClick: ({ key }) => handleChangeQuery(keyQuery, key) }}>
      <Button className="border border-gray-300 rounded-md px-3 py-1 bg-white hover:bg-gray-50 flex items-center gap-1">
        <Space>
          <span className="text-[13px]">
            {data && queryConfig_field
              ? (data.find((item: any) => item?.key?.toString() === queryConfig_field) as any)?.label
              : name_dropdown}
          </span>
          <DownOutlined />
        </Space>
      </Button>
    </Dropdown>
  )
}
