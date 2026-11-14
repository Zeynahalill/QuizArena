import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type AdminAuthState = {
  token: string | null
  setToken: (token: string) => void
  logout: () => void
}

export const useAdminAuth = create<AdminAuthState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }),
      logout: () => set({ token: null }),
    }),
    { name: 'quizarena-admin-auth' },
  ),
)
