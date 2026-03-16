"use client";

import { motion } from "framer-motion";
import { Zap, Clock, ShieldCheck, Coins } from "lucide-react";
import { cn } from "@/lib/utils";

interface TelemetryMetersProps {
    tokens: number;
    latency: number;
    confidence: number;
    cost: number;
    isExecuting: boolean;
}

export function TelemetryMeters({ tokens, latency, confidence, cost, isExecuting }: TelemetryMetersProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Meter
                icon={<Zap size={14} className={cn("text-primary", isExecuting && "animate-pulse")} />}
                label="Tokens"
                value={`${tokens.toLocaleString()}`}
                subValue="Consumed"
                active={isExecuting}
                gradient="from-primary to-blue-500"
            />
            <Meter
                icon={<Clock size={14} className={cn("text-yellow-400", isExecuting && "animate-pulse")} />}
                label="Latency"
                value={`${latency}ms`}
                subValue="Real-time"
                active={isExecuting}
                gradient="from-yellow-400 to-orange-500"
            />
            <Meter
                icon={<ShieldCheck size={14} className={cn("text-green-400", isExecuting && "animate-pulse")} />}
                label="Confidence"
                value={`${(confidence * 100).toFixed(1)}%`}
                subValue="Validation"
                active={isExecuting}
                gradient="from-green-400 to-emerald-500"
            />
            <Meter
                icon={<Coins size={14} className={cn("text-purple-400", isExecuting && "animate-pulse")} />}
                label="Est. Cost"
                value={`${cost.toFixed(2)} ⏣`}
                subValue="Budget Delta"
                active={isExecuting}
                gradient="from-purple-400 to-pink-500"
            />
        </div>
    );
}

function Meter({ icon, label, value, subValue, active, gradient }: { icon: React.ReactNode, label: string, value: string, subValue: string, active?: boolean, gradient: string }) {
    return (
        <motion.div
            className={cn(
                "glass-card p-4 border rounded-2xl flex flex-col gap-2 transition-all relative overflow-hidden",
                active ? "border-white/20 bg-white/[0.03]" : "border-white/5 bg-white/[0.01]"
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
            </div>
            <div className="flex flex-col relative z-10 mt-1">
                <span className={cn("text-2xl font-bold font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r", gradient)}>
                    {value}
                </span>
                <span className="text-[9px] text-muted/50 uppercase tracking-widest mt-0.5">{subValue}</span>
            </div>
        </motion.div>
    );
}
