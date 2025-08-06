import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "@/stores/authStore";
import { ActivityIndicator, View } from "react-native";

const MainLayout = () => {
  const { isHydrated, tokenExpiry, token } = useAuthStore();

  // Wait for Zustand to hydrate before doing anything
  if (!isHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Redirect if no valid token
  const isTokenValid =
    token && tokenExpiry && new Date(tokenExpiry) > new Date();

  if (!isTokenValid) {
    return <Redirect href="/login" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
};

export default MainLayout;
