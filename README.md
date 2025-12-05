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

## Công nghệ & Thư viện sử dụng

### Frontend Framework & Core

- **React 18.3** - UI library với Concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Build tool & dev server nhanh
- **React Router DOM v7** - Client-side routing

### State Management & Data Fetching

- **React Query (TanStack Query v5)** - Server state management, caching, refetching
- **React Context API** - Global state (auth, user, permissions, socket)
- **React Hook Form** - Form state & validation
- **Yup** - Schema validation

### UI & Styling

- **Tailwind CSS** - Utility-first CSS framework
- **Ant Design (antd v5)** - Component library (Table, Modal, Steps, Select...)
- **Radix UI** - Headless UI primitives (Popover, Dropdown, Alert Dialog)
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **Swiper** - Touch slider component

### Authentication & Authorization

- **JWT (JSON Web Token)** - Token-based authentication
- **RBAC (Role-Based Access Control)** - Phân quyền theo vai trò:
  - **ADMIN** - Toàn quyền hệ thống
  - **SALES_STAFF** - Nhân viên bán hàng
  - **INVENTORY_STAFF** - Nhân viên kho
  - **CUSTOMER** - Khách hàng
- **Custom Hooks** - `useRolePermissions`, `useCheckPermission`
- **Route Guards** - Protected routes cho admin/client

### Real-time Communication

- **Socket.IO Client v4** - WebSocket cho:
  - Real-time chat (admin ↔ customer)
  - Live stock updates
  - Order notifications
  - Online status tracking

### Data Visualization & Export

- **Chart.js v4** - Biểu đồ thống kê (bar, line, pie)
- **React Chart.js 2** - React wrapper cho Chart.js
- **chartjs-plugin-datalabels** - Plugin hiển thị label trên chart
- **XLSX** - Export Excel (đơn hàng, sản phẩm, thống kê)
- **jsPDF + html2canvas** - Export PDF

### Rich Text & Media

- **TinyMCE (React)** - WYSIWYG editor cho mô tả sản phẩm
- **React Helmet Async** - SEO meta tags

### Utilities & Helpers

- **Axios** - HTTP client
- **js-cookie** - Cookie management
- **Lodash** - Utility functions
- **date-fns** - Date formatting & manipulation
- **clsx / tailwind-merge** - Conditional className merging
- **mitt** - Event emitter
- **React Infinite Scroll** - Lazy loading danh sách
- **React Highlight Words** - Search highlighting

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript ESLint** - TypeScript linting rules
- **Vite Plugin React** - Fast Refresh & optimizations

### Key Features Implementation

#### 1. Authentication Flow

```typescript
// JWT stored in localStorage
// authContext.tsx quản lý: isAuthenticated, role, permissions
// Protected routes kiểm tra token + role trước khi render
```

#### 2. RBAC System

```typescript
// role_permission.ts định nghĩa:
// - Roles: ADMIN, SALES_STAFF, INVENTORY_STAFF, CUSTOMER
// - Permissions: view_dashboard, view_orders, view_products...
// - Mapping: Role → Permissions[]

// Frontend check:
const { hasPermission } = useRolePermissions(permissions)
if (hasPermission("product:delete")) {
  // Render delete button
}
```

#### 3. Real-time Updates

```typescript
// Socket events:
// - client:update_quantity_product_display (cập nhật tồn kho)
// - client:order_notification (thông báo đơn hàng mới)
// - admin:chat_message (tin nhắn chat)
```

#### 4. Data Caching & Optimization

```typescript
// React Query config:
// - staleTime: 1-10 phút
// - placeholderData: keepPreviousData (giữ data cũ khi refetch)
// - queryClient.setQueryData() (cập nhật cache trực tiếp từ socket)
```

---

## Tính năng chính

### Giao diện Client (Người dùng)

- Xem danh sách sản phẩm, tìm kiếm, bộ lọc (giá, hãng, danh mục).
- Trang chi tiết sản phẩm (gallery ảnh, thông số, mô tả, đánh giá sản phẩm).
- Giỏ hàng (thêm/xóa/sửa số lượng).
- Thanh toán (checkout) — form nhập địa chỉ giao hàng.
- Tài khoản người dùng: đăng ký / đăng nhập / quản lý thông tin (JWT authentication).
- Hệ thống chat real-time với quản trị viên (Socket.IO).
- Xem đơn hàng đã mua + đánh giá sản phẩm.
- Cập nhật tồn kho real-time khi có người mua.
- Responsive (desktop, tablet, mobile).

