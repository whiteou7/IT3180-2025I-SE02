import type { PropertyStatus } from "./properties"

export type PropertyReport = {
  propertyReportId: string
  ownerId: string | null
  propertyId: number | null
  status: PropertyStatus
  createdAt: string
  issuerId?: string | null
  updatedAt: string
  ownerFullName: string
  issuerFullName: string | null
  propertyName: string
  content: string | null
  issuedStatus: PropertyStatus | null
  approved: boolean
}