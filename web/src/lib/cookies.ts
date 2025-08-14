import { cookies } from "next/headers";

export async function setCookie(
  name: string,
  value: string,
  options?: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "strict" | "lax" | "none";
    path?: string;
    maxAge?: number;
  }
) {
  (await cookies()).set({
    name,
    value,
    httpOnly: options?.httpOnly ?? false,
    secure: options?.secure ?? process.env.NODE_ENV === "production",
    sameSite: options?.sameSite ?? "strict",
    path: options?.path ?? "/",
    maxAge: options?.maxAge,
  });
}

export async function getCookie(name: string): Promise<string | undefined> {
  return (await cookies()).get(name)?.value;
}

export async function deleteCookie(name: string) {
  (await cookies()).delete(name);
}
