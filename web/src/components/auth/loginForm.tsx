"use client";

import Link from "next/link";
import React, { useState } from "react";
import { loginDto } from "@/types/auth";
import { useRouter } from "next/navigation";
import { loginAction } from "@/actions/auth";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

export const LoginForm: React.FC = () => {
  const router = useRouter();

  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setError] = useState<string>("");
  const [successMessage, setSuccess] = useState<string>("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setStatus("loading");

    const formData = new FormData(e.currentTarget);
    const data: loginDto = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      rememberMe: formData.get("rememberMe") === "on",
    };

    const result = await loginAction(
      data.email,
      data.password,
      data.rememberMe
    );

    if (!result.ok) {
      setError(result.error?.title ?? "Login failed");
      setStatus("error");
      return;
    }

    // Success
    setSuccess("Login successful! Redirecting...");
    setStatus("idle");
    router.push("/app");
  };

  return (
    <form className="space-y-4" onSubmit={handleLogin}>
      <div>
        <Label htmlFor="email" className="mb-2">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          className="mb-2"
        />
      </div>
      <div>
        <Label htmlFor="password" className="mb-2">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="********"
          required
          className="mb-2"
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox id="remember" name="rememberMe" />
          <Label htmlFor="remember">Remember Me</Label>
        </div>
        <Link
          href="/forgot-password"
          className="text-sm text-blue-500 hover:underline">
          Forgot Password?
        </Link>
      </div>
      {status === "error" && errorMessage && (
        <p className="mt-4 text-sm text-red-500">{errorMessage}</p>
      )}
      {successMessage && (
        <p className="mt-4 text-sm text-green-500">{successMessage}</p>
      )}
      <Button
        type="submit"
        className="w-full mt-2"
        disabled={status === "loading"}>
        {status === "loading" ? "Logging in..." : "Login"}
      </Button>
      <CardFooter className="pt-4 text-center">
        <p className="text-sm text-gray-500">
          Don’t have an account?{" "}
          <Link href="/register" className="text-blue-500 hover:underline">
            Register
          </Link>
        </p>
      </CardFooter>
    </form>
  );
};
