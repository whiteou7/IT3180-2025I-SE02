export type User = {
  userId: string, 
  email: string, 
  fullName: string, 
  role: "tenant" | "admin",
  year_of_birth: number
}