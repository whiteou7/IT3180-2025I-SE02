export type User = {
  userId: string, 
  email: string, 
  fullName: string, 
  role: "tenant" | "admin",
  yearOfBirth: number
}