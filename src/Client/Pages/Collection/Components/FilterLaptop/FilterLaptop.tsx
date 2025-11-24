/* eslint-disable @typescript-eslint/no-explicit-any */
import { MenuProps } from "antd"
import { Fragment } from "react/jsx-runtime"
import { queryParamsCollection } from "src/Types/queryParams.type"
import DropdownFilter from "../DropdownFilter"

function FilterLaptop({
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
  const itemsScreenSizeList: MenuProps["items"] = dataFilter?.data?.screen_size_list?.map((item: string) => ({
    label: <div>{item} inch</div>,
    key: item
  }))

  const itemSSDList: MenuProps["items"] = dataFilter?.data?.ssd_list?.map((item: string) => ({
    label: <div>{item}</div>,
    key: item
  }))

  const itemRamList: MenuProps["items"] = dataFilter?.data?.ram_list?.map((item: string) => ({
    label: <div>{item}</div>,
    key: item
  }))

  const itemCpuList: MenuProps["items"] = dataFilter?.data?.cpu_list?.map((item: string) => ({
    label: <div>{item}</div>,
    key: item
  }))

  return (
    <Fragment>
      {type_filter === "Laptop" || type_filter === "Laptop Gaming" ? (
        <Fragment>
          <DropdownFilter
            handleChangeQuery={handleChangeQuery}
            queryConfig_field={queryConfig.screen_size}
            keyQuery="screen_size"
            data={itemsScreenSizeList}
            name_dropdown="Kích thước màn hình"
          />

          <DropdownFilter
            handleChangeQuery={handleChangeQuery}
            queryConfig_field={queryConfig.cpu}
            keyQuery="cpu"
            data={itemCpuList}
            name_dropdown="CPU"
          />

          <DropdownFilter
            handleChangeQuery={handleChangeQuery}
            queryConfig_field={queryConfig.ram}
            keyQuery="ram"
            data={itemRamList}
            name_dropdown="Ram"
          />

          <DropdownFilter
            handleChangeQuery={handleChangeQuery}
            queryConfig_field={queryConfig.ssd}
            keyQuery="ssd"
            data={itemSSDList}
            name_dropdown="SSD"
          />
        </Fragment>
      ) : null}
    </Fragment>
  )
}

export default FilterLaptop
