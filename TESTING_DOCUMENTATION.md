# TESTING DOCUMENTATION
## Tài liệu Kiểm thử Hệ thống Quản lý Chung cư
---

## Mục lục

1. [Tổng quan](#1-tổng-quan)
2. [API Response Structure](#2-api-response-structure)
3. [Module Quản lý Hóa đơn (Billing)](#3-module-quản-lý-hóa-đơn-billing)
4. [Module Quản lý Phương tiện (Vehicles)](#4-module-quản-lý-phương-tiện-vehicles)
5. [Module Quản lý Cư dân (Users/Residents)](#5-module-quản-lý-cư-dân-usersresidents)
6. [Module Quản lý Căn hộ (Apartments)](#6-module-quản-lý-căn-hộ-apartments)
7. [Appendix](#7-appendix)

---

## 1. Tổng quan

### 1.1 Phạm vi kiểm thử
Tài liệu này bao gồm các test case chi tiết cho 4 module nghiệp vụ cốt lõi:
- **Quản lý Hóa đơn (Billing):** Tạo, xem, thanh toán hóa đơn
- **Quản lý Phương tiện (Vehicles):** Đăng ký xe, check-in/out, cập nhật thông tin
- **Quản lý Cư dân (Users/Residents):** Xem và cập nhật thông tin người dùng
- **Quản lý Căn hộ (Apartments):** Tạo và xem danh sách căn hộ

### 1.2 Loại test case
- **Happy Path:** Kịch bản thành công với dữ liệu hợp lệ
- **Validation Errors:** Lỗi dữ liệu đầu vào (thiếu trường, sai kiểu dữ liệu)
- **Logic Errors:** Lỗi nghiệp vụ (dữ liệu không tồn tại, vi phạm ràng buộc)
- **Method Not Allowed:** Gửi request với HTTP method không được hỗ trợ

### 1.3 Môi trường kiểm thử
- **Base URL:** `http://localhost:3000`
- **Tool:** Postman, cURL, hoặc REST Client tương đương
- **Database:** PostgreSQL (cần setup với dữ liệu mẫu)

---

## 2. API Response Structure

### 2.1 Cấu trúc Response chuẩn

Tất cả API endpoint đều trả về response theo cấu trúc sau (dựa trên `types/api.ts`):

#### Response thành công:
```json
{
  "success": true,
  "message": "Mô tả kết quả",
  "data": {
    // Dữ liệu trả về (có thể là object, array, hoặc null)
  }
}
```

#### Response thất bại:
```json
{
  "success": false,
  "message": "Mô tả lỗi",
  "error": "Chi tiết lỗi (optional)"
}
```

### 2.2 HTTP Status Code

| Status Code | Ý nghĩa | Khi nào xảy ra |
|-------------|---------|----------------|
| 200 | OK | Request thành công (GET, PUT) |
| 201 | Created | Tạo tài nguyên mới thành công (POST) |
| 400 | Bad Request | Dữ liệu đầu vào không hợp lệ |
| 404 | Not Found | Không tìm thấy tài nguyên |
| 405 | Method Not Allowed | HTTP method không được hỗ trợ |
| 409 | Conflict | Xung đột dữ liệu (ví dụ: trùng lặp) |
| 500 | Internal Server Error | Lỗi server/database |

---

## 3. Module Quản lý Hóa đơn (Billing)

### 3.1 Endpoint Overview

| Endpoint | Method | Chức năng |
|----------|--------|-----------|
| `/api/billings` | GET | Lấy danh sách hóa đơn (có thể lọc) |
| `/api/billings` | POST | Tạo hóa đơn mới |
| `/api/billings/[id]` | GET | Xem chi tiết hóa đơn |
| `/api/billings/[id]` | PUT | Thanh toán hóa đơn |
| `/api/users/[id]/billings` | GET | Lấy danh sách hóa đơn của user |

### 3.2 Test Cases - Tạo hóa đơn (POST /api/billings)

| ID | Chức năng | Mô tả kịch bản | Dữ liệu đầu vào | Kết quả mong đợi |
|----|-----------|----------------|-----------------|------------------|
| **BILL-001** | Tạo hóa đơn thành công | Tạo hóa đơn với đầy đủ thông tin hợp lệ | **POST** `/api/billings`<br>**Headers:** `Content-Type: application/json`<br>**Body:**<br>```json```<br>```{```<br>```  "userId": "user-uuid-001",```<br>```  "serviceIds": [1, 2, 3],```<br>```  "dueDate": "2025-12-24",```<br>```  "periodStart": "2025-12-01",```<br>```  "periodEnd": "2025-12-31"```<br>```}```<br>``` ``` | **Status:** 201 Created<br>**Response:**<br>```json```<br>```{```<br>```  "success": true,```<br>```  "message": "Billing created successfully.",```<br>```  "data": {```<br>```    "billingId": "uuid-string"```<br>```  }```<br>```}```<br>``` ``` |
| **BILL-002** | Tạo hóa đơn không có ngày tùy chọn | Tạo hóa đơn chỉ với userId và serviceIds (dueDate, periodStart, periodEnd được tự động tính) | **POST** `/api/billings`<br>**Body:**<br>```json```<br>```{```<br>```  "userId": "user-uuid-001",```<br>```  "serviceIds": [1, 2]```<br>```}```<br>``` ``` | **Status:** 201 Created<br>**Response:**<br>```json```<br>```{```<br>```  "success": true,```<br>```  "message": "Billing created successfully.",```<br>```  "data": {```<br>```    "billingId": "uuid-string"```<br>```  }```<br>```}```<br>``` ```<br>**Note:** dueDate = now + 15 days, periodStart = now, periodEnd = periodStart + 30 days |
| **BILL-003** | Thiếu trường userId | Gửi request không có userId | **POST** `/api/billings`<br>**Body:**<br>```json```<br>```{```<br>```  "serviceIds": [1, 2]```<br>```}```<br>``` ``` | **Status:** 400 Bad Request<br>**Response:**<br>```json```<br>```{```<br>```  "success": false,```<br>```  "message": "userId and serviceIds (non-empty array) are required"```<br>```}```<br>``` ``` |
| **BILL-004** | Thiếu trường serviceIds | Gửi request không có serviceIds | **POST** `/api/billings`<br>**Body:**<br>```json```<br>```{```<br>```  "userId": "user-uuid-001"```<br>```}```<br>``` ``` | **Status:** 400 Bad Request<br>**Response:**<br>```json```<br>```{```<br>```  "success": false,```<br>```  "message": "userId and serviceIds (non-empty array) are required"```<br>```}```<br>``` ``` |
| **BILL-005** | serviceIds không phải là mảng | Gửi serviceIds dạng string hoặc number | **POST** `/api/billings`<br>**Body:**<br>```json```<br>```{```<br>```  "userId": "user-uuid-001",```<br>```  "serviceIds": "1,2,3"```<br>```}```<br>``` ``` | **Status:** 400 Bad Request<br>**Response:**<br>```json```<br>```{```<br>```  "success": false,```<br>```  "message": "userId and serviceIds (non-empty array) are required"```<br>```}```<br>``` ``` |
| **BILL-006** | serviceIds là mảng rỗng | Gửi serviceIds = [] | **POST** `/api/billings`<br>**Body:**<br>```json```<br>```{```<br>```  "userId": "user-uuid-001",```<br>```  "serviceIds": []```<br>```}```<br>``` ``` | **Status:** 400 Bad Request<br>**Response:**<br>```json```<br>```{```<br>```  "success": false,```<br>```  "message": "userId and serviceIds (non-empty array) are required"```<br>```}```<br>``` ``` |
| **BILL-007** | serviceIds chứa ID không tồn tại | Một hoặc nhiều serviceId không có trong bảng services | **POST** `/api/billings`<br>**Body:**<br>```json```<br>```{```<br>```  "userId": "user-uuid-001",```<br>```  "serviceIds": [1, 999, 3]```<br>```}```<br>``` ``` | **Status:** 500 Internal Server Error<br>**Response:**<br>```json```<br>```{```<br>```  "success": false,```<br>```  "message": "One or more services are invalid."```<br>```}```<br>``` ``` |
| **BILL-008** | Method không được hỗ trợ | Gửi request với method DELETE | **DELETE** `/api/billings` | **Status:** 405 Method Not Allowed<br>**Response:**<br>```json```<br>```{```<br>```  "success": false,```<br>```  "message": "Method Not Allowed"```<br>```}```<br>``` ```<br>**Headers:** `Allow: GET, POST` |

### 3.3 Test Cases - Lấy danh sách hóa đơn (GET /api/billings)

| ID | Chức năng | Mô tả kịch bản | Dữ liệu đầu vào | Kết quả mong đợi |
|----|-----------|----------------|-----------------|------------------|
| **BILL-009** | Lấy tất cả hóa đơn | Lấy danh sách hóa đơn không có filter, mặc định limit = 25 | **GET** `/api/billings` | **Status:** 200 OK<br>**Response:**<br>```json```<br>```{```<br>```  "success": true,```<br>```  "message": "Billings fetched successfully.",```<br>```  "data": [```<br>```    {```<br>```      "billingId": "uuid-1",```<br>```      "userId": "user-uuid-001",```<br>```      "fullName": "Nguyen Van A",```<br>```      "billingStatus": "unpaid",```<br>```      "dueDate": "2025-12-24",```<br>```      "periodStart": "2025-12-01",```<br>```      "periodEnd": "2025-12-31",```<br>```      "paidAt": null,```<br>```      "totalAmount": 1500000,```<br>```      "serviceCount": 3,```<br>```      "services": [...]```<br>```    }```<br>```  ]```<br>```}```<br>``` ``` |
| **BILL-010** | Lọc theo userId | Lấy hóa đơn của một user cụ thể | **GET** `/api/billings?userId=user-uuid-001` | **Status:** 200 OK<br>**Response:** Danh sách hóa đơn chỉ của user-uuid-001 |
| **BILL-011** | Lọc theo status | Lấy hóa đơn theo trạng thái (paid/unpaid) | **GET** `/api/billings?status=unpaid` | **Status:** 200 OK<br>**Response:** Danh sách hóa đơn có status = unpaid |
| **BILL-012** | Lọc kết hợp userId và status | Lấy hóa đơn của user với trạng thái cụ thể | **GET** `/api/billings?userId=user-uuid-001&status=paid` | **Status:** 200 OK<br>**Response:** Danh sách hóa đơn đã thanh toán của user-uuid-001 |
| **BILL-013** | Giới hạn số lượng kết quả | Sử dụng tham số limit | **GET** `/api/billings?limit=10` | **Status:** 200 OK<br>**Response:** Tối đa 10 hóa đơn |
| **BILL-014** | Limit vượt quá max (200) | Gửi limit > 200 | **GET** `/api/billings?limit=500` | **Status:** 200 OK<br>**Response:** Trả về tối đa 200 hóa đơn (limit được cap ở 200) |
| **BILL-015** | Limit nhỏ hơn 1 | Gửi limit = 0 hoặc âm | **GET** `/api/billings?limit=0` | **Status:** 200 OK<br>**Response:** Trả về 1 hóa đơn (limit được set = 1) |
| **BILL-016** | Method không được hỗ trợ | Gửi request với method DELETE | **DELETE** `/api/billings` | **Status:** 405 Method Not Allowed |

### 3.4 Test Cases - Xem chi tiết hóa đơn (GET /api/billings/[id])

| ID | Chức năng | Mô tả kịch bản | Dữ liệu đầu vào | Kết quả mong đợi |
|----|-----------|----------------|-----------------|------------------|
| **BILL-017** | Xem chi tiết hóa đơn thành công | Lấy thông tin chi tiết hóa đơn bằng ID hợp lệ | **GET** `/api/billings/{valid-billing-id}` | **Status:** 200 OK<br>**Response:**<br>```json```<br>```{```<br>```  "success": true,```<br>```  "message": "Billing details fetched successfully.",```<br>```  "data": {```<br>```    "billingId": "uuid-1",```<br>```    "userId": "user-uuid-001",```<br>```    "fullName": "Nguyen Van A",```<br>```    "totalPrice": 1650000,```<br>```    "billingStatus": "unpaid",```<br>```    "dueDate": "2025-12-24",```<br>```    "periodStart": "2025-12-01",```<br>```    "periodEnd": "2025-12-31",```<br>```    "paidAt": null,```<br>```    "services": [```<br>```      {```<br>```        "serviceId": 1,```<br>```        "serviceName": "Điện",```<br>```        "price": 500000,```<br>```        "tax": 10,```<br>```        "description": "Tiền điện tháng 12"```<br>```      }```<br>```    ]```<br>```  }```<br>```}```<br>``` ``` |
| **BILL-018** | Billing ID không tồn tại | Gửi ID không có trong database | **GET** `/api/billings/non-existent-id` | **Status:** 404 Not Found<br>**Response:**<br>```json```<br>```{```<br>```  "success": false,```<br>```  "message": "Billing not found"```<br>```}```<br>``` ``` |
| **BILL-019** | Thiếu billing ID | Không truyền ID trong URL | **GET** `/api/billings/` | **Status:** 400 Bad Request<br>**Response:**<br>```json```<br>```{```<br>```  "success": false,```<br>```  "message": "Billing ID is required"```<br>```}```<br>``` ``` |
| **BILL-020** | Method không được hỗ trợ | Gửi request với method DELETE | **DELETE** `/api/billings/{billing-id}` | **Status:** 405 Method Not Allowed<br>**Response:**<br>```json```<br>```{```<br>```  "success": false,```<br>```  "message": "Method DELETE Not Allowed"```<br>```}```<br>``` ```<br>**Headers:** `Allow: GET, PUT` |

### 3.5 Test Cases - Thanh toán hóa đơn (PUT /api/billings/[id])

| ID | Chức năng | Mô tả kịch bản | Dữ liệu đầu vào | Kết quả mong đợi |
|----|-----------|----------------|-----------------|------------------|
| **BILL-021** | Thanh toán hóa đơn thành công | Thanh toán hóa đơn có status = unpaid | **PUT** `/api/billings/{billing-id}`<br>**Headers:** `Content-Type: application/json`<br>*(Không cần body)* | **Status:** 200 OK<br>**Response:**<br>```json```<br>```{```<br>```  "success": true,```<br>```  "message": "Billing paid successfully.",```<br>```  "data": null```<br>```}```<br>``` ```<br>**Note:** Hóa đơn được cập nhật: `billing_status = 'paid'`, `paid_at = NOW()` |
| **BILL-022** | Thanh toán hóa đơn đã thanh toán | Thanh toán hóa đơn có status = paid (logic issue) | **PUT** `/api/billings/{paid-billing-id}` | **Status:** 200 OK<br>**Response:**<br>```json```<br>```{```<br>```  "success": true,```<br>```  "message": "Billing paid successfully.",```<br>```  "data": null```<br>```}```<br>``` ```<br>**⚠️ Note:** API hiện không kiểm tra trạng thái trước khi thanh toán. Đây là BUG cần báo cáo! |
| **BILL-023** | Billing ID không tồn tại | Thanh toán hóa đơn không tồn tại | **PUT** `/api/billings/non-existent-id` | **Status:** 404 Not Found<br>**Response:**<br>```json```<br>```{```<br>```  "success": false,```<br>```  "message": "Billing not found"```<br>```}```<br>``` ``` |
| **BILL-024** | Thiếu billing ID | Không truyền ID trong URL | **PUT** `/api/billings/` | **Status:** 400 Bad Request<br>**Response:**<br>```json```<br>```{```<br>```  "success": false,```<br>```  "message": "Billing ID is required"```<br>```}```<br>``` ``` |

### 3.6 Test Cases - Lấy hóa đơn của user (GET /api/users/[id]/billings)

| ID | Chức năng | Mô tả kịch bản | Dữ liệu đầu vào | Kết quả mong đợi |
|----|-----------|----------------|-----------------|------------------|
| **BILL-025** | Lấy hóa đơn của user thành công | Lấy tất cả hóa đơn của một user | **GET** `/api/users/{user-id}/billings` | **Status:** 200 OK<br>**Response:**<br>```json```<br>```{```<br>```  "success": true,```<br>```  "message": "User billings fetched successfully.",```<br>```  "data": [```<br>```    {```<br>```      "billingId": "uuid-1",```<br>```      "userId": "user-uuid-001",```<br>```      "fullName": "Nguyen Van A",```<br>```      "totalPrice": 1650000,```<br>```      "billingStatus": "unpaid",```<br>```      "dueDate": "2025-12-24",```<br>```      "periodStart": "2025-12-01",```<br>```      "periodEnd": "2025-12-31",```<br>```      "paidAt": null,```<br>```      "services": [...]```<br>```    }```<br>```  ]```<br>```}```<br>``` ```<br>**Note:** Kết quả được sắp xếp theo `used_at DESC` |
| **BILL-026** | User không có hóa đơn | User tồn tại nhưng chưa có hóa đơn nào | **GET** `/api/users/{user-id-no-billings}/billings` | **Status:** 200 OK<br>**Response:**<br>```json```<br>```{```<br>```  "success": true,```<br>```  "message": "User billings fetched successfully.",```<br>```  "data": []```<br>```}```<br>``` ``` |
| **BILL-027** | Method không được hỗ trợ | Gửi request với method POST | **POST** `/api/users/{user-id}/billings` | **Status:** 405 Method Not Allowed<br>**Response:**<br>```json```<br>```{```<br>```  "success": false,```<br>```  "message": "Method Not Allowed"```<br>```}```<br>``` ```<br>**Headers:** `Allow: GET` |

---

## 4. Module Quản lý Phương tiện (Vehicles)

### 4.1 Endpoint Overview

| Endpoint | Method | Chức năng |
|----------|--------|-----------|
| `/api/vehicles/checkin` | GET | Lấy lịch sử check-in xe (có thể lọc) |
| `/api/users/[id]/vehicle` | POST | Đăng ký xe mới cho user |
| `/api/users/[id]/vehicles` | GET | Lấy thông tin xe của user |
| `/api/users/[id]/vehicle/checkin` | POST | Check-in/Check-out xe |
| `/api/users/[id]/vehicle/[vehicleId]` | PUT | Cập nhật biển số xe |

### 4.2 Test Cases - Lấy lịch sử check-in (GET /api/vehicles/checkin)

| ID | Chức năng | Mô tả kịch bản | Dữ liệu đầu vào | Kết quả mong đợi |
|----|-----------|----------------|-----------------|------------------|
| **VEH-001** | Lấy tất cả log check-in | Lấy lịch sử check-in của tất cả xe | **GET** `/api/vehicles/checkin` | **Status:** 200 OK<br>**Response:**<br>```json```<br>```{```<br>```  "success": true,```<br>```  "message": "Fetched vehicle logs successfully.",```<br>```  "data": {```<br>```    "logs": [```<br>```      {```<br>```        "vehicleLogId": "log-uuid-1",```<br>```        "entranceTime": "2025-12-09T08:30:00Z",```<br>```        "exitTime": "2025-12-09T18:45:00Z",```<br>```        "vehicleId": 1,```<br>```        "licensePlate": "29A-12345",```<br>```        "userId": "user-uuid-001",```<br>```        "fullName": "Nguyen Van A",```<br>```        "apartmentId": 101,```<br>```        "apartmentNumber": 501,```<br>```        "buildingId": 1,```<br>```        "floor": 5```<br>```      }```<br>```    ]```<br>```  }```<br>```}```<br>``` ``` |
| **VEH-002** | Lọc theo userId | Lấy lịch sử check-in của một user cụ thể | **GET** `/api/vehicles/checkin?userId=user-uuid-001` | **Status:** 200 OK<br>**Response:** Chỉ log của user-uuid-001 |
| **VEH-003** | Lọc theo tuần (week) | Lấy log trong 7 ngày gần nhất | **GET** `/api/vehicles/checkin?filter=week` | **Status:** 200 OK<br>**Response:** Log có `entrance_time >= NOW() - 7 days` |
| **VEH-004** | Lọc theo tháng (month) | Lấy log trong 1 tháng gần nhất | **GET** `/api/vehicles/checkin?filter=month` | **Status:** 200 OK<br>**Response:** Log có `entrance_time >= NOW() - 1 month` |
| **VEH-005** | Lọc theo năm (year) | Lấy log trong 1 năm gần nhất | **GET** `/api/vehicles/checkin?filter=year` | **Status:** 200 OK<br>**Response:** Log có `entrance_time >= NOW() - 1 year` |
| **VEH-006** | Lọc kết hợp userId và filter | Lấy log của user trong khoảng thời gian | **GET** `/api/vehicles/checkin?userId=user-uuid-001&filter=month` | **Status:** 200 OK<br>**Response:** Log của user trong 1 tháng |
| **VEH-007** | Method không được hỗ trợ | Gửi request với method POST | **POST** `/api/vehicles/checkin` | **Status:** 405 Method Not Allowed<br>**Response:**<br>```json```<br>```{```<br>```  "success": false,```<br>```  "message": "Method POST Not Allowed"```<br>```}```<br>``` ```<br>**Headers:** `Allow: GET` |

### 4.3 Test Cases - Đăng ký xe mới (POST /api/users/[id]/vehicle)

| ID | Chức năng | Mô tả kịch bản | Dữ liệu đầu vào | Kết quả mong đợi |
|----|-----------|----------------|-----------------|------------------|
| **VEH-008** | Đăng ký xe thành công | Tạo xe mới với biển số hợp lệ | **POST** `/api/users/{user-id}/vehicle`<br>**Headers:** `Content-Type: application/json`<br>**Body:**<br>```json```<br>```{```<br>```  "licensePlate": "29A-12345"```<br>```}```<br>``` ``` | **Status:** 201 Created<br>**Response:**<br>```json```<br>```{```<br>```  "success": true,```<br>```  "message": "Property and vehicle created successfully",```<br>```  "data": {```<br>```    "vehicleId": 1,```<br>```    "propertyId": 10,```<br>```    "licensePlate": "29A-12345"```<br>```  }```<br>```}```<br>``` ```<br>**Note:** Tự động tạo property với `property_type = 'vehicle'` |
| **VEH-009** | Thiếu licensePlate | Gửi request không có licensePlate | **POST** `/api/users/{user-id}/vehicle`<br>**Body:**<br>```json```<br>```{}```<br>``` ``` | **Status:** 400 Bad Request<br>**Response:**<br>```json```<br>```{```<br>```  "success": false,```<br>```  "message": "License plate is required"```<br>```}```<br>``` ``` |
| **VEH-010** | User không tồn tại | Đăng ký xe cho user không có trong DB | **POST** `/api/users/non-existent-user/vehicle`<br>**Body:**<br>```json```<br>```{```<br>```  "licensePlate": "29A-12345"```<br>```}```<br>``` ``` | **Status:** 404 Not Found<br>**Response:**<br>```json```<br>```{```<br>```  "success": false,```<br>```  "message": "User not found"```<br>```}```<br>``` ``` |
| **VEH-011** | Biển số đã tồn tại | Đăng ký biển số đã được đăng ký bởi user khác | **POST** `/api/users/{user-id}/vehicle`<br>**Body:**<br>```json```<br>```{```<br>```  "licensePlate": "29A-EXIST"```<br>```}```<br>``` ``` | **Status:** 409 Conflict<br>**Response:**<br>```json```<br>```{```<br>```  "success": false,```<br>```  "message": "License plate already registered"```<br>```}```<br>``` ``` |
| **VEH-012** | User đã có xe | User đã đăng ký 1 xe (vi phạm rule: 1 user chỉ có 1 xe) | **POST** `/api/users/{user-with-vehicle}/vehicle`<br>**Body:**<br>```json```<br>```{```<br>```  "licensePlate": "29A-NEW"```<br>```}```<br>``` ``` | **Status:** 409 Conflict<br>**Response:**<br>```json```<br>```{```<br>```  "success": false,```<br>```  "message": "User already has a vehicle"```<br>```}```<br>``` ``` |
| **VEH-013** | Thiếu userId | Không truyền userId trong URL | **POST** `/api/users//vehicle` | **Status:** 400 Bad Request<br>**Response:**<br>```json```<br>```{```<br>```  "success": false,```<br>```  "message": "User ID is required"```<br>```}```<br>``` ``` |
| **VEH-014** | Method không được hỗ trợ | Gửi request với method GET | **GET** `/api/users/{user-id}/vehicle` | **Status:** 405 Method Not Allowed<br>**Response:**<br>```json```<br>```{```<br>```  "success": false,```<br>```  "message": "Method GET Not Allowed"```<br>```}```<br>``` ```<br>**Headers:** `Allow: POST` |

### 4.4 Test Cases - Lấy thông tin xe của user (GET /api/users/[id]/vehicles)

| ID | Chức năng | Mô tả kịch bản | Dữ liệu đầu vào | Kết quả mong đợi |
|----|-----------|----------------|-----------------|------------------|
| **VEH-015** | Lấy thông tin xe thành công | User có xe đăng ký | **GET** `/api/users/{user-id}/vehicles` | **Status:** 200 OK<br>**Response:**<br>```json```<br>```{```<br>```  "success": true,```<br>```  "message": "Vehicle info fetched successfully",```<br>```  "data": {```<br>```    "vehicleId": 1,```<br>```    "propertyId": 10,```<br>```    "licensePlate": "29A-12345"```<br>```  }```<br>```}```<br>``` ``` |
| **VEH-016** | User không có xe | User chưa đăng ký xe nào | **GET** `/api/users/{user-id-no-vehicle}/vehicles` | **Status:** 404 Not Found<br>**Response:**<br>```json```<br>```{```<br>```  "success": false,```<br>```  "message": "Vehicle not found for this user"```<br>```}```<br>``` ``` |
| **VEH-017** | Thiếu userId | Không truyền userId trong URL | **GET** `/api/users//vehicles` | **Status:** 400 Bad Request<br>**Response:**<br>```json```<br>```{```<br>```  "success": false,```<br>```  "message": "User ID is required"```<br>```}```<br>``` ``` |
| **VEH-018** | Method không được hỗ trợ | Gửi request với method POST | **POST** `/api/users/{user-id}/vehicles` | **Status:** 405 Method Not Allowed<br>**Headers:** `Allow: GET` |

### 4.5 Test Cases - Check-in/Check-out xe (POST /api/users/[id]/vehicle/checkin)

| ID | Chức năng | Mô tả kịch bản | Dữ liệu đầu vào | Kết quả mong đợi |
|----|-----------|----------------|-----------------|------------------|
| **VEH-019** | Check-in xe lần đầu | Xe chưa có log hoặc đã check-out trước đó → tạo log mới với entrance_time | **POST** `/api/users/{user-id}/vehicle/checkin`<br>**Headers:** `Content-Type: application/json` | **Status:** 200 OK<br>**Response:**<br>```json```<br>```{```<br>```  "success": true,```<br>```  "message": "Vehicle entered",```<br>```  "data": {```<br>```    "time": "2025-12-09T10:00:00.000Z"```<br>```  }```<br>```}```<br>``` ```<br>**DB:** Tạo record mới trong `vehicle_logs`: `entrance_time = now`, `exit_time = NULL` |
| **VEH-020** | Check-out xe | Xe đang ở trong (exit_time = NULL) → cập nhật exit_time | **POST** `/api/users/{user-id}/vehicle/checkin`<br>*(Gọi lần 2 sau VEH-019)* | **Status:** 200 OK<br>**Response:**<br>```json```<br>```{```<br>```  "success": true,```<br>```  "message": "Vehicle exited",```<br>```  "data": {```<br>```    "time": "2025-12-09T18:30:00.000Z"```<br>```  }```<br>```}```<br>``` ```<br>**DB:** Cập nhật `exit_time = now` cho log gần nhất |
| **VEH-021** | Check-in lại sau khi check-out | Xe đã check-out (exit_time != NULL) → tạo log mới | **POST** `/api/users/{user-id}/vehicle/checkin`<br>*(Gọi lần 3 sau VEH-020)* | **Status:** 200 OK<br>**Response:**<br>```json```<br>```{```<br>```  "success": true,```<br>```  "message": "Vehicle entered",```<br>```  "data": {```<br>```    "time": "2025-12-10T08:00:00.000Z"```<br>```  }```<br>```}```<br>``` ``` |
| **VEH-022** | User không tồn tại | Check-in cho user không có trong DB | **POST** `/api/users/non-existent-user/vehicle/checkin` | **Status:** 404 Not Found<br>**Response:**<br>```json```<br>```{```<br>```  "success": false,```<br>```  "message": "User not found"```<br>```}```<br>``` ``` |
| **VEH-023** | User không có xe | Check-in cho user chưa đăng ký xe | **POST** `/api/users/{user-id-no-vehicle}/vehicle/checkin` | **Status:** 404 Not Found<br>**Response:**<br>```json```<br>```{```<br>```  "success": false,```<br>```  "message": "Vehicle not found for this user"```<br>```}```<br>``` ``` |
| **VEH-024** | Thiếu userId | Không truyền userId trong URL | **POST** `/api/users//vehicle/checkin` | **Status:** 400 Bad Request<br>**Response:**<br>```json```<br>```{```<br>```  "success": false,```<br>```  "message": "User ID is required"```<br>```}```<br>``` ``` |
| **VEH-025** | Method không được hỗ trợ | Gửi request với method GET | **GET** `/api/users/{user-id}/vehicle/checkin` | **Status:** 405 Method Not Allowed<br>**Headers:** `Allow: POST` |

### 4.6 Test Cases - Cập nhật biển số xe (PUT /api/users/[id]/vehicle/[vehicleId])

| ID | Chức năng | Mô tả kịch bản | Dữ liệu đầu vào | Kết quả mong đợi |
|----|-----------|----------------|-----------------|------------------|
| **VEH-026** | Cập nhật biển số thành công | Đổi biển số xe với dữ liệu hợp lệ | **PUT** `/api/users/{user-id}/vehicle/{vehicle-id}`<br>**Headers:** `Content-Type: application/json`<br>**Body:**<br>```json```<br>```{```<br>```  "licensePlate": "30B-67890"```<br>```}```<br>``` ``` | **Status:** 200 OK<br>**Response:**<br>```json```<br>```{```<br>```  "success": true,```<br>```  "message": "License plate updated successfully",```<br>```  "data": {```<br>```    "vehicleId": 1,```<br>```    "propertyId": 10,```<br>```    "licensePlate": "30B-67890"```<br>```  }```<br>```}```<br>``` ``` |
| **VEH-027** | Thiếu licensePlate | Không gửi licensePlate trong body | **PUT** `/api/users/{user-id}/vehicle/{vehicle-id}`<br>**Body:**<br>```json```<br>```{}```<br>``` ``` | **Status:** 400 Bad Request<br>**Response:**<br>```json```<br>```{```<br>```  "success": false,```<br>```  "message": "licensePlate is required"```<br>```}```<br>``` ``` |
| **VEH-028** | Vehicle ID không tồn tại | Cập nhật xe không có trong DB | **PUT** `/api/users/{user-id}/vehicle/999999`<br>**Body:**<br>```json```<br>```{```<br>```  "licensePlate": "30B-67890"```<br>```}```<br>``` ``` | **Status:** 404 Not Found<br>**Response:**<br>```json```<br>```{```<br>```  "success": false,```<br>```  "message": "Vehicle not found"```<br>```}```<br>``` ``` |
| **VEH-029** | Thiếu userId hoặc vehicleId | Không truyền đủ tham số trong URL | **PUT** `/api/users/{user-id}/vehicle/`<br>hoặc<br>**PUT** `/api/users//vehicle/{vehicle-id}` | **Status:** 400 Bad Request<br>**Response:**<br>```json```<br>```{```<br>```  "success": false,```<br>```  "message": "User ID and Vehicle ID are required"```<br>```}```<br>``` ``` |
| **VEH-030** | Method không được hỗ trợ | Gửi request với method DELETE | **DELETE** `/api/users/{user-id}/vehicle/{vehicle-id}` | **Status:** 405 Method Not Allowed<br>**Headers:** `Allow: PUT` |

---

## 5. Module Quản lý Cư dân (Users/Residents)

### 5.1 Endpoint Overview

| Endpoint | Method | Chức năng |
|----------|--------|-----------|
| `/api/users/[id]` | GET | Lấy thông tin user |
| `/api/users/[id]` | PUT | Cập nhật thông tin user |

### 5.2 Test Cases - Lấy thông tin user (GET /api/users/[id])

| ID | Chức năng | Mô tả kịch bản | Dữ liệu đầu vào | Kết quả mong đợi |
|----|-----------|----------------|-----------------|------------------|
| **USER-001** | Lấy thông tin user thành công | Lấy thông tin user với ID hợp lệ | **GET** `/api/users/{user-id}` | **Status:** 200 OK<br>**Response:**<br>```json```<br>```{```<br>```  "success": true,```<br>```  "message": "Fetched user info",```<br>```  "data": {```<br>```    "userId": "user-uuid-001",```<br>```    "email": "nguyenvana@example.com",```<br>```    "fullName": "Nguyen Van A",```<br>```    "role": "tenant",```<br>```    "yearOfBirth": 1990,```<br>```    "gender": "male",```<br>```    "phoneNumber": "0901234567",```<br>```    "apartmentId": 101```<br>```  }```<br>```}```<br>``` ``` |
| **USER-002** | User không tồn tại | Lấy thông tin user với ID không có trong DB | **GET** `/api/users/non-existent-user` | **Status:** 404 Not Found<br>**Response:**<br>```json```<br>```{```<br>```  "success": false,```<br>```  "message": "User not found"```<br>```}```<br>``` ``` |
| **USER-003** | Thiếu userId | Không truyền userId trong URL | **GET** `/api/users/` | **Status:** 400 Bad Request<br>**Response:**<br>```json```<br>```{```<br>```  "success": false,```<br>```  "message": "User ID is required"```<br>```}```<br>``` ``` |
| **USER-004** | Method không được hỗ trợ | Gửi request với method POST | **POST** `/api/users/{user-id}` | **Status:** 405 Method Not Allowed<br>**Response:**<br>```json```<br>```{```<br>```  "success": false,```<br>```  "message": "Method POST Not Allowed"```<br>```}```<br>``` ```<br>**Headers:** `Allow: PUT` |

### 5.3 Test Cases - Cập nhật thông tin user (PUT /api/users/[id])

| ID | Chức năng | Mô tả kịch bản | Dữ liệu đầu vào | Kết quả mong đợi |
|----|-----------|----------------|-----------------|------------------|
| **USER-005** | Cập nhật thông tin thành công | Cập nhật tất cả trường thông tin user | **PUT** `/api/users/{user-id}`<br>**Headers:** `Content-Type: application/json`<br>**Body:**<br>```json```<br>```{```<br>```  "email": "new-email@example.com",```<br>```  "fullName": "Nguyen Van B",```<br>```  "role": "admin",```<br>```  "yearOfBirth": 1985,```<br>```  "gender": "male",```<br>```  "phoneNumber": "0909876543"```<br>```}```<br>``` ``` | **Status:** 200 OK<br>**Response:**<br>```json```<br>```{```<br>```  "success": true,```<br>```  "message": "Updated user info",```<br>```  "data": {```<br>```    "userId": "user-uuid-001",```<br>```    "email": "new-email@example.com",```<br>```    "fullName": "Nguyen Van B",```<br>```    "role": "admin",```<br>```    "yearOfBirth": 1985,```<br>```    "gender": "male",```<br>```    "phoneNumber": "0909876543",```<br>```    "apartmentId": 101```<br>```  }```<br>```}```<br>``` ``` |
| **USER-006** | Cập nhật với trường null | Cập nhật yearOfBirth, gender, phoneNumber = null | **PUT** `/api/users/{user-id}`<br>**Body:**<br>```json```<br>```{```<br>```  "email": "email@example.com",```<br>```  "fullName": "Nguyen Van A",```<br>```  "role": "tenant",```<br>```  "yearOfBirth": null,```<br>```  "gender": null,```<br>```  "phoneNumber": null```<br>```}```<br>``` ``` | **Status:** 200 OK<br>**Response:** Các trường yearOfBirth, gender, phoneNumber được set = null |
| **USER-007** | User không tồn tại | Cập nhật user với ID không có trong DB | **PUT** `/api/users/non-existent-user`<br>**Body:**<br>```json```<br>```{```<br>```  "email": "test@example.com",```<br>```  "fullName": "Test User",```<br>```  "role": "tenant",```<br>```  "yearOfBirth": 1990,```<br>```  "gender": "male"```<br>```}```<br>``` ``` | **Status:** 404 Not Found<br>**Response:**<br>```json```<br>```{```<br>```  "success": false,```<br>```  "message": "User not found"```<br>```}```<br>``` ``` |
| **USER-008** | Role không hợp lệ | Gửi role không nằm trong enum (tenant, admin, police, accountant) | **PUT** `/api/users/{user-id}`<br>**Body:**<br>```json```<br>```{```<br>```  "email": "test@example.com",```<br>```  "fullName": "Test User",```<br>```  "role": "invalid_role",```<br>```  "yearOfBirth": 1990,```<br>```  "gender": "male"```<br>```}```<br>``` ``` | **Status:** 500 Internal Server Error<br>**Response:**<br>```json```<br>```{```<br>```  "success": false,```<br>```  "message": "Invalid input value for enum user_role"```<br>```}```<br>``` ```<br>**⚠️ Note:** API không validation trước, lỗi từ database constraint |
| **USER-009** | Gender không hợp lệ | Gửi gender không nằm trong enum (male, female) | **PUT** `/api/users/{user-id}`<br>**Body:**<br>```json```<br>```{```<br>```  "email": "test@example.com",```<br>```  "fullName": "Test User",```<br>```  "role": "tenant",```<br>```  "yearOfBirth": 1990,```<br>```  "gender": "other"```<br>```}```<br>``` ``` | **Status:** 500 Internal Server Error<br>**Response:** Database constraint error<br>**⚠️ Note:** API không validation trước |
| **USER-010** | Thiếu userId | Không truyền userId trong URL | **PUT** `/api/users/` | **Status:** 400 Bad Request<br>**Response:**<br>```json```<br>```{```<br>```  "success": false,```<br>```  "message": "User ID is required"```<br>```}```<br>``` ``` |

---

## 6. Module Quản lý Căn hộ (Apartments)

### 6.1 Endpoint Overview

| Endpoint | Method | Chức năng |
|----------|--------|-----------|
| `/api/apartments` | GET | Lấy danh sách căn hộ (bao gồm members) |
| `/api/apartments` | POST | Tạo căn hộ mới |

### 6.2 Test Cases - Lấy danh sách căn hộ (GET /api/apartments)

| ID | Chức năng | Mô tả kịch bản | Dữ liệu đầu vào | Kết quả mong đợi |
|----|-----------|----------------|-----------------|------------------|
| **APT-001** | Lấy danh sách căn hộ thành công | Lấy tất cả căn hộ kèm thông tin members | **GET** `/api/apartments` | **Status:** 200 OK<br>**Response:**<br>```json```<br>```{```<br>```  "success": true,```<br>```  "message": "Apartments fetched successfully.",```<br>```  "data": [```<br>```    {```<br>```      "apartmentId": 1,```<br>```      "buildingId": 1,```<br>```      "floor": 5,```<br>```      "apartmentNumber": 501,```<br>```      "monthlyFee": 2000000,```<br>```      "members": [```<br>```        {```<br>```          "userId": "user-uuid-001",```<br>```          "fullName": "Nguyen Van A",```<br>```          "email": "nguyenvana@example.com"```<br>```        }```<br>```      ]```<br>```    }```<br>```  ]```<br>```}```<br>``` ```<br>**Note:** Sắp xếp theo `building_id, apartment_number` |
| **APT-002** | Căn hộ không có members | Căn hộ chưa có cư dân nào | **GET** `/api/apartments` | **Status:** 200 OK<br>**Response:** Căn hộ có `members: []` |
| **APT-003** | Method không được hỗ trợ | Gửi request với method DELETE | **DELETE** `/api/apartments` | **Status:** 405 Method Not Allowed<br>**Response:**<br>```json```<br>```{```<br>```  "success": false,```<br>```  "message": "Method DELETE Not Allowed"```<br>```}```<br>``` ```<br>**Headers:** `Allow: POST, GET` |

### 6.3 Test Cases - Tạo căn hộ mới (POST /api/apartments)

| ID | Chức năng | Mô tả kịch bản | Dữ liệu đầu vào | Kết quả mong đợi |
|----|-----------|----------------|-----------------|------------------|
| **APT-004** | Tạo căn hộ thành công | Tạo căn hộ với đầy đủ thông tin hợp lệ | **POST** `/api/apartments`<br>**Headers:** `Content-Type: application/json`<br>**Body:**<br>```json```<br>```{```<br>```  "buildingId": 1,```<br>```  "floor": 10,```<br>```  "apartmentNumber": 1001,```<br>```  "monthlyFee": 3000000```<br>```}```<br>``` ``` | **Status:** 201 Created<br>**Response:**<br>```json```<br>```{```<br>```  "success": true,```<br>```  "message": "Apartment created successfully.",```<br>```  "data": {```<br>```    "apartmentId": 25```<br>```  }```<br>```}```<br>``` ``` |
| **APT-005** | Thiếu trường buildingId | Không gửi buildingId trong body | **POST** `/api/apartments`<br>**Body:**<br>```json```<br>```{```<br>```  "floor": 10,```<br>```  "apartmentNumber": 1001,```<br>```  "monthlyFee": 3000000```<br>```}```<br>``` ``` | **Status:** 400 Bad Request<br>**Response:**<br>```json```<br>```{```<br>```  "success": false,```<br>```  "message": "Missing required body keys"```<br>```}```<br>``` ``` |
| **APT-006** | Thiếu trường floor | Không gửi floor trong body | **POST** `/api/apartments`<br>**Body:**<br>```json```<br>```{```<br>```  "buildingId": 1,```<br>```  "apartmentNumber": 1001,```<br>```  "monthlyFee": 3000000```<br>```}```<br>``` ``` | **Status:** 400 Bad Request<br>**Response:**<br>```json```<br>```{```<br>```  "success": false,```<br>```  "message": "Missing required body keys"```<br>```}```<br>``` ``` |
| **APT-007** | Thiếu trường apartmentNumber | Không gửi apartmentNumber trong body | **POST** `/api/apartments`<br>**Body:**<br>```json```<br>```{```<br>```  "buildingId": 1,```<br>```  "floor": 10,```<br>```  "monthlyFee": 3000000```<br>```}```<br>``` ``` | **Status:** 400 Bad Request<br>**Response:**<br>```json```<br>```{```<br>```  "success": false,```<br>```  "message": "Missing required body keys"```<br>```}```<br>``` ``` |
| **APT-008** | Thiếu trường monthlyFee | Không gửi monthlyFee trong body | **POST** `/api/apartments`<br>**Body:**<br>```json```<br>```{```<br>```  "buildingId": 1,```<br>```  "floor": 10,```<br>```  "apartmentNumber": 1001```<br>```}```<br>``` ``` | **Status:** 400 Bad Request<br>**Response:**<br>```json```<br>```{```<br>```  "success": false,```<br>```  "message": "Missing required body keys"```<br>```}```<br>``` ``` |
| **APT-009** | Tất cả trường đều thiếu | Gửi body rỗng | **POST** `/api/apartments`<br>**Body:**<br>```json```<br>```{}```<br>``` ``` | **Status:** 400 Bad Request<br>**Response:**<br>```json```<br>```{```<br>```  "success": false,```<br>```  "message": "Missing required body keys"```<br>```}```<br>``` ``` |
| **APT-010** | Giá trị = 0 được chấp nhận | Gửi floor = 0 hoặc monthlyFee = 0 (0 là giá trị hợp lệ) | **POST** `/api/apartments`<br>**Body:**<br>```json```<br>```{```<br>```  "buildingId": 1,```<br>```  "floor": 0,```<br>```  "apartmentNumber": 101,```<br>```  "monthlyFee": 0```<br>```}```<br>``` ``` | **Status:** 201 Created<br>**Response:**<br>```json```<br>```{```<br>```  "success": true,```<br>```  "message": "Apartment created successfully.",```<br>```  "data": {```<br>```    "apartmentId": 26```<br>```  }```<br>```}```<br>``` ```<br>**Note:** Giá trị 0 pass validation `!= undefined` |

---

## 7. Appendix

### 7.1 Enum Values Reference

#### UserRole
```typescript
type UserRole = "tenant" | "admin" | "police" | "accountant"
```

#### Gender
```typescript
type Gender = "male" | "female"
```

#### BillingStatus
```typescript
type BillingStatus = "unpaid" | "paid" | "deleted"
```

#### Timeframe (filter for vehicle logs)
```typescript
type Timeframe = "week" | "month" | "year" | "all"
```

### 7.2 Dữ liệu mẫu để test

#### Sample Users
```json
{
  "userId": "user-uuid-001",
  "email": "nguyenvana@example.com",
  "fullName": "Nguyen Van A",
  "role": "tenant",
  "yearOfBirth": 1990,
  "gender": "male",
  "phoneNumber": "0901234567",
  "apartmentId": 101
}
```

#### Sample Services (để tạo billing)
```json
[
  { "serviceId": 1, "serviceName": "Điện", "price": 500000, "tax": 10 },
  { "serviceId": 2, "serviceName": "Nước", "price": 300000, "tax": 5 },
  { "serviceId": 3, "serviceName": "Internet", "price": 200000, "tax": 10 }
]
```

#### Sample License Plates
```
29A-12345
30B-67890
51C-11111
```

### 7.3 Postman Collection Setup

#### Environment Variables
```
base_url: http://localhost:3000
user_id: user-uuid-001
billing_id: [tạo từ test BILL-001]
vehicle_id: [tạo từ test VEH-008]
```

### 7.4 Known Issues & Recommendations

| Issue ID | Module | Mô tả | Test Case liên quan | Severity |
|----------|--------|-------|---------------------|----------|
| **BUG-001** | Billing | API `/api/billings/[id]` (PUT) không kiểm tra trạng thái hóa đơn trước khi thanh toán → có thể thanh toán lại hóa đơn đã thanh toán | BILL-022 | Medium |
| **BUG-002** | Users | API `/api/users/[id]` (PUT) không validation `role` và `gender` enum trước khi gửi DB → lỗi 500 thay vì 400 | USER-008, USER-009 | Low |
| **BUG-003** | Apartments | Validation `!= undefined` cho phép giá trị 0 → có thể tạo căn hộ với monthlyFee = 0 | APT-010 | Low |
| **IMPROVE-001** | All | Các endpoint không có pagination cho GET list → có thể gây performance issue với dữ liệu lớn | BILL-009, APT-001 | Medium |
| **IMPROVE-002** | Vehicles | Endpoint `/api/users/[id]/vehicle/[vehicleId]` (PUT) không kiểm tra ownership → user có thể cập nhật xe của người khác | VEH-026 | High |

### 7.5 Test Execution Checklist

#### Pre-test Setup
- [ ] Database đã được seed với dữ liệu mẫu
- [ ] Server đang chạy tại `http://localhost:3000`
- [ ] Postman/REST Client đã được cấu hình
- [ ] Environment variables đã được set

#### Execution Order
1. **Users Module** (tạo users trước)
2. **Apartments Module** (tạo căn hộ và gán users)
3. **Vehicles Module** (đăng ký xe cho users)
4. **Billing Module** (tạo và thanh toán hóa đơn)

#### Post-test
- [ ] Kiểm tra database consistency
- [ ] Document các bug tìm được
- [ ] Export Postman test results
- [ ] Report performance issues (nếu có)

---

## Ghi chú cho Tester

### Cách sử dụng tài liệu này:

1. **Copy dữ liệu vào Postman:**
   - Mỗi test case có đầy đủ endpoint, method, headers và body
   - Copy trực tiếp JSON body vào Postman request body
   - Thay thế `{user-id}`, `{billing-id}` bằng giá trị thực tế từ database hoặc response trước đó

2. **Kiểm tra kết quả:**
   - So sánh Status Code với cột "Kết quả mong đợi"
   - So sánh JSON response structure
   - Verify dữ liệu trong database sau mỗi test (nếu cần)

3. **Report bug:**
   - Ghi lại Test Case ID
   - Screenshot request/response
   - Mô tả expected vs actual behavior
   - Đính kèm database state (nếu liên quan)

4. **Regression Testing:**
   - Sau khi dev fix bug, chạy lại test case tương ứng
   - Chạy lại toàn bộ module để đảm bảo không phá vỡ functionality khác

---

**END OF DOCUMENT**

