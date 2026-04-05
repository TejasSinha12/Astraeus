import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Navbar } from "@/components/Navbar";
import { ParticlesBackground } from "@/components/ui/ParticlesBackground";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { Sidebar } from "@/components/Sidebar";
import { PricingProvider } from "@/components/providers/PricingProvider";
import { Toaster } from "sonner";

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
  description: "Autonomous Swarm-as-a-Service — Deploy production-grade multi-agent AI with institutional billing, federated orchestration, and cryptographically signed governance.",
  keywords: ["AGI", "swarm intelligence", "multi-agent AI", "coding assistant", "AI infrastructure", "LLM orchestration"],
  metadataBase: new URL("https://astraeus-livid.vercel.app"),
  openGraph: {
    title: "Ascension Intelligence Platform",
    description: "Deploy production-grade multi-agent reasoning. Replace brittle LLM calls with a high-performance Swarm Execution API.",
    siteName: "Astraeus",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ascension | Next-Gen Swarm AGI",
    description: "Multi-agent AI infrastructure with signed billing, federated orchestration, and The Forge evolutionary branching.",
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "theme-color": "#00e5ff",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <PricingProvider>
        <html lang="en" className="dark">
          <body className={`${inter.variable} ${firaCode.variable} antialiased bg-background text-text-main selection:bg-primary/30 selection:text-white cursor-auto`}>
            <CustomCursor />
            <ParticlesBackground />
            <Navbar />
            <Sidebar />
            <main className="md:pl-64 flex-1 min-h-screen relative z-10 pt-16">
              {children}
            </main>
            <Toaster
              theme="dark"
              position="bottom-right"
              toastOptions={{
                className: "border border-white/10 bg-surface text-white font-sans",
                descriptionClassName: "text-muted font-mono text-xs mt-1"
              }}
            />
          </body>
        </html>
      </PricingProvider>
    </ClerkProvider>
  );
}
