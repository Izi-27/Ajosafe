import { create } from 'zustand';
import { fcl } from '@/lib/flow/client';
import {
  getMagicSession,
  loginWithMagicLink as magicLoginWithEmailOTP,
  logoutMagicSession,
} from '@/lib/auth/magic';
import {
  bootstrapWalletlessSession,
  fetchWalletlessProfile,
} from '@/lib/auth/walletless';

function resolveSession(flowUser, magicUser, walletlessProfile) {
  if (flowUser?.loggedIn) {
    if (magicUser?.loggedIn) {
      return {
        user: flowUser,
        isAuthenticated: true,
        authMethod: 'flow_wallet',
        authMode: 'flow_linked_hybrid',
        canTransact: Boolean(flowUser.addr),
      };
    }

    return {
      user: flowUser,
      isAuthenticated: true,
      authMethod: 'flow_wallet',
      authMode: 'flow_self_custody',
      canTransact: Boolean(flowUser.addr),
    };
  }

  if (magicUser?.loggedIn) {
    return {
      user: {
        ...magicUser,
        addr: walletlessProfile?.managedFlowAddress || magicUser.addr || null,
      },
      isAuthenticated: true,
      authMethod: 'magic_link',
      authMode: walletlessProfile?.authMode || 'magic_walletless',
      canTransact: false,
    };
  }

  return {
    user: null,
    isAuthenticated: false,
    authMethod: null,
    authMode: null,
    canTransact: false,
  };
}

const useAuthStore = create((set, get) => ({
  user: null,
  flowUser: null,
  magicUser: null,
  walletlessProfile: null,
  isAuthenticated: false,
  authMethod: null,
  authMode: null,
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

      let walletlessProfile = null;
      try {
        walletlessProfile = await bootstrapWalletlessSession({
          issuer: magicUser.issuer,
          email: magicUser.email,
        });
      } catch (_) {
        // Non-blocking to keep login flow resilient.
      }

      set((state) => ({
        magicUser,
        walletlessProfile,
        ...resolveSession(state.flowUser, magicUser, walletlessProfile),
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
      walletlessProfile: null,
      isAuthenticated: false,
      authMethod: null,
      authMode: null,
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
        ...resolveSession(flowUser, state.magicUser, state.walletlessProfile),
        loading: false,
        sessionReady: true,
      }));
    });

    (async () => {
      try {
        const magicUser = await getMagicSession();

        let walletlessProfile = null;
        if (magicUser?.loggedIn) {
          try {
            walletlessProfile = await fetchWalletlessProfile({
              issuer: magicUser.issuer,
              email: magicUser.email,
            });
          } catch (_) {
            try {
              walletlessProfile = await bootstrapWalletlessSession({
                issuer: magicUser.issuer,
                email: magicUser.email,
              });
            } catch (_) {
              walletlessProfile = null;
            }
          }
        }

        set((state) => ({
          magicUser,
          walletlessProfile,
          ...resolveSession(state.flowUser, magicUser, walletlessProfile),
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
          walletlessProfile: null,
          ...resolveSession(state.flowUser, null, null),
          loading: false,
          sessionReady: true,
        }));
      }
    })();
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
