import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistStorage, persist } from "zustand/middleware";
import { create } from "zustand";

export const asyncStorageAdapter: PersistStorage<any> = {
  getItem: async (name) => {
    const value = await AsyncStorage.getItem(name);
    return value ? JSON.parse(value) : null;
  },
  setItem: async (name, value) => {
    await AsyncStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: async (name) => {
    await AsyncStorage.removeItem(name);
  },
};

type AuthStore = {
  token: string | null;
  tokenExpiry: Date | null;
  refreshToken: string | null;
  refreshTokenExpiry: Date | null;

  setToken: (
    token: string,
    tokenExpiry: Date,
    refreshToken: string,
    refreshTokenExpiry: Date
  ) => void;
  getToken: () => string | null;
  removeToken: () => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      token: null,
      tokenExpiry: null,
      refreshToken: null,
      refreshTokenExpiry: null,

      setToken: (token, tokenExpiry, refreshToken, refreshTokenExpiry) =>
        set(() => {
          if (tokenExpiry <= new Date() || refreshTokenExpiry <= new Date()) {
            throw new Error("Token expiry dates must be in the future.");
          }
          return {
            token,
            tokenExpiry,
            refreshToken,
            refreshTokenExpiry,
          };
        }),

      getToken: () => {
        const { token, tokenExpiry } = get();
        if (token && tokenExpiry && new Date() < new Date(tokenExpiry)) {
          return token;
        }
        return null;
      },

      removeToken: () =>
        set(() => ({
          token: null,
          tokenExpiry: null,
          refreshToken: null,
          refreshTokenExpiry: null,
        })),
    }),
    {
      name: "auth-storage",
      storage: asyncStorageAdapter,
    }
  )
);
