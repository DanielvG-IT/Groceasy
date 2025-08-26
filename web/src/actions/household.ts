"use server";

import { parseApiError } from "@/lib/error";
import { backendFetch } from "@/lib/fetcher";
import { OperationResult } from "@/types/action";
import { createHouseholdDto, Household } from "@/types/household";

export const createHouseholdAction = async (
  data: createHouseholdDto
): Promise<OperationResult<Household>> => {
  const res = await backendFetch("/household", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // required for refreshToken cookie
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    return { ok: false, error: await parseApiError(res) };
  }

  const resData: Household = await res.json();
  return { ok: true, data: resData };
};

export const getHouseholdAction = async (): Promise<
  OperationResult<Household>
> => {
  const res = await backendFetch("/household", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    return { ok: false, error: await parseApiError(res) };
  }

  const resData: Household = await res.json();
  return { ok: true, data: resData };
};
