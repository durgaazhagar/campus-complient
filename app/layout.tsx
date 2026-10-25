import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { DesktopNav } from "@/components/desktop-nav";
import { BottomNav } from "@/components/bottom-nav";
import { ChatBot } from "@/components/chatbot";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CollegeFix - Complaint Management System",
  description:
    "Report and track college maintenance complaints with AI-powered photo analysis",
  metadataBase: new URL("https://collegefix.app"),
  openGraph: {
    title: "CollegeFix - Complaint Management System",
    description:
      "Report and track college maintenance complaints with AI-powered photo analysis",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CollegeFix - Complaint Management System",
    description:
      "Report and track college maintenance complaints with AI-powered photo analysis",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DesktopNav />
        <main className="min-h-screen pb-20 md:pb-0">{children}</main>
        <BottomNav />
        <ChatBot />
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
