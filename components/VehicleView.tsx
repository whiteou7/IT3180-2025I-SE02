import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { ofetch } from "ofetch"
import { toast } from "sonner"
import { APIBody } from "@/types/api"
import { useRouter } from "next/router"

type VehicleInfo = {
  vehicleId: number
  propertyId: number
  licensePlate: string
}

type VehicleLog = {
  vehicleLogId: string
  entranceTime: Date
  exitTime: Date | null
}

type VehicleViewProps = {
  userId: string
}

export function VehicleView({ userId }: VehicleViewProps) {
  const router = useRouter()
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo | null>(null)
  const [vehicleLogs, setVehicleLogs] = useState<VehicleLog[]>([])
  const [loading, setLoading] = useState(false)
  const [licensePlate, setLicensePlate] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [newLicensePlate, setNewLicensePlate] = useState("")

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
        setLicensePlate(res.data.licensePlate)
      }
    } catch (err) {
      console.error(err)
      setVehicleInfo(null)
    } finally {
      setLoading(false)
    }
  }

  // Fetch vehicle logs
  const fetchVehicleLogs = async () => {
    if (!userId) return
    setLoading(true)
    try {
      const res = await ofetch<APIBody<VehicleLog[]>>(
        `/api/users/${userId}/vehicle-logs`,
        {
          ignoreResponseError: true,
        }
      )

      if (res.success) {
        setVehicleLogs(res.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVehicleInfo()
    fetchVehicleLogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const handleUpdateLicensePlate = async () => {
    if (!vehicleInfo) return

    setLoading(true)
    try {
      const res = await ofetch<APIBody<VehicleInfo>>(
        `/api/users/${userId}/vehicle/${vehicleInfo.vehicleId}`,
        {
          method: "PUT",
          body: { licensePlate },
          ignoreResponseError: true,
        }
      )

      if (res.success) {
        toast.success("License plate updated successfully")
        setIsEditing(false)
        fetchVehicleInfo()
      } else {
        toast.error(res.message ?? "Failed to update license plate")
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to update license plate")
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterVehicle = async () => {
    if (!newLicensePlate.trim()) {
      toast.error("Please enter a license plate")
      return
    }

    setLoading(true)
    try {
      const res = await ofetch<APIBody<VehicleInfo>>(
        `/api/users/${userId}/vehicle`,
        {
          method: "POST",
          body: { licensePlate: newLicensePlate.trim() },
          ignoreResponseError: true,
        }
      )

      if (res.success) {
        toast.success("Vehicle registered successfully")
        setIsRegistering(false)
        setNewLicensePlate("")
        fetchVehicleInfo()
      } else {
        toast.error(res.message ?? "Failed to register vehicle")
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to register vehicle")
    } finally {
      setLoading(false)
    }
  }

  // Get dates that have vehicle logs
  const getDatesWithLogs = () => {
    return vehicleLogs
      .filter((log) => log.entranceTime)
      .map((log) => {
        const date = new Date(log.entranceTime)
        return new Date(date.getFullYear(), date.getMonth(), date.getDate())
      })
  }

  if (loading && !vehicleInfo) {
    return <p>Loading...</p>
  }

  if (!vehicleInfo) {
    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold capitalize">Vehicle</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle Registration</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {!isRegistering ? (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  No vehicle registered
                </p>
                <Button onClick={() => setIsRegistering(true)}>
                  Register Vehicle
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="license-plate">License Plate</Label>
                  <Input
                    id="license-plate"
                    value={newLicensePlate}
                    onChange={(e) => setNewLicensePlate(e.target.value)}
                    placeholder="Enter license plate"
                    className="mt-2"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleRegisterVehicle}
                    disabled={loading || !newLicensePlate.trim()}
                  >
                    {loading ? "Registering..." : "Register Vehicle"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsRegistering(false)
                      setNewLicensePlate("")
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </>
    )
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold capitalize">Vehicle</h2>
        <Button 
          variant="outline" 
          onClick={() => router.push("/vehicle-checkin-demo")}
          className="flex items-center gap-2"
        >
          🚗 Demo Check-In
        </Button>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground">License Plate</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                  disabled={!isEditing}
                  className="max-w-xs"
                />
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleUpdateLicensePlate}
                      disabled={loading}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setLicensePlate(vehicleInfo.licensePlate)
                        setIsEditing(false)
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                )}
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Vehicle ID</Label>
              <p className="font-medium">{vehicleInfo.vehicleId}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4 flex justify-center">
              <Calendar
                className="w-[50%] bg-card"
                modifiers={{
                  hasLog: getDatesWithLogs(),
                }}
                modifiersClassNames={{
                  hasLog: "bg-primary text-primary-foreground rounded-md !text-sm",
                }}
              />
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {vehicleLogs.length === 0 ? (
                <p className="text-muted-foreground">No vehicle logs found</p>
              ) : (
                vehicleLogs.map((log) => (
                  <div
                    key={log.vehicleLogId}
                    className="border rounded-md p-3 text-sm"
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">Entrance</p>
                        <p className="text-muted-foreground">
                          {new Date(log.entranceTime).toLocaleString()}
                        </p>
                      </div>
                      {log.exitTime && (
                        <div>
                          <p className="font-medium">Exit</p>
                          <p className="text-muted-foreground">
                            {new Date(log.exitTime).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
