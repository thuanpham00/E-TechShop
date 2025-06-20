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
  // dành cho Laptop
  [
    {
      heading: "Thương hiệu",
      value: [
        { name: "ASUS", path: "laptop-asus-hoc-tap-va-lam-viec" },
        { name: "ACER", path: "laptop-acer-hoc-tap-va-lam-viec" },
        { name: "MSI", path: "laptop-msi-hoc-tap-va-lam-viec" },
        { name: "LENOVO", path: "laptop-lenovo-hoc-tap-va-lam-viec" }
      ]
    },
    {
      heading: "Giá bán",
      value: [
        { name: "Dưới 15 triệu", path: "laptop-duoi-15-trieu" },
        { name: "Từ 15 đến 20 triệu", path: "laptop-tu-15-den-20-trieu" },
        { name: "Trên 20 triệu", path: "laptop-tren-20-trieu" }
      ]
    }
    // {
    //   heading: "CPU Intel - AMD",
    //   value: [
    //     { name: "Intel Core i3", path: "laptop-asus-hoc-tap-va-lam-viec" },
    //     { name: "Intel Core i5", path: "laptop-asus-hoc-tap-va-lam-viec" },
    //     { name: "Intel Core i7", path: "laptop-asus-hoc-tap-va-lam-viec" },
    //     { name: "AMD Ryzen", path: "laptop-asus-hoc-tap-va-lam-viec" }
    //   ]
    // }
  ],
  // dành cho Laptop gaming
  [
    {
      heading: "Thương hiệu",
      value: [
        { name: "ASUS / ROG", path: "laptop-gaming-asus" },
        { name: "ACER / PREDATOR", path: "laptop-gaming-acer" },
        { name: "MSI", path: "laptop-gaming-msi" },
        { name: "LENOVO", path: "laptop-gaming-lenovo" }
      ]
    },
    {
      heading: "Giá bán",
      value: [
        { name: "Dưới 20 triệu", path: "laptop-gaming-duoi-20-trieu" },
        { name: "Từ 20 đến 25 triệu", path: "laptop-gaming-tu-20-den-25-trieu" },
        { name: "Trên 25 triệu", path: "laptop-gaming-tren-25-trieu" }
      ]
    }
    // {
    //   heading: "Kích thước",
    //   value: [
    //     { name: "Intel Core i3", path: "laptop-asus-hoc-tap-va-lam-viec" },
    //     { name: "Intel Core i5", path: "laptop-asus-hoc-tap-va-lam-viec" },
    //     { name: "Intel Core i7", path: "laptop-asus-hoc-tap-va-lam-viec" },
    //     { name: "AMD Ryzen", path: "laptop-asus-hoc-tap-va-lam-viec" },
    //     { name: "DELL", path: "laptop-asus-hoc-tap-va-lam-viec" }
    //   ]
    // }
  ],
  // dành cho PC GVN
  [
    {
      heading: "PC RTX 50 SERIES",
      value: [
        { name: "PC RTX 5090", path: "pc-gvn-rtx-5090" },
        { name: "PC RTX 5080", path: "pc-gvn-rtx-5080" },
        { name: "PC RTX 5070Ti", path: "pc-gvn-rtx-5070Ti" },
        { name: "PC RTX 5060Ti", path: "pc-gvn-rtx-5060Ti" }
      ]
    },
    {
      heading: "PC HOT CHIẾN HÈ",
      value: [
        { name: "I5 - 5060 - Chỉ từ 18TR", path: "pc-gvn-rtx-5060" },
        { name: "I5 - 4060 - 17tr", path: "pc-gvn-rtx-4060" },
        { name: "I5 - 3060 - 15tr", path: "pc-gvn-rtx-3060" }
      ]
    }
  ],
  // dành cho Main-cpu-vga
  [
    {
      heading: "1",
      value: [
        { name: "1", path: "pc-gvn-rtx-5090" },
        { name: "2", path: "pc-gvn-rtx-5080" },
        { name: "2", path: "pc-gvn-rtx-5070Ti" },
        { name: "2", path: "pc-gvn-rtx-5060Ti" }
      ]
    },
    {
      heading: "1",
      value: [
        { name: "1", path: "pc-gvn-rtx-5090" },
        { name: "2", path: "pc-gvn-rtx-5080" },
        { name: "2", path: "pc-gvn-rtx-5070Ti" },
        { name: "2", path: "pc-gvn-rtx-5060Ti" }
      ]
    }
  ],
  // dành cho case-nguồn-tản
  [
    {
      heading: "1",
      value: [
        { name: "1", path: "pc-gvn-rtx-5090" },
        { name: "2", path: "pc-gvn-rtx-5080" },
        { name: "2", path: "pc-gvn-rtx-5070Ti" },
        { name: "2", path: "pc-gvn-rtx-5060Ti" }
      ]
    },
    {
      heading: "1",
      value: [
        { name: "1", path: "pc-gvn-rtx-5090" },
        { name: "2", path: "pc-gvn-rtx-5080" },
        { name: "2", path: "pc-gvn-rtx-5070Ti" },
        { name: "2", path: "pc-gvn-rtx-5060Ti" }
      ]
    }
  ],
  // dành cho ổ cứng-ram-thẻ nhớ
  [
    {
      heading: "1",
      value: [
        { name: "1", path: "pc-gvn-rtx-5090" },
        { name: "2", path: "pc-gvn-rtx-5080" },
        { name: "2", path: "pc-gvn-rtx-5070Ti" },
        { name: "2", path: "pc-gvn-rtx-5060Ti" }
      ]
    },
    {
      heading: "1",
      value: [
        { name: "1", path: "pc-gvn-rtx-5090" },
        { name: "2", path: "pc-gvn-rtx-5080" },
        { name: "2", path: "pc-gvn-rtx-5070Ti" },
        { name: "2", path: "pc-gvn-rtx-5060Ti" }
      ]
    }
  ],
  // dành cho màn hình
  [
    {
      heading: "Thương hiệu",
      value: [
        { name: "SAMSUNG", path: "man-hinh-samsung" },
        { name: "ASUS", path: "man-hinh-asus" },
        { name: "DELL", path: "man-hinh-dell" },
        { name: "VIEWSONIC", path: "man-hinh-viewsonic" },
        { name: "ACER", path: "man-hinh-acer" }
      ]
    },
    {
      heading: "Giá bán",
      value: [
        { name: "Dưới 5 triệu", path: "man-hinh-duoi-5-trieu" },
        { name: "Từ 5 đến 10tr", path: "man-hinh-tu-5-den-10-trieu" },
        { name: "Từ 10 đến 20tr", path: "man-hinh-tu-10-den-20-trieu" },
        { name: "Trên 20tr", path: "man-hinh-tren-20-trieu" }
      ]
    }
    // {
    //   heading: "Kích thước",
    //   value: [
    //     { name: "Intel Core i3", path: "laptop-asus-hoc-tap-va-lam-viec" },
    //     { name: "Intel Core i5", path: "laptop-asus-hoc-tap-va-lam-viec" },
    //     { name: "Intel Core i7", path: "laptop-asus-hoc-tap-va-lam-viec" },
    //     { name: "AMD Ryzen", path: "laptop-asus-hoc-tap-va-lam-viec" },
    //     { name: "DELL", path: "laptop-asus-hoc-tap-va-lam-viec" }
    //   ]
    // }
  ]
]

