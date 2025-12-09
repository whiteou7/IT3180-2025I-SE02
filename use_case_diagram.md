@startuml
title US-001 - Cư dân nhập thông tin
left to right direction
actor "Cư dân\n(Resident)" as Resident
actor "Quản trị viên\n(Admin/BQT)" as Admin
rectangle "Hệ thống" {
  usecase "Cư dân tạo hồ sơ" as U1A
  usecase "Cư dân cập nhật hồ sơ" as U1B
  usecase "Admin xem hồ sơ cư dân" as U1C
  usecase "Admin chỉnh sửa hồ sơ" as U1D
  usecase "Admin duyệt thay đổi hồ sơ" as U1E
  usecase "Hệ thống lưu lịch sử thay đổi" as U1F
}
Resident --> U1A
Resident --> U1B
Admin --> U1C
Admin --> U1D
Admin --> U1E
U1B --> U1E
U1D --> U1F
U1E --> U1F
@enduml

@startuml
title US-002 - Cư dân tra cứu thông tin chung
left to right direction
actor "Cư dân\n(Resident)" as Resident
actor "Quản trị viên\n(Admin/BQT)" as Admin
actor "Cán bộ công an\n(Security Officer)" as Police
actor "Kế toán\n(Accountant)" as Accountant
rectangle "Hệ thống" {
  usecase "Resident xem thông tin khu/căn hộ" as U2A
  usecase "Admin xem & cập nhật dữ liệu tòa nhà" as U2B
  usecase "Admin quản lý sơ đồ/roster" as U2C
  usecase "Police xem danh bạ căn hộ/phương tiện" as U2D
  usecase "Accountant xem dữ liệu đối soát phí" as U2E
}
Resident --> U2A
Admin --> U2B
Admin --> U2C
Police --> U2D
Accountant --> U2E
@enduml

@startuml
title US-003 - Cư dân nhận thông báo phí/bảo trì/sự cố
left to right direction
actor "Cư dân\n(Resident)" as Resident
actor "Quản trị viên\n(Admin/BQT)" as Admin
actor "Kế toán\n(Accountant)" as Accountant
actor "Cán bộ công an\n(Security Officer)" as Police
rectangle "Hệ thống" {
  usecase "Resident nhận thông báo phí/bảo trì/sự cố" as U3A
  usecase "Resident đọc chi tiết thông báo" as U3B
  usecase "Admin tạo/duyệt thông báo" as U3C
  usecase "Admin đẩy thông báo đa kênh" as U3D
  usecase "Accountant gửi thông báo phí/nhắc hạn" as U3E
  usecase "Accountant xác nhận đã đọc" as U3F
  usecase "Police nhận cảnh báo an ninh" as U3G
}
Resident --> U3A
Resident --> U3B
U3A --> U3B
Admin --> U3C
Admin --> U3D
Accountant --> U3E
Accountant --> U3F
Police --> U3G
@enduml

@startuml
title US-004 - Trải nghiệm nhanh, an toàn
left to right direction
actor "Cư dân\n(Resident)" as Resident
actor "Quản trị viên\n(Admin/BQT)" as Admin
rectangle "Hệ thống" {
  usecase "Resident đăng nhập an toàn" as U4A
  usecase "Resident trải nghiệm mượt" as U4B
  usecase "Admin cấu hình hiệu năng" as U4C
  usecase "Admin cấu hình bảo mật" as U4D
  usecase "Admin giám sát lỗi/uptime" as U4E
}
Resident --> U4A
Resident --> U4B
Admin --> U4C
Admin --> U4D
Admin --> U4E
@enduml

@startuml
title US-005 - Cư dân thanh toán phí trực tuyến
left to right direction
actor "Cư dân\n(Resident)" as Resident
actor "Kế toán\n(Accountant)" as Accountant
actor "Quản trị viên\n(Admin/BQT)" as Admin
rectangle "Hệ thống" {
  usecase "Resident chọn hóa đơn & thanh toán online" as U5A
  usecase "Resident tải biên lai" as U5B
  usecase "Accountant theo dõi trạng thái & đối soát" as U5C
  usecase "Accountant hỗ trợ hoàn/điều chỉnh" as U5D
  usecase "Admin thiết lập phương thức thanh toán" as U5E
  usecase "Admin giám sát luồng thu phí" as U5F
}
Resident --> U5A
Resident --> U5B
Accountant --> U5C
Accountant --> U5D
Admin --> U5E
Admin --> U5F
@enduml

