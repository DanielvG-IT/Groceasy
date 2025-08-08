import { useAuthStore } from "@/stores/authStore";
import { Redirect, Stack } from "expo-router";

const MainLayout = () => {
  const token = useAuthStore((state) => state.token);

  if (token) return <Redirect href="/login" />; // TODO Fix the authStore because when logging in, I get imidietly redirected to the login page again

  return <Stack screenOptions={{ headerShown: false }} />;
};

export default MainLayout;
