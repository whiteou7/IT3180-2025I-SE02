# UI Test Cases

## 1. Vai trò: Cư dân (Tenant)

### 1.1. Đăng nhập
- Đăng nhập thành công với email và mật khẩu hợp lệ
- Đăng nhập thất bại với email không tồn tại
- Đăng nhập thất bại với mật khẩu sai
- Đăng nhập thất bại với email rỗng
- Đăng nhập thất bại với mật khẩu rỗng
- Đăng nhập thất bại với định dạng email không hợp lệ
- Hiển thị thông báo lỗi khi đăng nhập thất bại
- Chuyển hướng đến trang dashboard sau khi đăng nhập thành công

### 1.2. Trang chủ
- Hiển thị trang chủ khi chưa đăng nhập
- Hiển thị nút đăng nhập trên trang chủ
- Chuyển hướng đến trang đăng nhập khi click nút đăng nhập

### 1.3. Dashboard
- Hiển thị dashboard sau khi đăng nhập
- Hiển thị tên người dùng trên dashboard
- Hiển thị vai trò cư dân trên dashboard
- Hiển thị các thẻ thống kê nhanh
- Hiển thị các hành động nhanh dành cho cư dân
- Click vào hành động nhanh chuyển đến trang tương ứng

### 1.4. Hồ sơ Cư dân
- Hiển thị trang hồ sơ cư dân
- Chỉ hiển thị hồ sơ của chính cư dân
- Hiển thị thông tin cá nhân đầy đủ
- Cập nhật thông tin cá nhân thành công
- Cập nhật thông tin cá nhân thất bại với dữ liệu không hợp lệ
- Hiển thị thông báo lỗi khi cập nhật thất bại
- Hiển thị thông báo thành công khi cập nhật thành công

### 1.5. Danh sách Căn hộ
- Hiển thị danh sách căn hộ
- Hiển thị thông tin căn hộ của cư dân
- Tìm kiếm căn hộ theo tên tòa nhà
- Tìm kiếm căn hộ theo số tầng
- Tìm kiếm căn hộ theo số căn hộ
- Lọc căn hộ theo tòa nhà
- Lọc căn hộ theo tầng
- Hiển thị chi tiết căn hộ khi click vào

### 1.6. Kiểm soát Ra vào
- Hiển thị trang kiểm soát ra vào
- Chỉ hiển thị lịch sử ra vào của chính cư dân
- Hiển thị danh sách phương tiện của cư dân
- Đăng ký phương tiện mới thành công
- Đăng ký phương tiện mới thất bại với biển số trùng lặp
- Đăng ký phương tiện mới thất bại với dữ liệu không hợp lệ
- Xem lịch sử check-in/check-out
- Lọc lịch sử theo ngày
- Lọc lịch sử theo phương tiện
- Hiển thị thông báo lỗi khi đăng ký thất bại
- Hiển thị thông báo thành công khi đăng ký thành công

### 1.7. Quản lý Tài liệu
- Hiển thị trang quản lý tài liệu
- Chỉ hiển thị tài liệu của chính cư dân
- Hiển thị danh sách tài liệu
- Tải lên tài liệu mới thành công
- Tải lên tài liệu mới thất bại với file quá lớn
- Tải lên tài liệu mới thất bại với định dạng không được phép
- Xóa tài liệu thành công
- Tải xuống tài liệu
- Lọc tài liệu theo danh mục
- Tìm kiếm tài liệu theo tên
- Hiển thị thông báo lỗi khi tải lên thất bại
- Hiển thị thông báo thành công khi tải lên thành công

### 1.8. Tài sản
- Hiển thị trang quản lý tài sản
- Hiển thị danh sách tài sản của cư dân
- Đăng ký tài sản mới thành công
- Đăng ký tài sản mới thất bại với dữ liệu không hợp lệ
- Cập nhật thông tin tài sản thành công
- Xóa tài sản thành công
- Lọc tài sản theo loại
- Tìm kiếm tài sản theo tên
- Hiển thị thông báo lỗi khi thao tác thất bại
- Hiển thị thông báo thành công khi thao tác thành công

