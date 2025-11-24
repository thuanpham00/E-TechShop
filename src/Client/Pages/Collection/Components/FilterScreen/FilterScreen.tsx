/* eslint-disable @typescript-eslint/no-explicit-any */
import { MenuProps } from "antd"
import { Fragment } from "react/jsx-runtime"
import { queryParamsCollection } from "src/Types/queryParams.type"
import DropdownFilter from "../DropdownFilter"

export default function FilterScreen({
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
  const itemResolutionList: MenuProps["items"] = dataFilter?.data?.specs_resolution?.map((item: string) => ({
    label: <div>{item}</div>,
    key: item
  }))

  const itemTypeScreenList: MenuProps["items"] = dataFilter?.data?.specs_type_screen?.map((item: string) => ({
    label: <div>{item}</div>,
    key: item
  }))

  const itemScreenPanelList: MenuProps["items"] = dataFilter?.data?.specs_screen_panel?.map((item: string) => ({
    label: <div>{item}</div>,
    key: item
  }))

  const itemScreenSizeList: MenuProps["items"] = dataFilter?.data?.specs_screen_size?.map((item: string) => ({
    label: <div>{item}</div>,
    key: item
  }))

  return (
    <Fragment>
      {type_filter === "Màn hình" ? (
        <Fragment>
          <DropdownFilter
            handleChangeQuery={handleChangeQuery}
            queryConfig_field={queryConfig.resolution}
            keyQuery="resolution"
            data={itemResolutionList}
            name_dropdown="Độ phân giải"
          />

          <DropdownFilter
            handleChangeQuery={handleChangeQuery}
            queryConfig_field={queryConfig.type_screen}
            keyQuery="type_screen"
            data={itemTypeScreenList}
            name_dropdown="Kiểu màn hình"
          />

          <DropdownFilter
            handleChangeQuery={handleChangeQuery}
            queryConfig_field={queryConfig.screen_panel}
            keyQuery="screen_panel"
            data={itemScreenPanelList}
            name_dropdown="Tấm nền"
          />

          <DropdownFilter
            handleChangeQuery={handleChangeQuery}
            queryConfig_field={queryConfig.screen_size}
            keyQuery="screen_size"
            data={itemScreenSizeList}
            name_dropdown="Kích thước"
          />
        </Fragment>
      ) : null}
    </Fragment>
  )
}
