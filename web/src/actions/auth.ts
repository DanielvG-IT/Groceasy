"use server";

import { cookies } from "next/headers";
import { backendFetch } from "@/lib/fetcher";

const ACCESS_TOKEN_COOKIE = "accessToken";

async function setAccessToken(token: string) {
  (await cookies()).set({
    name: ACCESS_TOKEN_COOKIE,
    value: token,
    httpOnly: true, // protect from XSS
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 15, // 15 min
  });
}

export async function registerAction(
  firstName: string,
  lastName: string,
  email: string,
  password: string
) {
  const res = await backendFetch("/api/v1/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // required for refreshToken cookie
    body: JSON.stringify({ name, email, password }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.message || "Registration failed");
  }

  const data = await res.json();
  await setAccessToken(data.token);
  return data;
}

export async function loginAction(
  email: string,
  password: string,
  rememberMe: boolean
) {
  const res = await backendFetch("/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // required for refreshToken cookie
    body: JSON.stringify({ email, password, rememberMe }),
  });

  if (!res.ok) throw new Error("Invalid credentials");

  const data = await res.json();
  await setAccessToken(data.token);
  return data;
}

export async function logoutAction() {
  await backendFetch("/api/v1/auth/logout", {
    method: "POST",
    credentials: "include",
  });
  (await cookies()).delete(ACCESS_TOKEN_COOKIE);
}

export async function getProfileAction() {
  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) throw new Error("Not authenticated");

  const res = await backendFetch("/api/v1/user/profile", {
    headers: { Authorization: `Bearer ${accessToken}` },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch profile");
  }

  return res.json();
}
