import React, { ReactNode } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "@/styles/colors";

const SafeScreen: React.FC<{ children: ReactNode }> = ({ children }) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: insets.top,
        flex: 1,
        backgroundColor: COLORS.background,
      }}>
      {children}
    </View>
  );
};

export default SafeScreen;
