import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { styles } from "@/assets/styles/auth.styles";
import { COLORS } from "@/assets/styles/colors";
import { login } from "@/services/userService";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { LoginDto } from "@/models/auth";

const LoginScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onLoginPress = async () => {
    setError("");
    setLoading(true);

    if (!emailAddress || !password) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    try {
      const logindto = {
        email: emailAddress,
        password: password,
        rememberMe: true,
      } as LoginDto;

      const loginResult = await login(logindto);
      if (loginResult.errorMessage) {
        setError(loginResult.errorMessage || "Login failed. Please try again.");
        setLoading(false);
      }

      if (loginResult.successMessage) {
        setLoading(false);
        router.replace("/");
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      extraScrollHeight={30}>
      <View style={styles.container}>
        {/* <Image
          source={require("../../assets/images/revenue-i4.png")}
          style={styles.illustration}
        /> */}
        <Text style={styles.title}>Welcome Back</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => setError("")}>
              <Ionicons name="close" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>
        ) : null}

        <TextInput
          style={[styles.input, error && styles.errorInput]}
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Enter email"
          placeholderTextColor="#9A8478"
          onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
        />

        <TextInput
          style={[styles.input, error && styles.errorInput]}
          value={password}
          placeholder="Enter password"
          placeholderTextColor="#9A8478"
          secureTextEntry={true}
          onChangeText={(password) => setPassword(password)}
        />

        {loading ? (
          <TouchableOpacity
            style={[
              styles.button,
              {
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#808080",
              },
            ]}
            disabled={true}>
            <Text style={styles.buttonText}>Logging in...</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.button}
            onPress={onLoginPress}
            disabled={loading}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
        )}

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Don&apos;t have an account?</Text>

          <Link href="/signup" asChild>
            <TouchableOpacity>
              <Text style={styles.linkText}>Sign up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default LoginScreen;