@startuml
title US-006 - Cư dân gửi phản hồi/đánh giá
left to right direction
actor "Cư dân\n(Resident)" as Resident
actor "Quản trị viên\n(Admin/BQT)" as Admin
rectangle "Hệ thống" {
  usecase "Resident gửi phản hồi/đánh giá" as U6A
  usecase "Resident xem trạng thái phản hồi" as U6B
  usecase "Admin xem toàn bộ phản hồi" as U6C
  usecase "Admin phân loại & cập nhật trạng thái" as U6D
  usecase "Admin phản hồi cư dân" as U6E
}
Resident --> U6A
Resident --> U6B
Admin --> U6C
Admin --> U6D
Admin --> U6E
U6A --> U6B
U6A --> U6C
@enduml

@startuml
title US-007 - Cư dân đăng ký dịch vụ tòa nhà
left to right direction
actor "Cư dân\n(Resident)" as Resident
actor "Quản trị viên\n(Admin/BQT)" as Admin
rectangle "Hệ thống" {
  usecase "Resident duyệt catalog dịch vụ" as U7A
  usecase "Resident đặt dịch vụ & thanh toán" as U7B
  usecase "Admin quản lý danh mục/giá/lịch" as U7C
  usecase "Admin phê duyệt/huỷ đơn dịch vụ" as U7D
}
Resident --> U7A
Resident --> U7B
Admin --> U7C
Admin --> U7D
@enduml

@startuml
title US-008 - Cán bộ công an báo cáo sự cố an ninh
left to right direction
actor "Cán bộ công an\n(Security Officer)" as Police
actor "Quản trị viên\n(Admin/BQT)" as Admin
rectangle "Hệ thống" {
  usecase "Police tạo báo cáo sự cố an ninh" as U8A
  usecase "Police cập nhật trạng thái xử lý" as U8B
  usecase "Admin nhận & phân công xử lý" as U8C
  usecase "Admin lưu trữ lịch sử sự cố" as U8D
}
Police --> U8A
Police --> U8B
Admin --> U8C
Admin --> U8D
U8A --> U8C
U8B --> U8D
@enduml

@startuml
title US-009 - Cán bộ công an kiểm soát ra vào
left to right direction
actor "Cán bộ công an\n(Security Officer)" as Police
actor "Quản trị viên\n(Admin/BQT)" as Admin
actor "Cư dân\n(Resident)" as Resident
rectangle "Hệ thống" {
  usecase "Resident đăng ký xe/ra vào" as U9A
  usecase "Resident xem lịch sử ra vào của mình" as U9B
  usecase "Admin cấu hình quy tắc kiểm soát" as U9C
  usecase "Admin xem nhật ký ra vào toàn bộ" as U9D
  usecase "Police truy xuất log ra vào" as U9E
  usecase "Police ghi nhận sự cố ra vào" as U9F
}
Resident --> U9A
Resident --> U9B
Admin --> U9C
Admin --> U9D
Police --> U9E
Police --> U9F
U9E --> U9F
@enduml

@startuml
title US-010 - Cán bộ công an nhận báo cáo định kỳ
left to right direction
actor "Cán bộ công an\n(Security Officer)" as Police
actor "Quản trị viên\n(Admin/BQT)" as Admin
rectangle "Hệ thống" {
  usecase "Police nhận báo cáo an ninh định kỳ" as U10A
  usecase "Admin cấu hình lịch & phạm vi báo cáo" as U10B
  usecase "Admin quản lý danh sách người nhận" as U10C
}
Police --> U10A
Admin --> U10B
Admin --> U10C
@enduml

@startuml
title US-011 - Cán bộ công an quản lý hồ sơ điện tử
left to right direction
actor "Cán bộ công an\n(Security Officer)" as Police
actor "Quản trị viên\n(Admin/BQT)" as Admin
actor "Cư dân\n(Resident)" as Resident
rectangle "Hệ thống" {
  usecase "Resident tải lên tài liệu của mình" as U11A
  usecase "Resident xem tài liệu của mình" as U11B
  usecase "Admin quản lý danh mục & phân quyền" as U11C
  usecase "Admin duyệt tài liệu" as U11D
  usecase "Police truy cập hồ sơ an ninh" as U11E
}
Resident --> U11A
Resident --> U11B
Admin --> U11C
Admin --> U11D
Police --> U11E
@enduml