### 1.9. Tài sản Thất lạc
- Hiển thị trang tài sản thất lạc
- Tạo báo cáo tài sản thất lạc thành công
- Tạo báo cáo tài sản thất lạc thất bại với dữ liệu không hợp lệ
- Xem danh sách báo cáo tài sản thất lạc
- Xem chi tiết báo cáo tài sản thất lạc
- Lọc báo cáo theo trạng thái
- Tìm kiếm báo cáo theo từ khóa
- Hiển thị thông báo lỗi khi tạo báo cáo thất bại
- Hiển thị thông báo thành công khi tạo báo cáo thành công

### 1.10. Trung tâm Thanh toán
- Hiển thị trang trung tâm thanh toán
- Chỉ hiển thị hóa đơn của chính cư dân
- Hiển thị danh sách hóa đơn
- Xem chi tiết hóa đơn
- Lọc hóa đơn theo trạng thái
- Lọc hóa đơn theo khoảng thời gian
- Tìm kiếm hóa đơn theo số hóa đơn
- Thanh toán hóa đơn thành công
- Thanh toán hóa đơn thất bại
- Xuất hóa đơn PDF thành công
- Hiển thị thông báo lỗi khi thanh toán thất bại
- Hiển thị thông báo thành công khi thanh toán thành công

### 1.11. Thông báo Công khai
- Hiển thị trang thông báo công khai
- Hiển thị danh sách thông báo
- Xem chi tiết thông báo
- Lọc thông báo theo danh mục
- Tìm kiếm thông báo theo từ khóa
- Sắp xếp thông báo theo ngày đăng

### 1.12. Tin nhắn Riêng
- Hiển thị trang tin nhắn riêng
- Hiển thị danh sách cuộc trò chuyện
- Tạo cuộc trò chuyện mới với admin thành công
- Tạo cuộc trò chuyện mới thất bại với người dùng không phải admin
- Gửi tin nhắn thành công
- Gửi tin nhắn thất bại với nội dung rỗng
- Nhận tin nhắn mới
- Đánh dấu tin nhắn đã đọc
- Hiển thị thông báo lỗi khi gửi tin nhắn thất bại
- Hiển thị thông báo thành công khi gửi tin nhắn thành công

### 1.13. Danh mục Dịch vụ
- Hiển thị trang danh mục dịch vụ
- Hiển thị danh sách dịch vụ có sẵn
- Thêm dịch vụ vào giỏ hàng thành công
- Xóa dịch vụ khỏi giỏ hàng
- Thanh toán dịch vụ thành công
- Thanh toán dịch vụ thất bại
- Lọc dịch vụ theo danh mục
- Tìm kiếm dịch vụ theo tên
- Hiển thị thông báo lỗi khi thanh toán thất bại
- Hiển thị thông báo thành công khi thanh toán thành công

### 1.14. Phản hồi
- Hiển thị trang phản hồi
- Tạo phản hồi mới thành công
- Tạo phản hồi mới thất bại với nội dung rỗng
- Xem danh sách phản hồi của cư dân
- Xem chi tiết phản hồi
- Lọc phản hồi theo trạng thái
- Tìm kiếm phản hồi theo từ khóa
- Hiển thị thông báo lỗi khi tạo phản hồi thất bại
- Hiển thị thông báo thành công khi tạo phản hồi thành công

### 1.15. Đăng xuất
- Đăng xuất thành công
- Chuyển hướng đến trang chủ sau khi đăng xuất
- Xóa thông tin phiên đăng nhập sau khi đăng xuất

### 1.16. Kiểm tra Phân quyền
- Không thể truy cập trang quản lý cư dân của người khác
- Không thể truy cập trang quản lý thu phí
- Không thể truy cập trang quản lý dịch vụ
- Không thể truy cập trang cài đặt hệ thống
- Không thể truy cập trang báo cáo tài chính
- Không thể truy cập trang báo cáo tổng hợp
- Không thể truy cập trang báo cáo an ninh
- Hiển thị thông báo không có quyền truy cập khi cố truy cập trang không được phép

