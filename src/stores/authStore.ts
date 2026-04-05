import { create } from "zustand";
import type { User, RegisterData } from "@/types/user";
import * as authApi from "@/lib/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) {
        set({ token, isAuthenticated: true });
        get().fetchUser();
      } else {
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    const token = response.access_token;

    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", token);
    }

    set({ token, isAuthenticated: true });
    await get().fetchUser();
  },

  register: async (data: RegisterData) => {
    await authApi.register(data);
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  fetchUser: async () => {
    try {
      const user = await authApi.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
      }
    }
  },
}));
