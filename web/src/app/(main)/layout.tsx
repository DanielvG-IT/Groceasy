"use client";

import { getProfileAction, logoutAction } from "@/actions/auth";
import { CurrentUserDto } from "@/types/auth";
import { useEffect, useState } from "react";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [userData, setUserData] = useState<CurrentUserDto | null>(null);

  useEffect(() => {
    const fetchProfile = async (): Promise<void> => {
      try {
        const res = await getProfileAction();

        if ("error" in res && res.error) {
          if (res.error.status === 404) {
            // TODO: Give user modal to create or join a household
          }
          console.error("Household not found");
          return;
        }

        if (!res.ok) {
          console.error("Failed to fetch household:", res.error);
          return;
        }

        if ("data" in res) {
          setUserData(res.data);
          return;
        }

        console.error("Unexpected response format");
        return;
      } catch (error) {
        console.error("An error occurred while fetching the household:", error);
        return;
      }
    };

    fetchProfile();
  }, []);
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex justify-between items-center p-4 shadow bg-white">
        <h1 className="text-xl font-bold">Groceasy</h1>
        <div>
          <div className="w-10 h-10 rounded-full bg-gray-300"></div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">
              Hello, {userData ? userData.firstName : "User"}
            </span>
            <button
              className="text-blue-500 hover:underline"
              onClick={() => {
                logoutAction();
              }}>
              Logout
            </button>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
