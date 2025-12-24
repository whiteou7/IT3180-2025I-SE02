import { useEffect } from "react"
import { useRouter } from "next/router"
import { Building2, Users, DollarSign, Shield, Bell, Wrench } from "lucide-react"
import { LoginForm } from "@/components/login-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useUserStore } from "@/store/userStore"

export default function HomePage() {
  const router = useRouter()
  const { userId } = useUserStore()

  useEffect(() => {
    // Redirect to dashboard if already logged in
    if (userId) {
      router.push("/dashboard")
    }
  }, [userId, router])

  const features = [
    {
      icon: Users,
      title: "Quản lý Cư dân",
      description: "Quản lý hồ sơ cư dân, căn hộ và kiểm soát ra vào",
    },
    {
      icon: Building2,
      title: "Quản lý Tài sản",
      description: "Theo dõi tài sản, đồ thất lạc và báo cáo tài sản",
    },
    {
      icon: DollarSign,
      title: "Thu Phí",
      description: "Xử lý thanh toán, hóa đơn và giao dịch tài chính",
    },
    {
      icon: Shield,
      title: "An ninh & Ra vào",
      description: "Giám sát kiểm soát ra vào và báo cáo an ninh",
    },
    {
      icon: Bell,
      title: "Giao tiếp",
      description: "Gửi thông báo và quản lý giao tiếp",
    },
    {
      icon: Wrench,
      title: "Dịch vụ Tòa nhà",
      description: "Quản lý danh mục dịch vụ và xử lý yêu cầu dịch vụ",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - System Information */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary text-primary-foreground flex aspect-square size-12 items-center justify-center rounded-lg">
                  <Building2 className="size-6" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">Hệ Thống Quản Lý Chung Cư</h1>
                  <p className="text-muted-foreground text-lg mt-1">
                    Giải pháp toàn diện cho các khu chung cư hiện đại
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground text-base leading-relaxed max-w-2xl">
                Tối ưu hóa hoạt động của khu chung cư với nền tảng quản lý tích hợp của chúng tôi.
                Từ hồ sơ cư dân đến thanh toán, quản lý tài sản đến an ninh - tất cả những gì bạn cần
                ở một nơi.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <Card key={index} className="border-border/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 text-primary p-2 rounded-lg">
                          <Icon className="size-5" />
                        </div>
                        <CardTitle className="text-base">{feature.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Additional Info */}
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Truy cập theo vai trò:</span> Quản trị viên, An ninh, Kế toán
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Báo cáo & Phân tích:</span> Tài chính, An ninh, Tổng hợp
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">Chào mừng trở lại</CardTitle>
                  <CardDescription>
                    Đăng nhập để truy cập bảng điều khiển quản lý chung cư
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LoginForm />
                </CardContent>
              </Card>
              
              {/* Quick Links */}
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Cần trợ giúp? Liên hệ quản trị viên hệ thống
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