_Ví dụ ảnh minh họa:_
![Client Home](https://pub-9c2ae26b29c841968f1def8091e99be4.r2.dev/client_home.jpg)
![Client Collection](https://pub-9c2ae26b29c841968f1def8091e99be4.r2.dev/client_collection.jpg)
![Client Product Detail](https://pub-9c2ae26b29c841968f1def8091e99be4.r2.dev/client_product_detail.jpg)
![Client Cart](https://pub-9c2ae26b29c841968f1def8091e99be4.r2.dev/client_cart.jpg)
![Client Order](https://pub-9c2ae26b29c841968f1def8091e99be4.r2.dev/client_order.jpg)

### Giao diện Admin (Quản trị + Nhân viên)

- Dashboard tổng quan (doanh thu, đơn hàng, số lượng sản phẩm, người dùng).
- Quản lý sản phẩm (CRUD): thêm, sửa, xóa, upload ảnh.
- Quản lý danh mục, thương hiệu.
- Quản lý đơn hàng: xem chi tiết, thay đổi trạng thái (pending → shipped → delivered).
- Quản lý người dùng: phân quyền (admin, staff, khách hàng).
- **RBAC (Role-Based Access Control)**: Phân quyền chi tiết theo vai trò và permission.
- Quản lý nhà cung cấp, cung ứng sản phẩm và nhập hàng cho hệ thống.
- Quản lý email và hệ thống chat với khách hàng (real-time với Socket.IO).
- Thống kê doanh thu, lợi nhuận với biểu đồ trực quan (Chart.js).
- Export báo cáo Excel/PDF.

---

_Ví dụ ảnh minh họa:_
![Admin Dashboard](https://pub-9c2ae26b29c841968f1def8091e99be4.r2.dev/admin_dashboard.jpg)
![Admin Product](https://pub-9c2ae26b29c841968f1def8091e99be4.r2.dev/admin_product.jpg)
![Admin Message 1](https://pub-9c2ae26b29c841968f1def8091e99be4.r2.dev/admin_message_1.jpg)
![Admin Message 2](https://pub-9c2ae26b29c841968f1def8091e99be4.r2.dev/admin_message_2.jpg)
![Admin Permission](https://pub-9c2ae26b29c841968f1def8091e99be4.r2.dev/admin_permission.jpg)

## Kiến trúc & Cấu trúc thư mục

```bash
TechZone/
│── dist/                  # Thư mục build sau khi chạy production
│── media/                 # Lưu trữ media (ảnh, video...)
│── node_modules/          # Thư viện cài đặt bởi npm/yarn
│── public/                # Static files (favicon, images, ...)
│── src/                   # Code chính của dự án
│   ├── Admin/             # Phần dành riêng cho quản trị viên
│   │   ├── Components/    # Các component tái sử dụng trong admin
│   │   ├── Layouts/       # Giao diện layout admin
│   │   ├── Pages/         # Trang của admin (Dashboard, Quản lý...)
│   │   └── Routes/        # Định nghĩa route cho admin
│   │
│   ├── Apis/              # Gọi API backend
│   │   ├── admin.api.ts   # API cho admin
│   │   └── client.api.ts  # API cho client
│   │
│   ├── Assets/            # Tài nguyên (ảnh, logo, ...)
│   │   ├── img/
│   │   └── logo/
│   │
│   ├── Client/            # Phần dành cho khách hàng
│   │   ├── Components/    # Component tái sử dụng cho client
│   │   ├── Constants/     # Các hằng số client
│   │   ├── Layout/        # Layout client
│   │   ├── Pages/         # Các trang của client (Menu, Order...)
│   │   └── Routes/        # Định nghĩa route cho client
│   │
│   ├── Utils/             # Hàm tiện ích (helper functions)
│   ├── Components/        # Component chung (dùng cho cả Admin & Client)
│   ├── Constants/         # Hằng số toàn cục
│   ├── Context/           # React Context API (quản lý state)
│   │   └── authContext.tsx # Quản lý trạng thái đăng nhập
│   ├── Helpers/           # Các hàm helper
│   ├── Hook/              # Custom React hooks
│   ├── lib/               # Thư viện tự viết/tích hợp
│   ├── Types/             # Định nghĩa TypeScript types & interfaces
│   ├── App.tsx            # File gốc React App
│   ├── index.css          # CSS global
│   ├── main.tsx           # Điểm vào ứng dụng
│   └── vite-env.d.ts      # TypeScript cho Vite
│
├── .editorconfig          # Quy tắc format code
├── .env                   # File môi trường (API keys, config)
├── .eslintrc.js/cjs       # ESLint config
├── .gitignore             # Bỏ qua file/thư mục khi push git
├── .prettierrc            # Prettier config (format code)
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
