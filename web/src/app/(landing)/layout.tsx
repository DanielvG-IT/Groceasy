import type { Metadata } from "next";
import Header from "@/components/landing/header";
import Footer from "@/components/landing/footer";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Groceasy",
  description: "Groceasy - Simplify your grocery shopping experience.",
};

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
      <Footer />
    </>
  );
}
