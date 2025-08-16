// "use client";

// import { Button } from "@/components/ui/button";
// import { useRouter } from "next/navigation";
// import React, { useState } from "react";
// import Link from "next/link";

// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

// export default function ForgotPasswordPage() {
//   const router = useRouter();

//   const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
//   const [errorMessage, setError] = useState<string>("");
//   const [successMessage, setSuccess] = useState<string>("");

//   const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setError("");
//     setSuccess("");
//     setStatus("loading");

//     const formData = new FormData(e.currentTarget);
//     const data = "";

//     const result = "await forgotPasswordAction";

//     // if (!result.ok) {
//     //   setError(result.error?.title ?? "Login failed");
//     //   setStatus("error");
//     //   return;
//     // }

//     // Success
//     setSuccess("Login successful! Redirecting...");
//     setStatus("idle");
//     router.push("/app");
//   };

//   return (
//     <form className="space-y-4">
//       <p className="text-sm text-gray-500 dark:text-gray-400">
//         Enter your email to reset your password.
//       </p>

//       <div>
//         <Label htmlFor="email">Email</Label>
//         <Input id="email" type="email" placeholder="you@example.com" />
//       </div>

//       <Button type="submit" className="w-full mt-2">
//         Send Reset Link
//       </Button>

//       <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-4">
//         Remember your password?{" "}
//         <Link href="/login" className="text-blue-500 hover:underline">
//           Login
//         </Link>
//       </p>
//     </form>
//   );
// }
