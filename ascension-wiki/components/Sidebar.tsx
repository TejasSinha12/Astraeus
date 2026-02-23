"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import {
    Brain, Database, Wrench, GraduationCap, ShieldAlert, Network, Menu, X,
    BarChart2, GitBranch, FlaskConical, Cpu, Map, ScrollText, Terminal,
    LayoutDashboard, Shield, Code, Zap
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV_SECTIONS = [
    {
        label: "Documentation",
        items: [
            { name: "Core Cognition", href: "/docs/core", icon: Brain },
            { name: "Memory Systems", href: "/docs/memory", icon: Database },
            { name: "Tool Boundaries", href: "/docs/tools", icon: Wrench },
            { name: "Learning & Optimization", href: "/docs/learning", icon: GraduationCap },
            { name: "Safety Layers", href: "/docs/safety", icon: ShieldAlert },
            { name: "Swarm Coordination", href: "/docs/swarm", icon: Network },
            { name: "Whitepaper", href: "/whitepaper", icon: ScrollText },
        ],
    },
    {
        label: "Coding & API",
        items: [
            { name: "Coding Arena", href: "/coding", icon: Code },
            { name: "API Reference", href: "/docs/api", icon: Zap },
        ],
    },
    {
        label: "Research Lab",
        items: [
            { name: "Benchmarks", href: "/benchmarks", icon: BarChart2 },
            { name: "Evolution", href: "/evolution", icon: GitBranch },
            { name: "Arena", href: "/arena", icon: FlaskConical },
            { name: "Cognition Map", href: "/cognition-map", icon: Map },
        ],
    },
    {
        label: "Admin",
        isAdmin: true,
        items: [
            { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
            { name: "Experiments", href: "/experiments", icon: Cpu },
            { name: "Live Logs", href: "/logs", icon: Terminal },
            { name: "Control Panel", href: "/control", icon: Shield },
        ],
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const { user } = useUser();
    const [isOpen, setIsOpen] = useState(false);

    const userRole = (user?.publicMetadata?.role as string) || "PUBLIC";
    const isAdmin = userRole === "ADMIN";

    const filteredSections = NAV_SECTIONS.filter(section => !section.isAdmin || isAdmin);

    return (
        <>
            <button onClick={() => setIsOpen(!isOpen)}
                className="md:hidden fixed top-4 right-4 z-50 p-2 text-primary hover:text-white glass rounded-md transition-colors">
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className={cn(
                "fixed inset-y-0 left-0 z-40 w-64 glass-card border-r-0 md:border-r border-white/5",
                "flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0",
                !isOpen && "-translate-x-full"
            )}>
                <div className="p-6 flex flex-col h-full overflow-y-auto">
                    <Link href="/" className="flex items-center space-x-3 mb-8 group" onClick={() => setIsOpen(false)}>
                        <div className="relative w-7 h-7 flex items-center justify-center">
                            <div className="absolute inset-0 border-2 border-primary rounded-full animate-pulse opacity-50" />
                            <div className="w-2.5 h-2.5 bg-primary rounded-full box-glow" />
                        </div>
                        <span className="text-lg font-bold tracking-widest text-white group-hover:text-primary transition-colors">ASCENSION</span>
                    </Link>

                    <nav className="flex-1 space-y-6">
                        {filteredSections.map((section) => (
                            <div key={section.label}>
                                <p className="text-xs font-mono text-muted/60 uppercase tracking-widest mb-2 px-3">{section.label}</p>
                                <div className="space-y-1">
                                    {section.items.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                                        return (
                                            <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}
                                                className={cn(
                                                    "flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group relative",
                                                    isActive ? "bg-primary/10 text-primary" : "text-muted hover:text-white hover:bg-surface-hover"
                                                )}>
                                                {isActive && (
                                                    <motion.div layoutId="sidebar-active"
                                                        className="absolute left-0 w-0.5 h-full bg-primary rounded-r-md"
                                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
                                                )}
                                                <Icon size={15} className={cn("transition-colors shrink-0", isActive ? "text-primary" : "group-hover:text-primary/70")} />
                                                <span className="font-medium text-sm">{item.name}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>

                    <div className="mt-auto pt-4 border-t border-white/5">
                        <div className="flex items-center justify-between text-xs font-mono text-muted">
                            <span>SYSTEM_VER</span>
                            <span className="text-primary">v2.0.0-PROD</span>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden" />
                )}
            </AnimatePresence>
        </>
    );
}
