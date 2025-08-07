import { LoginDto, RegisterModel, TokenResponseDto } from "@/models/auth";
import { useAuthStore } from "@/stores/authStore";
import { ApiErrorDto } from "@/models/error";
import Constants from "expo-constants";

const backendUrl = Constants.expoConfig?.extra?.backendUrl;
if (typeof backendUrl !== "string") {
  throw new Error("Missing or invalid backend URL in expo config.");
}

type AuthResult = { successMessage?: string; errorMessage?: string };

export const login = async (loginDto: LoginDto): Promise<AuthResult> => {
  const result = await postRequest<TokenResponseDto>("/auth/login", loginDto);

  if (result.errorMessage) return { errorMessage: result.errorMessage };

  const { token, tokenExpiry, refreshToken, refreshTokenExpiry } = result.data!;
  useAuthStore
    .getState()
    .setToken(
      token,
      new Date(tokenExpiry),
      refreshToken,
      new Date(refreshTokenExpiry)
    );

  return { successMessage: "Login successful!" };
};

export const logout = () => {
  useAuthStore.getState().removeToken();
};

export const register = async (
  registerDto: RegisterModel
): Promise<AuthResult> => {
  if (registerDto.password !== registerDto.confirmPassword) {
    return { errorMessage: "Passwords do not match. Please try again." };
  }

  const result = await postRequest("/auth/register", registerDto);

  if (result.errorMessage) return { errorMessage: result.errorMessage };

  return { successMessage: "Registration successful!" };
};

const postRequest = async <TResponse>(
  endpoint: string,
  body: any
): Promise<{ data?: TResponse; errorMessage?: string }> => {
  try {
    const response = await fetchWithTimeout(`${backendUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    if (response.status >= 500) {
      return { errorMessage: "Server error. Please try again later!" };
    }

    const text = await response.text();
    const parsed = text ? JSON.parse(text) : {};

    if (!response.ok) {
      return {
        errorMessage: (parsed as ApiErrorDto).title || "An error occurred.",
      };
    }

    return { data: parsed as TResponse };
  } catch (error: any) {
    return {
      errorMessage: error.message || "Something went wrong. Please try again!",
    };
  }
};

const fetchWithTimeout = (
  url: string,
  options: RequestInit = {},
  timeout = 10000
) =>
  Promise.race([
    fetch(url, options),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), timeout)
    ),
  ]);
