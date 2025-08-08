import { View, Text, Button } from "react-native";
import { logout } from "@/services/userService";
import React from "react";

const HomeScreen = () => {
  return (
    <View>
      <Text>HomeScreen</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
};

export default HomeScreen;