## 2. Vai trò: Quản trị viên (Admin)

### 2.1. Đăng nhập
- Đăng nhập thành công với email và mật khẩu hợp lệ
- Đăng nhập thất bại với email không tồn tại
- Đăng nhập thất bại với mật khẩu sai
- Đăng nhập thất bại với email rỗng
- Đăng nhập thất bại với mật khẩu rỗng
- Đăng nhập thất bại với định dạng email không hợp lệ
- Hiển thị thông báo lỗi khi đăng nhập thất bại
- Chuyển hướng đến trang dashboard sau khi đăng nhập thành công

### 2.2. Dashboard
- Hiển thị dashboard sau khi đăng nhập
- Hiển thị tên người dùng trên dashboard
- Hiển thị vai trò quản trị viên trên dashboard
- Hiển thị các thẻ thống kê nhanh
- Hiển thị các hành động nhanh dành cho quản trị viên
- Click vào hành động nhanh chuyển đến trang tương ứng

### 2.3. Hồ sơ Cư dân
- Hiển thị trang hồ sơ cư dân
- Hiển thị danh sách tất cả cư dân
- Tìm kiếm cư dân theo tên
- Tìm kiếm cư dân theo email
- Tìm kiếm cư dân theo số căn hộ
- Lọc cư dân theo vai trò
- Lọc cư dân theo trạng thái
- Xem chi tiết hồ sơ cư dân
- Tạo cư dân mới thành công
- Tạo cư dân mới thất bại với email trùng lặp
- Tạo cư dân mới thất bại với dữ liệu không hợp lệ
- Cập nhật thông tin cư dân thành công
- Cập nhật thông tin cư dân thất bại với dữ liệu không hợp lệ
- Xóa cư dân thành công
- Hiển thị thông báo lỗi khi thao tác thất bại
- Hiển thị thông báo thành công khi thao tác thành công

### 2.4. Danh sách Căn hộ
- Hiển thị danh sách tất cả căn hộ
- Tìm kiếm căn hộ theo tên tòa nhà
- Tìm kiếm căn hộ theo số tầng
- Tìm kiếm căn hộ theo số căn hộ
- Lọc căn hộ theo tòa nhà
- Lọc căn hộ theo tầng
- Lọc căn hộ theo trạng thái
- Xem chi tiết căn hộ
- Cập nhật thông tin căn hộ thành công
- Cập nhật thông tin căn hộ thất bại với dữ liệu không hợp lệ
- Hiển thị danh sách cư dân trong căn hộ
- Hiển thị thông báo lỗi khi cập nhật thất bại
- Hiển thị thông báo thành công khi cập nhật thành công

### 2.5. Kiểm soát Ra vào
- Hiển thị trang kiểm soát ra vào
- Hiển thị lịch sử ra vào của tất cả cư dân
- Hiển thị danh sách tất cả phương tiện
- Đăng ký phương tiện mới cho cư dân thành công
- Đăng ký phương tiện mới thất bại với biển số trùng lặp
- Đăng ký phương tiện mới thất bại với dữ liệu không hợp lệ
- Xem lịch sử check-in/check-out của tất cả cư dân
- Lọc lịch sử theo ngày
- Lọc lịch sử theo phương tiện
- Lọc lịch sử theo cư dân
- Hiển thị thông báo lỗi khi đăng ký thất bại
- Hiển thị thông báo thành công khi đăng ký thành công

### 2.6. Quản lý Tài liệu
- Hiển thị trang quản lý tài liệu
- Hiển thị tài liệu của tất cả cư dân
- Hiển thị danh sách tài liệu
- Tải lên tài liệu mới cho cư dân thành công
- Tải lên tài liệu mới thất bại với file quá lớn
- Tải lên tài liệu mới thất bại với định dạng không được phép
- Xóa tài liệu thành công
- Tải xuống tài liệu
- Lọc tài liệu theo danh mục
- Lọc tài liệu theo cư dân
- Tìm kiếm tài liệu theo tên
- Hiển thị thông báo lỗi khi tải lên thất bại
- Hiển thị thông báo thành công khi tải lên thành công

