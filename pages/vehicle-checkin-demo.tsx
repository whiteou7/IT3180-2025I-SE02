import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ofetch } from "ofetch"
import { toast } from "sonner"
import { APIBody } from "@/types/api"
import { useUserStore } from "@/store/userStore"
import { useRouter } from "next/router"

type VehicleInfo = {
  vehicleId: number
  propertyId: number
  licensePlate: string
}

type CheckInStatus = "idle" | "checking" | "success" | "error"

export default function VehicleCheckInDemo() {
  const { userId } = useUserStore()
  const router = useRouter()
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo | null>(null)
  const [checkInStatus, setCheckInStatus] = useState<CheckInStatus>("idle")
  const [lastCheckInTime, setLastCheckInTime] = useState<string | null>(null)
  const [isInside, setIsInside] = useState<boolean>(false)
  const [loading, setLoading] = useState(false)

  // Fetch vehicle info
  const fetchVehicleInfo = async () => {
    if (!userId) return
    setLoading(true)
    try {
      const res = await ofetch<APIBody<VehicleInfo>>(
        `/api/users/${userId}/vehicle-info`,
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
      const res = await ofetch<APIBody<any[]>>(
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
        toast.success(res.message || "Check-in successful!")
        
        // Reset status after animation
        setTimeout(() => {
          setCheckInStatus("idle")
        }, 2000)
      } else {
        setCheckInStatus("error")
        toast.error(res.message || "Check-in failed")
        
        // Reset status after error
        setTimeout(() => {
          setCheckInStatus("idle")
        }, 2000)
      }
    } catch (err) {
      console.error(err)
      setCheckInStatus("error")
      toast.error("Check-in failed")
      
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
            <p className="text-muted-foreground mb-4">Please log in to access vehicle check-in</p>
            <Button onClick={() => router.push("/login")}>
              Go to Login
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
            <p className="text-muted-foreground mb-4">No vehicle registered</p>
            <Button onClick={() => router.push("/")}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Vehicle Check-In Demo
          </h1>
          <p className="text-lg text-gray-600">
            Simulate vehicle entry and exit with visual feedback
          </p>
        </div>

        {/* Main Check-in Card */}
        <Card className="mb-8 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Vehicle Check-In</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Vehicle Info */}
            <div className="text-center space-y-2">
              <div className="flex justify-center items-center gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">License Plate</p>
                  <p className="text-xl font-bold">{vehicleInfo.licensePlate}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Vehicle ID</p>
                  <p className="text-xl font-bold">{vehicleInfo.vehicleId}</p>
                </div>
              </div>
              
              {/* Status Badge */}
              <div className="flex justify-center">
                <Badge 
                  variant={isInside ? "default" : "secondary"}
                  className="text-sm px-4 py-2"
                >
                  {isInside ? "Inside Property" : "Outside Property"}
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
                      Checking In...
                    </div>
                  ) : checkInStatus === "success" ? (
                    "✓ Check-In Successful!"
                  ) : checkInStatus === "error" ? (
                    "✗ Check-In Failed"
                  ) : (
                    isInside ? "Check Out" : "Check In"
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
                <p className="text-sm text-muted-foreground">Last Check-in:</p>
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
            <CardTitle className="text-xl">Demo Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">How it works:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Click "Check In" to simulate vehicle entry</li>
                  <li>• Click "Check Out" to simulate vehicle exit</li>
                  <li>• Visual animations provide feedback</li>
                  <li>• Status updates in real-time</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Real-world implementation:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• RFID/NFC card readers</li>
                  <li>• License plate recognition</li>
                  <li>• Mobile app integration</li>
                  <li>• Automatic gate control</li>
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
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
