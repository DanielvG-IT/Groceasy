import { Card } from "@/components/ui/card";
import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";
import "@/app/globals.css";

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      {/* Center card for form */}
      <Card className="w-full max-w-md p-6 sm:p-8 shadow-lg rounded-2xl bg-white dark:bg-gray-800">
        {/* Branding */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight dark:text-white">
            Groseasy
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Securely access your account
          </p>
        </div>

        {/* Page-specific form */}
        {children}
      </Card>
    </div>
  );
};

export default AuthLayout;
