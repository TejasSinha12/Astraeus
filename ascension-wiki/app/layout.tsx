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
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { BackToTop } from "@/components/ui/BackToTop";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

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
  alternates: {
    canonical: "https://astraeus-livid.vercel.app",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Ascension",
  "operatingSystem": "Web",
  "applicationCategory": "DeveloperApplication",
  "description": "Autonomous Swarm-as-a-Service — Deploy production-grade multi-agent AI.",
  "offers": {
    "@type": "Offer",
    "price": "0.00",
    "priceCurrency": "USD"
  }
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
          <head><meta name="viewport" content="width=device-width, initial-scale=1" />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
          </head>
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-background focus:rounded-lg focus:font-bold">Skip to main content</a><body className={`${inter.variable} ${firaCode.variable} antialiased bg-background text-text-main selection:bg-primary/30 selection:text-white cursor-auto`}>
            <CustomCursor />
            <ParticlesBackground />
            <Navbar />
            <ScrollProgress />
            <Sidebar />
            <main id="main-content" className="md:pl-64 flex-1 min-h-screen relative z-10 pt-16 px-4 md:px-8 max-w-7xl mx-auto">
              <Breadcrumbs />
              {children}
            </main>
            <BackToTop />
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
