# Regression Testing Checklist – Apartment Management System

---

## 1. Dashboard & Tổng quan
- [ ] Dashboard hiển thị đúng theo vai trò (Admin, Cư dân, Kế toán, An ninh)
- [ ] Thống kê số lượng cư dân, căn hộ, phương tiện chính xác
- [ ] Biểu đồ / báo cáo hiển thị đúng dữ liệu sau cập nhật
- [ ] Quyền truy cập dashboard không bị lộ chéo giữa các vai trò
- [ ] Hiệu năng tải dashboard với dữ liệu lớn

---

## 2. Quản lý Cư dân (Residents Management)

### 2.1 Hồ sơ cư dân (Resident Profiles)
- [ ] Tạo mới hồ sơ cư dân
- [ ] Cập nhật thông tin cá nhân
- [ ] Xóa / vô hiệu hóa cư dân
- [ ] Kiểm tra dữ liệu bắt buộc và validate
- [ ] Lịch sử thay đổi hồ sơ được lưu

### 2.2 Danh bạ căn hộ (Apartment Directory)
- [ ] Tra cứu căn hộ theo tòa nhà / tầng
- [ ] Liên kết cư dân – căn hộ chính xác
- [ ] Cập nhật thông tin căn hộ
- [ ] Phân quyền xem / sửa căn hộ

### 2.3 Trạng thái cư trú (Residence Status)
- [ ] Trạng thái đang ở / trống hiển thị đúng
- [ ] Chuyển trạng thái khi cư dân chuyển đi / đến
- [ ] Không cho trùng cư dân vượt giới hạn căn hộ

### 2.4 Kiểm soát ra vào (Access Control)
- [ ] Ghi nhận lịch sử ra / vào
- [ ] Liên kết đúng cư dân – phương tiện
- [ ] Không cho truy cập trái phép
- [ ] Dữ liệu lịch sử không bị mất sau update

### 2.5 Quản lý tài liệu (Document Management)
- [ ] Upload tài liệu cư dân
- [ ] Xem / tải xuống tài liệu
- [ ] Phân quyền truy cập tài liệu
- [ ] Kiểm tra định dạng và dung lượng file
- [ ] Không mất file sau backup/restore

---

## 3. Quản lý Hóa đơn & Tài chính (Billing Management)
- [ ] Tạo hóa đơn định kỳ đúng chu kỳ
- [ ] Tính toán số tiền chính xác
- [ ] Thanh toán trực tuyến thành công / thất bại
- [ ] Lịch sử giao dịch được lưu đầy đủ
- [ ] Xuất hóa đơn PDF đúng định dạng
- [ ] Báo cáo thuế đúng số liệu
- [ ] Phân quyền xem / sửa dữ liệu tài chính

---

## 4. Dịch vụ (Services)

### 4.1 Danh mục dịch vụ (Service Catalog)
- [ ] Hiển thị danh sách dịch vụ
- [ ] Phân loại dịch vụ đúng

### 4.2 Quản lý dịch vụ (Service Management)
- [ ] Thêm dịch vụ mới
- [ ] Sửa thông tin dịch vụ
- [ ] Xóa / ẩn dịch vụ
- [ ] Không ảnh hưởng đến lịch sử sử dụng

### 4.3 Phản hồi dịch vụ (Feedbacks)
- [ ] Cư dân gửi phản hồi
- [ ] Ban quản lý xem và xử lý phản hồi
- [ ] Cập nhật trạng thái phản hồi
- [ ] Lưu lịch sử xử lý

---

## 5. Quản lý Tài sản & Đồ thất lạc (Property Management)
- [ ] Đăng ký tài sản cá nhân
- [ ] Cập nhật / xóa tài sản
- [ ] Báo cáo đồ thất lạc
- [ ] Tìm kiếm đồ thất lạc
- [ ] Trạng thái found / not found / deleted chính xác
- [ ] Phân quyền truy cập dữ liệu tài sản

---

## 6. Kiểm soát Phương tiện (Vehicle Management)
- [ ] Đăng ký phương tiện mới
- [ ] Check-in phương tiện
- [ ] Check-out phương tiện
- [ ] Lưu lịch sử di chuyển
- [ ] Demo Vehicle Check-in hoạt động đúng
- [ ] Không cho phương tiện chưa đăng ký ra vào

---

## 7. Giao tiếp Nội bộ (Communication)

### 7.1 Thông báo (Announcements)
- [ ] Tạo thông báo mới
- [ ] Hiển thị đúng đối tượng nhận
- [ ] Chỉnh sửa / xóa thông báo
- [ ] Lưu lịch sử thông báo

### 7.2 Chat nội bộ (Internal Chat)
- [ ] Nhắn tin 1-1 giữa cư dân và ban quản lý
- [ ] Tin nhắn gửi / nhận theo thời gian thực
- [ ] Lưu lịch sử chat
- [ ] Phân quyền truy cập đúng vai trò

---

## 8. Báo cáo & Thống kê (Reports)

### 8.1 Báo cáo tài chính (Financial Reports)
- [ ] Thống kê doanh thu chính xác
- [ ] Thống kê chi phí chính xác
- [ ] Dữ liệu thuế khớp với hóa đơn

### 8.2 Báo cáo tổng quan (General Reports)
- [ ] Thống kê cư dân
- [ ] Thống kê căn hộ
- [ ] Bộ lọc theo thời gian hoạt động đúng

### 8.3 Báo cáo an ninh (Security Reports)
- [ ] Thống kê ra / vào
- [ ] Thống kê sự cố an ninh
- [ ] Không mất dữ liệu lịch sử

---

## 9. Hệ thống (System)

### 9.1 Cài đặt hệ thống (System Settings)
- [ ] Thay đổi tham số hệ thống
- [ ] Áp dụng cấu hình mới đúng cách
- [ ] Không ảnh hưởng dữ liệu hiện có

### 9.2 Database Dump
- [ ] Sao lưu dữ liệu thành công
- [ ] Phục hồi dữ liệu thành công
- [ ] Dữ liệu sau restore toàn vẹn

---

## 10. Xác thực & Phân quyền (Authentication & Authorization)
- [ ] Đăng nhập với email/password hợp lệ
- [ ] Từ chối đăng nhập sai
- [ ] Quản lý phiên đăng nhập
- [ ] Phân quyền đúng: Admin / Tenant / Police / Accountant
- [ ] Không truy cập trái phép chức năng
- [ ] Reset mật khẩu hoạt động đúng
- [ ] Hết hạn phiên đăng nhập đúng thời gian

---

