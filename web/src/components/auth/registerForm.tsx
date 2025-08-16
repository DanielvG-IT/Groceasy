"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { RegisterModel } from "@/types/auth";
import { registerAction } from "@/actions/auth";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const RegisterForm: React.FC = () => {
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [errorMessage, setError] = useState<string>("");
  const [successMessage, setSuccess] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="flex space-x-4">
        <div className="flex-1">
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" name="firstName" placeholder="John" required />
        </div>
        <div className="flex-1">
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" name="lastName" placeholder="Doe" required />
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
        />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="********"
          required
        />
      </div>

      <div>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="********"
          required
        />
      </div>

      {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
      {successMessage && (
        <p className="text-sm text-green-500">{successMessage}</p>
      )}

      <Button
        type="submit"
        className="w-full mt-2"
        disabled={status === "loading"}>
        {status === "loading" ? "Registering..." : "Register"}
      </Button>

      <p className="text-sm text-center text-gray-500 mt-4">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-500 hover:underline">
          Login
        </Link>
      </p>
    </form>
  );
};
