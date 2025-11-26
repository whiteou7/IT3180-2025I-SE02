import type { User } from "./users"

export type ApartmentMember = Pick<User, "userId" | "fullName" | "email">

export type Apartment = {
  apartmentId: number
  buildingId: number
  floor: number
  monthlyFee: number
  apartmentNumber: number
  members?: ApartmentMember[]
}