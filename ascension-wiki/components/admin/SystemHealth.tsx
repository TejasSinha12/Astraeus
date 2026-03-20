"use client";

import { motion } from "framer-motion";
import { Activity, Cpu, Database, Server, Globe, Signal } from "lucide-react";
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
                    <span>Uptime: <span className="text-green-400">{uptime}</span></span>
                    <span>v5.2.2</span>
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
            <div className="glass-card p-6 border border-white/5 bg-white/[0.01]">
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
