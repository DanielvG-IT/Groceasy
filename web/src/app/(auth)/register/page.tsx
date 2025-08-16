"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { RegisterModel } from "@/types/auth";
import { registerAction } from "@/actions/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const RegisterPage = () => {
  const router = useRouter();

  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [errorMessage, setError] = useState<string>("");
  const [successMessage, setSuccess] = useState<string>("");

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    setStatus("loading");

    const formData = new FormData(e.currentTarget);
    const data: RegisterModel = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    const result = await registerAction(
      data.firstName,
      data.lastName,
      data.email,
      data.password
    );

    if (!result.ok) {
      setError(result.error?.title ?? "Registration failed");
      setStatus("idle");
      return;
    }

    // Success
    setSuccess("Registration successful! Redirecting to login...");
    setStatus("idle");
    router.push("/login");
  };

  return (
    <form className="space-y-4" onSubmit={handleRegister}>
      <div className="flex space-x-4">
        <div className="flex-1">
          <Label htmlFor="firstName" className="block mb-2">
            First Name
          </Label>
          <Input id="firstName" placeholder="John" className="p-2" />
        </div>
        <div className="flex-1">
          <Label htmlFor="lastName" className="block mb-2">
            Last Name
          </Label>
          <Input id="lastName" placeholder="Doe" className="p-2" />
        </div>
      </div>
      <div className="mt-4">
        <Label htmlFor="email" className="block mb-2">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          className="p-2"
        />
      </div>
      <div className="mt-4">
        <Label htmlFor="password" className="block mb-2">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="********"
          className="p-2"
        />
      </div>
      <div className="mt-4">
        <Label htmlFor="confirm" className="block mb-2">
          Confirm Password
        </Label>
        <Input
          id="confirm"
          type="password"
          placeholder="********"
          className="p-2"
        />
      </div>

      {errorMessage && (
        <p className="text-sm text-red-500 dark:text-red-400">{errorMessage}</p>
      )}
      {successMessage && (
        <p className="text-sm text-green-500 dark:text-green-400">
          {successMessage}
        </p>
      )}

      <Button type="submit" className="w-full mt-2">
        Register
      </Button>

      <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-4">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-500 hover:underline">
          Login
        </Link>
      </p>
    </form>
  );
};

export default RegisterPage;
