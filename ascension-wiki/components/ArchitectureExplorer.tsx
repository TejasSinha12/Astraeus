"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Database, Wrench, GraduationCap, ShieldAlert, Network, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const MODULES = [
    { id: "core", name: "Core Cognition", icon: Brain, desc: "Pydantic-typed LLM abstraction and deterministic Goal Directed Acyclic Graph planning.", href: "/docs/core", color: "from-cyan-500/20 to-blue-500/20", hoverBorder: "border-cyan-500/50" },
    { id: "memory", name: "Memory Systems", icon: Database, desc: "Vector FAISS LTM, sliding-window short-term buffers, and heuristic semantic indexers.", href: "/docs/memory", color: "from-purple-500/20 to-pink-500/20", hoverBorder: "border-purple-500/50" },
    { id: "tools", name: "Tool Boundaries", icon: Wrench, desc: "Strict execution sandboxing and dynamic tool registration arrays.", href: "/docs/tools", color: "from-emerald-500/20 to-teal-500/20", hoverBorder: "border-emerald-500/50" },
    { id: "learning", name: "Learning & Optimizer", icon: GraduationCap, desc: "Failure-triggered reflection loops creating rule variants A/B tested against evals.", href: "/docs/learning", color: "from-amber-500/20 to-orange-500/20", hoverBorder: "border-amber-500/50" },
    { id: "safety", name: "Safety Layers", icon: ShieldAlert, desc: "Regex constraint filters and external LLM ethical moderation firewalls.", href: "/docs/safety", color: "from-red-500/20 to-rose-500/20", hoverBorder: "border-red-500/50" },
    { id: "swarm", name: "Swarm Coordination", icon: Network, desc: "Multi-agent dispatch routing via FastAPI REST endpoints.", href: "/docs/swarm", color: "from-indigo-500/20 to-violet-500/20", hoverBorder: "border-indigo-500/50" },
];

export function ArchitectureExplorer() {
    const [activeModule, setActiveModule] = useState(MODULES[0]);

    return (
        <div className="flex flex-col md:flex-row gap-6 mt-12 h-auto md:h-[400px]">
            {/* Left: Interactive List */}
            <div className="w-full md:w-1/2 flex flex-col gap-3">
                <h3 className="text-xl font-semibold mb-2 text-white flex items-center gap-2">
                    <Network className="text-primary" />
                    System Architecture
                </h3>
                <div className="flex flex-col gap-2 overflow-y-auto pr-2 pb-2">
                    {MODULES.map((mod) => {
                        const Icon = mod.icon;
                        const isActive = activeModule.id === mod.id;

                        return (
                            <motion.button
                                key={mod.id}
                                onClick={() => setActiveModule(mod)}
                                whileHover={{ scale: 1.02, x: 5 }}
                                whileTap={{ scale: 0.98 }}
                                className={cn(
                                    "flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-300",
                                    isActive
                                        ? `bg-gradient-to-r ${mod.color} ${mod.hoverBorder} box-glow`
                                        : "bg-surface border-white/5 hover:border-white/20 hover:bg-surface-hover"
                                )}
                            >
                                <div className={cn("p-2 rounded-lg", isActive ? "bg-white/10" : "bg-background")}>
                                    <Icon className={isActive ? "text-white text-glow" : "text-muted"} size={20} />
                                </div>
                                <span className={cn("font-medium", isActive ? "text-white" : "text-muted")}>
                                    {mod.name}
                                </span>
                                {isActive && (
                                    <motion.div layoutId="indicator" className="ml-auto">
                                        <ChevronRight className="text-white" size={16} />
                                    </motion.div>
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Right: Dynamic Info Panel */}
            <div className="w-full md:w-1/2">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeModule.id}
                        initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
                        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, x: -20, filter: "blur(10px)" }}
                        transition={{ duration: 0.3 }}
                        className={cn(
                            "h-full rounded-2xl p-8 border glass-card relative overflow-hidden flex flex-col justify-center",
                            activeModule.hoverBorder
                        )}
                    >
                        <div className={`absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br ${activeModule.color} rounded-full blur-[100px] opacity-50`} />

                        <activeModule.icon className="w-16 h-16 mb-6 text-white text-glow" />

                        <h4 className="text-3xl font-bold text-white mb-4 tracking-tight">
                            {activeModule.name}
                        </h4>

                        <p className="text-muted text-lg leading-relaxed mb-8 relative z-10">
                            {activeModule.desc}
                        </p>

                        <Link href={activeModule.href}>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="mt-auto self-start px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white font-medium flex items-center gap-2 transition-colors relative focus:outline-none"
                            >
                                <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
                                View Documentation
                                <ChevronRight size={16} />
                            </motion.button>
                        </Link>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
