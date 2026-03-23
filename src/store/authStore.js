import { create } from 'zustand';
import { fcl } from '@/lib/flow/client';
import {
  getMagicSession,
  loginWithMagicLink as magicLoginWithEmailOTP,
  logoutMagicSession,
} from '@/lib/auth/magic';

function resolveSession(flowUser, magicUser) {
  if (flowUser?.loggedIn) {
    return {
      user: flowUser,
      isAuthenticated: true,
      authMethod: 'flow_wallet',
      canTransact: Boolean(flowUser.addr),
    };
  }

  if (magicUser?.loggedIn) {
    return {
      user: magicUser,
      isAuthenticated: true,
      authMethod: 'magic_link',
      canTransact: false,
    };
  }

  return {
    user: null,
    isAuthenticated: false,
    authMethod: null,
    canTransact: false,
  };
}

const useAuthStore = create((set, get) => ({
  user: null,
  flowUser: null,
  magicUser: null,
  isAuthenticated: false,
  authMethod: null,
  canTransact: false,
  sessionReady: false,
  loading: false,
  error: null,

  login: async () => {
    set({ loading: true, error: null });
    try {
      await fcl.authenticate();
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  loginWithMagicLink: async (email) => {
    set({ loading: true, error: null });

    try {
      const magicUser = await magicLoginWithEmailOTP(email);

      if (!magicUser) {
        throw new Error('Magic Link login completed but no user session was returned.');
      }

      set((state) => ({
        magicUser,
        ...resolveSession(state.flowUser, magicUser),
        loading: false,
        sessionReady: true,
      }));
    } catch (error) {
      set({ error: error.message || 'Magic Link login failed', loading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ loading: true });

    try {
      await fcl.unauthenticate();
    } catch (_) {
      // Continue clearing local auth state even if Flow logout fails.
    }

    try {
      await logoutMagicSession();
    } catch (error) {
      if (!String(error?.message || '').includes('NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY')) {
        set({ error: error.message, loading: false });
        return;
      }
    }

    set({
      user: null,
      flowUser: null,
      magicUser: null,
      isAuthenticated: false,
      authMethod: null,
      canTransact: false,
      loading: false,
      sessionReady: true,
    });
  },

  initAuth: () => {
    set({ loading: true, error: null });

    fcl.currentUser.subscribe((flowUser) => {
      set((state) => ({
        flowUser,
        ...resolveSession(flowUser, state.magicUser),
        loading: false,
        sessionReady: true,
      }));
    });

    (async () => {
      try {
        const magicUser = await getMagicSession();
        set((state) => ({
          magicUser,
          ...resolveSession(state.flowUser, magicUser),
          loading: false,
          sessionReady: true,
        }));
      } catch (error) {
        if (!String(error?.message || '').includes('NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY')) {
          set({ error: error.message, loading: false, sessionReady: true });
          return;
        }

        set((state) => ({
          magicUser: null,
          ...resolveSession(state.flowUser, null),
          loading: false,
          sessionReady: true,
        }));
      }
    })();
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
