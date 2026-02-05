import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, User } from '@/types';

// Mock users storage (in a real app, this would be a backend)
const getStoredUsers = (): Record<string, { password: string; user: User }> => {
  const users = localStorage.getItem('flowmind_users');
  return users ? JSON.parse(users) : {};
};

const storeUsers = (users: Record<string, { password: string; user: User }>) => {
  localStorage.setItem('flowmind_users', JSON.stringify(users));
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        const users = getStoredUsers();
        const userData = users[email.toLowerCase()];
        
        if (userData && userData.password === password) {
          set({ user: userData.user, isAuthenticated: true });
          return true;
        }
        return false;
      },

      register: async (email: string, password: string, name: string) => {
        const users = getStoredUsers();
        const normalizedEmail = email.toLowerCase();
        
        if (users[normalizedEmail]) {
          return false; // User already exists
        }

        const newUser: User = {
          id: crypto.randomUUID(),
          email: normalizedEmail,
          name,
          createdAt: new Date().toISOString(),
        };

        users[normalizedEmail] = { password, user: newUser };
        storeUsers(users);
        
        set({ user: newUser, isAuthenticated: true });
        return true;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'flowmind_auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
