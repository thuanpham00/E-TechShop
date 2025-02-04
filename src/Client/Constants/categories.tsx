import { Cpu, HardDrive, Headset, Keyboard, Laptop, LaptopMinimal, Monitor, Mouse } from "lucide-react"

export const categories = [
  { index: "0", name: "Laptop", icon: <Laptop size={22} /> },
  { index: "1", name: "Laptop Gaming", icon: <LaptopMinimal size={22} /> },
  { index: "2", name: "PC GVN", icon: <Laptop size={22} /> },
  { index: "3", name: "Main, CPU, VGA", icon: <Cpu size={22} /> },
  { index: "4", name: "Case, Nguồn, Tản", icon: <Cpu size={22} /> },
  { index: "5", name: "Ổ cứng, RAM, Thẻ nhớ", icon: <HardDrive size={22} /> },
  { index: "6", name: "Màn hình", icon: <Monitor size={22} /> },
  { index: "7", name: "Bàn phím", icon: <Keyboard size={22} /> },
  { index: "8", name: "Chuột + Lót chuột", icon: <Mouse size={22} /> },
  { index: "9", name: "Tai nghe", icon: <Headset size={22} /> }
]

interface MenuItem {
  heading: string
  value: { name: string; path: string }[]
}

export const MenuCategoryDetail: MenuItem[][] = [
  [
    {
      heading: "Thương hiệu",
      value: [
        { name: "ASUS", path: "laptop-asus-hoc-tap-va-lam-viec" },
        { name: "ACER", path: "laptop-acer-hoc-tap-va-lam-viec" },
        { name: "MSI", path: "laptop-asus-hoc-tap-va-lam-viec" },
        { name: "LENOVO", path: "laptop-asus-hoc-tap-va-lam-viec" },
        { name: "DELL", path: "laptop-asus-hoc-tap-va-lam-viec" }
      ]
    },
    {
      heading: "Giá bán",
      value: [
        { name: "Dưới 15 triệu", path: "laptop-asus-hoc-tap-va-lam-viec" },
        { name: "Từ 15 đến 20tr", path: "laptop-asus-hoc-tap-va-lam-viec" },
        { name: "Trên 20 triệu", path: "laptop-asus-hoc-tap-va-lam-viec" },
        { name: "LENOVO", path: "laptop-asus-hoc-tap-va-lam-viec" },
        { name: "DELL", path: "laptop-asus-hoc-tap-va-lam-viec" }
      ]
    },
    {
      heading: "CPU Intel - AMD",
      value: [
        { name: "Intel Core i3", path: "laptop-asus-hoc-tap-va-lam-viec" },
        { name: "Intel Core i5", path: "laptop-asus-hoc-tap-va-lam-viec" },
        { name: "Intel Core i7", path: "laptop-asus-hoc-tap-va-lam-viec" },
        { name: "AMD Ryzen", path: "laptop-asus-hoc-tap-va-lam-viec" },
        { name: "DELL", path: "laptop-asus-hoc-tap-va-lam-viec" }
      ]
    }
  ]
]

import bannerLaptopAcer from "src/Assets/img/banner_category/acer.webp"
import bannerLaptopAsus from "src/Assets/img/banner_category/asus.webp"

export const CategoryBanner = {
  "laptop-acer-hoc-tap-va-lam-viec": bannerLaptopAcer,
  "laptop-asus-hoc-tap-va-lam-viec": bannerLaptopAsus
}
