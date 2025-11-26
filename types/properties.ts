export type PropertyStatus = "found" | "not found" | "deleted"

export type PropertyType = "general" | "vehicle" | "document" | "electronics" | "other"

export type Property = {
  propertyId: number
  propertyName: string
  userId: string | null
  isPublic: boolean
  propertyType: PropertyType
  status: PropertyStatus
  createdAt: string
  licensePlate?: string | null
}

export type PropertySummary = Property & {
  ownerName?: string | null
  totalReports?: number
  lastReportedAt?: string | null
}

export type Vehicle = {
  vehicleId: number
  propertyId: number
  licensePlate: string
}