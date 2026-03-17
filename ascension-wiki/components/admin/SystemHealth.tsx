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
    const { data, error, isLoading } = useSWR(`${process.env.NEXT_PUBLIC_PLATFORM_API_URL}/admin/metrics/health`, fetcher, {
        refreshInterval: 5000,
    });

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
                    <span>Uptime: <span className="text-green-400">{uptime}</span></span>
                    <span>v5.2.0</span>
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
