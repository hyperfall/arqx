import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@supabase/supabase-js';
import { toolRepo } from '../../../src/repositories';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  checkAuthStatus: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,
      
      signIn: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const authMethods = toolRepo.getAuthMethods();
          
          if (authMethods) {
            // Use real Supabase authentication
            const user = await authMethods.signIn(email, password);
            set({
              isAuthenticated: true,
              user,
              isLoading: false,
              error: null
            });
          } else {
            // Mock authentication for development
            const mockUser: User = {
              id: 'mock-user-id',
              email,
              created_at: new Date().toISOString(),
              app_metadata: {},
              user_metadata: {},
              aud: 'authenticated',
              confirmation_sent_at: undefined,
              confirmed_at: new Date().toISOString(),
              email_confirmed_at: new Date().toISOString(),
              phone: undefined,
              phone_confirmed_at: undefined,
              last_sign_in_at: new Date().toISOString(),
              role: 'authenticated',
              updated_at: new Date().toISOString(),
              identities: []
            };
            
            set({
              isAuthenticated: true,
              user: mockUser,
              isLoading: false,
              error: null
            });
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Sign in failed'
          });
          throw error;
        }
      },
      
      signUp: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const authMethods = toolRepo.getAuthMethods();
          
          if (authMethods) {
            // Use real Supabase authentication
            const user = await authMethods.signUp(email, password);
            if (user) {
              set({
                isAuthenticated: true,
                user,
                isLoading: false,
                error: null
              });
            } else {
              set({
                isLoading: false,
                error: 'Please check your email for confirmation'
              });
            }
          } else {
            // Mock sign up
            const mockUser: User = {
              id: 'mock-user-id',
              email,
              created_at: new Date().toISOString(),
              app_metadata: {},
              user_metadata: {},
              aud: 'authenticated',
              confirmation_sent_at: undefined,
              confirmed_at: new Date().toISOString(),
              email_confirmed_at: new Date().toISOString(),
              phone: undefined,
              phone_confirmed_at: undefined,
              last_sign_in_at: new Date().toISOString(),
              role: 'authenticated',
              updated_at: new Date().toISOString(),
              identities: []
            };
            
            set({
              isAuthenticated: true,
              user: mockUser,
              isLoading: false,
              error: null
            });
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Sign up failed'
          });
          throw error;
        }
      },
      
      signOut: async () => {
        set({ isLoading: true });
        
        try {
          const authMethods = toolRepo.getAuthMethods();
          
          if (authMethods) {
            await authMethods.signOut();
          }
          
          set({
            isAuthenticated: false,
            user: null,
            isLoading: false,
            error: null
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Sign out failed'
          });
        }
      },
      
      clearError: () => {
        set({ error: null });
      },
      
      checkAuthStatus: async () => {
        set({ isLoading: true });
        
        try {
          const authMethods = toolRepo.getAuthMethods();
          
          if (authMethods) {
            const isAuth = await authMethods.isAuthenticated();
            if (isAuth) {
              const user = await authMethods.getCurrentUser();
              set({
                isAuthenticated: true,
                user,
                isLoading: false
              });
            } else {
              set({
                isAuthenticated: false,
                user: null,
                isLoading: false
              });
            }
          } else {
            // Keep existing state for mock mode
            set({ isLoading: false });
          }
        } catch (error) {
          set({
            isAuthenticated: false,
            user: null,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Auth check failed'
          });
        }
      }
    }),
    {
      name: 'toolforge-auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user
      })
    }
  )
);
