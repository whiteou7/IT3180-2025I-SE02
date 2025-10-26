import { create } from "zustand"
import { persist } from "zustand/middleware"

export type UserState = {
  userId: string
  role: "tenant" | "admin"
  setUser: (userId: string, role: "tenant" | "admin") => void
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
