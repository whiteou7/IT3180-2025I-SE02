export type Property = {
  propertyId: number
  propertyName: string
  userId: string | null
  isPublic: boolean
}

export type Vehicle = {
  vehicleId: number
  propertyId: number
  licensePlate: string
}