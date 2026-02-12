import { create } from "zustand";
import { persist } from "zustand/middleware";
import { configureApiClient } from "@vessel/network";
import { AppConfig } from "../config";
import { authService } from "../services/auth.service";

interface User {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;

  setToken: (token: string) => void;
  setUser: (user: User) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
  loginAsync: (email: string, password: string) => Promise<void>;
  registerAsync: (email: string, password: string) => Promise<void>;
}

/**
 * Reconfigure the singleton ApiClient with current auth state.
 * Called on login/logout to update the token provider.
 */
function reconfigureApiClient(): void {
  configureApiClient(
    AppConfig.apiBaseUrl,
    () => useAuthStore.getState().token,
    () => useAuthStore.getState().logout(),
  );
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setToken: (token) => set({ token, isAuthenticated: !!token }),
      setUser: (user) => set({ user }),

      login: (token, user) => {
        set({ token, user, isAuthenticated: true });
        reconfigureApiClient();
      },

      logout: () => {
        set({ token: null, user: null, isAuthenticated: false });
        reconfigureApiClient();
      },

      loginAsync: async (email: string, password: string) => {
        const response = await authService.login(email, password);
        set({
          token: response.access_token,
          user: response.user,
          isAuthenticated: true,
        });
        reconfigureApiClient();
      },

      registerAsync: async (email: string, password: string) => {
        await authService.register(email, password);
        // Registration doesn't auto-login; UI shows "Please login"
      },
    }),
    {
      name: "vessel-auth",
      onRehydrateStorage: () => {
        // Reconfigure ApiClient when store rehydration completes
        return () => reconfigureApiClient();
      },
    },
  ),
);

// Initial configuration on module load
reconfigureApiClient();
