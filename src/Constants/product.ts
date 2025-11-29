export const listSpecificationForCategory = {
  Laptop: [
    "Cpu",
    "Ram",
    "Ổ cứng",
    "Card đồ họa",
    "Màn hình",
    "Bàn phím",
    "Webcam",
    "Hệ điều hành",
    "Pin",
    "Trọng lượng",
    "Màu sắc",
    "Bảo hành"
  ],
  "Laptop Gaming": [
    "Cpu",
    "Ram",
    "Ổ cứng",
    "Card đồ họa",
    "Màn hình",
    "Bàn phím",
    "Webcam",
    "Hệ điều hành",
    "Pin",
    "Trọng lượng",
    "Màu sắc",
    "Bảo hành"
  ],
  "PC GVN": ["Mainboard", "Cpu", "Ram", "Vga", "Ssd", "Hhd", "Psu", "Case", "Tản nhiệt"],
  "Màn hình": [
    "Thời gian phản hồi",
    "Độ phân giải",
    "Tần số quét",
    "Kiểu màn hình",
    "Tấm nền",
    "Kích thước",
    "Bảo hành"
  ],
  "Bàn phím": ["Layout", "Cấu trúc", "Switch", "Pin", "Kết nối", "Led", "Key-cap", "Trọng lượng", "Bảo hành"],
  Chuột: ["Màu sắc", "Số nút bấm", "DPI", "Trọng lượng", "Kết nối", "Bảo hành"],
  "Tai nghe": ["Màu sắc", "Kiểu tai nghe", "Trọng lượng", "Bảo hành"],
  "RAM, SSD, HDD": ["Màu sắc", "Loại RAM", "Dung lượng", "Bảo hành"], // dành cho RAM
  HDD: ["Tốc độ đọc", "Tốc độ ghi", "Cache", "Dung lượng", "RPM", "Bảo hành"], // dành cho HDD
  SSD: ["Tốc độ đọc", "Tốc độ ghi", "Chuẩn giao tiếp", "Dung lượng", "TBW", "Bảo hành"], // dành cho SSD
  Loa: ["Công suất", "Kiểu loa", "Pin", "Bảo hành"]
} as const