### 2.7. Trạng thái Cư trú
- Hiển thị trang trạng thái cư trú
- Hiển thị danh sách căn hộ với trạng thái cư trú
- Lọc căn hộ theo trạng thái cư trú
- Cập nhật trạng thái cư trú thành công
- Cập nhật trạng thái cư trú thất bại với dữ liệu không hợp lệ
- Hiển thị thông báo lỗi khi cập nhật thất bại
- Hiển thị thông báo thành công khi cập nhật thành công

### 2.8. Tài sản
- Hiển thị trang quản lý tài sản
- Hiển thị danh sách tất cả tài sản
- Đăng ký tài sản mới cho cư dân thành công
- Đăng ký tài sản mới thất bại với dữ liệu không hợp lệ
- Cập nhật thông tin tài sản thành công
- Xóa tài sản thành công
- Lọc tài sản theo loại
- Lọc tài sản theo cư dân
- Tìm kiếm tài sản theo tên
- Hiển thị thông báo lỗi khi thao tác thất bại
- Hiển thị thông báo thành công khi thao tác thành công

### 2.9. Tài sản Thất lạc
- Hiển thị trang tài sản thất lạc
- Tạo báo cáo tài sản thất lạc thành công
- Tạo báo cáo tài sản thất lạc thất bại với dữ liệu không hợp lệ
- Xem danh sách tất cả báo cáo tài sản thất lạc
- Xem chi tiết báo cáo tài sản thất lạc
- Phê duyệt báo cáo thành công
- Từ chối báo cáo thành công
- Cập nhật trạng thái báo cáo thành công
- Lọc báo cáo theo trạng thái
- Lọc báo cáo theo cư dân
- Tìm kiếm báo cáo theo từ khóa
- Hiển thị thông báo lỗi khi thao tác thất bại
- Hiển thị thông báo thành công khi thao tác thành công

### 2.10. Trung tâm Thanh toán
- Hiển thị trang trung tâm thanh toán
- Hiển thị danh sách tất cả hóa đơn
- Tạo hóa đơn mới thành công
- Tạo hóa đơn mới thất bại với dữ liệu không hợp lệ
- Xem chi tiết hóa đơn
- Cập nhật hóa đơn thành công
- Xóa hóa đơn thành công
- Lọc hóa đơn theo trạng thái
- Lọc hóa đơn theo cư dân
- Lọc hóa đơn theo khoảng thời gian
- Tìm kiếm hóa đơn theo số hóa đơn
- Thanh toán hóa đơn cho cư dân thành công
- Xuất hóa đơn PDF thành công
- Hiển thị thông báo lỗi khi thao tác thất bại
- Hiển thị thông báo thành công khi thao tác thành công

### 2.11. Quản lý Thu phí
- Hiển thị trang quản lý thu phí
- Tạo hóa đơn hàng loạt thành công
- Tạo hóa đơn hàng loạt thất bại với dữ liệu không hợp lệ
- Thu phí hàng loạt thành công
- Thu phí hàng loạt thất bại
- Hoàn tác giao dịch thành công
- Hoàn tác giao dịch thất bại
- Hiển thị thông báo lỗi khi thao tác thất bại
- Hiển thị thông báo thành công khi thao tác thành công

### 2.12. Thông báo Công khai
- Hiển thị trang thông báo công khai
- Hiển thị danh sách thông báo
- Tạo thông báo mới thành công
- Tạo thông báo mới thất bại với dữ liệu không hợp lệ
- Xem chi tiết thông báo
- Cập nhật thông báo thành công
- Xóa thông báo thành công
- Lọc thông báo theo danh mục
- Tìm kiếm thông báo theo từ khóa
- Sắp xếp thông báo theo ngày đăng
- Hiển thị thông báo lỗi khi thao tác thất bại
- Hiển thị thông báo thành công khi thao tác thành công

