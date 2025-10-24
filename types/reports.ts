export type PropertyReport = {
  propertyReportId: string
  userId: string | null
  propertyId: number | null
  status: string
  createdAt: string
  issuerId?: string | null
  updatedAt: string
  userFullName: string
  issuerFullName: string | null
  propertyName: string
  content: string | null
}