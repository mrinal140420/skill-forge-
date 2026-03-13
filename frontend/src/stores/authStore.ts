import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { normalizeRole } from '@/lib/authRole';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  linkedin?: string;
  github?: string;
  role: 'student' | 'instructor' | 'admin';
  createdAt?: string;
  lastActivityAt?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      
      setUser: (user) => {
        const normalizedUser = user ? { ...user, role: normalizeRole(user.role) } : null;
        set({ user: normalizedUser, isAuthenticated: !!normalizedUser });
      },
      setToken: (token) => set({ token }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
      }),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      merge: (persistedState, currentState) => {
        const typedPersistedState = persistedState as Partial<AuthState>;
        const persistedUser = typedPersistedState.user
          ? { ...typedPersistedState.user, role: normalizeRole(typedPersistedState.user.role) }
          : null;

        return {
          ...currentState,
          ...typedPersistedState,
          user: persistedUser,
          isAuthenticated: !!persistedUser,
        };
      },
    }
  )
);
