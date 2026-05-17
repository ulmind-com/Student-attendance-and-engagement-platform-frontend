import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Student Attendance and Engagement Platform",
  description: "A premium emotional wellness and engagement platform for students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.variable, outfit.variable, "font-sans antialiased bg-slate-50")}>
        {/* Animated Background blobs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-300/30 blur-3xl animate-blob"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-300/30 blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-pink-300/30 blur-3xl animate-blob" style={{ animationDelay: '4s' }}></div>
        </div>
        {children}
      </body>
    </html>
  );
}
