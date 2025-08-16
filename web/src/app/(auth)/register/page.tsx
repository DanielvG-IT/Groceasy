import { RegisterForm } from "@/components/auth/registerForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register | Groseasy",
  description: "Create a new account",
};

const RegisterPage = () => {
  return <RegisterForm />;
};

export default RegisterPage;
