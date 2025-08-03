import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const useAuth = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return redirect("/auth/login");
  }

  return [token];
};
