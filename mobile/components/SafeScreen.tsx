import React, { ReactNode } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SafeScreenProps {
  children: ReactNode;
  backgroundColor?: string;
  style?: ViewStyle;
}

const SafeScreen = ({
  children,
  backgroundColor = "#f9f9f9",
  style,
}: SafeScreenProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 15, backgroundColor },
        style, // apply additional styles
      ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    flex: 1,
  } as ViewStyle,
});

export default SafeScreen;
