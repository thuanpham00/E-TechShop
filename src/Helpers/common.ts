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
