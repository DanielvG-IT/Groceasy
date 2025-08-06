import { View, ActivityIndicator } from "react-native";
import { useAuthStore } from "@/lib/authStore";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { ROUTES } from "@/lib/routes";

export default function Index() {
  const router = useRouter();
  const { token, getToken } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      await getToken();
      setLoading(false);
    };
    checkAuth();
  }, [router, getToken]);

  useEffect(() => {
    if (!loading) {
      if (token) {
        router.replace(ROUTES.HOME);
      } else {
        router.replace(ROUTES.LOGIN);
      }
    }
  }, [loading, token, router]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
