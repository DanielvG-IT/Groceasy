import { loginDto, RegisterModel, tokenResponseDto } from "@/models/auth";
import { useAuthStore } from "@/stores/authStore";
import { ApiErrorDto } from "@/models/error";
import Constants from "expo-constants";

const backendUrl = Constants.expoConfig?.extra?.backendUrl;
if (!backendUrl) {
  throw new Error("Backend URL is not defined in the configuration.");
}

export const login = async (loginDto: loginDto) => {
  const reqOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginDto),
  };

  let request;

  try {
    request = await fetch(`${backendUrl}/auth/login`, reqOptions);
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
  } catch {
    return { errorMessage: "Failed to parse server response." };
  }

  if (!request.ok) {
    return {
      errorMessage: (response as ApiErrorDto).title || "An error occurred.",
    };
  }

  const tokenResponse = response as tokenResponseDto;
  useAuthStore
    .getState()
    .setToken(
      tokenResponse.token,
      new Date(tokenResponse.tokenExpiry),
      tokenResponse.refreshToken,
      new Date(tokenResponse.refreshTokenExpiry)
    );
  // TODO Make the cookies expire {expires: new Date(Date.now() + 7 days}

  return { successMessage: "Login successful!" };
};

export const logout = async () => {
  useAuthStore.getState().removeToken();
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
    request = await fetch(`${backendUrl}/auth/register`, reqOptions);
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
  } catch {
    return { errorMessage: "Failed to parse server response." };
  }

  if (!request.ok) {
    return {
      errorMessage: (response as ApiErrorDto).title || "An error occurred.",
    };
  }

  return { successMessage: "Registration successful!" };
};
