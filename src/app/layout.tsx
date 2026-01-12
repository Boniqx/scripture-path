import type { Metadata } from "next";
import { Inter, Crimson_Pro } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/providers/AuthProvider";
import { div } from "framer-motion/client";
import { GuestSync } from "@/components/GuestSync";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const crimsonPro = Crimson_Pro({
  subsets: ["latin"],
  variable: "--font-crimson-pro",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ScripturePath | Deep AI Bible Study",
  description:
    "Uncover the depths of Scripture with AI-powered inductive reasoning.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn(inter.variable, crimsonPro.variable)}>
      <body className="antialiased min-h-screen bg-[#0a0a0a] text-[#f5f5f0] overflow-x-hidden selection:bg-amber-900/30 selection:text-amber-200">
        <div className="grain" />
        <AuthProvider>
          <GuestSync />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
