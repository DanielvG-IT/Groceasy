"use server";

import { cookies } from "next/headers";
import { tokenResponseDto } from "@/types/auth";
import { OperationResult } from "@/types/action";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

const ACCESS_TOKEN_COOKIE = "accessToken";
const REFRESH_TOKEN_COOKIE = "refreshToken";
const BACKEND_URL = process.env.BACKEND_API_URL!;
const NODE_ENV = process.env.NODE_ENV;

// --------------------
// Helpers
// --------------------

const getCookies = async (): Promise<ReturnType<typeof cookies>> => {
  return await cookies(); // await here so TypeScript knows it's the right type
};

function normalizeExpiry(expiry?: string | Date | number): Date | undefined {
  if (!expiry && expiry !== 0) return undefined;
  if (expiry instanceof Date) return expiry;
  if (typeof expiry === "number" || typeof expiry === "string") {
    const d = new Date(expiry);
    return isNaN(d.getTime()) ? undefined : d;
  }
  // Fallback: attempt to coerce to Date
  const d = new Date(expiry as unknown as string);
  return isNaN(d.getTime()) ? undefined : d;
}

export async function getAccessToken(): Promise<string | undefined> {
  const c = await getCookies();
  return c.get(ACCESS_TOKEN_COOKIE)?.value;
}

export async function setAccessToken(
  token: string,
  expiry?: string | Date | number
) {
  const c = await getCookies();
  const expiresDate = normalizeExpiry(expiry);
  c.set({
    name: ACCESS_TOKEN_COOKIE,
    value: token,
    httpOnly: true,
    secure: NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: expiresDate,
  });
}

export async function getRefreshToken(): Promise<string | undefined> {
  const c = await getCookies();
  return c.get(REFRESH_TOKEN_COOKIE)?.value;
}
export async function setRefreshToken(
  token: string,
  expiry?: string | Date | number
) {
  const c = await getCookies();
  const expiresDate = normalizeExpiry(expiry);
  c.set({
    name: REFRESH_TOKEN_COOKIE,
    value: token,
    httpOnly: true,
    secure: NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: expiresDate,
  });
}

export async function deleteRefreshToken() {
  const c = await getCookies();
  c.delete(REFRESH_TOKEN_COOKIE);
}

export async function deleteAccessToken() {
  const c = await getCookies();
  c.delete(ACCESS_TOKEN_COOKIE);
}

// --------------------
// Refresh token
// --------------------

export async function refreshAccessToken(): Promise<OperationResult> {
  const c = await getCookies();
  const refreshToken = c.get(REFRESH_TOKEN_COOKIE)?.value;

  console.log("Refreshing access token..."); // ! DEBUG: Delete this line

  if (!refreshToken) {
    console.warn("No refresh token found"); // ! DEBUG: Delete this line
    await deleteAccessToken();
    return {
      ok: false,
      error: { title: "No refresh token found", status: 401 },
    };
  }

  console.log("Found refresh token, sending request...", refreshToken); // ! DEBUG: Delete this line

  try {
    console.log("Imma send request"); // ! DEBUG: Delete this line
    const res = await axios.post<tokenResponseDto>(
      `${BACKEND_URL}/auth/refresh`,
      { refreshToken },
      {
        withCredentials: true,
        validateStatus: () => true, // so axios doesn’t throw on 4xx/5xx
      }
    );

    if (res.status < 200 || res.status >= 300) {
      console.warn("Failed to refresh access token:", res.status, res.data);
      await deleteAccessToken();
      return {
        ok: false,
        error: { title: "Refresh failed", status: res.status },
      };
    }

    const data = res.data;
    await setAccessToken(data.accessToken, data.accessTokenExpiry);
    await setRefreshToken(data.refreshToken, data.refreshTokenExpiry);

    return { ok: true };
  } catch (err) {
    console.error("Refresh token error:", err);
    await deleteAccessToken();
    return { ok: false, error: { title: "Refresh failed", status: 500 } };
  }
}

// --------------------
// Backend fetch
// --------------------

export async function backendFetch(
  path: string,
  config: AxiosRequestConfig = {},
  retry = true
): Promise<AxiosResponse> {
  const c = await getCookies();
  const token = c.get(ACCESS_TOKEN_COOKIE)?.value;

  const headers: Record<string, string> = {
    ...((config.headers as Record<string, string>) || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let res = await axios({
    url: `${BACKEND_URL}${path}`,
    method: config.method || "GET",
    headers,
    data: config.data,
    withCredentials: true,
    validateStatus: () => true, // so axios doesn’t throw on 4xx/5xx
  });

  if (res.status === 401 && retry) {
    const refresh = await refreshAccessToken();
    if (!refresh.ok) return res;

    const newToken = (await getCookies()).get(ACCESS_TOKEN_COOKIE)?.value;
    if (newToken) headers.Authorization = `Bearer ${newToken}`;

    res = await axios({
      url: `${BACKEND_URL}${path}`,
      method: config.method || "GET",
      headers,
      data: config.data,
      withCredentials: true,
      validateStatus: () => true,
    });
  }

  return res;
}
