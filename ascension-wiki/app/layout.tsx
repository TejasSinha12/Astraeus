import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Navbar } from "@/components/Navbar";
import { ParticlesBackground } from "@/components/ui/ParticlesBackground";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ascension | Production AGI Infrastructure",
  description: "Institutional-grade AI infrastructure for high-performance reasoning, automated research, and cryptographically verifiable AGI orchestration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={`${inter.variable} ${firaCode.variable} antialiased bg-background text-text-main selection:bg-primary/30 selection:text-white cursor-auto`}>
          <CustomCursor />
          <ParticlesBackground />
          <Navbar />
          <Sidebar />
          <main className="md:pl-64 flex-1 min-h-screen relative z-10 pt-16">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