### 2.13. Tin nhắn Riêng
- Hiển thị trang tin nhắn riêng
- Hiển thị danh sách cuộc trò chuyện
- Tạo cuộc trò chuyện mới với cư dân thành công
- Gửi tin nhắn thành công
- Gửi tin nhắn thất bại với nội dung rỗng
- Nhận tin nhắn mới
- Đánh dấu tin nhắn đã đọc
- Hiển thị thông báo lỗi khi gửi tin nhắn thất bại
- Hiển thị thông báo thành công khi gửi tin nhắn thành công

### 2.14. Danh mục Dịch vụ
- Hiển thị trang danh mục dịch vụ
- Hiển thị danh sách dịch vụ có sẵn
- Xem chi tiết dịch vụ

### 2.15. Quản lý Dịch vụ
- Hiển thị trang quản lý dịch vụ
- Hiển thị danh sách tất cả dịch vụ
- Tạo dịch vụ mới thành công
- Tạo dịch vụ mới thất bại với dữ liệu không hợp lệ
- Cập nhật dịch vụ thành công
- Cập nhật dịch vụ thất bại với dữ liệu không hợp lệ
- Xóa dịch vụ thành công
- Kích hoạt dịch vụ thành công
- Vô hiệu hóa dịch vụ thành công
- Lọc dịch vụ theo danh mục
- Lọc dịch vụ theo trạng thái
- Tìm kiếm dịch vụ theo tên
- Hiển thị thông báo lỗi khi thao tác thất bại
- Hiển thị thông báo thành công khi thao tác thành công

### 2.16. Phản hồi
- Hiển thị trang phản hồi
- Hiển thị danh sách tất cả phản hồi
- Xem chi tiết phản hồi
- Cập nhật trạng thái phản hồi thành công
- Cập nhật trạng thái phản hồi thất bại với dữ liệu không hợp lệ
- Lọc phản hồi theo trạng thái
- Lọc phản hồi theo cư dân
- Tìm kiếm phản hồi theo từ khóa
- Hiển thị thông báo lỗi khi cập nhật thất bại
- Hiển thị thông báo thành công khi cập nhật thành công

### 2.17. Cài đặt Hệ thống
- Hiển thị trang cài đặt hệ thống
- Xem cài đặt hệ thống hiện tại
- Cập nhật cài đặt hệ thống thành công
- Cập nhật cài đặt hệ thống thất bại với dữ liệu không hợp lệ
- Sao lưu cơ sở dữ liệu thành công
- Sao lưu cơ sở dữ liệu thất bại
- Phục hồi cơ sở dữ liệu thành công
- Phục hồi cơ sở dữ liệu thất bại
- Hiển thị thông báo lỗi khi thao tác thất bại
- Hiển thị thông báo thành công khi thao tác thành công

### 2.18. Báo cáo An ninh
- Hiển thị trang báo cáo an ninh
- Hiển thị thống kê an ninh
- Xuất báo cáo an ninh thành công
- Lọc báo cáo theo khoảng thời gian
- Hiển thị biểu đồ thống kê

### 2.19. Báo cáo Tài chính
- Hiển thị trang báo cáo tài chính
- Hiển thị thống kê tài chính
- Xuất báo cáo tài chính thành công
- Lọc báo cáo theo khoảng thời gian
- Hiển thị biểu đồ thống kê

### 2.20. Báo cáo Tổng hợp
- Hiển thị trang báo cáo tổng hợp
- Hiển thị thống kê tổng hợp
- Xuất báo cáo tổng hợp thành công
- Lọc báo cáo theo khoảng thời gian
- Hiển thị biểu đồ thống kê

### 2.21. Đăng xuất
- Đăng xuất thành công
- Chuyển hướng đến trang chủ sau khi đăng xuất
- Xóa thông tin phiên đăng nhập sau khi đăng xuất

## 3. Vai trò: Công an (Police)

### 3.1. Đăng nhập
- Đăng nhập thành công với email và mật khẩu hợp lệ
- Đăng nhập thất bại với email không tồn tại
- Đăng nhập thất bại với mật khẩu sai
- Đăng nhập thất bại với email rỗng
- Đăng nhập thất bại với mật khẩu rỗng
- Đăng nhập thất bại với định dạng email không hợp lệ
- Hiển thị thông báo lỗi khi đăng nhập thất bại
- Chuyển hướng đến trang dashboard sau khi đăng nhập thành công

