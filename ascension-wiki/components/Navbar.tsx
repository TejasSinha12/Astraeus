"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Brain, Zap, LayoutDashboard, Shield, Code } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
    const pathname = usePathname();
    const { user, isLoaded } = useUser();

    const userRole = (user?.publicMetadata?.role as string) || "PUBLIC";
    const isAdmin = isLoaded && userRole.toUpperCase() === "ADMIN";

    const navLinks = [
        { href: "/docs/core", label: "Docs" },
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
            className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-6 md:px-8 border-b border-white/5 glass-card backdrop-blur-xl"
        >
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group mr-8 md:ml-64">
                <div className="relative w-7 h-7 flex items-center justify-center">
                    <div className="absolute inset-0 border-2 border-primary rounded-full animate-pulse opacity-50" />
                    <div className="w-2.5 h-2.5 bg-primary rounded-full box-glow" />
                </div>
                <span className="text-base font-bold tracking-widest text-white group-hover:text-primary transition-colors hidden md:block">
                    ASCENSION
                </span>
            </Link>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-1 mr-auto">
                {navLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                            "px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                            pathname === link.href || pathname?.startsWith(link.href)
                                ? "text-primary bg-primary/10"
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
                            Get Access
                        </motion.button>
                    </Link>
                </SignedOut>

                <SignedIn>
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
        </motion.header>
    );
}
