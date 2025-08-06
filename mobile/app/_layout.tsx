import SafeScreen from "@/components/SafeScreen";
import { Slot } from "expo-router";

export default function RootLayout() {
  return (
    <SafeScreen>
      <Slot screenOptions={{ headerShown: false }} />
    </SafeScreen>
  );
}
