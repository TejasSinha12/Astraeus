"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap, ShieldCheck, Activity, Cpu, Brain, Network } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RoleGate } from "@/components/auth/RoleGate";

const AGENTS = [
    { id: "Alpha_Prime", role: "Commander", status: "active" },
    { id: "Researcher_01", role: "Research Analyst", status: "active" },
    { id: "Coder_01", role: "Engineer", status: "idle" },
    { id: "Executive_Alpha", role: "Orchestrator", status: "active" },
];

const HEURISTICS = [
    { rule: "Always validate tool args before dispatch", weight: 0.92 },
    { rule: "Increase search depth on confidence < 0.7", weight: 0.81 },
    { rule: "Trigger reflection loop on FAIL actions", weight: 0.78 },
    { rule: "Prefer memory lookup before web search", weight: 0.74 },
];

const VERSIONS = [
    { id: "v0.1.0-alpha", date: "2026-02-21", status: "active" },
    { id: "v0.0.9-pre", date: "2026-02-18", status: "archived" },
    { id: "v0.0.8-pre", date: "2026-02-14", status: "archived" },
];

export default function DashboardClient() {
    const [metrics, setMetrics] = useState({ confidence: 94.2, accuracy: 98.7, heuristic: 0.85, agents: 3 });

    useEffect(() => {
        const interval = setInterval(() => {
            setMetrics((prev) => ({
                ...prev,
                confidence: parseFloat((prev.confidence + (Math.random() - 0.5) * 0.4).toFixed(1)),
                heuristic: parseFloat((prev.heuristic + (Math.random() - 0.5) * 0.02).toFixed(2)),
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-muted uppercase tracking-widest mb-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />System Online
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-tight">AGI Command Center</h1>
                    <p className="text-muted mt-1">Real-time cognitive framework telemetry</p>
                </div>
                <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/20 bg-primary/5 font-mono text-xs text-primary">
                    <Brain size={14} />Project Ascension v0.1.0-alpha
                </div>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <MetricCard label="Confidence Score" value={metrics.confidence} unit="%" icon={Zap} color="text-primary" glowColor="rgba(0,229,255,0.15)" delay={0} />
                <MetricCard label="Benchmark Accuracy" value={metrics.accuracy} unit="%" icon={ShieldCheck} color="text-green-400" glowColor="rgba(74,222,128,0.15)" delay={0.1} />
                <MetricCard label="Heuristic Weight" value={metrics.heuristic} icon={Activity} color="text-purple-400" glowColor="rgba(192,132,252,0.15)" delay={0.2} />
                <MetricCard label="Active Agents" value={metrics.agents} icon={Cpu} color="text-blue-400" glowColor="rgba(96,165,250,0.15)" delay={0.3} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="lg:col-span-2 glass-card rounded-2xl border border-white/5 p-6">
                    <h2 className="text-sm font-mono text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Network size={14} className="text-primary" />Swarm Status
                    </h2>
                    <div className="space-y-3">
                        {AGENTS.map((agent, i) => (
                            <motion.div key={agent.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
                                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2.5 h-2.5 rounded-full ${agent.status === "active" ? "bg-green-500 shadow-[0_0_8px_rgba(74,222,128,0.8)] animate-pulse" : "bg-white/20"}`} />
                                    <div>
                                        <div className="font-mono text-sm text-white">{agent.id}</div>
                                        <div className="text-xs text-muted">{agent.role}</div>
                                    </div>
                                </div>
                                <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${agent.status === "active" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-white/5 text-muted border border-white/10"}`}>
                                    {agent.status.toUpperCase()}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                    className="glass-card rounded-2xl border border-white/5 p-6">
                    <h2 className="text-sm font-mono text-muted uppercase tracking-widest mb-4">Version History</h2>
                    <div className="space-y-3">
                        {VERSIONS.map((v) => (
                            <div key={v.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                <div>
                                    <div className="font-mono text-sm text-white">{v.id}</div>
                                    <div className="text-xs text-muted">{v.date}</div>
                                </div>
                                <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${v.status === "active" ? "bg-primary/10 text-primary border border-primary/20" : "bg-white/5 text-muted border border-white/10"}`}>
                                    {v.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            <RoleGate allowedRole="researcher">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                    className="glass-card rounded-2xl border border-white/5 p-6">
                    <h2 className="text-sm font-mono text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Activity size={14} className="text-purple-400" />Heuristic Weight Breakdown
                    </h2>
                    <div className="space-y-4">
                        {HEURISTICS.map((h, i) => (
                            <div key={i}>
                                <div className="flex items-center justify-between text-sm mb-1.5">
                                    <span className="text-muted text-xs font-mono">{h.rule}</span>
                                    <span className="text-purple-400 font-mono font-bold text-sm">{h.weight.toFixed(2)}</span>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${h.weight * 100}%` }}
                                        transition={{ delay: 0.8 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-300" />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </RoleGate>
        </div>
    );
}
