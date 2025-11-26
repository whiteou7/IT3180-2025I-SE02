import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { UserRole } from "@/types/enum"

export type UserState = {
  userId: string
  role: UserRole
  setUser: (userId: string, role: UserRole) => void
  clearUser: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userId: "",
      role: "tenant",
      setUser: (userId, role) => set({ userId, role }),
      clearUser: () => set({ userId: "", role: "tenant" }),
    }),
    {
      name: "user-storage", // localStorage key
      partialize: (state) => ({ userId: state.userId, role: state.role }), // only store what's needed
    }
  )
)
