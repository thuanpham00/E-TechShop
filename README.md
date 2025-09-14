# 🛒 E‑TechShop — README (Chi tiết)

> **E‑TechShop** là một dự án ứng dụng web bán hàng điện tử (PC, laptop, gear, màn hình...). Repo được tổ chức thành **2 giao diện chính**:
>
> - **Client (Người dùng)** — giao diện mua sắm cho khách hàng.
> - **Admin (Quản trị)** — giao diện quản lý hệ thống, sản phẩm, đơn hàng, người dùng.

---

## Mục lục

- [Tổng quan](#tổng-quan)
- [Tính năng chính](#tính-năng-chính)
- [Kiến trúc & Cấu trúc thư mục](#kiến-trúc--cấu-trúc-thư-mục)
- [Biến môi trường (Environment variables)](#biến-môi-trường-environment-variables)
- [Cài đặt & Chạy (Local)](#cài-đặt--chạy-local)
- [Build & Triển khai (Deploy)](#build--triển-khai-deploy)
- [API (mẫu)](#api-mẫu)
- [License & Liên hệ](#license--liên-hệ)

---

## Tổng quan

Repo này được thiết kế theo mô hình _monorepo_ (hoặc tách 2 thư mục độc lập) gồm **client/** và **admin/** (và có thể có **server/** nếu bạn có backend trong cùng repo). Mục tiêu: tách rõ ràng phần UI cho khách hàng và phần quản trị để dễ phát triển, phân quyền và deploy độc lập.

---

## Tính năng chính

### Giao diện Client (Người dùng)

- Xem danh sách sản phẩm, tìm kiếm, bộ lọc (giá, hãng, danh mục).
- Trang chi tiết sản phẩm (gallery ảnh, thông số, mô tả).
- Giỏ hàng (thêm/xóa/sửa số lượng).
- Thanh toán (checkout) — form nhập địa chỉ giao hàng.
- Tài khoản người dùng: đăng ký / đăng nhập / quản lý thông tin.
- Hệ thống chat với quản trị viên
- Responsive (desktop, tablet, mobile).

*Ví dụ ảnh minh họa:*
![Client Home](/TechZone/media/bg-client-home.png)
![Client Product](/TechZone/media/bg-client-product.png)
![Client Cart](/TechZone/media/bg-client-cart.png)

### Giao diện Admin (Quản trị + Nhân viên)

- Dashboard tổng quan (doanh thu, đơn hàng, số lượng sản phẩm, người dùng).
- Quản lý sản phẩm (CRUD): thêm, sửa, xóa, upload ảnh.
- Quản lý danh mục, thương hiệu.
- Quản lý đơn hàng: xem chi tiết, thay đổi trạng thái (pending → shipped → delivered).
- Quản lý người dùng: phân quyền (admin, staff, khách hàng).
- Quản lý nhà cung cấp, cung ứng sản phẩm và nhập hàng cho hệ thống.
- Quản lý email và hệ thống chat với khách hàng
---
*Ví dụ ảnh minh họa:*
![Admin Dashboard](/TechZone/media/bg-admin.png)
![Admin Product](/TechZone/media/bg-admin-product.png)

## Kiến trúc & Cấu trúc thư mục

```
TechZone/
├── dist/ # thư mục build
├── media/ # hình ảnh demo, screenshot
├── public/ # tài nguyên tĩnh
├── src/ # mã nguồn chính
│ ├── Admin/ # giao diện quản trị
│ │ ├── Components/ # component tái sử dụng trong admin
│ │ ├── Layouts/ # layout admin (sidebar, header...)
│ │ ├── Pages/ # các trang (Dashboard, Product, Order, User...)
│ │ ├── Routes/ # định nghĩa routing admin
│ │ ├── Apis/ # gọi API cho admin
│ │ └── Assets/ # tài nguyên riêng của admin
│ │
│ ├── Client/ # giao diện người dùng
│ │ ├── Components/ # component UI (ProductCard, CartItem...)
│ │ ├── Constants/ # hằng số dùng trong client
│ │ ├── Layout/ # layout người dùng (navbar, footer...)
│ │ ├── Pages/ # các trang (Home, Product Detail, Cart, Checkout...)
│ │ ├── Routes/ # định nghĩa routing client
│ │ └── Utils/ # hàm tiện ích cho client
│ │
│ ├── Components/ # component dùng chung
│ ├── Context/ # context API (state toàn cục)
│ ├── Helpers/ # helper functions
│ ├── Hook/ # custom hooks
│ ├── lib/ # thư viện bổ sung
│ ├── Types/ # định nghĩa TypeScript types
│ ├── App.tsx # file gốc React
│ ├── main.tsx # entry point
│ └── socket.ts # cấu hình socket (nếu có)
│
├── index.html
├── package.json
├── tsconfig.json
└── README.md
```

**Ghi chú**: Nếu repo của bạn khác (ví dụ folder `frontend` + `backend`, hoặc `apps/client`, `apps/admin`), bạn có thể sửa phần "Cấu trúc thư mục" cho khớp.

---

## Biến môi trường (Environment variables)

### Client (Vite / React)

Tạo file `client/.env.local` (Vite yêu cầu tiền tố `VITE_`):

```
VITE_API_URL=https://api.example.com
VITE_APP_TITLE=E-TechShop
VITE_PUBLIC_STRIPE_KEY=pk_test_xxx    # nếu tích hợp Stripe
```

### Admin (Vite / React)

Tạo file `admin/.env.local`:

```
VITE_API_URL=https://api.example.com
VITE_ADMIN_PANEL_TITLE=E-TechShop Admin
```

### Server (Node.js / Express)

Tạo file `server/.env`:

```
PORT=4000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/etechshop
JWT_SECRET=your_jwt_secret_here
CORS_ORIGIN=http://localhost:5173
```

---

## Cài đặt & Chạy (Local)

**Yêu cầu**: Node.js 18+ (hoặc LTS), npm / pnpm / yarn.

1. Clone repo:

```bash
git clone https://github.com/thuanpham00/E-TechShop.git
cd E-TechShop
```

2. Chạy backend (nếu có `server/`):

```bash
cd server
cp .env.example .env      # hoặc tạo .env theo phần "Biến môi trường"
npm install
npm run dev               # hoặc `npm run start:dev`
```

3. Chạy client (giao diện người dùng):

```bash
cd ../client
cp .env.local.example .env.local   # nếu có
npm install
npm run dev
# mặc định Vite chạy ở http://localhost:5173
```

4. Chạy admin (giao diện quản trị):

```bash
cd ../admin
cp .env.local.example .env.local   # nếu có
npm install
npm run dev
# mặc định Vite chạy ở http://localhost:5174 (tùy cấu hình)
```

> Nếu bạn muốn chạy cả 3 cùng lúc, mở nhiều terminal hoặc sử dụng tool như `concurrently` hoặc `pnpm workspaces`.

---

## Build & Triển khai (Deploy)

### Build production

**Client**

```bash
cd client
npm run build
# build output -> client/dist
```

**Admin**

```bash
cd admin
npm run build
# build output -> admin/dist
```

### Deploy suggestions

- **Frontend (Client & Admin)**: Vercel, Netlify hoặc GitHub Pages (tùy chỉnh). Trỏ mỗi app thành project riêng trên Vercel để deploy độc lập.
- **Backend**: Render, Heroku (nếu còn miễn phí), Railway, DigitalOcean App Platform. Đặt biến môi trường trong dashboard của host.
- **Database**: MongoDB Atlas (cloud), hoặc self‑hosted MongoDB.

**Lưu ý về ảnh hiển thị trong README**: Đặt ảnh vào thư mục `media/` trong repo, sau đó trong README dùng đường dẫn tương đối:

```md
![Admin Dashboard](media/admin-dashboard.png)
```

Sau khi push lên GitHub, GitHub sẽ hiển thị ảnh. Tránh dùng đường dẫn tuyệt đối trên máy (`D:/...`).

---

## API (mẫu)

Dưới đây là ví dụ các endpoint RESTful phổ biến (server/Express):

- `POST /api/auth/register` — đăng ký user
- `POST /api/auth/login` — đăng nhập (trả JWT)
- `GET  /api/products` — lấy danh sách sản phẩm (query: page, limit, q, category, price)
- `GET  /api/products/:id` — chi tiết sản phẩm
- `POST /api/cart` — thêm/ cập nhật giỏ hàng (user)
- `POST /api/orders` — tạo đơn hàng
- `GET  /api/admin/orders` — (admin) lấy danh sách đơn hàng
- `POST /api/admin/products` — (admin) tạo sản phẩm
- `PUT  /api/admin/products/:id` — (admin) sửa sản phẩm

> Tùy ứng dụng bạn có thể dùng GraphQL thay vì REST.

---


## License & Liên hệ

- License: **MIT** (mặc định — thay đổi nếu bạn muốn).
- Tác giả / Repo: **thuanpham00** — https://github.com/thuanpham00/E-TechShop

