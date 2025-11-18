import type { BillingService } from "@/types/billings"

export function calculateServiceFinalPrice(service: BillingService): number {
  const taxAmount = (service.price * service.tax) / 100
  return Number((service.price + taxAmount).toFixed(2))
}

export function calculateServiceTaxAmount(service: BillingService): number {
  const taxAmount = (service.price * service.tax) / 100
  return Number(taxAmount.toFixed(2))
}

export function calculateBillingTotal(services: BillingService[]): number {
  const total = services.reduce((sum, service) => {
    return sum + calculateServiceFinalPrice(service)
  }, 0)
  return Number(total.toFixed(2))
}

export function calculateBillingTaxTotal(services: BillingService[]): number {
  const totalTax = services.reduce((sum, service) => {
    return sum + calculateServiceTaxAmount(service)
  }, 0)
  return Number(totalTax.toFixed(2))
}