### 3.2. Dashboard
- Hiển thị dashboard sau khi đăng nhập
- Hiển thị tên người dùng trên dashboard
- Hiển thị vai trò công an trên dashboard
- Hiển thị các thẻ thống kê nhanh
- Hiển thị các hành động nhanh dành cho công an
- Click vào hành động nhanh chuyển đến trang tương ứng

### 3.3. Danh sách Căn hộ
- Hiển thị danh sách căn hộ
- Chỉ xem được thông tin căn hộ
- Tìm kiếm căn hộ theo tên tòa nhà
- Tìm kiếm căn hộ theo số tầng
- Tìm kiếm căn hộ theo số căn hộ
- Lọc căn hộ theo tòa nhà
- Lọc căn hộ theo tầng
- Xem chi tiết căn hộ

### 3.4. Kiểm soát Ra vào
- Hiển thị trang kiểm soát ra vào
- Hiển thị lịch sử ra vào của tất cả cư dân
- Hiển thị danh sách tất cả phương tiện
- Xem lịch sử check-in/check-out của tất cả cư dân
- Lọc lịch sử theo ngày
- Lọc lịch sử theo phương tiện
- Lọc lịch sử theo cư dân
- Tìm kiếm lịch sử theo biển số xe

### 3.5. Quản lý Tài liệu
- Hiển thị trang quản lý tài liệu
- Chỉ xem được tài liệu của tất cả cư dân
- Hiển thị danh sách tài liệu
- Tải xuống tài liệu
- Lọc tài liệu theo danh mục
- Lọc tài liệu theo cư dân
- Tìm kiếm tài liệu theo tên

### 3.6. Tài sản Thất lạc
- Hiển thị trang tài sản thất lạc
- Xem danh sách tất cả báo cáo tài sản thất lạc
- Xem chi tiết báo cáo tài sản thất lạc
- Lọc báo cáo theo trạng thái
- Lọc báo cáo theo cư dân
- Tìm kiếm báo cáo theo từ khóa

### 3.7. Thông báo Công khai
- Hiển thị trang thông báo công khai
- Hiển thị danh sách thông báo
- Xem chi tiết thông báo
- Lọc thông báo theo danh mục
- Tìm kiếm thông báo theo từ khóa
- Sắp xếp thông báo theo ngày đăng

### 3.8. Tin nhắn Riêng
- Hiển thị trang tin nhắn riêng
- Hiển thị danh sách cuộc trò chuyện
- Chỉ có thể tạo cuộc trò chuyện với admin
- Tạo cuộc trò chuyện mới với admin thành công
- Tạo cuộc trò chuyện mới thất bại với người dùng không phải admin
- Gửi tin nhắn thành công
- Gửi tin nhắn thất bại với nội dung rỗng
- Nhận tin nhắn mới
- Đánh dấu tin nhắn đã đọc
- Hiển thị thông báo lỗi khi gửi tin nhắn thất bại
- Hiển thị thông báo thành công khi gửi tin nhắn thành công

### 3.9. Báo cáo An ninh
- Hiển thị trang báo cáo an ninh
- Hiển thị thống kê an ninh
- Xuất báo cáo an ninh thành công
- Lọc báo cáo theo khoảng thời gian
- Hiển thị biểu đồ thống kê

### 3.10. Đăng xuất
- Đăng xuất thành công
- Chuyển hướng đến trang chủ sau khi đăng xuất
- Xóa thông tin phiên đăng nhập sau khi đăng xuất

### 3.11. Kiểm tra Phân quyền
- Không thể truy cập trang hồ sơ cư dân
- Không thể truy cập trang trạng thái cư trú
- Không thể truy cập trang tài sản
- Không thể truy cập trang trung tâm thanh toán
- Không thể truy cập trang quản lý thu phí
- Không thể truy cập trang danh mục dịch vụ
- Không thể truy cập trang quản lý dịch vụ
- Không thể truy cập trang phản hồi
- Không thể truy cập trang cài đặt hệ thống
- Không thể truy cập trang báo cáo tài chính
- Không thể truy cập trang báo cáo tổng hợp
- Hiển thị thông báo không có quyền truy cập khi cố truy cập trang không được phép

