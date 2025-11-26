/* eslint-disable @typescript-eslint/no-explicit-any */
import { MenuProps } from "antd"
import { Fragment } from "react/jsx-runtime"
import { queryParamsCollection } from "src/Types/queryParams.type"
import DropdownFilter from "../DropdownFilter"

export default function FilterRam({
  type_filter,
  dataFilter,
  handleChangeQuery,
  queryConfig
}: {
  type_filter: string
  dataFilter: any
  handleChangeQuery: (key: string, value: string) => void
  queryConfig: queryParamsCollection
}) {
  const itemColorList: MenuProps["items"] = dataFilter?.data?.specs_color?.map((item: string) => ({
    label: <div>{item}</div>,
    key: item
  }))

  return (
    <Fragment>
      {type_filter === "RAM, SSD, HDD" ? (
        <Fragment>
          <DropdownFilter
            handleChangeQuery={handleChangeQuery}
            queryConfig_field={queryConfig.color}
            keyQuery="color"
            data={itemColorList}
            name_dropdown="Màu sắc"
          />
        </Fragment>
      ) : null}
    </Fragment>
  )
}
