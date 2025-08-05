import { Slot, useRouter } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/authStore";
import { ROUTES } from "@/lib/routes";

export default function AppLayout() {
  const { token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.replace(ROUTES.LOGIN);
    }
  }, [token, router]);

  return <Slot />;
}
