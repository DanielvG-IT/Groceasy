import { View, Text, TextInput, Button, Alert } from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { ROUTES } from "@/lib/routes";
import { useAuthStore } from "@/lib/authStore";
import { signin } from "@/services/userService";
import { loginDto } from "@/models/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [successMessage, setSuccess] = useState("");
  const [errorMessage, setError] = useState("");

  const router = useRouter();

  const handleLogin = async () => {
    setError("");
    setSuccess("");

    try {
      const dto = {
        email,
        password,
        rememberMe,
      } as loginDto;

      const { token, storeToken, removeToken, getToken } =
        useAuthStore.getState();

      const result = await signin(dto, {
        token,
        storeToken,
        removeToken,
        getToken,
      });

      if (result.errorMessage) {
        setError(result.errorMessage);
        return;
      }

      if (result.successMessage) {
        setSuccess(result.successMessage);
        router.push(ROUTES.HOME);
      }

      router.replace(ROUTES.HOME);
    } catch {
      Alert.alert("Login failed");
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        padding: 20,
      }}>
      <Text
        style={{
          fontSize: 32,
          fontWeight: "bold",
          marginBottom: 20,
          color: "#333",
        }}>
        Welcome Back
      </Text>
      {errorMessage && (
        <Text style={{ color: "red", marginBottom: 10 }}>{errorMessage}</Text>
      )}
      {successMessage && (
        <Text style={{ color: "green", marginBottom: 10 }}>
          {successMessage}
        </Text>
      )}
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{
          width: "100%",
          height: 50,
          borderColor: "#ccc",
          borderWidth: 1,
          borderRadius: 8,
          paddingHorizontal: 10,
          marginBottom: 15,
          backgroundColor: "#fff",
        }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          width: "100%",
          height: 50,
          borderColor: "#ccc",
          borderWidth: 1,
          borderRadius: 8,
          paddingHorizontal: 10,
          marginBottom: 15,
          backgroundColor: "#fff",
        }}
      />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 20,
        }}>
        <Text style={{ fontSize: 16, color: "#333" }}>Remember Me</Text>
        <Text
          onPress={() => setRememberMe(!rememberMe)}
          style={{
            width: 20,
            height: 20,
            borderWidth: 1,
            borderColor: "black",
            marginLeft: 8,
            textAlign: "center",
            backgroundColor: "#fff",
            lineHeight: 20,
          }}>
          {rememberMe ? "✔" : ""}
        </Text>
      </View>
      <Button title="Login" onPress={handleLogin} color="#007BFF" />
    </View>
  );
};

export default Login;
