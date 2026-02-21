"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MetricCardProps {
    label: string;
    value: string | number;
    unit?: string;
    icon: React.ElementType;
    color?: string;
    glowColor?: string;
    delay?: number;
}

export function MetricCard({ label, value, unit, icon: Icon, color = "text-primary", glowColor = "rgba(0,229,255,0.15)", delay = 0 }: MetricCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="relative group overflow-hidden rounded-2xl glass-card border border-white/5 p-6 hover:border-white/15 transition-all duration-300"
        >
            {/* Glow effect */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                style={{ background: `radial-gradient(circle at 50% 50%, ${glowColor}, transparent 70%)` }}
            />

            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono text-muted uppercase tracking-widest">{label}</span>
                    <div className={cn("p-2 rounded-lg bg-white/5", color.replace("text-", "text-"))}>
                        <Icon size={16} className={color} />
                    </div>
                </div>
                <div className="flex items-end gap-2">
                    <motion.span
                        key={String(value)}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={cn("text-4xl font-bold font-mono", color)}
                        style={{ textShadow: `0 0 20px ${glowColor}` }}
                    >
                        {value}
                    </motion.span>
                    {unit && <span className="text-lg text-muted mb-1 font-mono">{unit}</span>}
                </div>
            </div>
        </motion.div>
    );
}
