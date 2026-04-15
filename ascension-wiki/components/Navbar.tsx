"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Brain, Zap, LayoutDashboard, Shield, Code, Wallet, Key, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { TopUpModal } from "@/components/auth/TopUpModal";
import { usePricing } from "@/components/providers/PricingProvider";
import { Activity } from "lucide-react";

export function Navbar() {
    const pathname = usePathname();
    const { user, isLoaded } = useUser();
    const [isTopUpOpen, setIsTopUpOpen] = useState(false);
    
    // Inject global pricing hooks
    const { surgeMultiplier, isLoading } = usePricing();
    const isSurging = surgeMultiplier > 1.2;

    const userRole = (user?.publicMetadata?.role as string) || "PUBLIC";
    const isAdmin = isLoaded && userRole.toUpperCase() === "ADMIN";

    const navLinks = [
        { href: "/pricing", label: "Pricing" },
        { href: "/docs/core", label: "Docs" },
        { href: "/settings/developer", label: "Developer", icon: Key },
        ...(isAdmin
            ? [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }]
            : [{ href: "/coding", label: "Dashboard", icon: Code }] // Non-admins see Arena as their Dashboard
        ),
    ];

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-6 md:px-8 border-b border-white/5 glass backdrop-blur-[20px] saturate-[1.8] supports-[backdrop-filter]:bg-background/60"
        >
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group mr-6 md:ml-64 relative">
                <div className="relative w-7 h-7 flex items-center justify-center">
                    <div className={cn(
                        "absolute inset-0 border-2 rounded-full animate-pulse opacity-50",
                        isSurging ? "border-red-500" : "border-primary"
                    )} />
                    <div className={cn(
                        "w-2.5 h-2.5 rounded-full box-glow transition-colors",
                        isSurging ? "bg-red-500" : "bg-primary"
                    )} />
                </div>
                <span className="text-base font-bold tracking-widest text-white group-hover:text-primary transition-colors hidden md:block">
                    ASCENSION
                </span>
                
                {/* Global Orchestrator Load Indicator */}
                {isLoading ? (<div className="absolute -bottom-5 left/1/2 -translate-x-1/2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-black/80 px-2 py-0.5 rounded border border-white/10"><span className="text-[8px] font-mono tracking-widest uppercase text-muted/40 animate-pulse">SYNCING...</span></div>) : (
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-black/80 px-2 py-0.5 rounded border border-white/10">
                        <Activity size={10} className={cn(isSurging ? "text-red-500 animate-pulse" : "text-primary")} />
                        <span className={cn("text-[8px] font-mono tracking-widest uppercase font-bold", isSurging ? "text-red-400" : "text-primary/80")}>
                            {isSurging ? "ELEVATED LOAD" : "IDLE"}
                        </span>
                    </div>
                )}
            </Link>

            {/* Economy Surge Metrics */}
            <div className="hidden lg:flex flex-col items-start mx-4 border-l border-white/10 pl-4 py-1">
                <span className="text-[8px] text-white/30 uppercase tracking-widest font-bold">Network Pricing</span>
                <span className={cn(
                    "text-xs font-mono font-bold tracking-tight flex items-center gap-1 transition-colors", 
                    isSurging ? "text-red-400" : "text-green-400"
                )}>
                    {surgeMultiplier.toFixed(2)}x
                </span>
            </div>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-1 mr-auto">
                {navLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                            "px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                            pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href.split('/').slice(0, 2).join('/')))
                                ? "text-primary bg-primary/10" : ""
                                : "text-muted hover:text-white hover:bg-white/5"
                        )}
                    >
                        {link.icon && <link.icon size={14} />}
                        {link.label}
                    </Link>
                ))}
            </nav>

            {/* Auth Controls */}
            <div className="ml-auto flex items-center gap-4">
                <SignedOut>
                    <Link href="/sign-in">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-1.5 text-sm font-medium text-muted hover:text-white transition-colors"
                        >
                            Sign In
                        </motion.button>
                    </Link>
                    <Link href="/sign-up">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-1.5 text-sm font-bold rounded-lg bg-primary text-background hover:bg-primary/90 transition-colors box-glow flex items-center gap-2"
                        >
                            <Zap size={14} />
                            Get API Key
                        </motion.button>
                    </Link>
                </SignedOut>

                <SignedIn>
                    <Link
                        href="/arena"
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-orange-500/20 bg-orange-500/5 text-orange-400 text-xs font-bold hover:bg-orange-500/10 transition-colors"
                        title="The Forge"
                    >
                        <Flame size={14} />
                        <span className="hidden sm:inline">Forge</span>
                    </Link>
                    <button
                        onClick={() => setIsTopUpOpen(true)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-primary/20 bg-primary/5 text-primary text-xs font-bold hover:bg-primary/10 transition-colors"
                    >
                        <Wallet size={14} />
                        <span className="hidden sm:inline">Top Up</span>
                    </button>
                    {isAdmin && (
                        <Link
                            href="/control"
                            className="p-2 rounded-lg text-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
                            title="Admin Control"
                        >
                            <Shield size={17} />
                        </Link>
                    )}
                    <UserButton
                        appearance={{
                            elements: {
                                avatarBox: "w-8 h-8 ring-2 ring-primary/40 ring-offset-2 ring-offset-background",
                            },
                        }}
                        afterSignOutUrl="/"
                    />
                </SignedIn>
            </div>

            <TopUpModal isOpen={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} />
        </motion.header>
    );
}
