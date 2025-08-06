import { Redirect } from "expo-router";
import { useAuthStore } from "@/stores/authStore";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const { isHydrated, tokenExpiry, token } = useAuthStore();

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const isTokenValid =
    token && tokenExpiry && new Date(tokenExpiry) > new Date();

  return isTokenValid ? <Redirect href="/home" /> : <Redirect href="/login" />;
}
