import { View, Text, TextInput, Button, Alert } from "react-native";
import React from "react";

const login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login: loginStore } = useAuthStore();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const result = await (email, password);
      await loginStore(result.token);
      router.replace("/home");
    } catch {
      Alert.alert("Login failed");
    }
  };

  return (
    <View>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

export default login;
