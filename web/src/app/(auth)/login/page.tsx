"use client";

import { loginAction } from "@/actions/auth";
import { useRouter } from "next/navigation";
import { loginDto } from "@/types/auth";
import React, { useState } from "react";
import Link from "next/link";

import { Checkbox } from "@/components/ui/checkbox";
import { CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const LoginPage = () => {
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
      {/* Email Field */}
      <div className="">
        <Label htmlFor="email" className="block mb-2">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          className="transition duration-150 focus:ring-2 focus:ring-blue-400"
          required
        />
      </div>

      {/* Password Field */}
      <div className="mt-4">
        <Label htmlFor="password" className="block mb-2">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="********"
          className="transition duration-150 focus:ring-2 focus:ring-blue-400"
          required
        />
      </div>

      {/* Remember Me + Forgot Password */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-2">
          <Checkbox id="remember" name="rememberMe" />
          <Label htmlFor="remember" className="text-sm">
            Remember Me
          </Label>
        </div>
        <Link
          href="/forgot-password"
          className="text-sm text-blue-500 hover:underline">
          Forgot Password?
        </Link>
      </div>

      {/* Error Message */}
      {status === "error" && errorMessage && (
        <p className="text-sm text-red-500">{errorMessage}</p>
      )}

      {/* Success Message */}
      {successMessage && (
        <p className="text-sm text-green-500">{successMessage}</p>
      )}

      {/* Login Button */}
      <Button
        type="submit"
        className="w-full mt-2"
        disabled={status === "loading"}>
        {status === "loading" ? "Logging in..." : "Login"}
      </Button>

      {/* Optional social login buttons */}
      {/* 
      <div className="flex gap-2 justify-center mt-4">
      <Button variant="outline" className="flex-1">
        Login with Google
      </Button>
      <Button variant="outline" className="flex-1">
        Login with GitHub
      </Button>
      </div> 
      */}

      {/* Switch to Register */}
      <CardFooter className="pt-4 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Don’t have an account?{" "}
          <Link href="/register" className="text-blue-500 hover:underline">
            Register
          </Link>
        </p>
      </CardFooter>
    </form>
  );
};

export default LoginPage;
