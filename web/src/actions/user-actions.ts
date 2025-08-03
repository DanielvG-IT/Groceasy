"use server";

import { cookies } from "next/headers";
import { loginDto, registerDto, RegisterModel } from "@/models/auth";
import { ApiErrorDto } from "@/models/error";
import { redirect } from "next/navigation";
import { tokenResponseDto } from "@/models/auth";

const backendApiUrl = process.env.BACKEND_API_URL;
if (!backendApiUrl) {
  throw new Error(
    "BACKEND_API_URL is not defined in the environment variables."
  );
}

export const login = async (loginDto: loginDto) => {
  const cookieStore = await cookies();

  const reqOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginDto),
  };

  let request;

  try {
    request = await fetch(`${backendApiUrl}/auth/login`, reqOptions);
  } catch (error: any) {
    if (error.message) {
      return { errorMessage: error.message };
    } else {
      return { errorMessage: "Something went wrong. Please try again!" };
    }
  }

  if (request.status >= 500 && request.status < 600) {
    return { errorMessage: "Server error. Please try again later!" };
  }

  let response;
  try {
    const text = await request.text();
    response = text ? JSON.parse(text) : {};
  } catch (error: any) {
    return { errorMessage: "Failed to parse server response." };
  }

  if (!request.ok) {
    return {
      errorMessage: (response as ApiErrorDto).title || "An error occurred.",
    };
  }

  const tokenResponse = response as tokenResponseDto;
  cookieStore.set("token", tokenResponse.token);
  cookieStore.set("refreshToken", tokenResponse.refreshToken); // TODO Make the cookies expire {expires: new Date(Date.now() + 7 days}

  return { successMessage: "Login successful!" };
};

export const logout = async () => {
  const cookieStore = await cookies();

  cookieStore.delete("token");
  redirect("/auth/login"); // TODO May redirect to root /
};

export const register = async (registerDto: RegisterModel) => {
  if (registerDto.password !== registerDto.confirmPassword) {
    return { errorMessage: "Passwords do not match. Please try again." };
  }

  const reqOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(registerDto),
  };

  let request;
  try {
    request = await fetch(`${backendApiUrl}/auth/register`, reqOptions);
  } catch (error: any) {
    if (error.message) {
      return { errorMessage: error.message };
    } else {
      return { errorMessage: "Something went wrong. Please try again!" };
    }
  }

  if (request.status >= 500 && request.status < 600) {
    return { errorMessage: "Server error. Please try again later!" };
  }

  let response;
  try {
    const text = await request.text();
    response = text ? JSON.parse(text) : {};
  } catch (error: any) {
    return { errorMessage: "Failed to parse server response." };
  }

  console.log(request.status);
  console.log(response);

  if (!request.ok) {
    return {
      errorMessage: (response as ApiErrorDto).title || "An error occurred.",
    };
  }

  return { successMessage: "Registration successful!" };
};
