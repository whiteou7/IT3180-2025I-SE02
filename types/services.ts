import type { ServiceCategory } from "./enum"

export type Service = {
  serviceId: number
  serviceName: string
  price: number
  description: string | null
  tax: number
  category: ServiceCategory
  isAvailable: boolean
  updatedAt: string
}
