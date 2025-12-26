import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ofetch } from "ofetch"
import { toast } from "sonner"
import { APIBody } from "@/types/api"
import { useUserStore } from "@/store/userStore"
import { useRouter } from "next/router"
import { Vehicle, VehicleLog } from "@/types/vehicles"

type CheckInStatus = "idle" | "checking" | "success" | "error"

export default function VehicleCheckInDemo() {
  const { userId } = useUserStore()
  const router = useRouter()
  const [vehicleInfo, setVehicleInfo] = useState<Vehicle | null>(null)
  const [checkInStatus, setCheckInStatus] = useState<CheckInStatus>("idle")
  const [lastCheckInTime, setLastCheckInTime] = useState<string | null>(null)
  const [isInside, setIsInside] = useState<boolean>(false)
  const [loading, setLoading] = useState(false)

  // Fetch vehicle info
  const fetchVehicleInfo = async () => {
    if (!userId) return
    setLoading(true)
    try {
      const res = await ofetch<APIBody<Vehicle>>(
        `/api/users/${userId}/vehicles`,
        {
          ignoreResponseError: true,
        }
      )

      if (res.success) {
        setVehicleInfo(res.data)
      }
    } catch (err) {
      console.error(err)
      setVehicleInfo(null)
    } finally {
      setLoading(false)
    }
  }

  // Check current vehicle status
  const checkVehicleStatus = async () => {
    if (!userId) return
    try {
      const res = await ofetch<APIBody<VehicleLog[]>>(
        `/api/users/${userId}/vehicle-logs`,
        {
          ignoreResponseError: true,
        }
      )

      if (res.success && res.data.length > 0) {
        const latestLog = res.data[0]
        setIsInside(latestLog.exitTime === null)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchVehicleInfo()
      checkVehicleStatus()
    }
  }, [userId])

  const handleCheckIn = async () => {
    if (!userId || !vehicleInfo) return

    setCheckInStatus("checking")
    
    try {
      const res = await ofetch<APIBody<{ time: string }>>(
        `/api/users/${userId}/vehicle/checkin`,
        {
          method: "POST",
          ignoreResponseError: true,
        }
      )

      if (res.success) {
        setCheckInStatus("success")
        setLastCheckInTime(res.data.time)
        setIsInside(!isInside)
        toast.success(res.message || "Ghi nhận ra/vào thành công!")
        
        // Reset status after animation
        setTimeout(() => {
          setCheckInStatus("idle")
        }, 2000)
      } else {
        setCheckInStatus("error")
        toast.error(res.message || "Ghi nhận ra/vào thất bại")
        
        // Reset status after error
        setTimeout(() => {
          setCheckInStatus("idle")
        }, 2000)
      }
    } catch (err) {
      console.error(err)
      setCheckInStatus("error")
      toast.error((err as Error).message || "Ghi nhận ra/vào thất bại")
      
      setTimeout(() => {
        setCheckInStatus("idle")
      }, 2000)
    }
  }

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Vui lòng đăng nhập để sử dụng tính năng ghi nhận ra/vào xe</p>
            <Button onClick={() => router.push("/login")}>
              Đi tới đăng nhập
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!vehicleInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Chưa có xe nào được đăng ký</p>
            <Button onClick={() => router.push("/")}>
              Về bảng điều khiển
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Mô phỏng ra/vào xe
          </h1>
          <p className="text-lg text-gray-600">
            Thử mô phỏng xe vào/ra với phản hồi trực quan
          </p>
        </div>

        {/* Main Check-in Card */}
        <Card className="mb-8 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Ghi nhận ra/vào xe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Vehicle Info */}
            <div className="text-center space-y-2">
              <div className="flex justify-center items-center gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Biển số</p>
                  <p className="text-xl font-bold">{vehicleInfo.licensePlate}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Mã xe</p>
                  <p className="text-xl font-bold">{vehicleInfo.vehicleId}</p>
                </div>
              </div>
              
              {/* Status Badge */}
              <div className="flex justify-center">
                <Badge 
                  variant={isInside ? "default" : "secondary"}
                  className="text-sm px-4 py-2"
                >
                  {isInside ? "Đang ở trong khu vực" : "Đang ở ngoài khu vực"}
                </Badge>
              </div>
            </div>

            {/* Check-in Button with Animation */}
            <div className="flex justify-center">
              <div className="relative">
                <Button
                  size="lg"
                  onClick={handleCheckIn}
                  disabled={checkInStatus === "checking"}
                  className={`
                    px-8 py-4 text-lg font-semibold transition-all duration-300
                    ${checkInStatus === "checking" 
      ? "animate-pulse bg-blue-600 hover:bg-blue-700" 
      : checkInStatus === "success"
        ? "bg-green-600 hover:bg-green-700 animate-bounce"
        : checkInStatus === "error"
          ? "bg-red-600 hover:bg-red-700"
          : "bg-primary hover:bg-primary/90"
    }
                  `}
                >
                  {checkInStatus === "checking" ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Đang ghi nhận...
                    </div>
                  ) : checkInStatus === "success" ? (
                    "✓ Ghi nhận thành công!"
                  ) : checkInStatus === "error" ? (
                    "✗ Ghi nhận thất bại"
                  ) : (
                    isInside ? "Ghi nhận ra" : "Ghi nhận vào"
                  )}
                </Button>

                {/* Ripple Animation */}
                {checkInStatus === "checking" && (
                  <div className="absolute inset-0 rounded-lg bg-blue-400 animate-ping opacity-20"></div>
                )}
              </div>
            </div>

            {/* Last Check-in Time */}
            {lastCheckInTime && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Lần gần nhất:</p>
                <p className="font-medium">
                  {new Date(lastCheckInTime).toLocaleString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Demo Information */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Thông tin mô phỏng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Cách hoạt động:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Nhấn “Ghi nhận vào” để mô phỏng xe vào</li>
                  <li>• Nhấn “Ghi nhận ra” để mô phỏng xe ra</li>
                  <li>• Có hiệu ứng để báo trạng thái</li>
                  <li>• Trạng thái được cập nhật ngay</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Ứng dụng thực tế:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Quẹt thẻ ra/vào</li>
                  <li>• Nhận diện biển số</li>
                  <li>• Kết nối ứng dụng điện thoại</li>
                  <li>• Tự động điều khiển cổng</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Dashboard */}
        <div className="text-center mt-8">
          <Button 
            variant="outline" 
            onClick={() => router.push("/")}
            className="px-6"
          >
            Về bảng điều khiển
          </Button>
        </div>
      </div>
    </div>
  )
}