import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthState = {
  token: string | null;
  storeToken: (token: string) => void;
  removeToken: () => void;
  getToken: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  storeToken: async (token: string) => {
    await AsyncStorage.setItem("token", token);
    set({ token });
  },
  removeToken: async () => {
    await AsyncStorage.removeItem("token");
    set({ token: null });
  },
  getToken: async () => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      set({ token });
    }
  },
}));
