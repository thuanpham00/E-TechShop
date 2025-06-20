/* eslint-disable @typescript-eslint/no-explicit-any */
export const getNameParams = (name: string) => {
  return name
    .split("-")
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1).toLowerCase())
    .join(" ")
}

// laptop-asus-hoc-tap-va-lam-viec => Laptop Asus Hoc Tap Va Lam Viec

export function formatCurrency(current: number) {
  return new Intl.NumberFormat("de-DE").format(current)
}
// format 10000 -> 10.000

export function parseCurrencyToNumber(currencyStr: string) {
  if (!currencyStr) return 0
  const normalized = currencyStr.replace(/[^\d]/g, "") // Xóa tất cả ký tự không phải số
  return Number(normalized)
}

export function CalculateSalePrice(price: number, discount: number) {
  const priceSale = price - price * (discount / 100)
  return formatCurrency(priceSale)
}

export function ConvertAverageRating(averageRating: number) {
  if (averageRating === 0) {
    return "0.0"
  }
  return averageRating
}

export function convertDateTime(dateInput: string) {
  // Tạo đối tượng Date từ chuỗi đầu vào
  const date = new Date(dateInput)

  // Lấy các thành phần ngày, tháng, năm, giờ, phút, giây
  const day = String(date.getUTCDate()).padStart(2, "0")
  const month = String(date.getUTCMonth() + 1).padStart(2, "0") // Tháng bắt đầu từ 0
  const year = date.getUTCFullYear()
  const hours = String(date.getUTCHours()).padStart(2, "0")
  const minutes = String(date.getUTCMinutes()).padStart(2, "0")
  const seconds = String(date.getUTCSeconds()).padStart(2, "0")

  // Tạo chuỗi kết quả theo định dạng mong muốn
  const formattedDate = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`

  return formattedDate
}

export const cleanObject = (obj: Record<string, any>) => {
  const result: Record<string, any> = {}
  for (const key in obj) {
    if (obj[key] !== "" && obj[key] !== undefined) {
      result[key] = obj[key]
    }
  }
  return result
}

export function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD") // loại bỏ dấu tiếng Việt
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-") // thay ký tự không phải chữ/số bằng dấu -
    .replace(/^-+|-+$/g, "") // bỏ dấu - ở đầu/cuối
}

export function getNameFromNameId(nameId: string) {
  const arr = nameId.split("-i-")
  return arr[arr.length - 1]
}
