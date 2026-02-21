import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Project Ascension | AGI Research Framework",
  description: "Advanced AGI research framework focused on modular cognition, autonomous reasoning, and recursive self-improvement.",
};

import { Sidebar } from "@/components/Sidebar";
import { ParticlesBackground } from "@/components/ui/ParticlesBackground";
import { CustomCursor } from "@/components/ui/CustomCursor";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${firaCode.variable} antialiased bg-background text-text-main selection:bg-primary/30 selection:text-white cursor-auto`}>
        <CustomCursor />
        <ParticlesBackground />
        <Sidebar />
        <main className="md:pl-64 flex-1 min-h-screen relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
