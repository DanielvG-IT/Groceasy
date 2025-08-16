import { LoginForm } from "@/components/auth/loginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Groseasy",
  description: "Login to access your account",
};

const LoginPage = () => {
  return <LoginForm />;
};

export default LoginPage;