## 4. Vai trò: Kế toán (Accountant)

### 4.1. Đăng nhập
- Đăng nhập thành công với email và mật khẩu hợp lệ
- Đăng nhập thất bại với email không tồn tại
- Đăng nhập thất bại với mật khẩu sai
- Đăng nhập thất bại với email rỗng
- Đăng nhập thất bại với mật khẩu rỗng
- Đăng nhập thất bại với định dạng email không hợp lệ
- Hiển thị thông báo lỗi khi đăng nhập thất bại
- Chuyển hướng đến trang dashboard sau khi đăng nhập thành công

### 4.2. Dashboard
- Hiển thị dashboard sau khi đăng nhập
- Hiển thị tên người dùng trên dashboard
- Hiển thị vai trò kế toán trên dashboard
- Hiển thị các thẻ thống kê nhanh
- Hiển thị các hành động nhanh dành cho kế toán
- Click vào hành động nhanh chuyển đến trang tương ứng

### 4.3. Danh sách Căn hộ
- Hiển thị danh sách căn hộ
- Chỉ xem được thông tin căn hộ
- Tìm kiếm căn hộ theo tên tòa nhà
- Tìm kiếm căn hộ theo số tầng
- Tìm kiếm căn hộ theo số căn hộ
- Lọc căn hộ theo tòa nhà
- Lọc căn hộ theo tầng
- Xem chi tiết căn hộ

### 4.4. Trung tâm Thanh toán
- Hiển thị trang trung tâm thanh toán
- Hiển thị danh sách tất cả hóa đơn
- Chỉ xem được thông tin hóa đơn
- Xem chi tiết hóa đơn
- Lọc hóa đơn theo trạng thái
- Lọc hóa đơn theo cư dân
- Lọc hóa đơn theo khoảng thời gian
- Tìm kiếm hóa đơn theo số hóa đơn
- Xuất hóa đơn PDF thành công

### 4.5. Quản lý Thu phí
- Hiển thị trang quản lý thu phí
- Tạo hóa đơn hàng loạt thành công
- Tạo hóa đơn hàng loạt thất bại với dữ liệu không hợp lệ
- Thu phí hàng loạt thành công
- Thu phí hàng loạt thất bại
- Hoàn tác giao dịch thành công
- Hoàn tác giao dịch thất bại
- Hiển thị thông báo lỗi khi thao tác thất bại
- Hiển thị thông báo thành công khi thao tác thành công

### 4.6. Thông báo Công khai
- Hiển thị trang thông báo công khai
- Hiển thị danh sách thông báo
- Xem chi tiết thông báo
- Lọc thông báo theo danh mục
- Tìm kiếm thông báo theo từ khóa
- Sắp xếp thông báo theo ngày đăng

### 4.7. Tin nhắn Riêng
- Hiển thị trang tin nhắn riêng
- Hiển thị danh sách cuộc trò chuyện
- Chỉ có thể tạo cuộc trò chuyện với admin
- Tạo cuộc trò chuyện mới với admin thành công
- Tạo cuộc trò chuyện mới thất bại với người dùng không phải admin
- Gửi tin nhắn thành công
- Gửi tin nhắn thất bại với nội dung rỗng
- Nhận tin nhắn mới
- Đánh dấu tin nhắn đã đọc
- Hiển thị thông báo lỗi khi gửi tin nhắn thất bại
- Hiển thị thông báo thành công khi gửi tin nhắn thành công

### 4.8. Báo cáo Tài chính
- Hiển thị trang báo cáo tài chính
- Hiển thị thống kê tài chính
- Xuất báo cáo tài chính thành công
- Lọc báo cáo theo khoảng thời gian
- Hiển thị biểu đồ thống kê
- Xuất báo cáo thuế thành công

### 4.9. Đăng xuất
- Đăng xuất thành công
- Chuyển hướng đến trang chủ sau khi đăng xuất
- Xóa thông tin phiên đăng nhập sau khi đăng xuất

