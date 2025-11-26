import type { UserRole, Gender } from "./enum"

export type User = {
  userId: string
  email: string
  fullName: string
  role: UserRole
  yearOfBirth: number | null
  gender: Gender | null
  apartmentId?: number | null
}