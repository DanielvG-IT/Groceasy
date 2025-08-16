import { ApiErrorDto } from "@/types/error";

export async function parseApiError(res: Response): Promise<ApiErrorDto> {
  try {
    const data = (await res.json()) as Partial<ApiErrorDto>;
    return {
      title: data.title || "Unexpected error",
      status: data.status ?? res.status,
      errorCode: data.errorCode,
      timestamp: data.timestamp,
    };
  } catch {
    return { title: res.statusText || "Unexpected error", status: res.status };
  }
}
