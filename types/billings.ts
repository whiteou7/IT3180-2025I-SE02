export type BillingService = {
  serviceId: number
  serviceName: string
  price: number
  description: string | null
  tax: number
}

export type BillingDetail = {
  billingId: string
  userId: string
  fullName: string
  services: BillingService[]
  totalPrice: number
}

export type TaxReport = {
  billingIds: string[]
  totalIncome: number
  totalTax: number
}
