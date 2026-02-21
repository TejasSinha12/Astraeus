"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, ShieldCheck, Zap, Cpu } from "lucide-react";

export function StatusPanel() {
    const [metrics, setMetrics] = useState({
        confidence: 94.2,
        accuracy: 98.7,
        heuristic: 0.85,
        agents: 4,
    });

    // Fake telemetry updates
    useEffect(() => {
        const interval = setInterval(() => {
            setMetrics((prev) => ({
                ...prev,
                confidence: +(prev.confidence + (Math.random() - 0.5) * 0.5).toFixed(1),
                heuristic: +(prev.heuristic + (Math.random() - 0.5) * 0.02).toFixed(2),
            }));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const items = [
        { label: "Confidence Score", value: `${metrics.confidence}%`, icon: Zap, color: "text-primary" },
        { label: "Benchmark Acc.", value: `${metrics.accuracy}%`, icon: ShieldCheck, color: "text-green-400" },
        { label: "Heuristic Weight", value: metrics.heuristic.toFixed(2), icon: Activity, color: "text-secondary" },
        { label: "Active Agents", value: metrics.agents, icon: Cpu, color: "text-blue-400" },
    ];

    return (
        <div className="glass-card rounded-xl p-6 border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-mono text-muted uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse box-glow" />
                    Live Telemetry
                </h3>
                <span className="text-xs text-primary font-mono glass px-2 py-1 rounded">SYNCED</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {items.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                        <motion.div
                            key={item.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex flex-col p-4 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                        >
                            <div className="flex items-center gap-2 mb-2 text-muted">
                                <Icon size={14} className={item.color} />
                                <span className="text-xs">{item.label}</span>
                            </div>
                            <motion.span
                                key={item.value}
                                initial={{ opacity: 0.5, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`text-2xl font-bold font-mono ${item.color} text-glow`}
                            >
                                {item.value}
                            </motion.span>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
