"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { RegisterModel } from "@/types/auth";
import { registerAction } from "@/actions/auth";

const RegisterPage = () => {
  const router = useRouter();

  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [errorMessage, setError] = useState<string>("");
  const [successMessage, setSuccess] = useState<string>("");

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    setSuccess("");
    setError("");

    e.preventDefault();
    setStatus("loading");
    const formData = new FormData(e.currentTarget);
    const data: RegisterModel = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };
    registerAction(data.firstName, data.lastName, data.email, data.password)
      .then((result) => {
        if (result?.errorMessage) {
          setError(result.errorMessage);
          setStatus("idle");
        } else if (result?.successMessage) {
          setSuccess(result?.successMessage);
          redirectToLogin();
        }
      })
      .catch((error) => {
        setError(error?.message || "An error occurred during registration.");
        setStatus("idle");
      });
  };

  const redirectToLogin = () => {
    router.push("/login");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center">Register</h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                required
                className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                required
                className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
              />
            </div>
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
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
              className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
          {errorMessage && (
            <p className="mt-1 mb-1 text-sm text-red-500">{errorMessage}</p>
          )}
          {successMessage && (
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
                Registering...
              </span>
            ) : (
              "Register"
            )}
          </button>
        </form>
        <div className="text-center">
          <button
            onClick={redirectToLogin}
            className="text-blue-500 hover:underline focus:outline-none">
            Already have an account?
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
