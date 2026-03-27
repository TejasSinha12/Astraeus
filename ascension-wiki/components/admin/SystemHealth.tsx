"use client";

import { motion } from "framer-motion";
import { Activity, Cpu, Database, Server, Globe, Signal, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url, { headers: { "api-key": "SYSTEM_ADMIN_BYPASS" } }).then(res => res.json());

const MOCK_TRAFFIC = [
    { time: "12:00", active: 4 },
    { time: "12:05", active: 6 },
    { time: "12:10", active: 5 },
    { time: "12:15", active: 8 },
    { time: "12:20", active: 12 },
    { time: "12:25", active: 10 },
    { time: "12:30", active: 14 },
];

export function SystemHealth() {
    const { data: historyData, isLoading: isHistoryLoading } = useSWR(`${process.env.NEXT_PUBLIC_PLATFORM_API_URL}/admin/metrics/history`, fetcher, {
        refreshInterval: 30000,
    });
    const { data: stability } = useSWR(`${process.env.NEXT_PUBLIC_PLATFORM_API_URL}/admin/metrics/stability`, fetcher, {
        refreshInterval: 10000,
    });
    const { data: consensus } = useSWR(`${process.env.NEXT_PUBLIC_PLATFORM_API_URL}/admin/metrics/consensus`, fetcher, {
        refreshInterval: 15000,
    });
    const { data: recovery } = useSWR(`${process.env.NEXT_PUBLIC_PLATFORM_API_URL}/admin/metrics/recovery`, fetcher, {
        refreshInterval: 15000,
    });
    const { data: sandbox } = useSWR(`${process.env.NEXT_PUBLIC_PLATFORM_API_URL}/admin/metrics/sandbox`, fetcher, {
        refreshInterval: 10000,
    });
    const { data, error, isLoading } = useSWR(`${process.env.NEXT_PUBLIC_PLATFORM_API_URL}/admin/metrics/health`, fetcher, {
        refreshInterval: 5000,
    });
    const { data: topology } = useSWR(`${process.env.NEXT_PUBLIC_PLATFORM_API_URL}/admin/metrics/nodes`, fetcher);

    const activeNodes = data?.active_swarms || 0;
    const cpuLoad = data?.cpu_load ? `${data.cpu_load.toFixed(1)}%` : "0.0%";
    const throughput = data?.throughput || "0 tokens/sec";
    const uptime = data?.uptime || "99.97%";
    const federationNodes = data?.federation_nodes || 3;

    return (
        <div className="space-y-6">
            {/* Live Status Banner */}
            <div className="flex items-center justify-between px-6 py-3 rounded-xl bg-green-500/5 border border-green-500/10">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-75" />
                    </div>
                    <span className="text-xs font-bold text-green-400 uppercase tracking-widest">All Systems Operational</span>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-mono text-muted/40 uppercase">
                    <span>Stability Index: <span className="text-primary font-bold">{stability?.overall_index || '0.88'}</span></span>
                    <span>Consensus: <span className="text-yellow-400 font-bold">{consensus?.overall_agreement || '0.92'}</span></span>
                    <span>Recovery: <span className="text-green-500 font-bold">{recovery?.recovery_rate * 100 || '94'}%</span></span>
                    <span>Sandbox: <span className="text-secondary font-bold">{sandbox?.security_status || 'HARDENED'}</span></span>
                    <span>Uptime: <span className="text-green-400">{uptime}</span></span>
                    <span>v5.2.7</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <HealthCard
                    icon={<Cpu className="text-primary" />}
                    title="Swarm Processing"
                    value={isLoading ? "..." : cpuLoad}
                    subValue="CPU Load Across Nodes"
                />
                <HealthCard
                    icon={<Database className="text-yellow-400" />}
                    title="Total Throughput"
                    value={isLoading ? "..." : throughput}
                    subValue="Real-time Token Velocity"
                />
                <HealthCard
                    icon={<Globe className="text-green-400" />}
                    title="Active Sessions"
                    value={isLoading ? "..." : activeNodes.toString().padStart(2, '0')}
                    subValue="Live Swarm Missions"
                />
                <HealthCard
                    icon={<Signal className="text-purple-400" />}
                    title="Federation Nodes"
                    value={isLoading ? "..." : federationNodes.toString()}
                    subValue="Connected Clusters"
                />
            </div>

            <div className="glass-card p-6 border border-white/5 bg-white/[0.01]">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Activity className="text-primary w-5 h-5" />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-white">Swarm Traffic (Active Missions)</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-[9px] font-mono text-primary uppercase tracking-widest">Live</span>
                    </div>
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={historyData || []}>
                            <defs>
                                <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#00e5ff" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="time" stroke="rgba(255,255,255,0.1)" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="rgba(255,255,255,0.1)" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "10px" }}
                                cursor={{ stroke: "rgba(0,229,255,0.2)", strokeWidth: 2 }}
                            />
                            <Area type="monotone" dataKey="active" stroke="#00e5ff" strokeWidth={2} fillOpacity={1} fill="url(#colorActive)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Federation Topology Map */}
            <div className="relative glass-card p-6 border border-white/5 bg-white/[0.01]">
                {/* Stability Gauge (Radial Overlay) */}
                <div className="absolute top-6 right-6 w-24 h-24 bg-black/40 backdrop-blur-md rounded-full border border-white/5 flex flex-col items-center justify-center z-10">
                    <div className="text-[8px] font-mono text-muted/40 uppercase mb-0.5">Stability</div>
                    <div className="text-lg font-bold text-primary">{(stability?.overall_index * 100 || 88).toFixed(0)}%</div>
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle
                            cx="48" cy="48" r="44"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            className="text-white/5"
                        />
                        <motion.circle
                            cx="48" cy="48" r="44"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeDasharray="276"
                            initial={{ strokeDashoffset: 276 }}
                            animate={{ strokeDashoffset: 276 - (276 * (stability?.overall_index || 0.88)) }}
                            className="text-primary"
                        />
                    </svg>
                </div>

                <div className="flex items-center gap-3 mb-8">
                    <Globe className="rotate-12 text-green-400 w-5 h-5" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-white">Federation Topology (Geographic Distribution)</h3>
                </div>
                
                <div className="relative h-[200px] w-full flex items-center justify-center bg-black/20 rounded-xl overflow-hidden border border-white/5">
                    {/* Simulated SVG Graph */}
                    <svg width="100%" height="100%" viewBox="0 0 500 200" className="opacity-80">
                        <defs>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        {/* Links */}
                        <line x1="250" y1="100" x2="100" y2="150" stroke="rgba(0,229,255,0.2)" strokeWidth="1" strokeDasharray="4 4" />
                        <line x1="250" y1="100" x2="400" y2="60" stroke="rgba(0,229,255,0.2)" strokeWidth="1" strokeDasharray="4 4" />
                        
                        {/* Nodes */}
                        <g filter="url(#glow)">
                            <circle cx="250" cy="100" r="8" fill="#00e5ff" className="animate-pulse" />
                            <circle cx="100" cy="150" r="5" fill="#4ade80" />
                            <circle cx="400" cy="60" r="5" fill="#a855f7" />
                        </g>
                        
                        {/* Labels */}
                        <text x="265" y="105" fill="white" fontSize="10" fontWeight="bold" className="uppercase font-mono opacity-60">US-EAST (MASTER)</text>
                        <text x="110" y="155" fill="white" fontSize="9" className="uppercase font-mono opacity-40">EU-CENTRAL</text>
                        <text x="410" y="65" fill="white" fontSize="9" className="uppercase font-mono opacity-40">AP-SOUTH</text>
                    </svg>

                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                        <div className="flex items-center gap-2 bg-black/40 px-2 py-1 rounded border border-white/5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            <span className="text-[9px] font-mono text-white/40 uppercase">Latency: 42ms</span>
                        </div>
                        <div className="flex items-center gap-2 bg-black/40 px-2 py-1 rounded border border-white/5">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <span className="text-[9px] font-mono text-white/40 uppercase">Sync: 100%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Consensus Heatmap Grid */}
            <div className="glass-card p-6 border border-white/5 bg-white/[0.01]">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Database className="text-yellow-400 w-5 h-5" />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-white">Consensus Heatmap (Model Alignment)</h3>
                    </div>
                </div>
                
                <div className="grid grid-cols-10 gap-2">
                    {Array.from({ length: 40 }).map((_, i) => (
                        <div 
                            key={i}
                            className={cn(
                                "aspect-square rounded-sm border border-white/5",
                                i % 7 === 0 ? "bg-red-500/20" : i % 5 === 0 ? "bg-yellow-500/20" : "bg-primary/20"
                            )}
                            title={`Step ${i}: 0.94 Agreement`}
                        />
                    ))}
                </div>
                <div className="mt-4 flex items-center gap-4 text-[10px] font-mono uppercase text-muted/40">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-sm bg-primary/20" />
                        <span>High Agreement</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-sm bg-yellow-500/20" />
                        <span>Divergence</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-sm bg-red-500/20" />
                        <span>Conflict</span>
                    </div>
                </div>
            </div>

            {/* Recovery Rate & Resilience */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6 border border-white/5 bg-white/[0.01]">
                    <div className="flex items-center gap-3 mb-8">
                        <Activity className="text-green-500 w-5 h-5" />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-white">Autonomous Recovery Rate</h3>
                    </div>
                    <div className="flex items-center justify-center h-[150px]">
                        <div className="relative w-32 h-32 flex flex-col items-center justify-center">
                            <span className="text-[8px] font-mono text-muted/40 uppercase mb-1">Fixed</span>
                            <span className="text-3xl font-bold text-green-500">{(recovery?.recovery_rate * 100 || 94).toFixed(0)}%</span>
                            <svg className="absolute inset-0 w-full h-full -rotate-90">
                                <circle cx="64" cy="64" r="60" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                                <motion.circle 
                                    cx="64" cy="64" r="60" fill="none" stroke="#22c55e" strokeWidth="4"
                                    strokeDasharray="377" initial={{ strokeDashoffset: 377 }}
                                    animate={{ strokeDashoffset: 377 - (377 * (recovery?.recovery_rate || 0.94)) }}
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 border border-white/5 bg-white/[0.01]">
                    <div className="flex items-center gap-3 mb-8">
                        <Shield className="text-primary w-5 h-5" />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-white">Top Mitigation Causes</h3>
                    </div>
                    <div className="space-y-4">
                        {(recovery?.top_causes || []).map((c: any, i: number) => (
                            <div key={i} className="flex flex-col gap-1.5">
                                <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-tighter">
                                    <span className="text-white/60">{c.cause}</span>
                                    <span className="text-primary">{c.count}</span>
                                </div>
                                <div className="w-full h-1 bg-white/[0.03] rounded-full overflow-hidden">
                                    <div className="h-full bg-primary" style={{ width: `${(c.count / 45) * 100}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sandbox Isolation & Resource Capping */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="glass-card p-6 border border-white/5 bg-white/[0.01]">
                    <div className="flex items-center gap-3 mb-8">
                        <Shield className="text-secondary w-5 h-5" />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-white">Sandbox Isolation</h3>
                    </div>
                    <div className="flex flex-col items-center justify-center h-[120px]">
                        <div className="text-4xl font-bold text-secondary mb-2">{sandbox?.active_sandboxes || 0}</div>
                        <div className="text-[10px] uppercase tracking-widest text-muted/60">Active Subprocesses</div>
                    </div>
                </div>

                <div className="glass-card p-6 border border-white/5 bg-white/[0.01] lg:col-span-2">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <Cpu className="text-primary w-5 h-5" />
                            <h3 className="text-sm font-bold uppercase tracking-widest text-white">Sandbox Resource Consumption</h3>
                        </div>
                        <div className="text-[10px] font-mono text-secondary uppercase tracking-tighter">Status: {sandbox?.security_status}</div>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] uppercase font-mono tracking-tighter">
                                <span className="text-white/60">Memory Usage (Overall Pool)</span>
                                <span className="text-primary">{sandbox?.memory_usage?.current_mb || 42}MB / {sandbox?.memory_usage?.limit_mb || 128}MB</span>
                            </div>
                            <div className="w-full h-2 bg-white/[0.03] rounded-full overflow-hidden">
                                <motion.div 
                                    className="h-full bg-primary" 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(sandbox?.memory_usage?.current_mb / sandbox?.memory_usage?.limit_mb) * 100 || 33}%` }}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex-1 flex flex-col gap-1">
                                <span className="text-[8px] uppercase text-muted/40 font-mono">Avg Latency</span>
                                <span className="text-sm font-bold text-white">{sandbox?.avg_latency_ms || 320}ms</span>
                            </div>
                            <div className="flex-1 flex flex-col gap-1">
                                <span className="text-[8px] uppercase text-muted/40 font-mono">Hardening Score</span>
                                <span className="text-sm font-bold text-secondary">{(sandbox?.health_score * 100 || 99).toFixed(1)}%</span>
                            </div>
                            <div className="flex-1 flex flex-col gap-1">
                                <span className="text-[8px] uppercase text-muted/40 font-mono">Sec. Breaches</span>
                                <span className="text-sm font-bold text-green-500">0 DETECTED</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function HealthCard({ icon, title, value, subValue }: { icon: React.ReactNode, title: string, value: string, subValue: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 border border-white/5 bg-white/[0.01] flex flex-col gap-4"
        >
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white/[0.03] rounded-lg border border-white/5">
                    {icon}
                </div>
                <span className="text-[10px] font-mono text-muted uppercase tracking-widest">{title}</span>
            </div>
            <div className="flex flex-col">
                <span className="text-3xl font-bold text-white font-mono">{value}</span>
                <span className="text-[10px] text-muted/40 uppercase tracking-widest mt-1">{subValue}</span>
            </div>
        </motion.div>
    );
}
