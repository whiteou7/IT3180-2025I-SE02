import type { BillingStatus } from "./enum"

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
  billingStatus: BillingStatus
  dueDate: string
  periodStart: string
  periodEnd: string
  paidAt?: string | null
}

export type BillingSummary = {
  billingId: string
  userId: string
  fullName: string
  billingStatus: BillingStatus
  dueDate: string
  periodStart: string
  periodEnd: string
  paidAt?: string | null
  totalAmount: number
  serviceCount: number
  services: BillingService[]
}

export type TaxReport = {
  billingIds: string[]
  totalIncome: number
  totalTax: number
}
