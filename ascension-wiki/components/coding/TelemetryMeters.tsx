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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Meter
                icon={<Zap size={14} className="text-primary" />}
                label="Tokens"
                value={`${tokens.toLocaleString()}`}
                subValue="Consumed"
                active={isExecuting}
            />
            <Meter
                icon={<Clock size={14} className="text-yellow-400" />}
                label="Latency"
                value={`${latency}ms`}
                subValue="Real-time"
                active={isExecuting}
            />
            <Meter
                icon={<ShieldCheck size={14} className="text-green-400" />}
                label="Confidence"
                value={`${(confidence * 100).toFixed(1)}%`}
                subValue="Validation"
                active={isExecuting}
            />
            <Meter
                icon={<Coins size={14} className="text-primary" />}
                label="Est. Cost"
                value={`${cost.toFixed(2)} ⏣`}
                subValue="Budget Delta"
                active={isExecuting}
            />
        </div>
    );
}

function Meter({ icon, label, value, subValue, active }: { icon: React.ReactNode, label: string, value: string, subValue: string, activeContent?: boolean, active?: boolean }) {
    return (
        <motion.div
            className={cn(
                "glass-card p-3 border border-white/5 bg-white/[0.01] flex flex-col gap-1 transition-all",
                active && "border-primary/20 bg-primary/5"
            )}
            animate={active ? { borderColor: ["rgba(0,229,255,0.05)", "rgba(0,229,255,0.2)", "rgba(0,229,255,0.05)"] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
        >
            <div className="flex items-center gap-2">
                {icon}
                <span className="text-[9px] font-mono text-muted uppercase tracking-widest">{label}</span>
            </div>
            <div className="flex flex-col">
                <span className="text-lg font-bold text-white font-mono leading-none">{value}</span>
                <span className="text-[8px] text-muted/50 uppercase tracking-tighter mt-1">{subValue}</span>
            </div>
        </motion.div>
    );
}
