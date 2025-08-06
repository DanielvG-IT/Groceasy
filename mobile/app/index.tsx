import { useEffect, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { useAuthStore } from "@/stores/authStore";

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = useAuthStore.getState().getToken();

      if (token) {
        router.replace("/home"); // route in (tabs) group
      } else {
        router.replace("/login"); // route in (auth) group
      }

      setIsReady(true);
    };

    checkAuth();
  }, [router]);

  if (!isReady) return null;

  if (!isReady) {
    return <Stack.Screen name="loader" options={{ headerShown: false }} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
