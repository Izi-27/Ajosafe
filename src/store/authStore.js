import { create } from 'zustand';
import { fcl } from '@/lib/flow/client';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  login: async () => {
    set({ loading: true, error: null });
    try {
      await fcl.authenticate();
      fcl.currentUser.subscribe((user) => {
        set({
          user,
          isAuthenticated: user.loggedIn,
          loading: false,
        });
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await fcl.unauthenticate();
      set({ user: null, isAuthenticated: false, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  initAuth: () => {
    fcl.currentUser.subscribe((user) => {
      set({
        user,
        isAuthenticated: user.loggedIn,
      });
    });
  },
}));

export default useAuthStore;
