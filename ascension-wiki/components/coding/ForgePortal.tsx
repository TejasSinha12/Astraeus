"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Zap, Shield, Code, Activity, Trophy, ArrowRight, Gauge, Layers } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface BranchMetrics {
    latency_ms: number;
    complexity_score: number;
    security_rating: string;
    tokens_used: number;
}

interface ForgePortalProps {
    objective: string;
    branches: Record<string, BranchMetrics>;
    onSelect: (label: string) => void;
}

export function ForgePortal({ objective, branches, onSelect }: ForgePortalProps) {
    const [hovered, setHovered] = useState<string | null>(null);

    // Find the "Winner" (Mock logic: best complexity vs latency)
    const winner = Object.keys(branches).reduce((a, b) =>
        (branches[a].complexity_score + (100 / branches[a].latency_ms)) >
            (branches[b].complexity_score + (100 / branches[b].latency_ms)) ? a : b
    );

    return (
        <div className="flex flex-col gap-8 w-full">
            {/* Header: Performance Duel */}
            <header className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg">
                            <Zap className="text-primary w-5 h-5" />
                        </div>
                        <h2 className="text-2xl font-bold uppercase tracking-tight">The <span className="text-primary">Forge</span></h2>
                    </div>
                    <p className="text-xs text-muted font-mono uppercase tracking-widest italic opacity-60">Parallel Evolutionary Multi-Branching</p>
                </div>

                <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-muted uppercase font-bold tracking-widest">Active Swarms</span>
                        <span className="text-xl font-mono font-bold text-white">03</span>
                    </div>
                    <div className="h-8 w-[1px] bg-white/10" />
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-muted uppercase font-bold tracking-widest">Consensus</span>
                        <span className="text-xl font-mono font-bold text-green-400">98.2%</span>
                    </div>
                </div>
            </header>

            {/* Objective Preview */}
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                <div className="text-[10px] font-mono text-primary uppercase tracking-widest mb-1 flex items-center gap-2">
                    <ArrowRight size={10} /> Core Objective
                </div>
                <p className="text-sm text-white/80 font-mono italic">"{objective}"</p>
            </div>

            {/* Branch Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(branches).map(([label, metrics]) => (
                    <motion.div
                        key={label}
                        onHoverStart={() => setHovered(label)}
                        onHoverEnd={() => setHovered(null)}
                        whileHover={{ y: -5 }}
                        className={cn(
                            "relative overflow-hidden glass-card rounded-3xl border p-6 transition-all duration-500",
                            label === winner ? "border-primary/40 bg-primary/[0.03]" : "border-white/5 hover:border-white/20",
                            hovered === label && "shadow-[0_20px_50px_rgba(0,229,255,0.1)]"
                        )}
                    >
                        {/* Winner Badge */}
                        {label === winner && (
                            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 bg-primary text-background rounded-full text-[9px] font-black uppercase tracking-tighter">
                                <Trophy size={10} /> Optimized Pick
                            </div>
                        )}

                        <div className="mb-6">
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter italic mb-1 flex items-center gap-2">
                                <Layers size={18} className="text-primary" />
                                {label}
                            </h3>
                            <span className="text-[10px] text-muted uppercase font-mono tracking-widest">Architecture Variant</span>
                        </div>

                        {/* Metrics Table */}
                        <div className="space-y-4 mb-8">
                            <MetricRow
                                icon={<Gauge size={12} />}
                                label="Latency"
                                value={`${metrics.latency_ms}ms`}
                                highlight={metrics.latency_ms < 15}
                            />
                            <MetricRow
                                icon={<Activity size={12} />}
                                label="Complexity"
                                value={metrics.complexity_score.toFixed(2)}
                                highlight={metrics.complexity_score < 0.7}
                            />
                            <MetricRow
                                icon={<Shield size={12} />}
                                label="Security"
                                value={metrics.security_rating}
                                highlight
                            />
                            <MetricRow
                                icon={<Code size={12} />}
                                label="Tokens"
                                value={metrics.tokens_used.toString()}
                            />
                        </div>

                        <button
                            onClick={() => onSelect(label)}
                            className={cn(
                                "w-full py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all border",
                                label === winner
                                    ? "bg-primary text-background border-primary hover:bg-transparent hover:text-primary active:scale-[0.97]"
                                    : "bg-white/5 text-white border-white/10 hover:bg-white/10"
                            )}
                        >
                            Review Implementation
                        </button>

                        {/* Subtle Background Accent */}
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/20 blur-[80px] pointer-events-none opacity-20" />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

function MetricRow({ icon, label, value, highlight }: { icon: React.ReactNode, label: string, value: string, highlight?: boolean }) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/5 rounded-md text-muted/60">
                    {icon}
                </div>
                <span className="text-[10px] text-muted/60 uppercase font-bold tracking-widest">{label}</span>
            </div>
            <span className={cn(
                "text-xs font-mono font-bold",
                highlight ? "text-primary" : "text-white/60"
            )}>
                {value}
            </span>
        </div>
    );
}
