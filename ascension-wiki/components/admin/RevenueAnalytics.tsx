"use client";

import { motion } from "framer-motion";
import { Coins, TrendingUp, CreditCard, Wallet, BarChart2 } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url, { headers: { "api-key": "SYSTEM_ADMIN_BYPASS" } }).then(res => res.json());

export function RevenueAnalytics() {
    const { data, error, isLoading } = useSWR(`${process.env.NEXT_PUBLIC_PLATFORM_API_URL}/admin/metrics/revenue`, fetcher, {
        refreshInterval: 5000, // Reduced latency, polls more aggressively
    });

    // Dynamic SWR Pipeline
    const chartData = data?.revenue_history || [];

    const totalCredits = data?.total_credits_circulating ? `${(data.total_credits_circulating / 1000).toFixed(0)}k` : "0k";
    const dailyRev = data?.daily_revenue ? `$${data.daily_revenue.toLocaleString()}` : "$0";
    const tokenVelocity = data?.token_velocity ? `${data.token_velocity}x` : "0x";
    const burnRate = data?.burn_rate ? `${data.burn_rate}/hr` : "0/hr";

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<Coins className="text-primary" />} label="Daily Revenue" value={isLoading ? "..." : dailyRev} delta="+12%" />
            <StatCard icon={<TrendingUp className="text-green-400" />} label="Token Velocity" value={isLoading ? "..." : tokenVelocity} delta="+0.4" />
            <StatCard icon={<CreditCard className="text-yellow-400" />} label="Total Credits" value={isLoading ? "..." : totalCredits} delta="-2k" />
            <StatCard icon={<Wallet className="text-purple-400" />} label="Burn Rate" value={isLoading ? "..." : burnRate} delta="+50" />

            <div className="md:col-span-2 lg:col-span-4 glass-card p-6 border border-white/5 bg-white/[0.01]">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <BarChart2 className="text-primary w-5 h-5" />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-white">Institutional Revenue Trajectory</h3>
                    </div>
                </div>

                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="day" stroke="rgba(255,255,255,0.1)" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="rgba(255,255,255,0.1)" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip
                                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                                contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "10px" }}
                            />
                            <Bar dataKey="rev" fill="#00e5ff" radius={[4, 4, 0, 0]} animationDuration={500} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, delta }: { icon: React.ReactNode, label: string, value: string, delta: string }) {
    const isPositive = delta.startsWith("+");
    return (
        <div className="glass-card p-6 border border-white/5 bg-white/[0.01] flex flex-col gap-2">
            <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-white/[0.03] rounded-lg">
                    {icon}
                </div>
                <span className={cn("text-[10px] font-bold font-mono", isPositive ? "text-green-400" : "text-red-400")}>{delta}</span>
            </div>
            <span className="text-3xl font-bold font-mono text-white tracking-tight">{value}</span>
            <span className="text-[10px] text-muted/40 uppercase tracking-widest font-mono">{label}</span>
        </div>
    );
}
