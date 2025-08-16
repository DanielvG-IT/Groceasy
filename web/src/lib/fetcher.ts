"use server";

import { tokenResponseDto } from "@/types/auth";
import { cookies } from "next/headers";

const ACCESS_TOKEN_COOKIE = "accessToken";
const BACKEND_URL = process.env.BACKEND_API_URL;
const NODE_ENV = process.env.NODE_ENV;

async function setAccessToken(token: string) {
  (await cookies()).set({
    name: ACCESS_TOKEN_COOKIE,
    value: token,
    httpOnly: true,
    secure: NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 15,
  });
}

export async function backendFetch(
  input: string,
  init: RequestInit = {},
  retry = true
) {
  console.log(`Sending request to: ${BACKEND_URL}${input}`);
  let token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;

  // Add Authorization header if we have a token
  init.headers = {
    ...init.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  init.credentials = "include"; // send refreshToken cookie automatically

  let res = await fetch(`${BACKEND_URL}${input}`, init);

  // If token expired → try refresh once
  if (res.status === 401 && retry) {
    const refreshRes = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!refreshRes.ok) {
      (await cookies()).delete(ACCESS_TOKEN_COOKIE);
      throw new Error("Session expired");
    }

    const refreshData = (await refreshRes.json()) as tokenResponseDto;
    await setAccessToken(refreshData.accessToken);

    // Retry original request with new token
    token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
    init.headers = {
      ...init.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    res = await fetch(`${BACKEND_URL}${input}`, init);
  }

  return res;
}
