import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { UserRole } from "@/types/enum"

export type UserState = {
  userId: string
  fullName: string
  role: UserRole
  setUser: (userId: string, role: UserRole, fullName: string) => void
  clearUser: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userId: "",
      role: "tenant",
      fullName: "",
      setUser: (userId, role, fullName) => set({ userId, role, fullName }),
      clearUser: () => set({ userId: "", role: "tenant", fullName: "" }),
    }),
    {
      name: "user-storage", // localStorage key
      partialize: (state) => ({ userId: state.userId, role: state.role, fullName: state.fullName }), // only store what's needed
    }
  )
)
