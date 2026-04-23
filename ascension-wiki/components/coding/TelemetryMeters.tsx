"use client";

import { motion } from "framer-motion";
import { Zap, Clock, ShieldCheck, Coins, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TelemetryMetersProps {
    tokens: number;
    latency: number;
    confidence: number;
    cost: number;
    isExecuting: boolean;
}

export function TelemetryMeters({ tokens, latency, confidence, cost, isExecuting }: TelemetryMetersProps) {
    // Commit 26: Intl.NumberFormat Mapping over strictly typed numbers natively
    const formattedTokens = new Intl.NumberFormat('en-US').format(tokens);
    const getLatencyColor = (ms: number) => ms < 300 ? "text-green-400" : ms < 600 ? "text-yellow-400" : "text-red-500"; // Commit 27: Latency bounds

    return (
        <div className="flex flex-col gap-4">
            <motion.div 
                initial="hidden" 
                animate="visible" 
                variants={{ visible: { transition: { staggerChildren: 0.1 } } }} // Commit 28: Stagger blocks
                role="group"
                aria-label="Live Swarm Telemetry Indicators"
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
                <Meter
                    icon={<Zap size={14} className={cn("text-primary", isExecuting && "animate-pulse")} />}
                    label="Tokens"
                    value={formattedTokens}
                    subValue="Consumed"
                    active={isExecuting}
                    gradient="from-primary to-blue-500"
                />
            <Meter
                icon={<Clock size={14} className={cn(getLatencyColor(latency), isExecuting && "animate-pulse")} />}
                label="Latency"
                value={`${latency}ms`}
                subValue="Real-time"
                active={isExecuting}
                gradient="from-yellow-400 to-orange-500"
                tooltip="Time to first byte or roundtrip response time for the active Swarm."
            />
            <Meter
                icon={<ShieldCheck size={14} className={cn("text-green-400", isExecuting && "animate-pulse")} />}
                label="Confidence"
                value={`${(confidence * 100).toFixed(1)}%`}
                subValue="Validation"
                active={isExecuting}
                gradient="from-green-400 to-emerald-500"
                tooltip="Aggregated score from Auditor agents verifying code stability."
            />
            <Meter
                icon={<Coins size={14} className={cn("text-purple-400", isExecuting && "animate-pulse")} />}
                label="Est. Cost"
                value={`${cost.toFixed(4)} ⏣`}
                subValue="Budget Delta"
                active={isExecuting}
                gradient="from-purple-400 to-pink-500"
            />
            </motion.div>
            
            <div role="log" aria-live="polite" className="h-28 overflow-y-auto custom-scrollbar glass-card border-white/10 bg-black/40 rounded-2xl p-4 flex flex-col gap-2 relative shadow-inner">
                <div className="flex items-center justify-between mb-1 sticky top-0 bg-black/80 backdrop-blur-md z-10 pb-2">
                    <span className="text-[10px] font-mono text-white/60 uppercase tracking-widest flex items-center gap-2">
                        <Coins size={12} className="text-white/20" /> Live Economy Ledger
                    </span>
                    <span className="flex h-2 w-2 relative">
                        {isExecuting && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>}
                        <span className={cn("relative inline-flex rounded-full h-2 w-2", isExecuting ? "bg-primary shadow-[0_0_10px_rgba(0,229,255,0.8)]" : "bg-white/20")}></span>
                    </span>
                </div>
                
                <div className="flex flex-col gap-1.5 mt-2">
                    {/* Commit 29 & 30: Convert Static Ledger Mock Arrays properly mapping active UI hovers mapping explicitly defined borders natively */}
                    <div className="flex items-center justify-between text-[10px] font-mono p-2 rounded-lg bg-white/[0.01] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 transition-colors shadow-sm">
                        <span className="text-white/60 font-bold tracking-widest">TX_{(Date.now() % 1000000).toString(16).slice(0, 6).toUpperCase()}</span>
                        <div className="flex items-center gap-4">
                            <span className="text-white/30 uppercase text-[9px]">Model Inference</span>
                            <span className="text-blue-400">-0.0042 ⏣</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono p-2 rounded-lg bg-white/[0.01] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 transition-colors shadow-sm">
                        <span className="text-white/60 font-bold tracking-widest">TX_{((Date.now() - 5000) % 1000000).toString(16).slice(0, 6).toUpperCase()}</span>
                        <div className="flex items-center gap-4">
                            <span className="text-white/30 uppercase text-[9px]">Vector Embeddings</span>
                            <span className="text-blue-400">-0.0011 ⏣</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Meter({ icon, label, value, subValue, active, gradient, tooltip, circularValue }: { icon: React.ReactNode, label: string, value: string, subValue: string, active?: boolean, gradient: string, tooltip?: string, circularValue?: number }) {
    return (
        <motion.div
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
            className={cn(
                "glass-card p-4 border rounded-2xl flex flex-col gap-2 transition-all relative overflow-hidden",
                active ? "border-white/20 bg-white/[0.03] shadow-[0_4px_30px_rgba(0,0,0,0.5)]" : "border-white/5 bg-white/[0.01]"
            )}
            animate={active ? { borderColor: ["rgba(255,255,255,0.05)", "rgba(255,255,255,0.2)", "rgba(255,255,255,0.05)"] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
        >
            {active && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent shimmer loop" />
            )}
            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                    <div className={cn("p-1.5 rounded-lg bg-white/[0.05]", active && "shadow-[0_0_10px_rgba(255,255,255,0.1)]")}>
                        {icon}
                    </div>
                    <span className="text-[10px] font-mono text-muted uppercase tracking-widest">{label}</span>
                </div>
                {tooltip && (
                    <div className="group/tooltip relative">
                        <HelpCircle size={12} className="text-white/20 hover:text-white/80 cursor-help transition-colors" />
                        <div className="absolute top-full right-0 mt-2 w-48 p-2 rounded-lg bg-black border border-white/10 text-[9px] text-white/70 shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0 transition-all z-20">
                            {tooltip}
                        </div>
                    </div>
                )}
            </div>
            <div className="flex items-end justify-between relative z-10 mt-1">
                <div className="flex flex-col">
                    <span className={cn("text-2xl font-bold font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r", gradient)}>
                        {value}
                    </span>
                    <span className="text-[9px] text-muted/50 uppercase tracking-widest mt-0.5">{subValue}</span>
                </div>
                {circularValue !== undefined && (
                    <div className="relative w-10 h-10 -mt-2 -mr-1">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-white/10" />
                            <circle
                                cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" fill="transparent"
                                strokeDasharray={100}
                                strokeDashoffset={100 - (circularValue * 100)}
                                className={cn("transition-all duration-1000 ease-out", circularValue > 0.8 ? "text-green-400" : "text-yellow-400")}
                            />
                        </svg>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
