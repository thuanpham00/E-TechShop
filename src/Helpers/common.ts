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
  // Cộng thêm 7 tiếng để chuyển từ UTC sang giờ Việt Nam
  const vnTime = new Date(date.getTime())

  // Lấy các thành phần ngày, tháng, năm, giờ, phút, giây
  const day = String(vnTime.getDate()).padStart(2, "0")
  const month = String(vnTime.getMonth() + 1).padStart(2, "0")
  const year = vnTime.getFullYear()
  const hours = String(vnTime.getHours()).padStart(2, "0")
  const minutes = String(vnTime.getMinutes()).padStart(2, "0")
  const seconds = String(vnTime.getSeconds()).padStart(2, "0")

  // Format lại chuỗi
  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`
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

export function normalize(s?: string) {
  return (s ?? "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .replace(/[^a-z0-9]/gi, "") // remove spaces/punctuation
    .toLowerCase()
    .trim()
}
