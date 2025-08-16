import type { ApiErrorDto } from "@/types/error";

export type OperationResult<TData = void> =
  | { ok: true } // Action succeeded without returning any data
  | { ok: true; data: TData } // Action succeeded and returned data
  | { ok: false; error: ApiErrorDto }; // Action failed and returned an error
