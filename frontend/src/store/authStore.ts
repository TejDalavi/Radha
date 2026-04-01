import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  userId: string | null;
  role: string | null;
  isApproved: boolean;
  setAuth: (token: string, userId: string, role: string, isApproved: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userId: null,
      role: null,
      isApproved: false,
      setAuth: (token, userId, role, isApproved) => set({ token, userId, role, isApproved }),
      logout: () => set({ token: null, userId: null, role: null, isApproved: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
