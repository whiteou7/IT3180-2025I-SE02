# Product Handoff Documentation - BlueMoon

## Mục lục

1. [Project Overview](#1-project-overview-tổng-quan-dự-án)
2. [Tech Stack](#2-tech-stack-công-nghệ-sử-dụng)
3. [Project Structure](#3-project-structure-cấu-trúc-dự-án)
4. [Database Schema](#4-database-schema-cấu-trúc-csdl)
5. [Installation & Setup](#5-installation--setup-cài-đặt--môi-trường)
6. [Key API Endpoints](#6-key-api-endpoints)

---

## 1. Project Overview (Tổng quan dự án)

### Tên dự án
**BlueMoon - Hệ thống Quản lý Chung cư**

### Mục tiêu
Cung cấp giải pháp quản lý toàn diện cho cư dân, ban quản lý và đội ngũ an ninh trong khu chung cư, hỗ trợ các hoạt động vận hành hàng ngày và quản lý tài chính.

### Các tính năng chính

#### 1. **Dashboard & Tổng quan**
   - Dashboard tổng quan cho từng vai trò (Admin, Cư dân, Kế toán, An ninh)
   - Hiển thị thống kê và báo cáo trực quan

#### 2. **Quản lý Cư dân (Residents Management)**
   - **Hồ sơ cư dân (Resident Profiles)**: Quản lý thông tin cư dân chi tiết
   - **Danh bạ căn hộ (Apartment Directory)**: Tra cứu và quản lý căn hộ theo tòa nhà
   - **Trạng thái cư trú (Residence Status)**: Theo dõi tình trạng căn hộ (đang ở/trống)
   - **Kiểm soát ra vào (Access Control)**: Quản lý phương tiện và lịch sử ra vào
   - **Quản lý tài liệu (Document Management)**: Lưu trữ và quản lý hồ sơ giấy tờ cư dân

#### 3. **Quản lý Hóa đơn & Tài chính (Billing Management)**
   - Tạo và quản lý hóa đơn định kỳ
   - Thanh toán trực tuyến
   - Lịch sử giao dịch
   - Xuất hóa đơn PDF
   - Báo cáo thuế

#### 4. **Dịch vụ (Services)**
   - **Danh mục dịch vụ (Service Catalog)**: Danh sách các dịch vụ có sẵn (vệ sinh, bảo trì, tiện ích)
   - **Quản lý dịch vụ (Service Management)**: Thêm/sửa/xóa dịch vụ
   - **Phản hồi dịch vụ (Feedbacks)**: Tiếp nhận và xử lý ý kiến phản hồi từ cư dân

#### 5. **Quản lý Tài sản & Đồ thất lạc (Property Management)**
   - Đăng ký tài sản cá nhân (xe, điện tử, tài liệu)
   - Báo cáo đồ thất lạc
   - Quản lý tìm kiếm đồ thất lạc
   - Trạng thái tài sản (found/not found/deleted)

#### 6. **Kiểm soát Phương tiện (Vehicle Management)**
   - Đăng ký phương tiện
   - Check-in/Check-out xe ra vào
   - Lịch sử di chuyển phương tiện
   - Demo tính năng Vehicle Check-in

#### 7. **Giao tiếp Nội bộ (Communication)**
   - **Thông báo (Announcements)**: Đăng bài thông báo chung
   - **Chat nội bộ (Internal Chat)**: Tin nhắn 1-1 giữa cư dân và ban quản lý

#### 8. **Báo cáo & Thống kê (Reports)**
   - **Báo cáo tài chính (Financial Reports)**: Thống kê doanh thu, chi phí, thuế
   - **Báo cáo tổng quan (General Reports)**: Thống kê chung về cư dân, căn hộ
   - **Báo cáo an ninh (Security Reports)**: Thống kê ra vào, sự cố an ninh

#### 9. **Hệ thống (System)**
   - **Cài đặt hệ thống (System Settings)**: Cấu hình tham số hệ thống
   - **Database Dump**: Sao lưu và phục hồi dữ liệu

#### 10. **Xác thực & Phân quyền (Authentication & Authorization)**
   - Đăng nhập với email/password
   - Quản lý phiên đăng nhập
   - Phân quyền theo vai trò: Admin, Tenant (Cư dân), Police (An ninh), Accountant (Kế toán)
   - Reset mật khẩu

---

## 2. Tech Stack (Công nghệ sử dụng)

### Frontend
- **Framework**: Next.js 15.5.7 (Pages Router)
- **UI Library**: React 19.1.0
- **Styling**: 
  - Tailwind CSS 4.0
  - Tailwind Typography
  - Tailwind Animate
- **UI Components**: 
  - Radix UI (Headless components): Dialog, Dropdown, Select, Tabs, Avatar, Checkbox, Progress, Switch, Tooltip, Accordion, Alert Dialog, Navigation Menu, etc.
  - Shadcn UI (Custom components built on Radix UI)
  - Lucide React (Icons library)
- **Animation**: Framer Motion
- **Charts**: Recharts
- **Forms**: 
  - React Hook Form
  - Zod (Schema validation)
  - @hookform/resolvers
- **Date Handling**: date-fns, react-day-picker
- **Rich Text**: React Markdown
- **Carousel**: Embla Carousel React
- **Theme**: next-themes (Dark/Light mode)
- **Toast Notifications**: Sonner
- **PDF Generation**: @h1dd3nsn1p3r/pdf-invoice

### Backend
- **API Architecture**: Next.js API Routes (Serverless Functions)
- **HTTP Client**: ofetch (auto-import fetch wrapper)
- **File Upload**: formidable
- **Authentication**: bcryptjs (Password hashing)

### Database
- **Database**: PostgreSQL
- **Connection Library**: postgres (v3.4.7)
- **ORM/Query Builder**: Raw SQL queries với automatic snake_case → camelCase transformation

### State Management
- **Global State**: Zustand 5.0.8 (with persist middleware)
- **Hooks**: react-use (Collection of React Hooks)

### Language & Type Safety
- **Language**: TypeScript 5
- **Type Definitions**: Strict typing với types folder organization

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint 9 với eslint-config-next
- **Build Tool**: Turbopack (Next.js's new bundler)
- **Environment Variables**: dotenv

### Additional Libraries
- **Utilities**:
  - clsx, tailwind-merge (ClassName utilities)
  - class-variance-authority (Variant-based styling)
  - cmdk (Command menu)
  - input-otp (OTP input)
  - vaul (Drawer component)
- **Storage**: @supabase/supabase-js (Optional, có dependency nhưng chưa rõ mức độ sử dụng)

---

## 3. Project Structure (Cấu trúc dự án)

```
introse-se02/
│
├── pages/                          # Next.js Pages Router
│   ├── api/                       # Backend API Routes (Serverless Functions)
│   │   ├── auth/                  # Authentication endpoints
│   │   │   ├── login.ts
│   │   │   └── reset-password.ts
│   │   ├── users/                 # User management
│   │   │   ├── [id]/
│   │   │   │   ├── apartments.ts  # User's apartments
│   │   │   │   ├── billings.ts    # User's billings
│   │   │   │   ├── documents/     # User's documents
│   │   │   │   ├── properties/    # User's properties
│   │   │   │   ├── vehicle/       # Vehicle check-in/logs
│   │   │   │   └── vehicles.ts    # User's vehicles
│   │   │   ├── [id].ts            # Single user CRUD
│   │   │   ├── users.ts           # All users
│   │   │   └── search.ts          # Search users
│   │   ├── apartments/            # Apartment management
│   │   │   ├── [id].ts
│   │   │   └── apartments.ts
│   │   ├── billings/              # Billing management
│   │   │   ├── [id]/
│   │   │   │   └── file.ts        # PDF generation
│   │   │   ├── [id].ts
│   │   │   └── index.ts
│   │   ├── services/              # Service management
│   │   │   ├── [id].ts
│   │   │   └── services.ts
│   │   ├── feedbacks/             # Feedback system
│   │   │   ├── [id].ts
│   │   │   └── feedbacks.ts
│   │   ├── properties/            # Property management
│   │   │   ├── index.ts
│   │   │   └── available.ts
│   │   ├── property-reports/      # Lost & found reports
│   │   │   ├── [id].ts
│   │   │   └── property-reports.ts
│   │   ├── vehicles/              # Vehicle control
│   │   │   └── checkin.ts
│   │   ├── chats/                 # Internal messaging
│   │   │   ├── [chatId]/messages.ts
│   │   │   └── chats.ts
│   │   ├── posts/                 # Announcements
│   │   │   ├── [id].ts
│   │   │   └── posts.ts
│   │   ├── system/                # System management
│   │   │   ├── settings.ts
│   │   │   └── dump.ts           # DB backup
│   │   └── taxes.ts               # Tax reporting
│   │
│   ├── dashboard.tsx              # Main dashboard
│   ├── index.tsx                  # Home page
│   ├── login.tsx                  # Login page
│   │
│   ├── residents/                 # Resident management pages
│   │   ├── profiles.tsx
│   │   ├── apartments.tsx
│   │   ├── status.tsx
│   │   ├── access-control.tsx
│   │   └── documents.tsx
│   │
│   ├── billing/                   # Billing pages
│   │   └── index.tsx
│   │
│   ├── services/                  # Service pages
│   │   ├── catalog.tsx
│   │   ├── manage.tsx
│   │   └── feedbacks.tsx
│   │
│   ├── property/                  # Property pages
│   │   ├── index.tsx
│   │   └── lost-property.tsx
│   │
│   ├── communication/             # Communication pages
│   │   ├── announcements.tsx
│   │   └── chat.tsx
│   │
│   ├── reports/                   # Reporting pages
│   │   ├── financial.tsx
│   │   ├── general.tsx
│   │   └── security.tsx
│   │
│   ├── system/                    # System pages
│   │   └── settings.tsx
│   │
│   ├── vehicle-checkin-demo.tsx   # Demo page
│   ├── _app.tsx                   # App wrapper
│   └── _document.tsx              # HTML document
│
├── components/                    # React Components
│   ├── ui/                       # Shadcn UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   ├── form.tsx
│   │   └── ... (50+ reusable components)
│   ├── auth/
│   │   └── auth-gate.tsx         # Protected route wrapper
│   ├── residents/                # Domain-specific components
│   ├── property/
│   ├── Sidebar.tsx               # Main navigation
│   ├── ThemeToggle.tsx           # Dark/Light mode toggle
│   └── login-form.tsx
│
├── types/                        # TypeScript Type Definitions
│   ├── users.ts                  # User types
│   ├── apartments.ts             # Apartment types
│   ├── billings.ts               # Billing types
│   ├── vehicles.ts               # Vehicle types
│   ├── services.ts               # Service types
│   ├── properties.ts             # Property types
│   ├── feedbacks.ts              # Feedback types
│   ├── chats.ts                  # Chat types
│   ├── posts.ts                  # Post types
│   ├── reports.ts                # Report types
│   ├── enum.ts                   # Enums (Roles, Status, Categories)
│   └── api.ts                    # API response types
│
├── lib/                          # Utility Functions
│   ├── utils.ts                  # General utilities (cn, formatters)
│   └── billing.ts                # Billing-specific logic
│
├── store/                        # State Management
│   └── userStore.ts              # Zustand store for user state
│
├── hooks/                        # Custom React Hooks
│   └── use-mobile.ts             # Responsive hook
│
├── styles/                       # Global Styles
│
├── public/                       # Static Assets
│
├── db.ts                         # Database connection
├── middleware.js                 # Next.js middleware
├── next.config.ts                # Next.js configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies
└── .env                          # Environment variables (not in repo)
```

### Vai trò của các thư mục chính

#### `pages/api` - Backend API Routes
Chứa toàn bộ logic Backend dưới dạng serverless functions. Mỗi file/folder tương ứng với một endpoint API:
- Xử lý HTTP methods (GET, POST, PUT, DELETE)
- Kết nối trực tiếp với PostgreSQL database
- Business logic và validation
- File structure tự động map sang URL endpoints

#### `pages` - Frontend Pages (Routing)
Next.js Pages Router tự động tạo routes dựa trên cấu trúc file:
- `pages/dashboard.tsx` → `/dashboard`
- `pages/residents/profiles.tsx` → `/residents/profiles`
- Dynamic routes: `[id].tsx`, `[chatId].tsx`

#### `components` - UI Components
- **`ui/`**: Reusable Shadcn UI components (50+ components)
- **Domain-specific**: Components cho từng module (residents, property, auth)
- **Layout**: Sidebar, ThemeToggle
- Tất cả components đều sử dụng TypeScript và Tailwind CSS

#### `types` - TypeScript Type Definitions
Định nghĩa tất cả types cho:
- Database entities
- API requests/responses
- Component props
- Enums và constants
**Rất quan trọng** để đảm bảo type safety và IntelliSense trong IDE

#### `lib` - Utility Functions
- **`utils.ts`**: Hàm tiện ích chung (className merger, formatters, validators)
- **`billing.ts`**: Logic nghiệp vụ tính toán hóa đơn
- Có thể chứa các helper functions khác

#### `store` - State Management
- **`userStore.ts`**: Zustand store lưu trữ thông tin user hiện tại (userId, role, fullName)
- Sử dụng persist middleware để lưu vào localStorage
- Dùng cho authentication state

#### `public` - Static Assets
- Images, icons, fonts
- Accessed via `/` URL path

---

## 4. Database Schema (Cấu trúc CSDL)

Hệ thống sử dụng PostgreSQL với schema được thiết kế theo mô hình quan hệ. Dựa trên các types định nghĩa, dưới đây là các bảng chính và mối quan hệ:

### Các bảng chính

#### 1. **users** - Bảng người dùng
```sql
Columns:
- user_id: VARCHAR (Primary Key)
- email: VARCHAR (Unique)
- full_name: VARCHAR
- password_hash: VARCHAR
- role: ENUM ('tenant', 'admin', 'police', 'accountant')
- year_of_birth: INTEGER (Nullable)
- gender: ENUM ('male', 'female') (Nullable)
- phone_number: VARCHAR (Nullable)
- apartment_id: INTEGER (Nullable, Foreign Key → apartments.apartment_id)
```
**Vai trò**: Lưu trữ thông tin tất cả người dùng trong hệ thống (cư dân, admin, kế toán, an ninh)

#### 2. **apartments** - Bảng căn hộ
```sql
Columns:
- apartment_id: INTEGER (Primary Key, Auto-increment)
- building_id: INTEGER
- floor: INTEGER
- apartment_number: INTEGER
- monthly_fee: DECIMAL
```
**Vai trò**: Quản lý thông tin căn hộ trong chung cư

#### 3. **billings** - Bảng hóa đơn
```sql
Columns:
- billing_id: VARCHAR (Primary Key, UUID)
- user_id: VARCHAR (Foreign Key → users.user_id)
- billing_status: ENUM ('unpaid', 'paid', 'deleted')
- due_date: DATE
- period_start: DATE
- period_end: DATE
- paid_at: TIMESTAMP (Nullable)
- total_price: DECIMAL
```
**Vai trò**: Quản lý hóa đơn thanh toán của cư dân

#### 4. **billing_services** - Bảng chi tiết dịch vụ trong hóa đơn
```sql
Columns:
- billing_id: VARCHAR (Foreign Key → billings.billing_id)
- service_id: INTEGER (Foreign Key → services.service_id)
- (Composite Primary Key: billing_id + service_id)
```
**Vai trò**: Liên kết nhiều-nhiều giữa billings và services

#### 5. **services** - Bảng dịch vụ
```sql
Columns:
- service_id: INTEGER (Primary Key, Auto-increment)
- service_name: VARCHAR
- price: DECIMAL
- description: TEXT (Nullable)
- tax: DECIMAL
- category: ENUM ('cleaning', 'maintenance', 'utilities', 'amenities', 'other')
- is_available: BOOLEAN
- updated_at: TIMESTAMP
```
**Vai trò**: Danh mục các dịch vụ cung cấp trong chung cư

#### 6. **properties** - Bảng tài sản
```sql
Columns:
- property_id: INTEGER (Primary Key, Auto-increment)
- property_name: VARCHAR
- user_id: VARCHAR (Nullable, Foreign Key → users.user_id)
- is_public: BOOLEAN
- property_type: ENUM ('general', 'vehicle', 'document', 'electronics', 'other')
- status: ENUM ('found', 'not found', 'deleted')
- created_at: TIMESTAMP
- license_plate: VARCHAR (Nullable, for vehicles)
```
**Vai trò**: Quản lý tài sản cá nhân và đồ thất lạc

#### 7. **vehicles** - Bảng phương tiện
```sql
Columns:
- vehicle_id: INTEGER (Primary Key, Auto-increment)
- property_id: INTEGER (Foreign Key → properties.property_id)
- license_plate: VARCHAR
```
**Vai trò**: Lưu thông tin phương tiện (xe) của cư dân

#### 8. **vehicle_logs** - Bảng lịch sử ra vào
```sql
Columns:
- vehicle_log_id: VARCHAR (Primary Key, UUID)
- user_id: VARCHAR (Nullable, Foreign Key → users.user_id)
- vehicle_id: INTEGER (Nullable, Foreign Key → vehicles.vehicle_id)
- license_plate: VARCHAR (Nullable)
- entrance_time: TIMESTAMP
- exit_time: TIMESTAMP (Nullable)
- apartment_id: INTEGER (Nullable)
```
**Vai trò**: Ghi nhận lịch sử xe ra vào chung cư

#### 9. **property_reports** - Bảng báo cáo tài sản
```sql
Columns:
- property_report_id: VARCHAR (Primary Key, UUID)
- owner_id: VARCHAR (Nullable, Foreign Key → users.user_id)
- property_id: INTEGER (Nullable, Foreign Key → properties.property_id)
- issuer_id: VARCHAR (Nullable, Foreign Key → users.user_id)
- status: ENUM ('found', 'not found', 'deleted')
- issued_status: ENUM ('found', 'not found', 'deleted') (Nullable)
- content: TEXT (Nullable)
- approved: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```
**Vai trò**: Báo cáo về đồ thất lạc hoặc tìm được

#### 10. **feedbacks** - Bảng phản hồi
```sql
Columns:
- feedback_id: VARCHAR (Primary Key, UUID)
- user_id: VARCHAR (Foreign Key → users.user_id)
- content: TEXT
- tags: TEXT[] (Array)
- status: ENUM ('open', 'in_progress', 'resolved', 'closed')
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```
**Vai trò**: Quản lý phản hồi/khiếu nại từ cư dân

#### 11. **chats** - Bảng cuộc trò chuyện
```sql
Columns:
- chat_id: VARCHAR (Primary Key, UUID)
- user1_id: VARCHAR (Foreign Key → users.user_id)
- user2_id: VARCHAR (Foreign Key → users.user_id)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```
**Vai trò**: Quản lý cuộc trò chuyện 1-1

#### 12. **messages** - Bảng tin nhắn
```sql
Columns:
- message_id: VARCHAR (Primary Key, UUID)
- chat_id: VARCHAR (Foreign Key → chats.chat_id)
- sender_id: VARCHAR (Foreign Key → users.user_id)
- content: TEXT
- created_at: TIMESTAMP
- read_at: TIMESTAMP (Nullable)
```
**Vai trò**: Lưu trữ tin nhắn trong các cuộc trò chuyện

#### 13. **posts** - Bảng thông báo
```sql
Columns:
- post_id: VARCHAR (Primary Key, UUID)
- user_id: VARCHAR (Foreign Key → users.user_id)
- title: VARCHAR (Nullable)
- content: TEXT
- category: ENUM ('fees_billing', 'maintenance', 'building_issues', 'general') (Nullable)
- created_at: TIMESTAMP
```
**Vai trò**: Thông báo chung từ ban quản lý

#### 14. **documents** - Bảng tài liệu
```sql
Columns:
- document_id: VARCHAR (Primary Key, UUID)
- user_id: VARCHAR (Foreign Key → users.user_id)
- filename: VARCHAR
- category: ENUM ('personal', 'apartment', 'building', 'legal', 'other')
- file_path: VARCHAR
- uploaded_at: TIMESTAMP
```
**Vai trò**: Lưu trữ metadata của tài liệu người dùng (file thực tế lưu trên filesystem/cloud)

### Mối quan hệ chính

```
users (1) ←→ (0..1) apartments
  ├─→ (1) ←→ (N) billings
  ├─→ (1) ←→ (N) properties
  ├─→ (1) ←→ (N) vehicle_logs
  ├─→ (1) ←→ (N) feedbacks
  ├─→ (1) ←→ (N) documents
  ├─→ (1) ←→ (N) posts
  └─→ (1) ←→ (N) messages

billings (M) ←→ (N) services (via billing_services)

properties (1) ←→ (0..1) vehicles
  └─→ (1) ←→ (N) property_reports

vehicles (1) ←→ (N) vehicle_logs

chats (1) ←→ (N) messages
  └─→ (2) users (user1_id, user2_id)
```

### Notes về Database
- **UUID vs Auto-increment**: Các bảng transactional (billings, feedbacks, chats, messages, posts) dùng UUID, các bảng master data (apartments, services, vehicles) dùng auto-increment
- **Snake_case → camelCase**: Database sử dụng snake_case nhưng được tự động chuyển sang camelCase trong code TypeScript (xem `db.ts`)
- **Soft Delete**: Một số bảng có status 'deleted' thay vì xóa thực sự
- **Timestamps**: Hầu hết các bảng có `created_at` và/hoặc `updated_at`

---

## 5. Installation & Setup (Cài đặt & Môi trường)

### Yêu cầu hệ thống

- **Node.js**: >= 18.x (Recommended: 20.x hoặc mới hơn)
- **npm**: >= 9.x
- **PostgreSQL**: >= 14.x
- **OS**: Windows, macOS, hoặc Linux

### Bước 1: Clone Repository

```bash
git clone <repository-url>
cd introse-se02
```

### Bước 2: Cài đặt Dependencies

```bash
npm install
```

Lệnh này sẽ cài đặt tất cả các packages được liệt kê trong `package.json` (~70 dependencies).

### Bước 3: Cấu hình Database

#### 3.1. Tạo PostgreSQL Database

```sql
CREATE DATABASE bluemoon_db;
```

#### 3.2. Import Schema & Seed Data

*Chạy các SQL scripts để tạo bảng và import dữ liệu mẫu (nếu có file SQL riêng)*

### Bước 4: Cấu hình Environment Variables

Tạo file `.env` ở root directory với các biến môi trường sau:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/bluemoon_db

# Application Configuration
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000

# Optional: If using Supabase for storage
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Security (for production)
# SESSION_SECRET=your_secret_key_here
```

#### Chi tiết các biến môi trường

| Biến môi trường | Mô tả | Bắt buộc | Ví dụ |
|----------------|-------|----------|-------|
| `DATABASE_URL` | Connection string đến PostgreSQL database | ✅ Có | `postgresql://user:pass@localhost:5432/dbname` |
| `NODE_ENV` | Môi trường chạy | ❌ Không | `development`, `production` |
| `NEXT_PUBLIC_API_URL` | Base URL của API (cho frontend) | ❌ Không | `http://localhost:3000` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL (nếu dùng Supabase storage) | ❌ Không | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ❌ Không | `eyJhbGc...` |

**⚠️ Lưu ý**: File `.env` đã được thêm vào `.gitignore` và **không được commit lên repository**.

### Bước 5: Chạy Development Server

```bash
npm run dev
```

Server sẽ chạy tại: **http://localhost:3000**

Turbopack (faster dev mode) được enable mặc định.

### Bước 6: Build cho Production

```bash
npm run build
```

Lệnh này sẽ:
- Compile TypeScript
- Bundle code với Turbopack
- Optimize assets
- Generate static pages

### Bước 7: Chạy Production Server

```bash
npm start
```

Server production sẽ chạy tại port mặc định 3000.

### Bước 8: Linting (Optional)

```bash
npm run lint
```

Kiểm tra code quality với ESLint.

---

### Cấu trúc thư mục sau khi cài đặt

```
introse-se02/
├── node_modules/          # Dependencies (sau khi npm install)
├── .next/                 # Build output (sau khi npm run build)
├── public/                # Static files
├── .env                   # Environment variables (TỰ TẠO)
├── .env.local             # Local overrides (optional)
└── ... (source code)
```

### Troubleshooting

#### Lỗi kết nối Database
```
Error: DATABASE_URL environment variable is not defined
```
**Giải pháp**: Đảm bảo file `.env` đã được tạo và có biến `DATABASE_URL`

#### Port 3000 đã được sử dụng
**Giải pháp**: Chạy với port khác:
```bash
npm run dev -- -p 3001
```

#### TypeScript errors
**Giải pháp**: Đảm bảo tất cả types được định nghĩa đúng trong thư mục `types/`

---

## 6. Key API Endpoints

Dưới đây là danh sách các nhóm API chính. Tất cả endpoints đều nằm trong `pages/api/`.

### Base URL
```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

---

### 6.1. Authentication & Authorization

#### **POST** `/api/auth/login`
- **Mô tả**: Đăng nhập vào hệ thống
- **Body**: `{ email: string, password: string }`
- **Response**: `{ userId, fullName, role, token? }`

#### **POST** `/api/auth/reset-password`
- **Mô tả**: Reset mật khẩu người dùng
- **Body**: `{ email: string, newPassword: string }`

---

### 6.2. User Management

#### **GET** `/api/users`
- **Mô tả**: Lấy danh sách tất cả người dùng
- **Query params**: `?role=admin&search=name`

#### **POST** `/api/users`
- **Mô tả**: Tạo người dùng mới
- **Body**: `{ email, fullName, password, role, ... }`

#### **GET** `/api/users/[id]`
- **Mô tả**: Lấy thông tin chi tiết một người dùng
- **Params**: `id` (userId)

#### **PUT** `/api/users/[id]`
- **Mô tả**: Cập nhật thông tin người dùng

#### **DELETE** `/api/users/[id]`
- **Mô tả**: Xóa người dùng

#### **GET** `/api/users/search`
- **Mô tả**: Tìm kiếm người dùng
- **Query params**: `?query=search_term`

---

### 6.3. User-specific Resources

#### **GET** `/api/users/[id]/apartments`
- **Mô tả**: Lấy danh sách căn hộ của user

#### **GET** `/api/users/[id]/billings`
- **Mô tả**: Lấy danh sách hóa đơn của user

#### **GET** `/api/users/[id]/documents`
- **Mô tả**: Lấy danh sách tài liệu của user

#### **POST** `/api/users/[id]/documents/upload`
- **Mô tả**: Upload tài liệu cho user
- **Content-Type**: `multipart/form-data`

#### **GET** `/api/users/[id]/documents/[filename]`
- **Mô tả**: Download tài liệu cụ thể

#### **GET** `/api/users/[id]/vehicles`
- **Mô tả**: Lấy danh sách phương tiện của user

#### **GET** `/api/users/[id]/vehicle-logs`
- **Mô tả**: Lấy lịch sử ra vào của user

#### **POST** `/api/users/[id]/vehicle/checkin`
- **Mô tả**: Check-in xe cho user

#### **GET** `/api/users/[id]/properties`
- **Mô tả**: Lấy danh sách tài sản của user

#### **GET** `/api/users/[id]/properties/[propertyId]`
- **Mô tả**: Chi tiết một tài sản cụ thể

---

### 6.4. Apartment Management

#### **GET** `/api/apartments`
- **Mô tả**: Lấy danh sách tất cả căn hộ
- **Query params**: `?building=1&floor=5&status=occupied`

#### **GET** `/api/apartments/[id]`
- **Mô tả**: Chi tiết một căn hộ và danh sách cư dân

#### **PUT** `/api/apartments/[id]`
- **Mô tả**: Cập nhật thông tin căn hộ

---

### 6.5. Billing Management

#### **GET** `/api/billings`
- **Mô tả**: Lấy danh sách tất cả hóa đơn
- **Query params**: `?status=unpaid&userId=xxx&from=2024-01-01&to=2024-12-31`

#### **POST** `/api/billings`
- **Mô tả**: Tạo hóa đơn mới
- **Body**: `{ userId, services: [], dueDate, periodStart, periodEnd }`

#### **GET** `/api/billings/[id]`
- **Mô tả**: Chi tiết hóa đơn

#### **PUT** `/api/billings/[id]`
- **Mô tả**: Cập nhật hóa đơn (thanh toán, hủy)
- **Body**: `{ status: 'paid' | 'deleted' }`

#### **GET** `/api/billings/[id]/file`
- **Mô tả**: Xuất hóa đơn PDF
- **Response**: PDF file stream

#### **GET** `/api/taxes`
- **Mô tả**: Báo cáo thuế
- **Query params**: `?from=2024-01-01&to=2024-12-31`
- **Response**: `{ totalIncome, totalTax, billingIds[] }`

---

### 6.6. Service Management

#### **GET** `/api/services`
- **Mô tả**: Lấy danh sách dịch vụ
- **Query params**: `?category=cleaning&available=true`

#### **POST** `/api/services`
- **Mô tả**: Tạo dịch vụ mới (Admin only)

#### **GET** `/api/services/[id]`
- **Mô tả**: Chi tiết dịch vụ

#### **PUT** `/api/services/[id]`
- **Mô tả**: Cập nhật dịch vụ

#### **DELETE** `/api/services/[id]`
- **Mô tả**: Xóa dịch vụ

---

### 6.7. Feedback Management

#### **GET** `/api/feedbacks`
- **Mô tả**: Lấy danh sách phản hồi
- **Query params**: `?status=open&userId=xxx`

#### **POST** `/api/feedbacks`
- **Mô tả**: Tạo phản hồi mới
- **Body**: `{ userId, content, tags: [] }`

#### **GET** `/api/feedbacks/[id]`
- **Mô tả**: Chi tiết phản hồi

#### **PUT** `/api/feedbacks/[id]`
- **Mô tả**: Cập nhật trạng thái phản hồi
- **Body**: `{ status: 'in_progress' | 'resolved' | 'closed' }`

---

### 6.8. Property & Lost-Found Management

#### **GET** `/api/properties`
- **Mô tả**: Lấy danh sách tất cả tài sản
- **Query params**: `?type=vehicle&status=found&userId=xxx`

#### **POST** `/api/properties`
- **Mô tả**: Đăng ký tài sản mới

#### **GET** `/api/properties/available`
- **Mô tả**: Lấy danh sách đồ thất lạc có sẵn (chưa có chủ)

#### **GET** `/api/property-reports`
- **Mô tả**: Lấy danh sách báo cáo tài sản

#### **POST** `/api/property-reports`
- **Mô tả**: Tạo báo cáo tài sản (tìm thấy/mất)

#### **GET** `/api/property-reports/[id]`
- **Mô tả**: Chi tiết báo cáo

#### **PUT** `/api/property-reports/[id]`
- **Mô tả**: Cập nhật báo cáo (approve, update status)

---

### 6.9. Vehicle Management

#### **POST** `/api/vehicles/checkin`
- **Mô tả**: Check-in/Check-out xe ra vào
- **Body**: `{ licensePlate, userId?, action: 'entry' | 'exit' }`
- **Response**: Tạo vehicle_log mới

---

### 6.10. Communication (Chat & Posts)

#### **GET** `/api/chats`
- **Mô tả**: Lấy danh sách cuộc trò chuyện của user hiện tại
- **Query params**: `?userId=xxx`

#### **POST** `/api/chats`
- **Mô tả**: Tạo cuộc trò chuyện mới
- **Body**: `{ user1Id, user2Id }`

#### **GET** `/api/chats/[chatId]/messages`
- **Mô tả**: Lấy tin nhắn trong một cuộc trò chuyện

#### **POST** `/api/chats/[chatId]/messages`
- **Mô tả**: Gửi tin nhắn
- **Body**: `{ senderId, content }`

#### **GET** `/api/posts`
- **Mô tả**: Lấy danh sách thông báo
- **Query params**: `?category=maintenance`

#### **POST** `/api/posts`
- **Mô tả**: Tạo thông báo mới (Admin only)

#### **GET** `/api/posts/[id]`
- **Mô tả**: Chi tiết thông báo

#### **PUT** `/api/posts/[id]`
- **Mô tả**: Cập nhật thông báo

#### **DELETE** `/api/posts/[id]`
- **Mô tả**: Xóa thông báo

---

### 6.11. System Management

#### **GET** `/api/system/settings`
- **Mô tả**: Lấy cài đặt hệ thống

#### **PUT** `/api/system/settings`
- **Mô tả**: Cập nhật cài đặt hệ thống

#### **POST** `/api/system/dump`
- **Mô tả**: Backup database (Admin only)

---

### API Response Format (Chuẩn chung)

#### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

#### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### HTTP Status Codes
- `200 OK`: Request thành công
- `201 Created`: Tạo mới thành công
- `400 Bad Request`: Dữ liệu không hợp lệ
- `401 Unauthorized`: Chưa đăng nhập
- `403 Forbidden`: Không có quyền truy cập
- `404 Not Found`: Không tìm thấy resource
- `500 Internal Server Error`: Lỗi server

---

## 7. Development Guidelines (Hướng dẫn phát triển)

### Code Style
- Sử dụng TypeScript cho tất cả files
- Follow ESLint rules (chạy `npm run lint`)
- Sử dụng Prettier để format code (nếu có config)
- Components sử dụng functional components với TypeScript

### Naming Conventions
- **Files**: kebab-case (`user-profile.tsx`)
- **Components**: PascalCase (`UserProfile`)
- **Functions/Variables**: camelCase (`getUserData`)
- **Types**: PascalCase (`User`, `BillingDetail`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)

### Git Workflow (Gợi ý)
1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes and commit: `git commit -m "feat: add new feature"`
3. Push and create Pull Request
4. Code review và merge vào main

---

## 8. Notes & Best Practices

### Security
- **Passwords**: Luôn hash với bcryptjs trước khi lưu database
- **Authentication**: Implement proper session management
- **Authorization**: Kiểm tra role trước khi cho phép truy cập API
- **SQL Injection**: Sử dụng parameterized queries (thư viện `postgres` đã hỗ trợ)
- **Environment Variables**: Không commit `.env` lên repo

### Performance
- Sử dụng Turbopack để tăng tốc dev mode
- Optimize images trong thư mục `public/`
- Implement pagination cho các API trả về danh sách lớn
- Cache API responses khi có thể

### Database
- Luôn sử dụng transactions cho các operations liên quan đến nhiều bảng
- Index các columns được query thường xuyên
- Backup database định kỳ qua endpoint `/api/system/dump`

---

