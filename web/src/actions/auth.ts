"use server";

import { cookies } from "next/headers";
import { backendFetch } from "@/lib/fetcher";
import { parseApiError } from "@/lib/error";
import type { OperationResult } from "@/types/action";
import { tokenResponseDto } from "@/types/auth";

const ACCESS_TOKEN_COOKIE = "accessToken";

async function setAccessToken(token: string): Promise<void> {
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
): Promise<OperationResult> {
  const res = await backendFetch("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // required for refreshToken cookie
    body: JSON.stringify({ firstName, lastName, email, password }),
  });

  if (!res.ok) {
    return { ok: false, error: await parseApiError(res) };
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
    credentials: "include", // required for refreshToken cookie
    body: JSON.stringify({ email, password, rememberMe }),
  });

  if (!res.ok) {
    return { ok: false, error: await parseApiError(res) };
  }

  const data = (await res.json()) as tokenResponseDto;
  await setAccessToken(data.accessToken);
  return { ok: true }; // success, no data
}

export async function logoutAction(): Promise<OperationResult> {
  const res = await backendFetch("/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    return { ok: false, error: await parseApiError(res) };
  }

  (await cookies()).delete("accessToken");
  return { ok: true }; // success, no data
}

// export async function getProfileAction() {
//   const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
//   if (!accessToken) throw new Error("Not authenticated");

//   const res = await backendFetch("/user/profile", {
//     headers: { Authorization: `Bearer ${accessToken}` },
//     credentials: "include",
//   });

//   if (!res.ok) {
//     throw await parseApiError(res);
//   }

//   return res.json();
// }