@startuml
title US-012 - Kế toán tự động lưu/cập nhật hóa đơn
left to right direction
actor "Kế toán\n(Accountant)" as Accountant
actor "Quản trị viên\n(Admin/BQT)" as Admin
actor "Cư dân\n(Resident)" as Resident
rectangle "Hệ thống" {
  usecase "Resident xem trạng thái hóa đơn" as U12A
  usecase "Accountant đồng bộ & đối soát hóa đơn" as U12B
  usecase "Accountant cập nhật trạng thái hóa đơn" as U12C
  usecase "Admin giám sát toàn bộ hóa đơn" as U12D
  usecase "Admin tạo báo cáo nhanh" as U12E
}
Resident --> U12A
Accountant --> U12B
Accountant --> U12C
Admin --> U12D
Admin --> U12E
@enduml

@startuml
title US-013 - Kế toán xuất báo cáo tài chính
left to right direction
actor "Kế toán\n(Accountant)" as Accountant
actor "Quản trị viên\n(Admin/BQT)" as Admin
rectangle "Hệ thống" {
  usecase "Accountant chọn kỳ & mẫu báo cáo" as U13A
  usecase "Accountant xuất báo cáo PDF/Excel" as U13B
  usecase "Admin xem/duyệt báo cáo tài chính" as U13C
  usecase "Admin chia sẻ báo cáo nội bộ" as U13D
}
Accountant --> U13A
Accountant --> U13B
Admin --> U13C
Admin --> U13D
@enduml

@startuml
title US-014 - Kế toán lấy dữ liệu NCC, tính & gửi hóa đơn
left to right direction
actor "Kế toán\n(Accountant)" as Accountant
actor "Quản trị viên\n(Admin/BQT)" as Admin
rectangle "Hệ thống" {
  usecase "Accountant lấy dữ liệu nhà cung cấp" as U14A
  usecase "Accountant tính phí & tạo hóa đơn" as U14B
  usecase "Accountant gửi hóa đơn cho cư dân" as U14C
  usecase "Admin cấu hình nguồn dữ liệu NCC" as U14D
  usecase "Admin duyệt trước khi gửi" as U14E
}
Accountant --> U14A
Accountant --> U14B
Accountant --> U14C
Admin --> U14D
Admin --> U14E
@enduml

@startuml
title US-015 - Kế toán xuất hóa đơn và báo cáo thuế
left to right direction
actor "Kế toán\n(Accountant)" as Accountant
actor "Quản trị viên\n(Admin/BQT)" as Admin
rectangle "Hệ thống" {
  usecase "Accountant xuất hóa đơn" as U15A
  usecase "Accountant tạo báo cáo thuế" as U15B
  usecase "Admin phê duyệt hồ sơ thuế" as U15C
  usecase "Admin lưu trữ hồ sơ thuế" as U15D
}
Accountant --> U15A
Accountant --> U15B
Admin --> U15C
Admin --> U15D
@enduml

@startuml
title US-016 - BQT thông báo chung & trao đổi riêng
left to right direction
actor "Ban quản trị\n(BQT)" as Board
actor "Cư dân\n(Resident)" as Resident
rectangle "Hệ thống" {
  usecase "Admin tạo thông báo chung" as U16A
  usecase "Admin quản lý kênh thông báo" as U16B
  usecase "Admin phản hồi chat riêng" as U16C
  usecase "Resident đọc thông báo" as U16D
  usecase "Resident trao đổi riêng với BQT" as U16E
}
Board --> U16A
Board --> U16B
Board --> U16C
Resident --> U16D
Resident --> U16E
@enduml

@startuml
title US-017 - BQT quản lý thông tin & trạng thái cư trú
left to right direction
actor "Ban quản trị\n(BQT)" as Board
actor "Cư dân\n(Resident)" as Resident
rectangle "Hệ thống" {
  usecase "Admin xem/sửa trạng thái cư trú" as U17A
  usecase "Admin cập nhật tạm trú/tạm vắng" as U17B
  usecase "Resident xem trạng thái cư trú" as U17C
  usecase "Resident yêu cầu cập nhật trạng thái" as U17D
}
Board --> U17A
Board --> U17B
Resident --> U17C
Resident --> U17D
@enduml

