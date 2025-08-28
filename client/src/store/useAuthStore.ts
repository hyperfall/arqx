import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  user: { email: string; id: string } | null;
  signIn: (email: string) => Promise<void>;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      signIn: async (email: string) => {
        // Mock authentication - in real app this would use Supabase
        set({
          isAuthenticated: true,
          user: { email, id: 'mock-user-id' },
        });
      },
      signOut: () => {
        set({
          isAuthenticated: false,
          user: null,
        });
      },
    }),
    {
      name: 'toolforge-auth-storage',
    }
  )
);
