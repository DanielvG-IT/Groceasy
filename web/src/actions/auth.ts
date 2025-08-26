"use server";

import { parseApiError } from "@/lib/error";
import { CurrentUserDto, tokenResponseDto } from "@/types/auth";
import {
  backendFetch,
  deleteAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "@/lib/fetcher";
import type { OperationResult } from "@/types/action";

export async function registerAction(
  firstName: string,
  lastName: string,
  email: string,
  password: string
): Promise<OperationResult> {
  const res = await backendFetch("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: JSON.stringify({ firstName, lastName, email, password }),
  });

  if (res.status < 200 || res.status >= 300) {
    return { ok: false, error: await parseApiError(res.data) };
  }

  return { ok: true }; // success, no data
}

export async function loginAction(
  email: string,
  password: string,
  rememberMe: boolean
): Promise<OperationResult> {
  const res = await backendFetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: JSON.stringify({ email, password, rememberMe }),
  });

  if (res.status < 200 || res.status >= 300) {
    return { ok: false, error: await parseApiError(res.data) };
  }

  try {
    const raw = res.data;
    if (!raw || typeof raw !== "object") {
      return {
        ok: false,
        error: {
          title: "Invalid login response",
          errorCode: "LoginFailed",
          status: 500,
        },
      };
    }
    const data = raw as tokenResponseDto;
    if (typeof data.accessToken !== "string") {
      return {
        ok: false,
        error: {
          title: "Malformed token response: invalid accessTokenExpiry",
          errorCode: "LoginFailed",
          status: 500,
        },
      };
    }

    // Parse expiry into a Date and validate it
    const expiryDate = new Date(String(data.accessTokenExpiry));
    if (Number.isNaN(expiryDate.getTime())) {
      return {
        ok: false,
        error: {
          title: "Malformed token response: invalid accessTokenExpiry",
          errorCode: "LoginFailed",
          status: 500,
        },
      };
    }

    // Use the Date object for cookie/session expiry handling
    await setAccessToken(data.accessToken, expiryDate);
    await setRefreshToken(data.refreshToken, expiryDate);
    return { ok: true }; // success, no data
  } catch (error) {
    // Normalize unknown catch value to a string message
    const message =
      error instanceof Error ? error.message : String(error ?? "Unknown error");
    console.error("Failed to parse login response:", message); // TODO: Implement proper error handling
    return {
      ok: false,
      error: { title: message, errorCode: "LoginFailed", status: 500 },
    };
  }
}

export async function logoutAction(): Promise<OperationResult> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    return {
      ok: false,
      error: {
        title: "Missing Refresh Token",
        errorCode: "LogoutFailed",
        status: 400,
      },
    };
  }

  const res = await backendFetch("/auth/logout", {
    method: "POST",
    data: { refreshToken },
    withCredentials: true,
  });

  if (res.status < 200 || res.status >= 300) {
    const error = await parseApiError(res.data);
    console.error("Unexpected response from server:", res.status, error); // TODO: Implement proper error handling
    return { ok: false, error };
  }

  try {
    await deleteAccessToken();
  } catch (cookieError) {
    console.error("Failed to delete access token cookie:", cookieError); // TODO: Implement proper error handling
    return {
      ok: false,
      error: {
        title: "Cookie Error",
        errorCode: "CookieDeleteError",
        status: 500,
      },
    };
  }

  return { ok: true }; // success, no data
}

export async function getProfileAction(): Promise<
  OperationResult<CurrentUserDto>
> {
  const res = await backendFetch("/auth/me", {
    method: "GET",
    withCredentials: true,
  });

  if (res.status < 200 || res.status >= 300) {
    return { ok: false, error: await parseApiError(res.data) };
  }

  const respData: CurrentUserDto = await res.data;
  return { ok: true, data: respData };
}