@startuml
title US-018 - BQT tối ưu quy trình thu phí
left to right direction
actor "Ban quản trị\n(BQT)" as Board
actor "Kế toán\n(Accountant)" as Accountant
rectangle "Hệ thống" {
  usecase "Admin cấu hình quy trình thu phí" as U18A
  usecase "Admin phê duyệt các bước thu phí" as U18B
  usecase "Admin giám sát KPI thu phí" as U18C
  usecase "Accountant thực thi thu phí" as U18D
  usecase "Accountant đối soát & báo cáo" as U18E
  usecase "Accountant đề xuất cải tiến" as U18F
}
Board --> U18A
Board --> U18B
Board --> U18C
Accountant --> U18D
Accountant --> U18E
Accountant --> U18F
@enduml

@startuml
title US-019 - BQT muốn giao diện thân thiện
left to right direction
actor "Ban quản trị\n(BQT)" as Board
rectangle "Hệ thống" {
  usecase "Admin yêu cầu giao diện dễ dùng" as U19A
  usecase "Hệ thống áp dụng guideline UX/UI" as U19B
}
Board --> U19A
Board --> U19B
@enduml

@startuml
title US-020 - BQT đảm bảo an toàn & bảo mật dữ liệu
left to right direction
actor "Ban quản trị\n(BQT)" as Board
rectangle "Hệ thống" {
  usecase "Admin thiết lập bảo mật & phân quyền" as U20A
  usecase "Admin giám sát truy cập" as U20B
  usecase "Hệ thống mã hóa & log truy vết" as U20C
  usecase "Hệ thống cảnh báo bất thường" as U20D
}
Board --> U20A
Board --> U20B
Board --> U20C
Board --> U20D
@enduml

@startuml
title US-021 - BQT tổng hợp & xuất báo cáo nhanh
left to right direction
actor "Ban quản trị\n(BQT)" as Board
rectangle "Hệ thống" {
  usecase "Admin chọn mẫu báo cáo" as U21A
  usecase "Admin lọc dữ liệu báo cáo" as U21B
  usecase "Admin xuất báo cáo nhanh" as U21C
}
Board --> U21A
Board --> U21B
Board --> U21C
@enduml

@startuml
title US-022 - BQT sao lưu dữ liệu định kỳ
left to right direction
actor "Ban quản trị\n(BQT)" as Board
rectangle "Hệ thống" {
  usecase "Admin lên lịch sao lưu" as U22A
  usecase "Admin kiểm tra trạng thái sao lưu" as U22B
  usecase "Admin khôi phục dữ liệu khi cần" as U22C
  usecase "Hệ thống thực hiện sao lưu" as U22D
  usecase "Hệ thống lưu lịch sử & cảnh báo lỗi" as U22E
}
Board --> U22A
Board --> U22B
Board --> U22C
Board --> U22D
Board --> U22E
@enduml

@startuml
title US-023 - Kế toán email nhắc hạn thanh toán
left to right direction
actor "Kế toán\n(Accountant)" as Accountant
actor "Cư dân\n(Resident)" as Resident
actor "Quản trị viên\n(Admin/BQT)" as Admin
rectangle "Hệ thống" {
  usecase "Accountant cấu hình lịch nhắc hạn" as U23A
  usecase "Accountant gửi email nhắc hạn" as U23B
  usecase "Accountant theo dõi mở email" as U23C
  usecase "Resident nhận nhắc hạn" as U23D
  usecase "Resident mở hóa đơn để thanh toán" as U23E
  usecase "Admin giám sát tỷ lệ gửi/nhận" as U23F
  usecase "Admin chỉnh nội dung mẫu email" as U23G
}
Accountant --> U23A
Accountant --> U23B
Accountant --> U23C
Resident --> U23D
Resident --> U23E
Admin --> U23F
Admin --> U23G
@enduml

@startuml
title US-024 - Cư dân báo mất tài sản khu vực chung
left to right direction
actor "Cư dân\n(Resident)" as Resident
actor "Ban quản trị\n(BQT)" as Board
actor "Cán bộ công an\n(Security Officer)" as Police
rectangle "Hệ thống" {
  usecase "Resident tạo báo cáo mất tài sản" as U24A
  usecase "Resident cập nhật trạng thái báo cáo" as U24B
  usecase "Admin tiếp nhận & phân công xử lý" as U24C
  usecase "Admin cập nhật tiến độ xử lý" as U24D
  usecase "Police truy cập báo cáo mất tài sản" as U24E
  usecase "Police hỗ trợ điều tra/thu hồi" as U24F
}
Resident --> U24A
Resident --> U24B
Board --> U24C
Board --> U24D
Police --> U24E
Police --> U24F
@enduml
