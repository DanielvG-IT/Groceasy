import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { styles } from "@/assets/styles/auth.styles";
import { register } from "@/services/userService";
import { COLORS } from "@/assets/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { RegisterModel } from "@/models/auth";

const SignupScreen = () => {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const onSignUpPress = () => {
    setError("");
    const registerobj: RegisterModel = {
      firstName: firstName,
      lastName: lastName,
      email: emailAddress,
      password: password,
      confirmPassword: confirmPassword,
    };

    register(registerobj)
      .then(() => {
        router.replace("/login");
      })
      .catch((err) => {
        setError(err.message || "Registration failed. Please try again.");
      });
  };

  // const onVerifyPress = () => {};
  // const [code, setCode] = useState("");
  // const [pendingVerification, setPendingVerification] = useState(false);
  // if (pendingVerification) {
  //   return (
  //     <View style={styles.verificationContainer}>
  //       <Text style={styles.verificationTitle}>Verify your email</Text>

  //       {error ? (
  //         <View style={styles.errorBox}>
  //           <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
  //           <Text style={styles.errorText}>{error}</Text>
  //           <TouchableOpacity onPress={() => setError("")}>
  //             <Ionicons name="close" size={20} color={COLORS.textLight} />
  //           </TouchableOpacity>
  //         </View>
  //       ) : null}

  //       <TextInput
  //         style={[styles.verificationInput, error && styles.errorInput]}
  //         value={code}
  //         placeholder="Enter your verification code"
  //         placeholderTextColor={"#9A8478"}
  //         onChangeText={(code) => setCode(code)}
  //       />
  //       <TouchableOpacity style={styles.button} onPress={onVerifyPress}>
  //         <Text style={styles.buttonText}>Verify</Text>
  //       </TouchableOpacity>
  //     </View>
  //   );
  // }

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      enableAutomaticScroll={true}>
      <View style={styles.container}>
        {/* <Image
          source={require("../../assets/images/revenue-i2.png")}
          style={styles.illustration}
        /> */}

        <Text style={styles.title}>Create Account</Text>

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
          style={[
            styles.input,
            error && styles.errorInput,
            { height: 52 }, // Ensure consistent height
          ]}
          autoCapitalize="words"
          value={firstName}
          placeholderTextColor="#9A8478"
          placeholder="Enter first name"
          onChangeText={setFirstName}
        />

        <TextInput
          style={[
            styles.input,
            error && styles.errorInput,
            { height: 52 }, // Ensure consistent height
          ]}
          autoCapitalize="words"
          value={lastName}
          placeholderTextColor="#9A8478"
          placeholder="Enter last name"
          onChangeText={setLastName}
        />

        <TextInput
          style={[
            styles.input,
            error && styles.errorInput,
            { height: 52 }, // Ensure consistent height
          ]}
          autoCapitalize="none"
          value={emailAddress}
          placeholderTextColor="#9A8478"
          placeholder="Enter email"
          onChangeText={setEmailAddress}
        />

        <TextInput
          style={[styles.input, error && styles.errorInput]}
          value={password}
          placeholder="Enter password"
          placeholderTextColor="#9A8478"
          secureTextEntry={true}
          onChangeText={setPassword}
        />
        {/* TODO Add show password eye button */}
        <TextInput
          style={[styles.input, error && styles.errorInput]}
          value={password}
          placeholder="Confirm password"
          placeholderTextColor="#9A8478"
          secureTextEntry={true}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity style={styles.button} onPress={onSignUpPress}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.linkText}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default SignupScreen;