import bannerLaptopAcer from "src/Assets/img/banner_category/acer.webp"
import bannerLaptopAsus from "src/Assets/img/banner_category/asus.webp"
import bannerLaptopDuoi15trieu from "src/Assets/img/banner_category/laptop_duoi_15_trieu.webp"
import bannerLaptopLenovo from "src/Assets/img/banner_category/lenovo.webp"
import bannerPCGVN from "src/Assets/img/banner_category/thang_02_pc_gvn_banner_web_collection_1920x420.webp"
import bannerMonitor from "src/Assets/img/banner_category/ips_banner_1920x680_801fccb12fa947bfb0eda431877d620e.webp"
import bannerAsus from "src/Assets/img/banner_category/asus-monitor.webp"
import bannerDell from "src/Assets/img/banner_category/dell-monitor.webp"

export const CategoryBanner = {
  "laptop-acer-hoc-tap-va-lam-viec": bannerLaptopAcer,
  "laptop-asus-hoc-tap-va-lam-viec": bannerLaptopAsus,
  "top-10-laptop-ban-chay": bannerLaptopDuoi15trieu,
  "laptop-duoi-15-trieu": bannerLaptopDuoi15trieu,
  "laptop-tu-15-den-20-trieu": bannerLaptopDuoi15trieu,
  "laptop-tren-20-trieu": bannerLaptopDuoi15trieu,
  "laptop-lenovo-hoc-tap-va-lam-viec": bannerLaptopLenovo,
  "laptop-msi-hoc-tap-va-lam-viec": bannerLaptopDuoi15trieu,

  "top-10-laptop-gaming-ban-chay": bannerLaptopDuoi15trieu,
  "laptop-gaming-acer": bannerLaptopAcer,
  "laptop-gaming-asus": bannerLaptopAsus,
  "laptop-gaming-msi": bannerLaptopDuoi15trieu,
  "laptop-gaming-lenovo": bannerLaptopLenovo,
  "laptop-gaming-duoi-20-trieu": bannerLaptopDuoi15trieu,
  "laptop-gaming-tu-20-den-25-trieu": bannerLaptopDuoi15trieu,
  "laptop-gaming-tren-25-trieu": bannerLaptopDuoi15trieu,

  "top-10-pc-ban-chay": bannerPCGVN,
  "pc-gvn-rtx-5090": bannerPCGVN,
  "pc-gvn-rtx-5080": bannerPCGVN,
  "pc-gvn-rtx-5070Ti": bannerPCGVN,
  "pc-gvn-rtx-5060Ti": bannerPCGVN,
  "pc-gvn-rtx-5060": bannerPCGVN,
  "pc-gvn-rtx-4060": bannerPCGVN,
  "pc-gvn-rtx-3060": bannerPCGVN,

  "man-hinh-samsung": bannerMonitor,
  "man-hinh-asus": bannerAsus,
  "man-hinh-dell": bannerDell,
  "man-hinh-duoi-5-trieu": bannerMonitor,
  "man-hinh-tu-5-den-10-trieu": bannerLaptopDuoi15trieu,
  "man-hinh-tu-10-den-20-trieu": bannerMonitor,
  "man-hinh-tren-20-trieu": bannerLaptopDuoi15trieu,
  "top-10-man-hinh-ban-chay": bannerMonitor
}
