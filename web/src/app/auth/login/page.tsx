"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/actions/user-actions";
import { loginDto } from "@/models/auth";

const LoginPage = () => {
  const router = useRouter();

  const [status, setStatus] = useState<string>("idle");
  const [errorMessage, setError] = useState<string>("");
  const [successMessage, setSuccess] = useState<string>("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    const formData = new FormData(e.currentTarget);
    const data: loginDto = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      rememberMe: false,
    };
    login(data).then((result) => {
      if (result?.errorMessage) {
        setError(result.errorMessage);
        setStatus("error");
      } else if (result.successMessage) {
        setSuccess(result?.successMessage);
        router.push("/dashboard");
      }
    });
  };

  const redirectToRegister = () => {
    router.push("/auth/register");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
          {(status === "error" || errorMessage) && (
            <p className="mt-1 mb-1 text-sm text-red-500">{errorMessage}</p>
          )}
          {(status === "success" || successMessage) && (
            <p className="mt-1 mb-1 text-sm text-green-500">{successMessage}</p>
          )}
          <button
            type="submit"
            className={`w-full px-4 py-2 text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-md shadow-md hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
              status === "loading" ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={status === "loading"}>
            {status === "loading" ? (
              <span className="flex items-center justify-center">
                <svg
                  className="w-5 h-5 mr-2 text-white animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </button>
        </form>
        <div className="text-center">
          <button
            onClick={redirectToRegister}
            className="text-blue-500 hover:underline focus:outline-none">
            Haven't got an account yet?
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
