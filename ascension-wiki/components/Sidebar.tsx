"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Database, Wrench, GraduationCap, ShieldAlert, Network, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    { name: "Core Cognition", href: "/docs/core", icon: Brain },
    { name: "Memory Systems", href: "/docs/memory", icon: Database },
    { name: "Tool Boundaries", href: "/docs/tools", icon: Wrench },
    { name: "Learning & Optimization", href: "/docs/learning", icon: GraduationCap },
    { name: "Safety Layers", href: "/docs/safety", icon: ShieldAlert },
    { name: "Swarm Coordination", href: "/docs/swarm", icon: Network },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => setIsOpen(!isOpen);

    return (
        <>
            <button
                onClick={toggleSidebar}
                className="md:hidden fixed top-4 right-4 z-50 p-2 text-primary hover:text-white glass rounded-md transition-colors"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div
                className={cn(
                    "fixed inset-y-0 left-0 z-40 w-64 glass-card border-r-0 md:border-r border-white/5",
                    "flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0",
                    !isOpen && "-translate-x-full"
                )}
            >
                <div className="p-6 flex flex-col h-full overflow-y-auto">
                    <Link href="/" className="flex items-center space-x-3 mb-10 group" onClick={() => setIsOpen(false)}>
                        <div className="relative w-8 h-8 flex items-center justify-center">
                            <div className="absolute inset-0 border-2 border-primary rounded-full animate-pulse opacity-50"></div>
                            <div className="w-3 h-3 bg-primary rounded-full box-glow"></div>
                        </div>
                        <span className="text-xl font-bold tracking-widest text-white group-hover:text-primary transition-colors text-glow">ASCENSION</span>
                    </Link>

                    <div className="text-xs font-mono text-muted uppercase tracking-widest mb-4 opacity-70">
                        System Architecture
                    </div>

                    <nav className="flex-1 space-y-2">
                        {NAV_ITEMS.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        "flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group relative",
                                        isActive
                                            ? "bg-primary/10 text-primary box-glow"
                                            : "text-muted hover:text-white hover:bg-surface-hover"
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="sidebar-active"
                                            className="absolute left-0 w-1 h-full bg-primary rounded-r-md box-glow"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.2 }}
                                        />
                                    )}
                                    <Icon size={18} className={cn("transition-colors", isActive ? "text-primary" : "group-hover:text-primary/70")} />
                                    <span className="font-medium text-sm">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="mt-auto pt-6 border-t border-white/10">
                        <div className="flex items-center justify-between text-xs font-mono text-muted">
                            <span>SYSTEM_VER</span>
                            <span className="text-primary text-glow">v0.1.0-alpha</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overlay for mobile */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={toggleSidebar}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
                    />
                )}
            </AnimatePresence>
        </>
    );
}
