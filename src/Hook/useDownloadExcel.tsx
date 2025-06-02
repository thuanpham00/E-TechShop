/* eslint-disable @typescript-eslint/no-explicit-any */
import * as XLSX from "xlsx"

export default function useDownloadExcel() {
  const downloadExcel = (data: Record<string, any>[]) => {
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")
    XLSX.writeFile(workbook, `DataSheet-${Date.now()}.xlsx`)
  }
  return {
    downloadExcel
  }
}
