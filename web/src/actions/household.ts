"use server";

import { parseApiError } from "@/lib/error";
import { backendFetch } from "@/lib/fetcher";
import { OperationResult } from "@/types/action";
import { createHouseholdDto, UserHousehold } from "@/types/household";

export const createHouseholdAction = async (
  data: createHouseholdDto
): Promise<OperationResult> => {
  const res = await backendFetch("/household", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // required for refreshToken cookie
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    return { ok: false, error: await parseApiError(res) };
  }

  return { ok: true }; // success, no data
};

export const getHouseholdsAction = async (): Promise<
  OperationResult<Array<UserHousehold>>
> => {
  const res = await backendFetch("/household", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    return { ok: false, error: await parseApiError(res) };
  }

  const respData: Array<UserHousehold> = await res.json();
  return { ok: true, data: respData };
};