### 4.10. Kiểm tra Phân quyền
- Không thể truy cập trang hồ sơ cư dân
- Không thể truy cập trang kiểm soát ra vào
- Không thể truy cập trang quản lý tài liệu
- Không thể truy cập trang trạng thái cư trú
- Không thể truy cập trang tài sản
- Không thể truy cập trang tài sản thất lạc
- Không thể truy cập trang danh mục dịch vụ
- Không thể truy cập trang quản lý dịch vụ
- Không thể truy cập trang phản hồi
- Không thể truy cập trang cài đặt hệ thống
- Không thể truy cập trang báo cáo an ninh
- Không thể truy cập trang báo cáo tổng hợp
- Hiển thị thông báo không có quyền truy cập khi cố truy cập trang không được phép

## 5. Kiểm thử Giao diện Chung

### 5.1. Điều hướng
- Sidebar hiển thị đúng menu theo vai trò
- Click vào menu item chuyển đến trang tương ứng
- Menu item không có quyền không hiển thị
- Breadcrumb hiển thị đúng đường dẫn
- Click vào breadcrumb chuyển đến trang tương ứng

### 5.2. Responsive Design
- Giao diện hiển thị đúng trên màn hình desktop
- Giao diện hiển thị đúng trên màn hình tablet
- Giao diện hiển thị đúng trên màn hình mobile
- Sidebar thu gọn trên màn hình nhỏ
- Menu điều hướng hoạt động đúng trên mobile

### 5.3. Theme Toggle
- Chuyển đổi giữa chế độ sáng và tối thành công
- Giao diện hiển thị đúng màu sắc ở chế độ sáng
- Giao diện hiển thị đúng màu sắc ở chế độ tối
- Lưu trữ tùy chọn theme sau khi đăng xuất

### 5.4. Form Validation
- Hiển thị thông báo lỗi khi submit form với dữ liệu rỗng
- Hiển thị thông báo lỗi khi submit form với định dạng email không hợp lệ
- Hiển thị thông báo lỗi khi submit form với số điện thoại không hợp lệ
- Hiển thị thông báo lỗi khi submit form với dữ liệu vượt quá độ dài cho phép
- Xóa thông báo lỗi khi người dùng sửa dữ liệu hợp lệ

### 5.5. Loading States
- Hiển thị trạng thái loading khi tải dữ liệu
- Hiển thị trạng thái loading khi submit form
- Hiển thị skeleton loader khi tải danh sách
- Ẩn trạng thái loading sau khi tải xong

### 5.6. Error Handling
- Hiển thị thông báo lỗi khi API trả về lỗi
- Hiển thị thông báo lỗi khi mất kết nối mạng
- Hiển thị thông báo lỗi khi timeout
- Hiển thị trang 404 khi truy cập URL không tồn tại
- Hiển thị trang 403 khi không có quyền truy cập

### 5.7. Toast Notifications
- Hiển thị thông báo thành công khi thao tác thành công
- Hiển thị thông báo lỗi khi thao tác thất bại
- Tự động ẩn thông báo sau một khoảng thời gian
- Có thể đóng thông báo bằng cách click vào nút đóng

### 5.8. Pagination
- Hiển thị phân trang khi danh sách có nhiều trang
- Chuyển trang thành công khi click vào số trang
- Chuyển trang thành công khi click vào nút next
- Chuyển trang thành công khi click vào nút previous
- Hiển thị đúng số trang hiện tại

### 5.9. Search và Filter
- Tìm kiếm hoạt động đúng với từ khóa
- Lọc hoạt động đúng với điều kiện
- Kết hợp tìm kiếm và lọc hoạt động đúng
- Xóa bộ lọc thành công
- Xóa từ khóa tìm kiếm thành công

### 5.10. Table Operations
- Sắp xếp cột thành công
- Sắp xếp cột theo thứ tự tăng dần
- Sắp xếp cột theo thứ tự giảm dần
- Chọn nhiều hàng thành công
- Xóa nhiều hàng đã chọn thành công
- Xuất dữ liệu bảng thành công

