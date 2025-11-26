/* eslint-disable @typescript-eslint/no-explicit-any */
import { MenuProps } from "antd"
import { Fragment } from "react/jsx-runtime"
import { queryParamsCollection } from "src/Types/queryParams.type"
import DropdownFilter from "../DropdownFilter"

export default function FilterKeyboard({
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
  const itemLayoutList: MenuProps["items"] = dataFilter?.data?.specs_layout?.map((item: string) => ({
    label: <div>{item}</div>,
    key: item
  }))

  const itemLedList: MenuProps["items"] = dataFilter?.data?.specs_led?.map((item: string) => ({
    label: <div>{item}</div>,
    key: item
  }))

  return (
    <Fragment>
      {type_filter === "Bàn phím" ? (
        <Fragment>
          <DropdownFilter
            handleChangeQuery={handleChangeQuery}
            queryConfig_field={queryConfig.layout}
            keyQuery="layout"
            data={itemLayoutList}
            name_dropdown="Layout"
          />

          <DropdownFilter
            handleChangeQuery={handleChangeQuery}
            queryConfig_field={queryConfig.led}
            keyQuery="led"
            data={itemLedList}
            name_dropdown="Led"
          />
        </Fragment>
      ) : null}
    </Fragment>
  )
}
